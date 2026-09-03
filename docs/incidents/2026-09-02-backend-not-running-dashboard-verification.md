# Dashboard実機確認時にBackendが未起動だった事象（PR #55）

## 概要

Phase 10-3（Dashboard Redesign、PR #55）の実装完了後、`npm run lint` / `tsc --noEmit` / `npm run test` / `npm run build` がすべて成功したことを確認したうえで、ブラウザによる実機確認（Desktop / Mobileでの表示確認、ログイン→Dashboard遷移の動作確認）を行おうとしたところ、Backendが未起動であることが判明し、認証が必要なDashboardページの実機確認ができない状態だった。

当時稼働していたのはFrontendの開発サーバー（`npm run dev`、ポート3000）のみで、Backend（FastAPI、ポート8000）・MySQLはいずれも起動していなかった。

## 発見方法

1. `npm run build` 成功後、Backendの起動を試みる目的で `cd backend && uvicorn app.main:app --reload --port 8000` を実行したところ、`command not found: uvicorn` エラーが発生した
2. `backend/` 配下に `.venv` 等の仮想環境ディレクトリが存在せず、依存パッケージ（`requirements.txt` に定義されたFastAPI等）がローカル環境にインストールされていないことを確認した
3. この時点でBackendの正しい起動方法が不明であり、推測でコマンドを試すのではなく、プロジェクトの構成ファイル（README.md、docker-compose.yml、CI設定等）を調査する方針に切り替えた
4. 調査の結果、ルート直下の `README.md` に `docker compose up -d --build` を用いた公式なセットアップ手順が明記されていることが分かった
5. `docker compose ps` を実行したところ、`Cannot connect to the Docker daemon` エラーが発生し、**Docker Desktopアプリ自体が起動していない**ことが直接の原因だと判明した

## わかったこと

- StudyLog Backendは、ローカルに直接 `uvicorn` をインストールして起動する運用ではなく、**Docker Compose（frontend / backend / db の3サービス構成）を用いてローカル環境を構築する設計**になっている
- `backend/` に仮想環境が存在しないのは異常ではなく、そもそもホストOS上で直接Pythonプロセスを起動する想定の構成ではなかった
- Docker自体（`docker` コマンド、Docker Compose v5.1.4）はマシンにインストール済みだったが、Docker Desktopのデーモンプロセスが起動していなかったため、`docker compose` コマンドがすべて失敗していた
- ルート直下に `.env`（`.env.example` と同一内容）が既に存在しており、`docker compose up` はこれを自動的に読み込む状態だった
- CI（`.github/workflows/ci.yml`）のbackendジョブは `pytest` 実行のみで `uvicorn` を起動していないため、CIログからは正しい起動方法を読み取れなかった。起動手順はREADME.mdの「セットアップ」セクションにのみ明記されていた

## 対応

1. Docker Desktopアプリを起動（`open -a Docker`）し、デーモンの起動を待機した
2. `docker compose up -d --build` でfrontend / backend / db の3コンテナをビルド・起動した
3. 初回セットアップとして `docker compose run --rm backend alembic upgrade head`（マイグレーション）と `docker compose run --rm backend python -m app.db.seed`（初期データ投入）を実行した
4. `curl` で `/health`、認証API（`/api/auth/login`）、Dashboard API（`/api/dashboard`）が正常に応答することを確認した
5. Docker版Frontendと衝突しないよう、事前にホスト側で直接動かしていた `npm run dev`（ポート3000）を停止した

以降のブラウザでの実機確認は、Docker Compose環境（`http://localhost:3000`、Backend `http://localhost:8000`）に対して行う運用に統一した。

## 教訓

- Backendの起動方法が分からない場合、`uvicorn` を直接叩く、仮想環境を新規作成する、といった対応を推測で行う前に、必ずREADME.md・docker-compose.yml・CI設定など実際のプロジェクト構成ファイルを確認すること。今回はユーザーから明示的に「推測で判断せず調査してほしい」と指摘され、調査に切り替えたことで正しい手順（Docker Compose）にたどり着けた
- CIのジョブ定義は「テストを通す」ことが目的であり、ローカル開発環境の起動手順を必ずしも反映していない。起動方法はREADME等のセットアップドキュメントを一次情報として確認する
- `docker` コマンドが存在する（インストール済み）ことと、Docker Desktopのデーモンが実際に起動していることは別の話であり、`docker compose` 系コマンドのエラーメッセージ（`Cannot connect to the Docker daemon`）を早い段階で確認すれば、無駄な試行錯誤を避けられる
