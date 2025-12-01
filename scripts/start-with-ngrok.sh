#!/bin/bash

# Start app with ngrok tunnel
# This creates a public URL accessible from anywhere

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

echo "🚀 Starting app with ngrok tunnel..."
echo ""

# Start the app normally
./start.sh

# Wait a bit for services to start
sleep 5

# Kill any existing ngrok
pkill -f "ngrok http" 2>/dev/null || true
sleep 1

# Start ngrok tunnel for frontend
echo "🌐 Starting ngrok tunnel..."
ngrok http 5173 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

sleep 5

# Get the public URL (try multiple times)
NGROK_URL=""
for i in {1..5}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)
    if [ -n "$NGROK_URL" ]; then
        break
    fi
    sleep 2
done

if [ -n "$NGROK_URL" ]; then
    echo ""
    echo "✅ ngrok tunnel active!"
    echo ""
    echo "📱 Access from iPad:"
    echo "   $NGROK_URL"
    echo ""
    echo "⚠️  Note: This URL is public and accessible from anywhere"
    echo "   To stop: ./stop.sh && kill $NGROK_PID"
else
    echo "❌ Failed to get ngrok URL. Check http://localhost:4040"
fi

