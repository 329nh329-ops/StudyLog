#!/bin/bash
set -eux

dnf update -y
dnf install -y docker git

systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

DOCKER_COMPOSE_VERSION="v2.29.7"
curl -SL "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/libexec/docker/cli-plugins/docker-compose || true

cd /home/ec2-user
git clone --branch ${repo_branch} --single-branch ${repo_url} app
cd app

TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)

cat > .env <<EOF
JWT_SECRET_KEY=${jwt_secret_key}
SEED_ADMIN_USERNAME=${seed_admin_username}
SEED_ADMIN_PASSWORD=${seed_admin_password}
NEXT_PUBLIC_API_BASE_URL=http://$${PUBLIC_IP}:8000
CORS_ALLOW_ORIGINS=["http://$${PUBLIC_IP}:3000"]
EOF

chown -R ec2-user:ec2-user /home/ec2-user/app

/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d --build
