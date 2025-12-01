#!/bin/bash

# DigiBahi Raspberry Pi Setup Script
# Installs all dependencies and configures system for Linux tablet deployment

set -e

echo "🔧 DigiBahi Raspberry Pi Setup"
echo "================================"
echo ""

# Check if running on Raspberry Pi
if [ ! -f /proc/device-tree/model ] || ! grep -q "Raspberry Pi" /proc/device-tree/model; then
    echo "⚠️  Warning: This script is designed for Raspberry Pi"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install system dependencies
echo "📦 Installing system dependencies..."
sudo apt install -y \
    python3.10 \
    python3.10-venv \
    python3-pip \
    nodejs \
    npm \
    git \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-hin \
    libtesseract-dev \
    libleptonica-dev \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    chromium-browser \
    x11-xserver-utils \
    unclutter

# Install Node.js 18+ if not already installed
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Verify installations
echo ""
echo "✅ Verifying installations..."
node --version
python3 --version
tesseract --version | head -n 1
chromium-browser --version | head -n 1

echo ""
echo "✅ System setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone DigiBahi repository"
echo "2. Run: cd digi-bahi-ink && ./install.sh"
echo "3. Run: ./scripts/start-kiosk.sh (for kiosk mode)"
echo ""

