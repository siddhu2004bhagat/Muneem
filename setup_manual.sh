#!/bin/bash

# MUNEEM - Manual Setup Script (No Kiosk Mode)
# Usage: ./setup_manual.sh

set -e # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting Muneem Manual Setup...${NC}"
echo -e "${YELLOW}This will install dependencies and build the application (NO kiosk mode).${NC}"

# Get current directory
CURRENT_DIR=$(pwd)
CURRENT_USER=${SUDO_USER:-$USER}

echo -e "${BLUE}Running in: $CURRENT_DIR${NC}"

# 1. Install System Dependencies
echo -e "${YELLOW}Step 1: Installing System Dependencies...${NC}"
sudo apt update
sudo apt install -y curl python3-pip python3-venv nodejs npm git \
    tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin \
    libtesseract-dev libleptonica-dev \
    python3-pydantic python3-cryptography python3-sqlalchemy \
    python3-pil python3-numpy python3-opencv

# 2. Build Frontend
echo -e "${YELLOW}Step 2: Building Frontend...${NC}"
npm install
npm run build

# 3. Setup Backend Environment
echo -e "${YELLOW}Step 3: Setting up Backend...${NC}"
cd backend

if [ -d "venv" ]; then
    rm -rf venv
fi

python3 -m venv venv --system-site-packages
source venv/bin/activate

pip install --upgrade pip setuptools wheel

echo -e "${BLUE}Installing Python dependencies (skipping compilation)...${NC}"
pip install --only-binary=:all: "fastapi>=0.110.0" "uvicorn[standard]>=0.29.0" python-dotenv requests websockets || true
pip install --only-binary=:all: pydantic || echo "⚠️ Pydantic binary not found, using system package..."
pip install --only-binary=:all: -r requirements.txt || true 

deactivate

# Setup .env if missing
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating default backend .env${NC}"
    cp .env.example .env 2>/dev/null || echo "No .env.example found, skipping"
fi

cd ..

# 4. Setup OCR Service Environment
echo -e "${YELLOW}Step 4: Setting up OCR Service...${NC}"
cd backend/services/tesseract_ocr

if [ -d "venv" ]; then
    rm -rf venv
fi

python3 -m venv venv --system-site-packages
source venv/bin/activate

pip install --upgrade pip setuptools wheel

echo -e "${BLUE}Installing OCR dependencies (skipping compilation)...${NC}"
pip install --only-binary=:all: -r requirements.txt || pip install -r requirements.txt

deactivate
cd ../../..

echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${BLUE}To start the application, run: ./start.sh${NC}"
echo -e "${BLUE}Then access it at: http://localhost:5173${NC}"
