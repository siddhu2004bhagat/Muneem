#!/bin/bash

# DigiBahi Raspberry Pi Setup Validation Script
# Tests all critical components for Pi deployment

set -e

echo "🔍 DigiBahi Raspberry Pi Setup Validation"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

warn() {
    echo -e "${YELLOW}⚠️${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# Check Python version
echo "📦 Checking Python..."
PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$PYTHON_MINOR" -ge 10 ]; then
    check "Python $PYTHON_VERSION (>= 3.10 required)"
else
    check "Python $PYTHON_VERSION (>= 3.10 required)" || true
fi

# Check Node.js version
echo ""
echo "📦 Checking Node.js..."
NODE_VERSION=$(node --version 2>&1 | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ "$NODE_MAJOR" -ge 18 ]; then
    check "Node.js $NODE_VERSION (>= 18 required)"
else
    check "Node.js $NODE_VERSION (>= 18 required)" || true
fi

# Check Tesseract
echo ""
echo "📦 Checking Tesseract OCR..."
if command -v tesseract &> /dev/null; then
    TESS_VERSION=$(tesseract --version 2>&1 | head -n 1)
    check "Tesseract installed: $TESS_VERSION"
    
    # Check for language data
    if [ -d "/usr/share/tesseract-ocr/5/tessdata" ] || [ -d "/usr/share/tesseract-ocr/4.00/tessdata" ]; then
        check "Tesseract language data directory exists"
    else
        warn "Tesseract language data directory not found (may need: sudo apt install tesseract-ocr-eng tesseract-ocr-hin)"
    fi
else
    check "Tesseract installed" || true
fi

# Check Chromium
echo ""
echo "🌐 Checking Chromium..."
if command -v chromium-browser &> /dev/null || command -v chromium &> /dev/null; then
    check "Chromium browser installed"
else
    warn "Chromium not found (required for kiosk mode)"
fi

# Check backend dependencies
echo ""
echo "🐍 Checking Python dependencies..."
if [ -d "backend/venv" ]; then
    check "Backend virtual environment exists"
    
    # Check if psutil is installed (for memory monitoring)
    if [ -f "backend/venv/bin/activate" ]; then
        source backend/venv/bin/activate
        if python3 -c "import psutil" 2>/dev/null; then
            check "psutil installed (memory monitoring)"
        else
            warn "psutil not installed (run: pip install psutil)"
        fi
        deactivate
    fi
else
    warn "Backend virtual environment not found (run: ./install.sh)"
fi

# Check frontend dependencies
echo ""
echo "⚛️  Checking Node.js dependencies..."
if [ -d "node_modules" ]; then
    check "Frontend dependencies installed"
else
    warn "Frontend dependencies not installed (run: npm install)"
fi

# Check critical files
echo ""
echo "📁 Checking critical files..."
[ -f "src/lib/platform.ts" ] && check "Platform detection utility exists" || check "Platform detection utility exists" || true
[ -f "src/features/pen-input/services/ocrHybrid.service.ts" ] && check "OCR service with backend routing exists" || check "OCR service exists" || true
[ -f "backend/app/utils/memory.py" ] && check "Memory monitoring utility exists" || check "Memory monitoring utility exists" || true
[ -f "scripts/start-kiosk.sh" ] && check "Kiosk mode script exists" || check "Kiosk mode script exists" || true
[ -f "scripts/pi-setup.sh" ] && check "Pi setup script exists" || check "Pi setup script exists" || true

# Check if running on Raspberry Pi
echo ""
echo "🖥️  Checking platform..."
if [ -f "/proc/device-tree/model" ]; then
    MODEL=$(cat /proc/device-tree/model 2>/dev/null || echo "unknown")
    if echo "$MODEL" | grep -q "Raspberry Pi"; then
        check "Running on Raspberry Pi: $MODEL"
    else
        warn "Not running on Raspberry Pi (detected: $MODEL)"
    fi
else
    warn "Cannot detect platform (not Linux or /proc not available)"
fi

# Check architecture
if command -v uname &> /dev/null; then
    ARCH=$(uname -m)
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
        check "ARM64 architecture detected"
    elif [ "$ARCH" = "armv7l" ]; then
        warn "ARM32 architecture (ARM64 recommended)"
    else
        warn "Non-ARM architecture: $ARCH (expected ARM64 for Pi)"
    fi
fi

# Summary
echo ""
echo "=========================================="
echo "📊 Validation Summary"
echo "=========================================="
PASSED=$(( $(grep -c "✅" <<< "$(cat)" 2>/dev/null || echo 0) ))
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "${RED}❌ Errors: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Validation passed! Ready for deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ Validation failed. Please fix errors before deployment.${NC}"
    exit 1
fi

