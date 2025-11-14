#!/bin/bash

# BELOURA HIRING - Database Reset Script

set -e

echo "⚠️  WARNING: This will delete ALL data in the local database!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [ "$REPLY" != "yes" ]; then
    echo "❌ Reset cancelled"
    exit 0
fi

echo "🗄️  Resetting database..."

# Stop and remove containers with volumes
cd docker
docker compose down -v || docker-compose down -v

# Start fresh
docker compose up -d || docker-compose up -d

echo "⏳ Waiting for PostgreSQL..."
sleep 10

# Run migrations
cd ../backend
echo "🔨 Running migrations..."
npx prisma migrate reset --force

echo "🌱 Seeding database..."
npm run prisma:seed

echo ""
echo "✅ Database reset complete!"
echo ""
echo "📊 Access Prisma Studio to view data:"
echo "   $ cd backend && npx prisma studio"
echo ""
