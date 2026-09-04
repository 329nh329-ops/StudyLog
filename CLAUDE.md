# StudyLog開発ルール

## Git運用

### 基本フロー

すべての変更は以下の順序で進める。

1. GitHub Issueを作成する（何を実現する作業なのかが一目で分かる短いタイトルにする）
2. Issueに対応する作業ブランチを作成する
3. 実装する
4. テストを実行する
   - Backend: `pytest tests/ -v`、`ruff check .`、`ruff format --check .`
   - Frontend: `npm run lint`、`npx tsc --noEmit`、`npm run test`、`npm run build`
   - Terraform（`terraform/`配下を変更した場合）: [Terraform品質チェック](#terraform品質チェック)を参照
5. コミットする
6. Pull Requestを作成する（対応するIssueへの参照を含める。例：`Closes #12`）
7. GitHub Actions（CI）の`backend`・`frontend`両ジョブが成功することを確認する
8. ユーザーの確認・承認を得てからマージする

### ブランチ命名

`feature/{Issue番号}-{短い説明}`の形式に統一する（例：`feature/12-card-edit`）。短い説明は英語・ハイフン区切り。機能追加以外も`feature/`プレフィックスで統一する。1つのブランチで複数のIssueを同時に扱わない。

### mainブランチへの直接push禁止

`main`ブランチへの直接pushは禁止する。すべての変更はブランチを作成し、Pull Request経由で`main`に取り込む。`main`にはBranch Protection Ruleが設定されており、GitHub Actionsの`backend`・`frontend`ジョブが成功しない限りマージできない（管理者にも適用される設定）。

### Pull Requestのマージ

Pull Requestのマージは、CIの成功を確認した上で、必ずユーザーの確認・承認を得てから行う。Claude Codeが自身の判断でマージを実行しない。

## Terraform品質チェック

`terraform/`配下（AWSインフラ構成）を変更した場合、コミット前に以下を実施する。

1. `terraform fmt -recursive` でフォーマットを統一する
2. `terraform validate` で構文・設定の妥当性を確認する
3. `terraform plan` で変更内容を確認する
   - 意図しないリソースの作成・変更・削除がないか確認する
   - 特にEC2インスタンスなど課金が発生するリソースが、意図せず新規作成・再作成されていないか確認する
4. 機密情報（AWSアクセスキー、SSH秘密鍵、DBパスワード、JWTシークレットなど）がTerraformコード（`.tf`）や変数ファイル（`.tfvars`等）に直接書かれていないか確認する
   - `terraform.tfstate`にはリソース作成時の機密情報が平文で残るため、Gitに含めない（`.gitignore`で除外済み）
   - アプリケーションのシークレット（JWT_SECRET_KEY等）はTerraformで管理せず、`deploy/`配下のデプロイ手順・環境変数ファイルで扱う
5. Security Groupの変更がある場合、不要なポートを外部公開していないか確認する
   - 想定外のポート（特にDB用の3306番など）が`0.0.0.0/0`に対して開いていないか確認する

これらはCIでは自動実行されないため、`terraform/`配下を変更したPRでは、実施結果をPRの説明やコメントに記載する。

## エラー・不具合調査の記録

開発中に発生したエラー・不具合（バグ報告、原因不明のクラッシュ、テスト失敗の原因調査など）について、再現手順や原因調査を行った場合は、`docs/incidents/` 配下にMarkdownファイルとして記録する。

- ファイル名は `YYYY-MM-DD-短い説明.md` とする
- 記録する内容は最低限以下を含める
  - 発生した現象（再現手順、エラーメッセージ）
  - 調査方法（どうやって原因を特定・切り分けたか）
  - わかったこと（仮説が誤りだった場合はその経緯も含める）
  - 対応内容（原因を断定できなかった場合はその旨と、それでも取った対応の理由）
- 原因を100%特定できなかった場合でも、調査で判明した事実と、それでも取った対応の理由は残す
- 該当のPRがある場合は、同じ内容の要約をPRにもコメントとして残す
