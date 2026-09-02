# 開発初期〜Phase 6で遭遇した問題（過去分まとめ）

このファイルは、`docs/incidents/` の運用を始める前（Phase 1〜6の開発期間）に開発中に遭遇し、引き継ぎノート（handoff.html）の「ハマりどころ」節に記録されていた事項を、記録として移行したもの。個別のインシデントファイルとしてではなく、まとめて1件として残す。

## テストが本番用DBを直接truncateする

`backend/tests/conftest.py` の `db_session` フィクスチャは、テスト専用DBではなく本番用 `studylog` DBそのものを使用し、テスト実行後に全テーブルをTRUNCATEする構成になっている。そのため、pytest実行後は開発用データ（seedデータ）が失われる。

**対応**：テスト実行後は `docker compose run --rm ... backend python -m app.db.seed` で再seedする運用で回避している。DBを完全に分離する根本対応は行っていない。

## `docker compose up` がバックグラウンドで稀にハングする

開発セッション中、`docker compose up -d frontend` などのコマンドがバックグラウンドで実行完了せず固まることが複数回発生した。

**対応**：`docker ps -a` でコンテナ状態を確認し、`Created` のまま起動していないコンテナがあれば `docker start <container_id>` で手動起動すると解決した。原因の特定はできていない。

## Docker Desktop起動直後は `docker info` が失敗する

開発セッション開始直後、Docker Desktopの起動が完了していないタイミングで `docker info` 等のコマンドを実行すると失敗する。

**対応**：`open -a Docker` の実行後、数十秒待ってからDocker関連コマンドを実行する。

## カテゴリ名のテストでUNIQUE制約違反

seed済みの初期カテゴリ（Java、Python等12件）と同じ名前でテスト用カテゴリを作成すると、カテゴリ名のUNIQUE制約（`is_deleted=FALSE` の範囲でユニーク）に違反してテストが失敗する。

**対応**：テストでは `TestCatXxx` のような、初期カテゴリと衝突しない専用の名前を使う運用にしている。

## backendコンテナにタイムゾーン設定がない

`docker-compose.yml` の `backend` サービスには `TZ` 環境変数が設定されていないため、コンテナ内の `date.today()` や `datetime.now()` はコンテナのシステムタイムゾーン（UTC等）に依存し、JST基準の「今日」と一致しない可能性がある。

**対応**：日付関連の処理は必ず `app/core/clock.py` の `today_jst()` を使い、`date.today()` や `datetime.now()` を直接使わないルールで運用している（`today_jst()` は `zoneinfo.ZoneInfo("Asia/Tokyo")` を用いて明示的にJST基準で計算する）。根本対応（`TZ` 環境変数の設定）は行っていない。
