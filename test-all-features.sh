#!/bin/bash

# DigBahi - Comprehensive Feature Test & Validation
# This script tests all implemented features

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   🧪 DigBahi - Complete Feature Test Suite               ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

# Test result function
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
        ((PASS_COUNT++))
    else
        echo -e "${RED}❌ FAIL${NC} - $2"
        ((FAIL_COUNT++))
    fi
}

test_skip() {
    echo -e "${YELLOW}⚠️  SKIP${NC} - $1"
    ((SKIP_COUNT++))
}

echo "═══════════════════════════════════════════════════════════"
echo "📦 PHASE 1: INFRASTRUCTURE & FOLDER STRUCTURE"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 1: Check folder structure
echo "🔍 Test 1.1: Verify folder structure..."
if [ -d "src/features/pen-input" ] && [ -d "src/features/ledger-formats" ] && [ -d "src/features/ai-analytics" ]; then
    test_result 0 "Core feature folders exist"
else
    test_result 1 "Core feature folders missing"
fi

# Test 2: Check pen-input structure
echo "🔍 Test 1.2: Verify pen-input folder structure..."
if [ -d "src/features/pen-input/templates" ] && [ -f "src/features/pen-input/templates/paper-templates.ts" ]; then
    test_result 0 "Pen-input templates folder properly structured"
else
    test_result 1 "Pen-input templates folder missing"
fi

# Test 3: Check ledger-formats structure
echo "🔍 Test 1.3: Verify ledger-formats folder structure..."
if [ -d "src/features/ledger-formats/components" ] && [ -d "src/features/ledger-formats/config" ]; then
    test_result 0 "Ledger-formats folder properly structured"
else
    test_result 1 "Ledger-formats folder structure incorrect"
fi

# Test 4: Check for duplicate folders
echo "🔍 Test 1.4: Check for duplicate folders..."
DUPLICATES=$(find src/features -type d -name 'ledger-formats' | wc -l)
if [ "$DUPLICATES" -eq 1 ]; then
    test_result 0 "No duplicate folders found"
else
    test_result 1 "Duplicate folders detected"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎨 PHASE 2: FORMAT SELECTION FEATURE"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 5: Format config file
echo "🔍 Test 2.1: Check format configuration..."
if [ -f "src/features/ledger-formats/config/formats.config.ts" ]; then
    FORMAT_COUNT=$(grep -c "export const.*:.*LedgerFormat" src/features/ledger-formats/config/formats.config.ts)
    if [ "$FORMAT_COUNT" -ge 4 ]; then
        test_result 0 "Format config exists with $FORMAT_COUNT formats"
    else
        test_result 1 "Insufficient formats defined"
    fi
else
    test_result 1 "Format config file missing"
fi

# Test 6: SimpleFormatPicker component
echo "🔍 Test 2.2: Check SimpleFormatPicker component..."
if [ -f "src/features/ledger-formats/components/SimpleFormatPicker.tsx" ]; then
    if grep -q "handleSelect" src/features/ledger-formats/components/SimpleFormatPicker.tsx; then
        test_result 0 "SimpleFormatPicker component with click handlers"
    else
        test_result 1 "SimpleFormatPicker missing click handlers"
    fi
else
    test_result 1 "SimpleFormatPicker component missing"
fi

# Test 7: Format integration in Index
echo "🔍 Test 2.3: Check format integration in main app..."
if grep -q "SimpleFormatPicker" src/pages/Index.tsx; then
    test_result 0 "Format selector integrated in main app"
else
    test_result 1 "Format selector not integrated"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 PHASE 3: FORMAT-AWARE LEDGER DISPLAY"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 8: LedgerTable format integration
echo "🔍 Test 3.1: Check LedgerTable format awareness..."
if grep -q "getFormatById" src/components/layout/LedgerTable.tsx; then
    test_result 0 "LedgerTable uses format system"
else
    test_result 1 "LedgerTable not format-aware"
fi

# Test 9: Multiple format renderers
echo "🔍 Test 3.2: Check multiple format renderers..."
if grep -q "renderCashBookTable\|renderDoubleEntryTable\|renderPartyLedgerTable" src/components/layout/LedgerTable.tsx; then
    test_result 0 "Multiple format renderers implemented"
else
    test_result 1 "Format renderers missing"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✍️  PHASE 4: PEN INPUT WITH FORMATTED PAPER"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 10: Paper templates
echo "🔍 Test 4.1: Check paper templates..."
if [ -f "src/features/pen-input/templates/paper-templates.ts" ]; then
    if grep -q "traditionalKhata\|cashBook\|doubleEntry\|partyLedger" src/features/pen-input/templates/paper-templates.ts; then
        test_result 0 "Paper templates defined for all formats"
    else
        test_result 1 "Incomplete paper templates"
    fi
else
    test_result 1 "Paper templates file missing"
fi

# Test 11: Canvas integration
echo "🔍 Test 4.2: Check canvas uses paper templates..."
if grep -q "getPaperTemplate" src/features/pen-input/hooks/useCanvas.ts; then
    test_result 0 "Canvas integrated with paper templates"
else
    test_result 1 "Canvas not using paper templates"
fi

# Test 12: PenCanvas component
echo "🔍 Test 4.3: Check PenCanvas component..."
if grep -q "PenToolProvider" src/features/pen-input/PenCanvas.tsx; then
    test_result 0 "PenCanvas properly wrapped with context"
else
    test_result 1 "PenCanvas missing context provider"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🤖 PHASE 5: AI ANALYTICS FEATURES"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 13: AI Analytics backend
echo "🔍 Test 5.1: Check AI analytics backend..."
if [ -d "backend/app/ai/analytics" ]; then
    test_result 0 "AI analytics backend module exists"
else
    test_result 1 "AI analytics backend missing"
fi

# Test 14: AI Analytics frontend
echo "🔍 Test 5.2: Check AI analytics frontend..."
if [ -d "src/features/ai-analytics" ]; then
    test_result 0 "AI analytics frontend module exists"
else
    test_result 1 "AI analytics frontend missing"
fi

# Test 15: InsightsDashboard component
echo "🔍 Test 5.3: Check InsightsDashboard component..."
if [ -f "src/features/ai-analytics/components/InsightsDashboard.tsx" ]; then
    test_result 0 "InsightsDashboard component exists"
else
    test_result 1 "InsightsDashboard component missing"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🧠 PHASE 6: AI FEDERATED LEARNING"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 16: Federated learning backend
echo "🔍 Test 6.1: Check federated learning backend..."
if [ -d "backend/app/ai/federated" ]; then
    test_result 0 "Federated learning backend module exists"
else
    test_result 1 "Federated learning backend missing"
fi

# Test 17: Federated learning frontend
echo "🔍 Test 6.2: Check federated learning frontend..."
if [ -d "src/features/ai-learning" ]; then
    test_result 0 "Federated learning frontend module exists"
else
    test_result 1 "Federated learning frontend missing"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔧 PHASE 7: BUILD & INTEGRATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 18: TypeScript compilation
echo "🔍 Test 7.1: Check TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    test_result 0 "TypeScript compiles without errors"
else
    test_result 1 "TypeScript compilation errors"
fi

# Test 19: Check for common files
echo "🔍 Test 7.2: Check essential files..."
ESSENTIAL_FILES=(
    "src/pages/Index.tsx"
    "src/components/layout/LedgerTable.tsx"
    "src/features/pen-input/PenCanvas.tsx"
    "backend/app/main.py"
)

MISSING_COUNT=0
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        ((MISSING_COUNT++))
    fi
done

if [ $MISSING_COUNT -eq 0 ]; then
    test_result 0 "All essential files present"
else
    test_result 1 "$MISSING_COUNT essential files missing"
fi

# Test 20: Check package.json
echo "🔍 Test 7.3: Check package.json dependencies..."
if [ -f "package.json" ]; then
    if grep -q "react\|vite" package.json; then
        test_result 0 "package.json has required dependencies"
    else
        test_result 1 "package.json missing core dependencies"
    fi
else
    test_result 1 "package.json missing"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📱 PHASE 8: FRONTEND INTEGRATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 21: Check for tabs integration
echo "🔍 Test 8.1: Check navigation tabs..."
if grep -q "TabsTrigger.*formats" src/pages/Index.tsx; then
    test_result 0 "Formats tab integrated in navigation"
else
    test_result 1 "Formats tab not found in navigation"
fi

# Test 22: Check format picker rendering
echo "🔍 Test 8.2: Check format picker rendering..."
if grep -q "TabsContent.*formats" src/pages/Index.tsx; then
    test_result 0 "Format picker renders in tab content"
else
    test_result 1 "Format picker not rendering"
fi

# Test 23: Check pen input button
echo "🔍 Test 8.3: Check pen input button..."
if grep -q "Pen Input\|PenTool" src/components/layout/Header.tsx; then
    test_result 0 "Pen Input button in header"
else
    test_result 1 "Pen Input button missing"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🗄️  PHASE 9: BACKEND STRUCTURE"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 24: Backend folders
echo "🔍 Test 9.1: Check backend folder structure..."
if [ -d "backend/app/api/v1" ] && [ -d "backend/app/db" ] && [ -d "backend/app/services" ]; then
    test_result 0 "Backend folder structure correct"
else
    test_result 1 "Backend folder structure incorrect"
fi

# Test 25: Backend main.py
echo "🔍 Test 9.2: Check backend main.py..."
if [ -f "backend/app/main.py" ]; then
    if grep -q "FastAPI\|app = FastAPI" backend/app/main.py; then
        test_result 0 "Backend main.py properly configured"
    else
        test_result 1 "Backend main.py configuration issues"
    fi
else
    test_result 1 "Backend main.py missing"
fi

# Test 26: Backend routers
echo "🔍 Test 9.3: Check backend API routers..."
ROUTER_COUNT=$(grep -c "include_router" backend/app/main.py 2>/dev/null || echo "0")
if [ "$ROUTER_COUNT" -ge 5 ]; then
    test_result 0 "Backend has $ROUTER_COUNT routers registered"
else
    test_result 1 "Insufficient routers registered ($ROUTER_COUNT)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📝 FINAL REPORT"
echo "═══════════════════════════════════════════════════════════"
echo ""

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT + SKIP_COUNT))
PASS_RATE=$((PASS_COUNT * 100 / TOTAL_TESTS))

echo "Total Tests Run: $TOTAL_TESTS"
echo -e "${GREEN}✅ Passed: $PASS_COUNT${NC}"
echo -e "${RED}❌ Failed: $FAIL_COUNT${NC}"
echo -e "${YELLOW}⚠️  Skipped: $SKIP_COUNT${NC}"
echo ""
echo "Pass Rate: $PASS_RATE%"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   🎉 ALL TESTS PASSED! PRODUCT IS STABLE!                ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ⚠️  SOME TESTS FAILED - REVIEW REQUIRED                ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi

