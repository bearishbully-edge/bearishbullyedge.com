#region Using declarations
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using NinjaTrader.NinjaScript;
#endregion

namespace NinjaTrader.NinjaScript.Indicators
{
    /// <summary>
    /// API Bridge to stream order flow data to BearishBully Edge web dashboard
    /// </summary>
    public class BearishBullyAPIBridge
    {
        private static readonly HttpClient client = new HttpClient();
        private string apiEndpoint;
        private string apiKey;
        private bool isEnabled;

        public BearishBullyAPIBridge(string endpoint, string key)
        {
            apiEndpoint = endpoint;
            apiKey = key;
            isEnabled = !string.IsNullOrEmpty(endpoint) && !string.IsNullOrEmpty(key);
            
            if (isEnabled)
            {
                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
                client.Timeout = TimeSpan.FromSeconds(5);
            }
        }

        #region Data Transfer Objects

        public class OrderFlowSnapshot
        {
            public DateTime Timestamp { get; set; }
            public string Instrument { get; set; }
            public double CurrentPrice { get; set; }
            public FootprintData[] Footprint { get; set; }
            public PatternData[] ActivePatterns { get; set; }
            public LargeOrderData[] LargeOrders { get; set; }
            public PerformanceData Performance { get; set; }
            public DeltaMetrics Delta { get; set; }
        }

        public class FootprintData
        {
            public double Price { get; set; }
            public long BidVolume { get; set; }
            public long AskVolume { get; set; }
            public long TotalVolume { get; set; }
            public double Delta { get; set; }
            public double ImbalanceRatio { get; set; }
        }

        public class PatternData
        {
            public string Type { get; set; }
            public double Confidence { get; set; }
            public double PriceLevel { get; set; }
            public string Signal { get; set; }
            public DateTime DetectedTime { get; set; }
        }

        public class LargeOrderData
        {
            public long Id { get; set; }
            public double Price { get; set; }
            public long Volume { get; set; }
            public DateTime Time { get; set; }
            public string Direction { get; set; }
            public double Confidence { get; set; }
        }

        public class PerformanceData
        {
            public double RenderTimeMs { get; set; }
            public double CalcTimeMs { get; set; }
            public int QueuedTicks { get; set; }
            public int ActivePatterns { get; set; }
            public int PriceLevels { get; set; }
        }

        public class DeltaMetrics
        {
            public double CumulativeDelta { get; set; }
            public double DeltaPercentage { get; set; }
            public double MaxDelta { get; set; }
            public double MinDelta { get; set; }
        }

        #endregion

        #region API Methods

        public async Task SendOrderFlowSnapshot(OrderFlowSnapshot snapshot)
        {
            if (!isEnabled) return;

            try
            {
                var json = JsonConvert.SerializeObject(snapshot);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await client.PostAsync($"{apiEndpoint}/api/orderflow/snapshot", content);
                
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"[API Bridge Error] {response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[API Bridge Exception] {ex.Message}");
            }
        }

        public async Task SendLargeOrderAlert(LargeOrderData order)
        {
            if (!isEnabled) return;

            try
            {
                var json = JsonConvert.SerializeObject(order);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                await client.PostAsync($"{apiEndpoint}/api/orderflow/alert/large-order", content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[API Bridge] Large order alert failed: {ex.Message}");
            }
        }

        public async Task SendPatternAlert(PatternData pattern)
        {
            if (!isEnabled) return;

            try
            {
                var json = JsonConvert.SerializeObject(pattern);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                await client.PostAsync($"{apiEndpoint}/api/orderflow/alert/pattern", content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[API Bridge] Pattern alert failed: {ex.Message}");
            }
        }

        #endregion
    }
}