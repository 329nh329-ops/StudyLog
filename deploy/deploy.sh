#!/bin/bash
# StudyLog本番デプロイスクリプト
#
# ローカル(Mac)でDocker本番イメージをbuildし、EC2へ転送してDocker Composeで起動する。
# t3.micro(メモリ1GB)ではNext.jsのproduction buildがメモリ不足を起こすため、
# EC2上ではbuildを行わず、コンテナ実行のみを行う方式を採用している。
# 詳細な経緯は docs/incidents/ を参照。
#
# 使い方:
#   ./deploy/deploy.sh <EC2パブリックIP> <SSH秘密鍵パス> <.envファイルパス>
#
# .envファイルには以下を定義すること（deploy/env.prod.example参照）:
#   JWT_SECRET_KEY, SEED_ADMIN_USERNAME, SEED_ADMIN_PASSWORD,
#   NEXT_PUBLIC_API_BASE_URL, CORS_ALLOW_ORIGINS

set -euo pipefail

EC2_HOST="${1:?EC2パブリックIPを指定してください}"
SSH_KEY="${2:?SSH秘密鍵のパスを指定してください}"
ENV_FILE="${3:?本番用.envファイルのパスを指定してください}"

SSH_USER="ec2-user"
REMOTE_APP_DIR="/home/ec2-user/app"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

SSH_OPTS=(-o StrictHostKeyChecking=accept-new -i "$SSH_KEY")

echo "==> [1/6] backendイメージをbuild"
docker build --platform linux/amd64 \
  -f "$PROJECT_ROOT/backend/Dockerfile.prod" \
  -t studylog-backend:prod \
  "$PROJECT_ROOT/backend"

echo "==> [2/6] frontendイメージをbuild"
NEXT_PUBLIC_API_BASE_URL="$(grep -E '^NEXT_PUBLIC_API_BASE_URL=' "$ENV_FILE" | cut -d= -f2-)"
docker build --platform linux/amd64 \
  -f "$PROJECT_ROOT/frontend/Dockerfile.prod" \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
  -t studylog-frontend:prod \
  "$PROJECT_ROOT/frontend"

echo "==> [3/6] イメージをtar.gzにexport"
docker save studylog-backend:prod | gzip > "$WORK_DIR/backend.tar.gz"
docker save studylog-frontend:prod | gzip > "$WORK_DIR/frontend.tar.gz"

echo "==> [4/6] EC2へ転送"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$EC2_HOST" "mkdir -p $REMOTE_APP_DIR"
scp "${SSH_OPTS[@]}" \
  "$WORK_DIR/backend.tar.gz" \
  "$WORK_DIR/frontend.tar.gz" \
  "$PROJECT_ROOT/docker-compose.prod.yml" \
  "$ENV_FILE" \
  "$SSH_USER@$EC2_HOST:$REMOTE_APP_DIR/"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$EC2_HOST" \
  "mv $REMOTE_APP_DIR/$(basename "$ENV_FILE") $REMOTE_APP_DIR/.env"

echo "==> [5/6] EC2上でイメージをload"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$EC2_HOST" "
  sudo docker load -i $REMOTE_APP_DIR/backend.tar.gz &&
  sudo docker load -i $REMOTE_APP_DIR/frontend.tar.gz &&
  rm -f $REMOTE_APP_DIR/backend.tar.gz $REMOTE_APP_DIR/frontend.tar.gz
"

echo "==> [6/6] Docker Composeで起動"
ssh "${SSH_OPTS[@]}" "$SSH_USER@$EC2_HOST" "
  cd $REMOTE_APP_DIR &&
  sudo /usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
"

echo "==> デプロイ完了"
echo "Frontend: http://$EC2_HOST:3000"
echo "Backend:  http://$EC2_HOST:8000/health"
