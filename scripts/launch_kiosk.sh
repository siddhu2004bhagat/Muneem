#!/bin/bash

# MUNEEM Kiosk Launcher
# Waits for services and launches Chromium in kiosk mode

export DISPLAY=:0
export XAUTHORITY=/home/siddhu/.Xauthority

# Disable screen blanking
xset s off 2>/dev/null || true
xset -dpms 2>/dev/null || true
xset s noblank 2>/dev/null || true

# Wait for services to be ready
echo "Waiting for services..."
sleep 10

# Check if backend is ready
until curl -s http://localhost:8000/api/v1/health > /dev/null 2>&1; do
    echo "Waiting for backend..."
    sleep 2
done

# Find chromium binary
CHROMIUM_CMD=$(command -v chromium-browser || command -v chromium || echo "chromium")

# Launch Chromium in kiosk mode with touch/pointer events enabled
$CHROMIUM_CMD \
    --kiosk \
    --touch-events=enabled \
    --enable-features=TouchpadOverscrollHistoryNavigation \
    --force-device-scale-factor=1 \
    --noerrdialogs \
    --disable-infobars \
    --no-first-run \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --disable-pinch \
    --overscroll-history-navigation=0 \
    --autoplay-policy=no-user-gesture-required \
    http://localhost:5173
