# 🥷 NinjaTrader 8 Integration Guide

## Overview

This guide shows you how to send real-time MNQ volume data from NinjaTrader 8 to your BearishBully Edge API.

**Two Integration Methods:**
1. **Custom NinjaScript Strategy** (Recommended) - Real-time automated data feed
2. **Manual Export + Upload** - Good for historical data backfill

---

## Method 1: Custom NinjaScript Strategy (Real-Time)

### Prerequisites
- NinjaTrader 8 installed
- .NET Framework 4.8+ (comes with NT8)
- API endpoint URL (from Vercel deployment)

### Step 1: Create New Strategy

1. Open NinjaTrader 8
2. Go to **Tools → New NinjaScript → Strategy**
3. Name it: `BearishBullyVolumeSync`
4. Set these parameters:
   - **Bars Required to Trade:** 1
   - **Calculate:** OnBarClose
   - **Order Fill Resolution:** Standard

### Step 2: Add the Code

```csharp
#region Using declarations
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Xml.Serialization;
using NinjaTrader.Cbi;
using NinjaTrader.Gui;
using NinjaTrader.Gui.Chart;
using NinjaTrader.Gui.SuperDom;
using NinjaTrader.Gui.Tools;
using NinjaTrader.Data;
using NinjaTrader.NinjaScript;
using NinjaTrader.Core.FloatingPoint;
using NinjaTrader.NinjaScript.Indicators;
using NinjaTrader.NinjaScript.DrawingTools;
using System.Net.Http;
using System.Net.Http.Headers;
#endregion

namespace NinjaTrader.NinjaScript.Strategies
{
    public class BearishBullyVolumeSync : Strategy
    {
        private HttpClient httpClient;
        private string apiUrl = "https://your-deployment-url.vercel.app/api/volume";
        
        // User-configurable parameters
        private string symbol = "MNQ";
        private string relatedSymbol = "QQQ";
        private string timeframe = "1m";
        
        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = @"Sends volume data to BearishBully Edge API";
                Name = "BearishBullyVolumeSync";
                Calculate = Calculate.OnBarClose;
                EntriesPerDirection = 1;
                EntryHandling = EntryHandling.AllEntries;
                IsExitOnSessionCloseStrategy = true;
                ExitOnSessionCloseSeconds = 30;
                IsFillLimitOnTouch = false;
                MaximumBarsLookBack = MaximumBarsLookBack.TwoHundredFiftySix;
                OrderFillResolution = OrderFillResolution.Standard;
                Slippage = 0;
                StartBehavior = StartBehavior.WaitUntilFlat;
                TimeInForce = TimeInForce.Gtc;
                TraceOrders = false;
                RealtimeErrorHandling = RealtimeErrorHandling.StopCancelClose;
                StopTargetHandling = StopTargetHandling.PerEntryExecution;
                BarsRequiredToTrade = 1;
                IsInstantiatedOnEachOptimizationIteration = true;
            }
            else if (State == State.Configure)
            {
                // Initialize HTTP client
                httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Accept.Add(
                    new MediaTypeWithQualityHeaderValue("application/json")
                );
            }
            else if (State == State.Terminated)
            {
                // Clean up
                if (httpClient != null)
                {
                    httpClient.Dispose();
                }
            }
        }

        protected override void OnBarUpdate()
        {
            // Wait for at least 2 bars of data
            if (CurrentBar < 1)
                return;

            // Calculate volume delta
            // Note: For true buy/sell volume, you need Order Flow data
            // This example uses total volume as a proxy
            double buyVolume = Volume[0];  // Current bar volume (simplified)
            double sellVolume = Volume[1]; // Previous bar volume (simplified)
            double volumeDelta = buyVolume - sellVolume;

            // Create JSON payload
            string jsonPayload = String.Format(@"{{
                ""symbol"": ""{0}"",
                ""related_symbol"": ""{1}"",
                ""bar_time"": ""{2}"",
                ""open_volume"": {3},
                ""close_volume"": {4},
                ""delta_volume"": {5},
                ""timeframe"": ""{6}"",
                ""source"": ""NinjaTrader""
            }}", 
                symbol,
                relatedSymbol,
                Time[0].ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ"),
                buyVolume,
                sellVolume,
                volumeDelta,
                timeframe
            );

            // Send to API asynchronously
            SendToAPI(jsonPayload);
        }

        private async void SendToAPI(string jsonData)
        {
            try
            {
                var content = new StringContent(jsonData, Encoding.UTF8, "application/json");
                var response = await httpClient.PostAsync(apiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    Print(Time[0] + ": Volume data sent successfully");
                }
                else
                {
                    Print(Time[0] + ": API Error - " + response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                Print(Time[0] + ": Exception - " + ex.Message);
            }
        }

        #region Properties
        [NinjaScriptProperty]
        [Display(Name="API URL", Description="BearishBully Edge API endpoint", Order=1, GroupName="API Settings")]
        public string ApiUrl
        {
            get { return apiUrl; }
            set { apiUrl = value; }
        }

        [NinjaScriptProperty]
        [Display(Name="Symbol", Description="Futures symbol", Order=2, GroupName="API Settings")]
        public string Symbol
        {
            get { return symbol; }
            set { symbol = value; }
        }

        [NinjaScriptProperty]
        [Display(Name="Related Symbol", Description="Related equity symbol", Order=3, GroupName="API Settings")]
        public string RelatedSymbol
        {
            get { return relatedSymbol; }
            set { relatedSymbol = value; }
        }

        [NinjaScriptProperty]
        [Display(Name="Timeframe", Description="Bar timeframe", Order=4, GroupName="API Settings")]
        public string Timeframe
        {
            get { return timeframe; }
            set { timeframe = value; }
        }
        #endregion
    }
}
```

### Step 3: Compile the Strategy

1. Press **F5** to compile
2. Fix any errors (usually namespace issues)
3. Wait for "Compiled successfully" message

### Step 4: Configure and Enable

1. Right-click on chart → **Strategies**
2. Select `BearishBullyVolumeSync`
3. Set these parameters:
   - **API URL:** `https://your-app.vercel.app/api/volume`
   - **Symbol:** `MNQ`
   - **Related Symbol:** `QQQ`
   - **Timeframe:** `1m`
4. Click **OK**
5. **Enable the strategy** (green checkbox)

### Step 5: Verify It's Working

1. Check NinjaTrader Output Window (Tools → Output Window)
2. Look for: `"Volume data sent successfully"`
3. Check your Supabase database for new rows
4. Verify Volume Widget updates in your terminal

---

## Method 2: Enhanced Volume Delta (Order Flow)

If you have **Order Flow** data (requires paid data feed like Rithmic):

```csharp
// Replace the volume calculation in OnBarUpdate() with:

// Get order flow data
OrderFlowCumulativeDelta delta = OrderFlowCumulativeDelta(
    CumulativeDeltaType.BidAsk, 
    CumulativeDeltaPeriod.Session, 
    0
);

double buyVolume = delta.DeltaClose[0] > 0 ? delta.DeltaClose[0] : 0;
double sellVolume = delta.DeltaClose[0] < 0 ? Math.Abs(delta.DeltaClose[0]) : 0;
double volumeDelta = buyVolume - sellVolume;
```

This gives you TRUE buy/sell volume split.

---

## Method 3: Manual Export + Upload

### For Historical Data Backfill

1. **Export Data from NinjaTrader:**
   - Right-click chart → **Export**
   - Select: Time, Volume
   - Save as CSV

2. **Convert to JSON:**

```python
# convert_csv_to_json.py
import csv
import json
from datetime import datetime

def convert_csv_to_json(csv_file, output_file):
    data = []
    with open(csv_file, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            bar = {
                "symbol": "MNQ",
                "related_symbol": "QQQ",
                "bar_time": datetime.strptime(row['Time'], '%Y%m%d %H%M%S').isoformat() + 'Z',
                "open_volume": float(row['Volume']),
                "close_volume": 0,  # Calculate if you have bar-by-bar data
                "delta_volume": float(row['Volume']),
                "timeframe": "1m",
                "source": "NinjaTrader"
            }
            data.append(bar)
    
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

convert_csv_to_json('mnq_data.csv', 'mnq_upload.json')
```

3. **Upload to API:**

```bash
# Split large files into batches of 100 bars
curl -X POST https://your-app.vercel.app/api/volume \
  -H "Content-Type: application/json" \
  -d @mnq_upload.json
```

---

## Troubleshooting

### Issue: "Strategy won't compile"
**Fix:** Ensure you added `using System.Net.Http;` at the top

### Issue: "Volume data not appearing in database"
**Fix:**
1. Check NinjaTrader Output Window for error messages
2. Verify API URL is correct (no trailing slash)
3. Test API manually with curl first
4. Check Vercel function logs

### Issue: "Strategy slows down NinjaTrader"
**Fix:** Add throttling to only send every N bars:

```csharp
// Add this as a class variable
private int barCounter = 0;
private int sendEveryNBars = 5; // Send every 5 bars

// In OnBarUpdate():
barCounter++;
if (barCounter % sendEveryNBars != 0)
    return;
```

### Issue: "Getting 400 validation errors"
**Fix:** Check the error message in Output Window - usually:
- Invalid timestamp format
- Negative volume values
- Wrong timeframe string

---

## Performance Considerations

### During Market Hours
- **1m bars:** ~390 API calls per trading session
- **5m bars:** ~78 API calls per trading session
- Recommended: Start with 5m for testing

### Data Limits
- Max batch size: 100 bars per request
- Rate limit: 100 requests/minute (add throttling if needed)
- Use async to prevent blocking NinjaTrader

### Best Practices
1. Test on **historical data replay** first
2. Start with **Market Replay** mode
3. Monitor API response times
4. Add error handling for network failures

---

## Advanced: Real-Time Order Flow Integration

If you have access to true buy/sell volume (Rithmic, CQG):

```csharp
// Use Volumetric Bars
protected override void OnStateChange()
{
    if (State == State.Configure)
    {
        AddVolumetric("MNQ 03-25", BarsPeriodType.Minute, 1, 
            VolumetricDeltaType.BidAsk, 0);
    }
}

protected override void OnBarUpdate()
{
    if (CurrentBar < 1) return;
    
    // Access true bid/ask volume
    double buyVolume = Bars.GetAsk(CurrentBar);
    double sellVolume = Bars.GetBid(CurrentBar);
    double volumeDelta = buyVolume - sellVolume;
    
    // Send to API...
}
```

---

## Testing Checklist

Before going live:

- [ ] Strategy compiles without errors
- [ ] Output Window shows "sent successfully" messages
- [ ] Data appears in Supabase table
- [ ] Volume Widget updates in terminal
- [ ] API response time < 500ms
- [ ] No errors during market replay
- [ ] Handles connection failures gracefully

---

## Next Steps

Once volume data is flowing:

1. ✅ Verify data quality (check for gaps)
2. 🔜 Add more instruments (ES, NQ, RTY)
3. 🔜 Integrate TradingView charts (Phase 2)
4. 🔜 Build Directional Bias Engine (Phase 3)

🎉 **Your NinjaTrader → BearishBully pipeline is complete!**
