#!/bin/bash

# Build and serve static files
# This creates a production build and serves it

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

echo "🔨 Building production bundle..."
npm run build

echo ""
echo "📦 Installing serve..."
npm install -g serve 2>/dev/null || echo "serve already installed"

echo ""
echo "🚀 Starting static server..."
echo ""

# Start backend services
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
cd "$SCRIPT_DIR/.."

# Start static file server
serve -s dist -l 5173 --host 0.0.0.0 > /tmp/static.log 2>&1 &

sleep 2

echo "✅ Static server running on http://0.0.0.0:5173"
echo ""
echo "📱 Access from iPad:"
echo "   http://192.168.29.253:5173"
echo "   or"
echo "   http://Abduls-MacBook-Air-2.local:5173"
echo ""

