#!/bin/bash

# DigiBahi Kiosk Mode Startup Script
# For Raspberry Pi 4/5 with 7" touchscreen
# Runs application in fullscreen kiosk mode

set -e

echo "🚀 Starting DigiBahi in Kiosk Mode..."

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

# Check if Chromium is installed
if ! command -v chromium-browser &> /dev/null && ! command -v chromium &> /dev/null; then
    echo "⚠️  Chromium not found. Installing..."
    sudo apt update
    sudo apt install -y chromium-browser
fi

CHROMIUM_CMD=$(command -v chromium-browser || command -v chromium)

# Start backend services in background
echo "🔧 Starting backend services..."
./start.sh > /dev/null 2>&1 &

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 5

# Check if services are running
if ! curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    echo "❌ Backend not responding. Please check logs."
    exit 1
fi

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Start Chromium in kiosk mode
echo "🌐 Launching Chromium in kiosk mode..."
$CHROMIUM_CMD \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --disable-features=TranslateUI \
    --disable-features=BlinkGenPropertyTrees \
    --autoplay-policy=no-user-gesture-required \
    --check-for-update-interval=31536000 \
    --disable-background-networking \
    --disable-background-timer-throttling \
    --disable-backgrounding-occluded-windows \
    --disable-breakpad \
    --disable-client-side-phishing-detection \
    --disable-component-update \
    --disable-default-apps \
    --disable-dev-shm-usage \
    --disable-domain-reliability \
    --disable-extensions \
    --disable-features=AudioServiceOutOfProcess \
    --disable-hang-monitor \
    --disable-ipc-flooding-protection \
    --disable-notifications \
    --disable-offer-store-unmasked-wallet-cards \
    --disable-popup-blocking \
    --disable-print-preview \
    --disable-prompt-on-repost \
    --disable-speech-api \
    --disable-sync \
    --disable-translate \
    --disable-wake-on-wifi \
    --metrics-recording-only \
    --mute-audio \
    --no-first-run \
    --no-default-browser-check \
    --no-pings \
    --password-store=basic \
    --use-mock-keychain \
    --use-gl=swiftshader \
    --enable-features=VaapiVideoDecoder \
    http://localhost:5173

echo "✅ Kiosk mode started"

