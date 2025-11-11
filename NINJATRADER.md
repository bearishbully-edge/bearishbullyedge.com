# 🎯 NinjaTrader 8 Integration Guide

## Overview

This guide shows how to send volume data from NinjaTrader 8 to BearishBully Edge in real-time.

---

## Prerequisites

- NinjaTrader 8 installed and configured
- Active data feed (Rithmic, CQG, etc.)
- BearishBully Edge deployed and API endpoint accessible
- Basic C# knowledge for customization

---

## Integration Methods

### Method 1: Market Analyzer Column (Recommended)
- Real-time updates every bar close
- Low overhead, efficient
- Easy to set up and monitor
- Best for single instrument tracking

### Method 2: Indicator
- More customizable
- Can track multiple instruments
- Visual feedback on chart
- Best for testing and development

### Method 3: Strategy
- Automated execution
- Integration with trading logic
- Can combine with order flow
- Best for advanced users

---

## Method 1: Market Analyzer Column

### Step 1: Create the Column

1. Open NinjaTrader 8
2. Go to **Tools** → **Edit NinjaScript** → **Market Analyzer Column**
3. Click **Add New** → **BearishBullyVolumeColumn**

### Step 2: Code Implementation

```csharp
#region Using declarations
using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using NinjaTrader.Cbi;
using NinjaTrader.Data;
using NinjaTrader.NinjaScript;
using Newtonsoft.Json;
#endregion

namespace NinjaTrader.NinjaScript.MarketAnalyzerColumns
{
    public class BearishBullyVolumeColumn : MarketAnalyzerColumn
    {
        private static readonly HttpClient httpClient = new HttpClient();
        private string apiEndpoint = "https://your-domain.vercel.app/api/volume";
        
        private int lastBarSent = -1;
        
        protected override void OnMarketData(MarketDataEventArgs marketDataUpdate)
        {
            // Only process on bar close
            if (CurrentBar <= 0 || CurrentBar == lastBarSent)
                return;
                
            // Send volume data on bar close
            if (marketDataUpdate.MarketDataType == MarketDataType.Last)
            {
                Task.Run(() => SendVolumeData());
                lastBarSent = CurrentBar;
            }
        }
        
        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = "Sends volume data to BearishBully Edge";
                Name = "BearishBully Volume";
                IsDataSeriesRequired = true;
            }
            else if (State == State.Configure)
            {
                // Add cumulative delta or use built-in volume
                // For order flow data, you'll need a data provider
            }
        }
        
        private async Task SendVolumeData()
        {
            try
            {
                // Get volume data from current bar
                var volumeBar = new
                {
                    bars = new[]
                    {
                        new
                        {
                            symbol = Instrument.MasterInstrument.Name,
                            related_symbol = "QQQ", // Customize as needed
                            bar_time = Time[0].ToUniversalTime().ToString("o"),
                            open_volume = GetBuyVolume(0),
                            close_volume = GetSellVolume(0),
                            delta_volume = GetBuyVolume(0) - GetSellVolume(0),
                            timeframe = GetTimeframe(),
                            source = "NinjaTrader"
                        }
                    }
                };
                
                var json = JsonConvert.SerializeObject(volumeBar);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await httpClient.PostAsync(apiEndpoint, content);
                
                if (response.IsSuccessStatusCode)
                {
                    CurrentValue = GetBuyVolume(0) - GetSellVolume(0);
                    PlotBrushes[0][0] = CurrentValue > 0 ? Brushes.LimeGreen : Brushes.Red;
                }
                else
                {
                    Print($"API Error: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Print($"Error sending volume data: {ex.Message}");
            }
        }
        
        private int GetBuyVolume(int barsAgo)
        {
            // If you have order flow data provider (like Continuum, Rithmic)
            // Replace this with actual buy volume calculation
            // For now, using approximation
            return (int)(Volume[barsAgo] * (Close[barsAgo] > Open[barsAgo] ? 0.6 : 0.4));
        }
        
        private int GetSellVolume(int barsAgo)
        {
            // If you have order flow data provider
            // Replace with actual sell volume calculation
            return (int)(Volume[barsAgo] * (Close[barsAgo] > Open[barsAgo] ? 0.4 : 0.6));
        }
        
        private string GetTimeframe()
        {
            if (BarsPeriod.BarsPeriodType == BarsPeriodType.Minute)
            {
                if (BarsPeriod.Value == 1) return "1m";
                if (BarsPeriod.Value == 5) return "5m";
                if (BarsPeriod.Value == 15) return "15m";
                if (BarsPeriod.Value == 30) return "30m";
            }
            else if (BarsPeriod.BarsPeriodType == BarsPeriodType.Hour)
            {
                if (BarsPeriod.Value == 1) return "1h";
                if (BarsPeriod.Value == 4) return "4h";
            }
            else if (BarsPeriod.BarsPeriodType == BarsPeriodType.Day)
            {
                return "1d";
            }
            
            return "1m"; // Default
        }
        
        #region Properties
        [NinjaScriptProperty]
        [Display(Name = "API Endpoint", Order = 1, GroupName = "BearishBully")]
        public string ApiEndpoint
        {
            get { return apiEndpoint; }
            set { apiEndpoint = value; }
        }
        #endregion
    }
}
```

### Step 3: Compile and Use

1. Click **Compile** (F5)
2. Fix any errors (install Newtonsoft.Json via NuGet if needed)
3. Open **Market Analyzer**
4. Right-click header → **Columns** → Add **BearishBully Volume**
5. Add MNQ to the analyzer
6. Data will send on each bar close

---

## Method 2: Indicator (With Order Flow)

For users with Rithmic or other order flow data providers:

```csharp
#region Using declarations
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using NinjaTrader.Cbi;
using NinjaTrader.Data;
using NinjaTrader.NinjaScript;
using NinjaTrader.NinjaScript.Indicators;
using Newtonsoft.Json;
#endregion

namespace NinjaTrader.NinjaScript.Indicators
{
    public class BearishBullyVolumeIndicator : Indicator
    {
        private static readonly HttpClient httpClient = new HttpClient();
        private string apiEndpoint = "https://your-domain.vercel.app/api/volume";
        
        private long buyVolume = 0;
        private long sellVolume = 0;
        private int lastBarSent = -1;
        
        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = "Sends real-time volume data to BearishBully Edge";
                Name = "BearishBully Volume Sender";
                IsOverlay = false;
                IsSuspendedWhileInactive = false;
                
                AddPlot(Brushes.LimeGreen, "Delta");
            }
            else if (State == State.Configure)
            {
                Calculate = Calculate.OnPriceChange;
            }
        }
        
        protected override void OnMarketData(MarketDataEventArgs marketDataUpdate)
        {
            // Track buy/sell volume from market data
            if (marketDataUpdate.MarketDataType == MarketDataType.Last)
            {
                if (marketDataUpdate.Price >= marketDataUpdate.Ask)
                {
                    buyVolume += marketDataUpdate.Volume;
                }
                else if (marketDataUpdate.Price <= marketDataUpdate.Bid)
                {
                    sellVolume += marketDataUpdate.Volume;
                }
                else
                {
                    // Mid-price trades - split volume
                    buyVolume += marketDataUpdate.Volume / 2;
                    sellVolume += marketDataUpdate.Volume / 2;
                }
            }
        }
        
        protected override void OnBarUpdate()
        {
            if (CurrentBar < 1)
                return;
                
            // On bar close, send data
            if (IsFirstTickOfBar && CurrentBar != lastBarSent)
            {
                // Get previous bar data
                long prevBuyVol = buyVolume;
                long prevSellVol = sellVolume;
                
                // Reset for new bar
                buyVolume = 0;
                sellVolume = 0;
                
                // Send the completed bar data
                Task.Run(() => SendVolumeData(prevBuyVol, prevSellVol, 1));
                
                lastBarSent = CurrentBar;
            }
            
            // Plot current delta
            Value[0] = buyVolume - sellVolume;
        }
        
        private async Task SendVolumeData(long openVol, long closeVol, int barsAgo)
        {
            try
            {
                var volumeBar = new
                {
                    bars = new[]
                    {
                        new
                        {
                            symbol = Instrument.MasterInstrument.Name,
                            related_symbol = "QQQ",
                            bar_time = Time[barsAgo].ToUniversalTime().ToString("o"),
                            open_volume = (int)openVol,
                            close_volume = (int)closeVol,
                            delta_volume = (int)(openVol - closeVol),
                            timeframe = GetTimeframe(),
                            source = "NinjaTrader"
                        }
                    }
                };
                
                var json = JsonConvert.SerializeObject(volumeBar);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await httpClient.PostAsync(apiEndpoint, content);
                
                if (!response.IsSuccessStatusCode)
                {
                    Print($"API Error: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Print($"Error: {ex.Message}");
            }
        }
        
        private string GetTimeframe()
        {
            var period = BarsPeriod;
            if (period.BarsPeriodType == BarsPeriodType.Minute)
            {
                if (period.Value == 1) return "1m";
                if (period.Value == 5) return "5m";
                if (period.Value == 15) return "15m";
                if (period.Value == 30) return "30m";
            }
            return "1m";
        }
        
        #region Properties
        [NinjaScriptProperty]
        [Display(Name = "API Endpoint", Order = 1, GroupName = "Settings")]
        public string ApiEndpoint
        {
            get { return apiEndpoint; }
            set { apiEndpoint = value; }
        }
        #endregion
    }
}
```

---

## Setup Instructions

### 1. Install Dependencies

**Newtonsoft.Json** is required. Two methods:

#### Method A: NuGet Package Manager
1. Tools → NuGet Package Manager → Manage Packages
2. Search "Newtonsoft.Json"
3. Install latest version

#### Method B: Manual Reference
1. Download `Newtonsoft.Json.dll`
2. Place in `C:\Program Files\NinjaTrader 8\bin\Custom\`
3. Add reference in your script

### 2. Configure API Endpoint

In the indicator/column properties, set:
```
API Endpoint: https://your-domain.vercel.app/api/volume
```

### 3. Set Chart Timeframe

Use supported timeframes:
- 1 minute
- 5 minutes
- 15 minutes
- 30 minutes
- 1 hour
- 4 hours
- Daily

### 4. Enable Data Series

Make sure your chart has real-time data enabled:
1. Chart → Data Series
2. Enable "Calculate on bar close" OFF for real-time
3. Check "Reload historical data"

---

## Troubleshooting

### Issue: "Newtonsoft.Json not found"

**Solution**: Install NuGet package or add DLL reference manually

### Issue: No data showing in BearishBully Edge

**Solution**:
1. Check API endpoint is correct
2. Verify NinjaTrader has internet access
3. Check Output Window for errors (F12)
4. Test API with curl/Postman first

### Issue: Volume data seems incorrect

**Solution**:
1. Verify you have an order flow data provider
2. The basic implementation uses approximations
3. For accurate buy/sell volume, use Rithmic or similar

### Issue: High CPU usage

**Solution**:
1. Use "Calculate on bar close" mode
2. Reduce frequency of market data processing
3. Implement throttling in OnMarketData

---

## Advanced: Batch Updates

For better performance, batch multiple bars:

```csharp
private List<VolumeBarData> batchBuffer = new List<VolumeBarData>();
private const int BATCH_SIZE = 10;

private async Task AddToBatch(VolumeBarData bar)
{
    batchBuffer.Add(bar);
    
    if (batchBuffer.Count >= BATCH_SIZE)
    {
        await SendBatch();
    }
}

private async Task SendBatch()
{
    if (batchBuffer.Count == 0) return;
    
    var payload = new { bars = batchBuffer.ToArray() };
    // ... send logic
    
    batchBuffer.Clear();
}
```

---

## Testing

### 1. Simulation Mode
- Enable Sim101 data
- Test with paper trading account
- Verify data appears in BearishBully Edge

### 2. Debug Output
Add debug prints:
```csharp
Print($"Sending: Symbol={symbol}, Delta={delta}, Time={barTime}");
```

### 3. Monitor Logs
Check:
- NinjaTrader Output Window (F12)
- Vercel logs (deployment dashboard)
- Supabase logs (database dashboard)

---

## Performance Tips

1. **Use bar close calculation** for lower overhead
2. **Batch updates** when possible (5-10 bars)
3. **Implement error handling** and retries
4. **Log sparingly** to avoid slowdowns
5. **Test with single instrument** before scaling

---

## Security Notes

- API endpoint transmitted over HTTPS
- No authentication required (protected by RLS)
- Data validated on server side
- Rate limiting recommended for production

---

## Support

For NinjaTrader-specific issues:
- NinjaTrader Support Forum
- C# Documentation: docs.microsoft.com
- BearishBully Edge API docs: `/API.md`

---

**Last Updated**: November 2025
**Tested with**: NinjaTrader 8.0.29.1
