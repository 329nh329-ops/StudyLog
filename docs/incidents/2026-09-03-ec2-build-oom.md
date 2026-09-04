# 2026-09-03 EC2(t3.micro)上でのDocker本番buildによるメモリ不足・SSH不通

## 発生した現象

AWS EC2（t3.micro, メモリ1GB）上に、Terraformの`user_data`経由でリポジトリをclone → `docker compose -f docker-compose.prod.yml up -d --build`を実行し、frontend（Next.js production build）・backend・MySQLをデプロイしようとした。

- `docker compose ... --build`の実行中、コマンドが応答しないままタイムアウトした
- その後、同インスタンスへのSSH接続を試みたところ「Connection timed out during banner exchange」で接続不可になった
- AWSコンソール（`describe-instance-status`）上ではインスタンスのステータスチェックは`ok`で、CPU使用率も張り付いてはいなかった

## 調査方法

1. `aws ec2 get-console-output`でシリアルコンソールログを取得し、カーネルパニックなど致命的なクラッシュが起きていないか確認した
   - ログの末尾はカーネルパニックではなく、Dockerコンテナのネットワークインターフェース（veth）が生成・削除を繰り返すログで途切れていた
   - これはコンテナが起動→クラッシュ→`restart`ポリシーによる再起動、を繰り返すパターンに一致する
2. 一度`stop`→`start`でインスタンスを再起動し、正常にSSH接続できることを確認した
3. 再起動直後の`free -h`でメモリ状況を確認したところ、911MB中609MB空きとクリーンな状態だった
4. その状態から`docker-compose.prod.yml`のbuild方式で起動を試みる代わりに、ローカル(Mac)でビルド済みのイメージを`docker load`で読み込ませてコンテナを起動したところ、正常に起動できた
5. 起動後の`free -h`では911MB中674MB使用、空き62MBまで逼迫していることを確認した（実行時だけでもメモリ使用量にほぼ余裕がない）

## わかったこと

- t3.micro（メモリ1GB、スワップ領域なし）上で`npm run build`（Next.jsのproduction build、TypeScriptの型チェックを含む）を実行すると、メモリを使い切りOOM killerがプロセスを強制終了させる。この際sshdも巻き込まれ、SSH接続自体が不能になることが実機で確認できた
- ステータスチェックが`ok`のままSSHだけが不通になる、という一見矛盾した状態はOOMの典型的な症状であり、CPU使用率だけでは異常を検知できない
- インスタンスの`terminate`（破棄）ではなく`stop`/`start`（再起動）だけで復旧できた。AWSリソースの再作成は不要だった
- ビルドを伴わずコンテナを実行するだけであれば、メモリはまだ逼迫するものの（空き62MB）動作は安定した

## 対応内容

EC2上ではDockerイメージのbuildを一切行わず、ローカル(Mac)で本番用イメージをbuildし、`docker save` → `scp` → `docker load`でEC2に転送してコンテナを起動する方式に変更した。

この対応により、EC2側の負荷はコンテナの実行のみとなり、実機での動作を確認できた。恒久対応として、この方式を正式なデプロイ手順として`deploy/deploy.sh`にスクリプト化し、`docker-compose.prod.yml`からもbuild定義を削除した。

なお、メモリの逼迫（空き62MB）は解消されていないため、今後アプリケーションの規模が大きくなった場合はインスタンスタイプの見直しが必要になる可能性がある。
