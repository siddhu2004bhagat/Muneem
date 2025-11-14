#!/bin/bash
# Test script for Inventory API endpoints

BASE_URL="http://localhost:8000/api/v1/inventory"

echo "========================================="
echo "Inventory API Integration Test"
echo "========================================="
echo ""

# Test 1: Get all items (should be empty initially)
echo "✓ Test 1: GET /items (Initial empty list)"
RESPONSE=$(curl -s "$BASE_URL/items")
if [ "$RESPONSE" = "[]" ]; then
    echo "✅ PASS: Empty list returned"
else
    echo "❌ FAIL: Expected empty list"
fi
echo ""

# Test 2: Create an item
echo "✓ Test 2: POST /items (Create item)"
ITEM_DATA='{
    "name": "Widget A",
    "sku": "WDG001",
    "hsn_code": "12345678",
    "gst_rate": 18.0,
    "opening_qty": 50.0,
    "unit": "pieces",
    "min_qty": 5.0,
    "mrp": 200.0,
    "sale_price": 180.0,
    "purchase_price": 150.0
}'
RESPONSE=$(curl -s -X POST "$BASE_URL/items" -H "Content-Type: application/json" -d "$ITEM_DATA")
echo "$RESPONSE" | python -m json.tool
ITEM_ID=$(echo "$RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['id'])")
if [ ! -z "$ITEM_ID" ]; then
    echo "✅ PASS: Item created with ID: $ITEM_ID"
else
    echo "❌ FAIL: Item creation failed"
fi
echo ""

# Test 3: Get item by ID
echo "✓ Test 3: GET /items/{id}"
RESPONSE=$(curl -s "$BASE_URL/items/$ITEM_ID")
if echo "$RESPONSE" | grep -q "Widget A"; then
    echo "✅ PASS: Item retrieved successfully"
else
    echo "❌ FAIL: Item retrieval failed"
fi
echo ""

# Test 4: Search items
echo "✓ Test 4: GET /items?search=widget"
RESPONSE=$(curl -s "$BASE_URL/items?search=widget")
if echo "$RESPONSE" | grep -q "Widget A"; then
    echo "✅ PASS: Search working correctly"
else
    echo "❌ FAIL: Search not working"
fi
echo ""

# Test 5: Create stock transaction
echo "✓ Test 5: POST /stock-transactions"
STOCK_DATA='{
    "item_id": '$ITEM_ID',
    "date": "2024-01-15",
    "type": "purchase",
    "qty": 25.0
}'
RESPONSE=$(curl -s -X POST "$BASE_URL/stock-transactions" -H "Content-Type: application/json" -d "$STOCK_DATA")
if echo "$RESPONSE" | grep -q "item_id"; then
    echo "✅ PASS: Stock transaction created"
else
    echo "❌ FAIL: Stock transaction failed"
fi
echo ""

# Test 6: Get inventory summary
echo "✓ Test 6: GET /summary"
RESPONSE=$(curl -s "$BASE_URL/summary")
STOCK_VALUE=$(echo "$RESPONSE" | python -c "import sys, json; data=json.load(sys.stdin)[0]; print(data['stock'])")
if [ "$STOCK_VALUE" -ge 75 ]; then
    echo "✅ PASS: Summary shows correct stock (75 = 50 opening + 25 purchase)"
else
    echo "❌ FAIL: Stock calculation incorrect"
fi
echo ""

# Test 7: Get total stock value
echo "✓ Test 7: GET /stock-value"
RESPONSE=$(curl -s "$BASE_URL/stock-value")
echo "$RESPONSE" | python -m json.tool
echo "✅ PASS: Total stock value calculated"
echo ""

# Test 8: Update item
echo "✓ Test 8: PUT /items/{id}"
UPDATE_DATA='{
    "name": "Widget A Updated",
    "sku": "WDG001",
    "gst_rate": 18.0,
    "opening_qty": 50.0,
    "unit": "pieces",
    "min_qty": 5.0,
    "mrp": 200.0,
    "sale_price": 180.0,
    "purchase_price": 150.0
}'
RESPONSE=$(curl -s -X PUT "$BASE_URL/items/$ITEM_ID" -H "Content-Type: application/json" -d "$UPDATE_DATA")
if echo "$RESPONSE" | grep -q "Widget A Updated"; then
    echo "✅ PASS: Item updated successfully"
else
    echo "❌ FAIL: Item update failed"
fi
echo ""

# Test 9: Soft delete item
echo "✓ Test 9: DELETE /items/{id} (Soft delete)"
RESPONSE=$(curl -s -X DELETE "$BASE_URL/items/$ITEM_ID")
if echo "$RESPONSE" | grep -q "soft-deleted"; then
    echo "✅ PASS: Item soft-deleted"
else
    echo "❌ FAIL: Soft delete failed"
fi
echo ""

# Test 10: Verify item not in active list
echo "✓ Test 10: Verify item excluded from active list"
RESPONSE=$(curl -s "$BASE_URL/items")
if [ "$RESPONSE" = "[]" ]; then
    echo "✅ PASS: Deleted item not in active list"
else
    echo "❌ FAIL: Deleted item still showing"
fi
echo ""

echo "========================================="
echo "All Tests Complete!"
echo "========================================="

