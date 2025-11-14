#!/bin/bash

set -e

echo "🚀 Starting Beloura Hiring deployment to Digital Ocean..."

# Database connection details (set in Digital Ocean environment)
DB_URL="${DATABASE_URL:-postgresql://doadmin:<PASSWORD>@beloura-hiring-db-do-user-27680736-0.l.db.ondigitalocean.com:25060/defaultdb?sslmode=require}"

# JWT Secrets (set in Digital Ocean environment)
JWT_SECRET="${JWT_SECRET:-<GENERATE_RANDOM_SECRET>}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-<GENERATE_RANDOM_SECRET>}"

echo "📦 Building Docker images..."

# Build backend
echo "Building backend..."
cd backend
docker build -t beloura-hiring-backend:latest .

# Build frontend
echo "Building frontend..."
cd ../frontend
docker build -t beloura-hiring-frontend:latest .

cd ..

echo "✅ Docker images built successfully!"

echo ""
echo "📝 Next steps:"
echo "1. Push images to a container registry (Docker Hub or DigitalOcean Container Registry)"
echo "2. Create Digital Ocean App using the app.yaml spec"
echo "3. Configure environment variables in Digital Ocean App Platform:"
echo "   - DATABASE_URL: ${DB_URL}"
echo "   - JWT_SECRET: ${JWT_SECRET}"
echo "   - JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}"
echo "4. Deploy the application"
echo ""
echo "Or use Digital Ocean App Platform's Git integration for automatic deployment"
