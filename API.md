# 📡 BearishBully Edge - API Documentation

## Base URL

**Development**: `http://localhost:3000/api`  
**Production**: `https://your-domain.vercel.app/api`

---

## Endpoints

### POST `/api/volume`

Insert volume bar data from NinjaTrader or other trading platforms.

#### Authentication
No authentication required for POST (protected by RLS on database level using service_role key).

#### Rate Limits
- **Development**: Unlimited
- **Production**: Configure via Vercel or implement custom rate limiting

#### Request Headers

```
Content-Type: application/json
```

#### Request Body

```typescript
{
  bars: VolumeBar[]  // Array of 1-1000 volume bars
}

interface VolumeBar {
  symbol: string;              // Trading symbol (2-10 chars, uppercase)
  related_symbol?: string;     // Related ETF/Index (optional)
  bar_time: string;            // ISO 8601 timestamp
  open_volume: number;         // Buy volume (non-negative)
  close_volume: number;        // Sell volume (non-negative)
  delta_volume: number;        // open_volume - close_volume
  timeframe: Timeframe;        // Bar period
  source?: string;             // Data source (optional)
}

type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
```

#### Request Example

```json
{
  "bars": [
    {
      "symbol": "MNQ",
      "related_symbol": "QQQ",
      "bar_time": "2025-11-03T14:30:00.000Z",
      "open_volume": 15420,
      "close_volume": 14230,
      "delta_volume": 1190,
      "timeframe": "1m",
      "source": "NinjaTrader"
    }
  ]
}
```

#### Success Response

**Code**: `200 OK`

```json
{
  "success": true,
  "inserted": 1
}
```

#### Error Responses

##### Validation Error

**Code**: `400 Bad Request`

```json
{
  "success": false,
  "inserted": 0,
  "errors": [
    {
      "field": "bars.0.bar_time",
      "message": "bar_time must be a valid ISO 8601 timestamp"
    }
  ]
}
```

##### Method Not Allowed

**Code**: `405 Method Not Allowed`

```json
{
  "success": false,
  "inserted": 0,
  "errors": [
    {
      "field": "method",
      "message": "Method not allowed. Use POST."
    }
  ]
}
```

##### Server Error

**Code**: `500 Internal Server Error`

```json
{
  "success": false,
  "inserted": 0,
  "errors": [
    {
      "field": "database",
      "message": "Failed to insert volume data"
    }
  ]
}
```

---

## Validation Rules

### Symbol
- **Type**: `string`
- **Min Length**: 2
- **Max Length**: 10
- **Pattern**: Uppercase alphanumeric only (`/^[A-Z0-9]+$/`)
- **Default**: "MNQ"
- **Examples**: ✅ "MNQ", "NQ", "ES" | ❌ "mnq", "MNQ!", "M"

### Related Symbol
- **Type**: `string` (optional)
- **Min Length**: 1
- **Max Length**: 10
- **Pattern**: Uppercase alphanumeric only
- **Examples**: ✅ "QQQ", "SPY", "NDX" | ❌ "qqq", "SPY-"

### Bar Time
- **Type**: `string`
- **Format**: ISO 8601 datetime with timezone
- **Range**: Within last year, max 1 minute in future
- **Required**: Yes
- **Examples**: 
  - ✅ "2025-11-03T14:30:00.000Z"
  - ✅ "2025-11-03T14:30:00-05:00" (EST)
  - ❌ "2025-11-03" (missing time)
  - ❌ "11/03/2025 2:30 PM" (wrong format)

### Open Volume
- **Type**: `number`
- **Min**: 0 (non-negative)
- **Max**: 1,000,000,000,000 (1e12)
- **Required**: Yes
- **Examples**: ✅ 15420, 0, 999999 | ❌ -100, 1e13, "15420"

### Close Volume
- **Type**: `number`
- **Min**: 0 (non-negative)
- **Max**: 1,000,000,000,000 (1e12)
- **Required**: Yes

### Delta Volume
- **Type**: `number`
- **Min**: -1,000,000,000,000 (-1e12)
- **Max**: 1,000,000,000,000 (1e12)
- **Required**: Yes
- **Validation**: Must equal `open_volume - close_volume`
- **Examples**: 
  - ✅ open: 15420, close: 14230, delta: 1190
  - ❌ open: 15420, close: 14230, delta: 1200 (incorrect calculation)

### Timeframe
- **Type**: `string` (enum)
- **Allowed Values**: `"1m"`, `"5m"`, `"15m"`, `"30m"`, `"1h"`, `"4h"`, `"1d"`
- **Default**: "1m"
- **Required**: Yes
- **Examples**: ✅ "1m", "5m" | ❌ "1min", "5M", "60s"

### Source
- **Type**: `string` (enum, optional)
- **Allowed Values**: `"NinjaTrader"`, `"Rithmic"`, `"Polygon"`, `"Manual"`
- **Default**: "NinjaTrader"
- **Required**: No

---

## Code Examples

### cURL

```bash
curl -X POST https://your-domain.vercel.app/api/volume \
  -H "Content-Type: application/json" \
  -d '{
    "bars": [
      {
        "symbol": "MNQ",
        "related_symbol": "QQQ",
        "bar_time": "2025-11-03T14:30:00.000Z",
        "open_volume": 15420,
        "close_volume": 14230,
        "delta_volume": 1190,
        "timeframe": "1m",
        "source": "NinjaTrader"
      }
    ]
  }'
```

### JavaScript (Fetch)

```javascript
async function sendVolumeData(bars) {
  try {
    const response = await fetch('https://your-domain.vercel.app/api/volume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bars }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Success: ${data.inserted} bars inserted`);
    } else {
      console.error('Validation errors:', data.errors);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Example usage
sendVolumeData([
  {
    symbol: 'MNQ',
    related_symbol: 'QQQ',
    bar_time: new Date().toISOString(),
    open_volume: 15420,
    close_volume: 14230,
    delta_volume: 1190,
    timeframe: '1m',
    source: 'NinjaTrader',
  }
]);
```

### Python

```python
import requests
from datetime import datetime

def send_volume_data(bars):
    url = 'https://your-domain.vercel.app/api/volume'
    headers = {'Content-Type': 'application/json'}
    
    payload = {'bars': bars}
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success: {data['inserted']} bars inserted")
    else:
        data = response.json()
        print(f"Error: {data['errors']}")

# Example usage
bars = [
    {
        'symbol': 'MNQ',
        'related_symbol': 'QQQ',
        'bar_time': datetime.utcnow().isoformat() + 'Z',
        'open_volume': 15420,
        'close_volume': 14230,
        'delta_volume': 1190,
        'timeframe': '1m',
        'source': 'NinjaTrader'
    }
]

send_volume_data(bars)
```

### C# (NinjaTrader)

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class VolumeBar
{
    public string symbol { get; set; }
    public string related_symbol { get; set; }
    public string bar_time { get; set; }
    public int open_volume { get; set; }
    public int close_volume { get; set; }
    public int delta_volume { get; set; }
    public string timeframe { get; set; }
    public string source { get; set; }
}

public class VolumeApiClient
{
    private static readonly HttpClient client = new HttpClient();
    private const string API_URL = "https://your-domain.vercel.app/api/volume";

    public static async Task SendVolumeData(VolumeBar[] bars)
    {
        var payload = new { bars = bars };
        var json = JsonConvert.SerializeObject(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await client.PostAsync(API_URL, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine("Volume data sent successfully");
            }
            else
            {
                Console.WriteLine($"Error: {responseBody}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Network error: {ex.Message}");
        }
    }
}

// Usage in NinjaTrader indicator/strategy
var bar = new VolumeBar
{
    symbol = "MNQ",
    related_symbol = "QQQ",
    bar_time = Time[0].ToUniversalTime().ToString("o"),
    open_volume = (int)Buys[0],
    close_volume = (int)Sells[0],
    delta_volume = (int)(Buys[0] - Sells[0]),
    timeframe = "1m",
    source = "NinjaTrader"
};

await VolumeApiClient.SendVolumeData(new[] { bar });
```

---

## Batch Insertion

You can send up to **1000 bars** in a single request for efficient bulk uploads.

### Example: Batch Insert

```json
{
  "bars": [
    {
      "symbol": "MNQ",
      "bar_time": "2025-11-03T14:30:00.000Z",
      "open_volume": 15420,
      "close_volume": 14230,
      "delta_volume": 1190,
      "timeframe": "1m"
    },
    {
      "symbol": "MNQ",
      "bar_time": "2025-11-03T14:31:00.000Z",
      "open_volume": 16890,
      "close_volume": 15340,
      "delta_volume": 1550,
      "timeframe": "1m"
    }
    // ... up to 1000 bars
  ]
}
```

---

## Error Handling Best Practices

### Retry Logic

```javascript
async function sendVolumeDataWithRetry(bars, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bars }),
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 400) {
        // Don't retry validation errors
        throw new Error('Validation error - check data format');
      }

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
}
```

### Validation Before Sending

```javascript
function validateBar(bar) {
  const errors = [];

  if (!/^[A-Z0-9]{2,10}$/.test(bar.symbol)) {
    errors.push('Invalid symbol format');
  }

  if (bar.open_volume < 0 || bar.close_volume < 0) {
    errors.push('Volume values must be non-negative');
  }

  if (bar.delta_volume !== bar.open_volume - bar.close_volume) {
    errors.push('Delta volume calculation mismatch');
  }

  const validTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];
  if (!validTimeframes.includes(bar.timeframe)) {
    errors.push('Invalid timeframe');
  }

  return errors;
}
```

---

## Testing

Use the provided test scripts in `/scripts`:

```bash
# Bash test
./scripts/test-api.sh

# Node.js test
node scripts/test-api.js
```

---

## Support

For API issues:
1. Check validation rules above
2. Review error messages in response
3. Test with sample data from `/scripts/sampleData.json`
4. Check Supabase logs if 500 errors persist

---

**Last Updated**: November 2025
