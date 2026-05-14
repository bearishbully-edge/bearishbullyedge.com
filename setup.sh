#!/bin/bash

# ============================================
# BearishBully Edge - Quick Setup Script
# Automates the initial setup process
# ============================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         🚀 BearishBully Edge - Quick Setup               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
echo -e "${BLUE}[1/7]${NC} Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed!${NC}"
    echo "Please install Node.js 18+ from: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo ""

# Check if .env.local exists
echo -e "${BLUE}[2/7]${NC} Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ No .env.local file found${NC}"
    echo "Copying .env.example to .env.local..."
    cp .env.example .env.local
    echo -e "${YELLOW}⚠ Please edit .env.local with your Supabase credentials${NC}"
    echo ""
    echo "Required variables:"
    echo "  • NEXT_PUBLIC_SUPABASE_URL"
    echo "  • NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  • SUPABASE_SERVICE_ROLE_KEY"
    echo ""
    echo "Get these from: https://supabase.com → Your Project → Settings → API"
    echo ""
    read -p "Press Enter after you've updated .env.local..."
fi

echo -e "${GREEN}✓ Environment file exists${NC}"
echo ""

# Validate environment variables
echo -e "${BLUE}[3/7]${NC} Validating environment variables..."
source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" == "your-project-url.supabase.co" ]; then
    echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_URL is not configured${NC}"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" == "your-anon-key-here" ]; then
    echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured${NC}"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ "$SUPABASE_SERVICE_ROLE_KEY" == "your-service-role-key-here" ]; then
    echo -e "${RED}✗ SUPABASE_SERVICE_ROLE_KEY is not configured${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables configured${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}[4/7]${NC} Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Running npm install..."
    npm install --quiet
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Type check
echo -e "${BLUE}[5/7]${NC} Running TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✓ No TypeScript errors${NC}"
else
    echo -e "${YELLOW}⚠ TypeScript errors detected (non-critical)${NC}"
fi
echo ""

# Database setup reminder
echo -e "${BLUE}[6/7]${NC} Database setup..."
echo "Make sure you've run the following in Supabase SQL Editor:"
echo "  1. Open https://supabase.com → Your Project → SQL Editor"
echo "  2. Run the contents of: supabase-schema.sql"
echo "  3. Verify with: SELECT * FROM volume_data;"
echo ""
read -p "Have you deployed the database schema? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠ Please deploy the database schema before continuing${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database schema deployed${NC}"
echo ""

# Test API
echo -e "${BLUE}[7/7]${NC} Testing API endpoint..."
echo "Starting dev server and testing API..."

# Start dev server in background
npm run dev > /tmp/bearishbully-dev.log 2>&1 &
DEV_PID=$!

# Wait for server to start
echo -n "Waiting for server to start"
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo ""
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# Run API test
if [ -f "./scripts/test-api.sh" ]; then
    chmod +x ./scripts/test-api.sh
    if ./scripts/test-api.sh; then
        echo -e "${GREEN}✓ API test passed${NC}"
    else
        echo -e "${YELLOW}⚠ API test failed (check logs)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Test script not found${NC}"
fi

# Kill dev server
kill $DEV_PID 2>/dev/null || true

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              ✅ Setup Complete!                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Your BearishBully Edge terminal is ready!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start the development server:"
echo -e "     ${BLUE}npm run dev${NC}"
echo ""
echo "  2. Open in your browser:"
echo -e "     ${BLUE}http://localhost:3000${NC}"
echo ""
echo "  3. To deploy to production:"
echo -e "     ${BLUE}npm i -g vercel${NC}"
echo -e "     ${BLUE}vercel${NC}"
echo ""
echo "Documentation:"
echo "  • README.md          - Main documentation"
echo "  • API.md             - API reference"
echo "  • DEPLOYMENT.md      - Deployment guide"
echo "  • NINJATRADER.md     - NinjaTrader integration"
echo "  • ARCHITECTURE.md    - System architecture"
echo ""
echo -e "${GREEN}Happy trading! 📈${NC}"
echo ""
