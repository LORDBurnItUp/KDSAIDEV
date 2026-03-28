#!/bin/bash
# KDS Platform — Phase 1 Deploy Script
# Run this on your VPS or local machine

set -e

echo "╔══════════════════════════════════════════╗"
echo "║  KDS Platform — Phase 1 Deploy           ║"
echo "║  Kings Dripping Swag (2130)              ║"
echo "╚══════════════════════════════════════════╝"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Config
PROJECT_DIR="/root/.openclaw/workspace/kds-platform"
DEPLOY_DIR="/var/www/thekingsdrippin.io"
DOMAIN="thekingsdrippin.io"

echo -e "\n${YELLOW}[1/5]${NC} Installing dependencies..."
cd "$PROJECT_DIR"
npm install

echo -e "\n${YELLOW}[2/5]${NC} Building Next.js project..."
npm run build

echo -e "\n${YELLOW}[3/5]${NC} Preparing deploy directory..."
mkdir -p "$DEPLOY_DIR"

echo -e "\n${YELLOW}[4/5]${NC} Copying build files..."
cp -r .next "$DEPLOY_DIR/"
cp -r public "$DEPLOY_DIR/" 2>/dev/null || mkdir -p "$DEPLOY_DIR/public"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/"
cp next.config.js "$DEPLOY_DIR/"
cp -r src "$DEPLOY_DIR/" 2>/dev/null || true

echo -e "\n${YELLOW}[5/5]${NC} Installing production dependencies..."
cd "$DEPLOY_DIR"
npm install --production

echo -e "\n${GREEN}✓ Phase 1 deployed!${NC}"
echo -e "Domain: ${GREEN}https://$DOMAIN${NC}"
echo -e "\nTo start the server:"
echo -e "  cd $DEPLOY_DIR"
echo -e "  npm start"
echo -e "\nOr with PM2:"
echo -e "  pm2 start npm --name kds -- start"
