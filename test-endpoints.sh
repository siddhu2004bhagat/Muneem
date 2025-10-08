#!/bin/bash

echo "🚀 DigBahi Backend Endpoint Tests"
echo "=================================="

BASE_URL="http://localhost:8001"

echo -e "\n1. Health Check:"
curl -s "$BASE_URL/api/v1/health" | jq . 2>/dev/null || curl -s "$BASE_URL/api/v1/health"

echo -e "\n\n2. Ledger GET:"
curl -s "$BASE_URL/api/v1/ledger" | jq . 2>/dev/null || curl -s "$BASE_URL/api/v1/ledger"

echo -e "\n\n3. Reports GET:"
curl -s "$BASE_URL/api/v1/reports" | jq . 2>/dev/null || curl -s "$BASE_URL/api/v1/reports"

echo -e "\n\n4. Ledger POST Test:"
curl -s -X POST "$BASE_URL/api/v1/ledger" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-01-08",
    "description": "Test Entry",
    "amount": 1000.00,
    "type": "sale",
    "gstRate": 18.0,
    "gstAmount": 180.0
  }' | jq . 2>/dev/null || echo "POST request sent"

echo -e "\n\n5. Sync POST Test:"
curl -s -X POST "$BASE_URL/api/v1/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "entries": [],
    "deviceId": "test_device",
    "timestamp": '$(date +%s)'
  }' | jq . 2>/dev/null || echo "Sync request sent"

echo -e "\n\n✅ Endpoint tests completed!"
