#!/bin/bash
# Test script for BearishBully Edge Volume API

API_URL="http://localhost:3000/api/volume"
SAMPLE_DATA="scripts/sampleData.json"

echo "🧪 BearishBully Edge API Test Suite"
echo "===================================="
echo ""

# Test 1: Single Volume Bar Insert
echo "Test 1: Single volume bar insert"
echo "---------------------------------"
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "MNQ",
    "related_symbol": "QQQ",
    "bar_time": "2025-11-03T14:30:00Z",
    "open_volume": 15420,
    "close_volume": 12350,
    "delta_volume": 3070,
    "timeframe": "1m",
    "source": "NinjaTrader"
  }' | jq .
echo ""
echo ""

# Test 2: Batch Insert
echo "Test 2: Batch volume bar insert"
echo "--------------------------------"
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d @$SAMPLE_DATA | jq .
echo ""
echo ""

# Test 3: Invalid Data (missing fields)
echo "Test 3: Invalid data test (should fail)"
echo "----------------------------------------"
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "MNQ",
    "bar_time": "2025-11-03T14:30:00Z"
  }' | jq .
echo ""
echo ""

# Test 4: Invalid timestamp
echo "Test 4: Invalid timestamp (should fail)"
echo "---------------------------------------"
curl -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "MNQ",
    "bar_time": "invalid-date",
    "open_volume": 1000,
    "close_volume": 800,
    "delta_volume": 200,
    "timeframe": "1m",
    "source": "NinjaTrader"
  }' | jq .
echo ""
echo ""

# Test 5: Wrong HTTP Method
echo "Test 5: Wrong HTTP method (should fail)"
echo "---------------------------------------"
curl -X GET $API_URL | jq .
echo ""
echo ""

echo "✅ Test suite complete!"
