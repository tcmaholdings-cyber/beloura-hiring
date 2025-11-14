#!/bin/bash

# BELOURA HIRING - Local Development Setup Script

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          BELOURA HIRING - Local Setup                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo -e "${GREEN}✅ Docker installed${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js v18+ from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js installed ($NODE_VERSION)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm installed ($NPM_VERSION)${NC}"

echo ""
echo "📦 Starting Docker services..."
cd docker
docker compose up -d || docker-compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Test database connection
echo "🔌 Testing database connection..."
until docker exec beloura-hiring-db pg_isready -U beloura_admin &> /dev/null; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo -e "${GREEN}✅ Database ready${NC}"

echo ""
echo "🔧 Setting up backend..."
cd ../backend

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database..."
npm run prisma:seed

echo ""
echo "🎨 Setting up frontend..."
cd ../frontend

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                   ✅ Setup Complete!                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 To start development:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   $ cd backend"
echo "   $ npm run dev"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   $ cd frontend"
echo "   $ npm run dev"
echo ""
echo "📍 Access Points:"
echo "   Frontend:      http://localhost:5173"
echo "   Backend API:   http://localhost:3001"
echo "   API Health:    http://localhost:3001/health"
echo "   pgAdmin:       http://localhost:5050"
echo "                  (admin@beloura.local / admin)"
echo "   Prisma Studio: cd backend && npx prisma studio"
echo ""
echo "📚 Test Credentials:"
echo "   Email: sourcer@beloura.local"
echo "   Email: interviewer@beloura.local"
echo "   Email: manager@beloura.local"
echo "   Password: password123"
echo ""
echo "🛑 To stop services:"
echo "   $ cd docker && docker compose down"
echo ""
