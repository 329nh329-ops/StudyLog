#!/bin/bash
set -eux

dnf update -y
dnf install -y docker

systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

DOCKER_COMPOSE_VERSION="v2.29.7"
curl -SL "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/libexec/docker/cli-plugins/docker-compose || true

mkdir -p /home/ec2-user/app
chown -R ec2-user:ec2-user /home/ec2-user/app
