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

echo -e "${BLUE}Starting Muneem Kiosk Setup...${NC}"
echo -e "${YELLOW}This script will install dependencies, configure services, and setup Kiosk mode.${NC}"

# Get current directory
CURRENT_DIR=$(pwd)
CURRENT_USER=${SUDO_USER:-$USER}

echo -e "${BLUE}Running as user: $CURRENT_USER in $CURRENT_DIR${NC}"

# 1. Update System and Install Dependencies
echo -e "${YELLOW}Step 1: Installing System Dependencies...${NC}"
apt update
apt install -y python3-pip python3-venv nodejs npm git \
    tesseract-ocr tesseract-ocr-eng tesseract-ocr-hin \
    libtesseract-dev libleptonica-dev \
    x11-xserver-utils unclutter chromium-browser \
    libgl1-mesa-glx # OpenCV dependency if needed

# 2. Install Node.js Dependencies and Build Frontend
echo -e "${YELLOW}Step 2: Building Frontend...${NC}"
# Use sudo -u to run as normal user to avoid permission issues with node_modules
sudo -u $CURRENT_USER npm install
sudo -u $CURRENT_USER npm run build

# 3. Setup Backend Environment
echo -e "${YELLOW}Step 3: Setting up Backend...${NC}"
cd backend
if [ ! -d "venv" ]; then
    sudo -u $CURRENT_USER python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Setup .env if missing
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating default backend .env${NC}"
    sudo -u $CURRENT_USER cp .env.example .env
fi
cd ..

# 4. Setup OCR Service Environment
echo -e "${YELLOW}Step 4: Setting up OCR Service...${NC}"
cd backend/services/tesseract_ocr
if [ ! -d "venv" ]; then
    sudo -u $CURRENT_USER python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
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
chromium-browser --kiosk --noerrdialogs --disable-infobars \
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
