#!/bin/bash

# Script to set environment variables for Digital Ocean App Platform
# This script requires the DO API token to be set in DIGITALOCEAN_ACCESS_TOKEN

set -e

APP_ID="9e7d6e0c-ea5b-494d-b34b-d8709074f2ad"
DO_TOKEN="${DIGITALOCEAN_ACCESS_TOKEN}"

if [ -z "$DO_TOKEN" ]; then
  echo "Error: DIGITALOCEAN_ACCESS_TOKEN environment variable is not set"
  exit 1
fi

# Database URL (get from: doctl databases connection <db-id> --format URI)
DATABASE_URL="${DATABASE_URL:-<GET_FROM_DOCTL>}"

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="${JWT_SECRET:-<GENERATE_WITH_OPENSSL>}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-<GENERATE_WITH_OPENSSL>}"

echo "Setting environment variables for app $APP_ID..."

# Get current app spec
CURRENT_SPEC=$(doctl apps spec get $APP_ID)

# Update the spec with environment variables
cat > /tmp/app-update.yaml <<EOF
name: beloura-hiring
region: nyc

services:
  - name: backend
    github:
      repo: tcmaholdings-cyber/beloura-hiring
      branch: main
      deploy_on_push: true
    source_dir: /backend
    dockerfile_path: backend/Dockerfile
    http_port: 3001
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /api
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3001"
      - key: DATABASE_URL
        value: "$DATABASE_URL"
        scope: RUN_AND_BUILD_TIME
        type: SECRET
      - key: JWT_SECRET
        value: "$JWT_SECRET"
        scope: RUN_AND_BUILD_TIME
        type: SECRET
      - key: JWT_REFRESH_SECRET
        value: "$JWT_REFRESH_SECRET"
        scope: RUN_AND_BUILD_TIME
        type: SECRET
      - key: CORS_ORIGIN
        value: https://beloura-hiring-4aywc.ondigitalocean.app
    health_check:
      http_path: /api/health

  - name: frontend
    github:
      repo: tcmaholdings-cyber/beloura-hiring
      branch: main
      deploy_on_push: true
    source_dir: /frontend
    dockerfile_path: frontend/Dockerfile
    http_port: 80
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    envs:
      - key: VITE_API_URL
        value: https://beloura-hiring-4aywc.ondigitalocean.app/api
EOF

# Apply the updated spec
doctl apps update $APP_ID --spec /tmp/app-update.yaml

echo "✅ Environment variables set successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Monitor deployment: doctl apps list-deployments $APP_ID"
echo "2. View logs: doctl apps logs $APP_ID --type=run"
echo "3. Check app: https://beloura-hiring-4aywc.ondigitalocean.app"
