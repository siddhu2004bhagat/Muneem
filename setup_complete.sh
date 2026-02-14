#!/bin/bash

# MUNEEM - Complete Raspberry Pi Kiosk Setup Script
# Usage: sudo ./setup_complete.sh

set -e # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting Muneem Kiosk Setup (v1.1)...${NC}"
echo -e "${YELLOW}This script will install dependencies, configure services, and setup Kiosk mode.${NC}"

# Get current directory
CURRENT_DIR=$(pwd)
CURRENT_USER=${SUDO_USER:-$USER}

echo -e "${BLUE}Running as user: $CURRENT_USER in $CURRENT_DIR${NC}"

# 1. Update System and Install Dependencies
echo -e "${YELLOW}Step 1: Installing System Dependencies...${NC}"
apt update
apt install -y curl

# Ensure Node.js 18+ is available
if ! command -v node &> /dev/null || [ "$(node -v | cut -d. -f1 | cut -dv -f2)" -lt 18 ]; then
    echo -e "${YELLOW}Setting up Node.js 18.x repository...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
fi

apt install -y python3-pip python3-venv nodejs npm git \
    tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin \
    libtesseract-dev libleptonica-dev \
    x11-xserver-utils unclutter chromium libgl1

# 2. Install Node.js Dependencies and Build Frontend
echo -e "${YELLOW}Step 2: Building Frontend...${NC}"
# Use sudo -u to run as normal user to avoid permission issues with node_modules
sudo -u $CURRENT_USER npm install
sudo -u $CURRENT_USER npm run build

# 3. Setup Backend Environment
echo -e "${YELLOW}Step 3: Setting up Backend...${NC}"

# Install system-level python dependencies to act as fallbacks/pre-built wheels
sudo apt install -y python3-pydantic python3-cryptography python3-sqlalchemy

cd backend
if [ ! -d "venv" ]; then
    sudo -u $CURRENT_USER python3 -m venv venv --system-site-packages
fi
source venv/bin/activate

# Upgrade build tools
pip install --upgrade pip setuptools wheel

# Install requirements, preferring binary wheels
# CRITICAL: Force Pydantic to use binary or system package to avoid Rust compilation
echo -e "${BLUE}Installing Python dependencies (skipping compilation)...${NC}"

# Install simple dependencies first
pip install --only-binary=:all: "fastapi>=0.110.0" "uvicorn[standard]>=0.29.0" python-dotenv requests websockets

# Try to install pydantic binary. If it fails, we rely on the system package (python3-pydantic) installed earlier.
# We DO NOT want pip to try compiling pydantic-core from source if a binary isn't available.
pip install --only-binary=:all: pydantic || echo "⚠️ Pydantic binary not found, using system package..."

# Install remaining requirements, ignoring errors for packages already satisfied by system
pip install --only-binary=:all: -r requirements.txt || true 

deactivate

# Setup .env if missing
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating default backend .env${NC}"
    sudo -u $CURRENT_USER cp .env.example .env
fi
cd ..

# 4. Setup OCR Service Environment
echo -e "${YELLOW}Step 4: Setting up OCR Service...${NC}"

# Install system dependencies for image processing to avoid compilation
sudo apt install -y python3-pil python3-numpy python3-opencv

cd backend/services/tesseract_ocr

# Remove old venv if it exists without system packages
if [ -d "venv" ]; then
    rm -rf venv
fi

if [ ! -d "venv" ]; then
    sudo -u $CURRENT_USER python3 -m venv venv --system-site-packages
fi

source venv/bin/activate
pip install --upgrade pip setuptools wheel

# Install with binary preference to avoid compilation (especially for opencv/numpy/pydantic)
echo -e "${BLUE}Installing OCR dependencies (skipping compilation)...${NC}"
pip install --only-binary=:all: -r requirements.txt || pip install -r requirements.txt

deactivate
cd ../../..

# 5. Configure Systemd Services
echo -e "${YELLOW}Step 5: Configuring Services...${NC}"

# Fix paths in service files
sed -i "s|/home/pi/digi-bahi-ink|$CURRENT_DIR|g" muneem-*.service
sed -i "s|User=pi|User=$CURRENT_USER|g" muneem-*.service

# Copy service files
cp muneem-*.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable muneem-backend muneem-frontend muneem-ocr
systemctl restart muneem-backend muneem-frontend muneem-ocr

# 6. Setup Kiosk Launch Script
echo -e "${YELLOW}Step 6: Setting up Kiosk Mode...${NC}"
mkdir -p /home/$CURRENT_USER/.config/autostart
chown -R $CURRENT_USER:$CURRENT_USER /home/$CURRENT_USER/.config/autostart

# Create Kiosk Launcher Script
cat > scripts/launch_kiosk.sh <<EOF
#!/bin/bash
# Muneem Kiosk Launcher

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Wait for backend health check
echo "Waiting for services..."
until curl -s http://localhost:8000/api/v1/health > /dev/null; do
    sleep 2
done

# Launch Chromium in Kiosk Mode
# Detect correct binary
CHROMIUM_BIN=chromium
if command -v chromium-browser &> /dev/null; then
    CHROMIUM_BIN=chromium-browser
fi

$CHROMIUM_BIN --kiosk --noerrdialogs --disable-infobars \
    --check-for-update-interval=31536000 \
    --disable-restore-session-state \
    --disable-session-crashed-bubble \
    http://localhost:5173
EOF
chmod +x scripts/launch_kiosk.sh
chown $CURRENT_USER:$CURRENT_USER scripts/launch_kiosk.sh

# Create Desktop Entry for Autostart
cat > /home/$CURRENT_USER/.config/autostart/muneem.desktop <<EOF
[Desktop Entry]
Type=Application
Name=MUNEEM Kiosk
Exec=$CURRENT_DIR/scripts/launch_kiosk.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF
chown $CURRENT_USER:$CURRENT_USER /home/$CURRENT_USER/.config/autostart/muneem.desktop

echo -e "${GREEN}✅ Installation Complete!${NC}"
echo -e "${BLUE}The system will reboot in 5 seconds to start Kiosk mode.${NC}"
sleep 5
reboot
