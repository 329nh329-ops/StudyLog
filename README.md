# StudyLog

ITを学習しているユーザーが、学習内容・学習時間・理解度を記録し、継続的に確認できるWebアプリケーション。

## 技術構成

- フロントエンド: Next.js (TypeScript)
- バックエンド: FastAPI (Python)
- データベース: MySQL
- 認証: JWT (HttpOnly Cookie)
- コンテナ: Docker / Docker Compose

## セットアップ

```bash
cp .env.example .env
docker compose up -d --build
```

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000 （`/health` でヘルスチェック、`/docs` でSwagger UI）
- MySQL: localhost:3306

## Lint

```bash
# frontend
cd frontend && npm run lint

# backend
cd backend && ruff check . && ruff format --check .
```
