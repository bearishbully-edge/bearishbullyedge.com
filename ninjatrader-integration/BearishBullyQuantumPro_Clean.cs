#region Using declarations
using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NinjaTrader.Cbi;
using NinjaTrader.Gui;
using NinjaTrader.Gui.Chart;
using NinjaTrader.Gui.Tools;
using NinjaTrader.NinjaScript;
using NinjaTrader.NinjaScript.DrawingTools;
using SharpDX;
using SharpDX.Direct2D1;
using SharpDX.DirectWrite;
#endregion

namespace NinjaTrader.NinjaScript.Indicators
{
    #region Core Data Structures
    
    public class TickData
    {
        public double Price { get; set; }
        public long Volume { get; set; }
        public bool IsBid { get; set; }
        public DateTime Time { get; set; }
        public MarketDataType MarketDataType { get; set; }
    }

    public class PriceLevelData
    {
        public double Price { get; set; }
        public long BidVolume { get; set; }
        public long AskVolume { get; set; }
        public long TotalVolume => BidVolume + AskVolume;
        public double Delta => AskVolume - BidVolume;
        public DateTime LastUpdate { get; set; }
        
        public void Reset()
        {
            BidVolume = 0;
            AskVolume = 0;
            LastUpdate = DateTime.MinValue;
        }
    }

    public class FootprintCell
    {
        public double PriceLevel { get; set; }
        public long BidVolume { get; set; }
        public long AskVolume { get; set; }
        public long TotalVolume => BidVolume + AskVolume;
        public double Delta => AskVolume - BidVolume;
        
        public void Add(long bid, long ask)
        {
            BidVolume += bid;
            AskVolume += ask;
        }
    }

    public enum PatternType
    {
        Unknown,
        Absorption,
        StopHunt,
        LiquidityGrab,
        Iceberg,
        Imbalance
    }

    public enum SignalType
    {
        Undefined,
        Bullish,
        Bearish,
        Reversal,
        Continuation
    }

    public class DetectedPattern
    {
        public PatternType Type { get; set; }
        public double Confidence { get; set; }
        public double PriceLevel { get; set; }
        public SignalType Signal { get; set; }
        public DateTime DetectedTime { get; set; }
    }

    public class LargeOrder
    {
        public long Id { get; set; }
        public double Price { get; set; }
        public long Volume { get; set; }
        public DateTime Time { get; set; }
        public bool IsBuy { get; set; }
        public double Confidence { get; set; }
    }

    public class PerformanceMetrics
    {
        public double CurrentCPUUsage { get; set; }
        public long MemoryUsageMB { get; set; }
        public double RenderTimeMs { get; set; }
        public double CalculationTimeMs { get; set; }
        public int QueuedTicks { get; set; }
        public int ActivePatterns { get; set; }
        public int LargeOrdersTracked { get; set; }
        public int VisiblePriceLevels { get; set; }
    }

    #endregion

    [CategoryAttribute("BearishBully")]
    [Description("BearishBully Quantum Pro - Enterprise Order Flow Analytics")]
    public class BearishBullyQuantumPro : Indicator
    {
        #region Variables

        // Core data structures
        private ConcurrentQueue<TickData> tickBuffer;
        private Dictionary<double, PriceLevelData> footprintData;
        private List<DetectedPattern> activePatterns;
        private Dictionary<long, LargeOrder> largeOrders;
        private PerformanceMetrics metrics;

        // Rendering
        private SharpDX.Direct2D1.Brush textBrush;
        private SharpDX.Direct2D1.Brush bidBrush;
        private SharpDX.Direct2D1.Brush askBrush;
        private SharpDX.Direct2D1.Brush backgroundBrush;
        private SharpDX.DirectWrite.TextFormat textFormat;
        
        // Performance tracking
        private Stopwatch renderStopwatch;
        private Stopwatch calcStopwatch;
        private object dataLock = new object();

        #endregion

        #region Properties

        [NinjaScriptProperty]
        [Range(1, 100)]
        [Display(Name = "Tick Aggregation", Order = 1, GroupName = "Performance")]
        public int TickAggregation { get; set; }

        [NinjaScriptProperty]
        [Display(Name = "Enable AI Patterns", Order = 2, GroupName = "Features")]
        public bool EnableAIPatterns { get; set; }

        [NinjaScriptProperty]
        [Display(Name = "Track Large Orders", Order = 3, GroupName = "Features")]
        public bool TrackLargeOrders { get; set; }

        [NinjaScriptProperty]
        [Range(1000, 1000000)]
        [Display(Name = "Large Order Threshold", Order = 4, GroupName = "Detection")]
        public int LargeOrderThreshold { get; set; }

        [NinjaScriptProperty]
        [Range(10, 120)]
        [Display(Name = "Max FPS", Order = 5, GroupName = "Performance")]
        public int MaxFPS { get; set; }

        [NinjaScriptProperty]
        [Display(Name = "Show Dashboard", Order = 6, GroupName = "Display")]
        public bool ShowDashboard { get; set; }

        #endregion

        #region Initialization

        protected override void OnStateChange()
        {
            if (State == State.SetDefaults)
            {
                Description = "BearishBully Quantum Pro - Enterprise Order Flow Analytics";
                Name = "BearishBullyQuantumPro";
                Calculate = Calculate.OnEachTick;
                IsOverlay = true;
                DisplayInDataBox = true;
                DrawOnPricePanel = true;
                ScaleJustification = ScaleJustification.Right;

                // Default settings
                TickAggregation = 5;
                EnableAIPatterns = true;
                TrackLargeOrders = true;
                LargeOrderThreshold = 50000;
                MaxFPS = 30;
                ShowDashboard = true;
            }
            else if (State == State.Configure)
            {
                // Initialize data structures
                tickBuffer = new ConcurrentQueue<TickData>();
                footprintData = new Dictionary<double, PriceLevelData>();
                activePatterns = new List<DetectedPattern>();
                largeOrders = new Dictionary<long, LargeOrder>();
                metrics = new PerformanceMetrics();
                
                renderStopwatch = new Stopwatch();
                calcStopwatch = new Stopwatch();
                
                renderStopwatch.Start();
            }
            else if (State == State.DataLoaded)
            {
                Print("✅ BearishBully Quantum Pro loaded successfully");
            }
            else if (State == State.Terminated)
            {
                // Cleanup
                DisposeBrushes();
            }
        }

        #endregion

        #region OnBarUpdate & Market Data

        protected override void OnBarUpdate()
        {
            if (CurrentBars[0] < 20) return;

            calcStopwatch.Restart();

            // Process queued ticks
            ProcessTickBuffer();

            // Update metrics
            metrics.QueuedTicks = tickBuffer.Count;
            metrics.ActivePatterns = activePatterns.Count;
            metrics.LargeOrdersTracked = largeOrders.Count;

            calcStopwatch.Stop();
            metrics.CalculationTimeMs = calcStopwatch.Elapsed.TotalMilliseconds;
        }

        protected override void OnMarketData(MarketDataEventArgs e)
        {
            if (e.MarketDataType == MarketDataType.Last ||
                e.MarketDataType == MarketDataType.Bid ||
                e.MarketDataType == MarketDataType.Ask)
            {
                tickBuffer.Enqueue(new TickData
                {
                    Price = e.Price,
                    Volume = e.Volume,
                    IsBid = e.MarketDataType == MarketDataType.Bid,
                    Time = e.Time,
                    MarketDataType = e.MarketDataType
                });
            }
        }

        #endregion

        #region Data Processing

        private void ProcessTickBuffer()
        {
            int processed = 0;
            int maxProcess = 100; // Process max 100 ticks per bar

            while (tickBuffer.TryDequeue(out TickData tick) && processed < maxProcess)
            {
                ProcessTick(tick);
                processed++;
            }
        }

        private void ProcessTick(TickData tick)
        {
            double priceLevel = Math.Round(tick.Price / TickSize) * TickSize;

            lock (dataLock)
            {
                if (!footprintData.ContainsKey(priceLevel))
                {
                    footprintData[priceLevel] = new PriceLevelData
                    {
                        Price = priceLevel
                    };
                }

                var level = footprintData[priceLevel];
                
                if (tick.IsBid || tick.MarketDataType == MarketDataType.Bid)
                    level.BidVolume += tick.Volume;
                else
                    level.AskVolume += tick.Volume;

                level.LastUpdate = tick.Time;
            }

            // Detect large orders
            if (TrackLargeOrders && tick.Volume >= LargeOrderThreshold)
            {
                DetectLargeOrder(tick);
            }

            // Pattern detection
            if (EnableAIPatterns)
            {
                DetectPatterns(tick);
            }
        }

        private void DetectLargeOrder(TickData tick)
        {
            var order = new LargeOrder
            {
                Id = tick.Time.Ticks,
                Price = tick.Price,
                Volume = tick.Volume,
                Time = tick.Time,
                IsBuy = tick.IsBid,
                Confidence = Math.Min(1.0, tick.Volume / (LargeOrderThreshold * 2.0))
            };

            lock (largeOrders)
            {
                largeOrders[order.Id] = order;
            }

            // Alert
            if (order.Volume > LargeOrderThreshold * 2)
            {
                PlaySound(@"Alert2.wav");
                Draw.ArrowUp(this, "LO_" + order.Id, false, 0, order.Price - (10 * TickSize), Brushes.Yellow);
            }
        }

        private void DetectPatterns(TickData tick)
        {
            // Simple absorption pattern detection
            double priceLevel = Math.Round(tick.Price / TickSize) * TickSize;
            
            if (footprintData.ContainsKey(priceLevel))
            {
                var level = footprintData[priceLevel];
                
                // High volume, low price movement = absorption
                if (level.TotalVolume > Volume[0] * 1.5 && Math.Abs(level.Delta) < level.TotalVolume * 0.3)
                {
                    var pattern = new DetectedPattern
                    {
                        Type = PatternType.Absorption,
                        Confidence = 0.85,
                        PriceLevel = priceLevel,
                        Signal = level.Delta > 0 ? SignalType.Bullish : SignalType.Bearish,
                        DetectedTime = Time[0]
                    };

                    lock (activePatterns)
                    {
                        activePatterns.Add(pattern);
                    }

                    Draw.Diamond(this, "PAT_" + pattern.DetectedTime.Ticks, false, 0, priceLevel, 
                        pattern.Signal == SignalType.Bullish ? Brushes.LimeGreen : Brushes.Red);
                }
            }
        }

        #endregion

        #region Rendering

        protected override void OnRender(ChartControl chartControl, ChartScale chartScale)
        {
            base.OnRender(chartControl, chartScale);

            // FPS limiting
            if (renderStopwatch.ElapsedMilliseconds < (1000.0 / MaxFPS))
                return;

            renderStopwatch.Restart();

            // Initialize brushes if needed
            if (textBrush == null)
                InitializeBrushes();

            // Render footprint
            RenderFootprint(chartControl, chartScale);

            // Render dashboard
            if (ShowDashboard)
                RenderDashboard(chartControl, chartScale);

            metrics.RenderTimeMs = renderStopwatch.Elapsed.TotalMilliseconds;
        }

        private void InitializeBrushes()
        {
            textBrush = new SharpDX.Direct2D1.SolidColorBrush(RenderTarget, SharpDX.Color.White);
            bidBrush = new SharpDX.Direct2D1.SolidColorBrush(RenderTarget, SharpDX.Color.LimeGreen);
            askBrush = new SharpDX.Direct2D1.SolidColorBrush(RenderTarget, SharpDX.Color.Red);
            backgroundBrush = new SharpDX.Direct2D1.SolidColorBrush(RenderTarget, 
                new SharpDX.Color(20, 20, 40, 200));

            textFormat = new SharpDX.DirectWrite.TextFormat(
                Core.Globals.DirectWriteFactory,
                "Consolas",
                SharpDX.DirectWrite.FontWeight.Normal,
                SharpDX.DirectWrite.FontStyle.Normal,
                10f
            );
        }

        private void RenderFootprint(ChartControl chartControl, ChartScale chartScale)
        {
            lock (dataLock)
            {
                foreach (var kvp in footprintData.OrderByDescending(x => x.Key).Take(50))
                {
                    double price = kvp.Key;
                    var level = kvp.Value;

                    float y = chartScale.GetYByValue(price);
                    float x = ChartPanel.W - 150;

                    // Draw bid volume
                    RenderTarget.DrawText(
                        level.BidVolume.ToString("N0"),
                        textFormat,
                        new SharpDX.RectangleF(x, y - 10, 60, 20),
                        bidBrush
                    );

                    // Draw ask volume
                    RenderTarget.DrawText(
                        level.AskVolume.ToString("N0"),
                        textFormat,
                        new SharpDX.RectangleF(x + 70, y - 10, 60, 20),
                        askBrush
                    );
                }
            }
        }

        private void RenderDashboard(ChartControl chartControl, ChartScale chartScale)
        {
            float x = 10;
            float y = 40;
            float lineHeight = 16;

            // Background panel
            RenderTarget.FillRectangle(
                new SharpDX.RectangleF(x - 5, y - 5, 250, 180),
                backgroundBrush
            );

            // Metrics
            DrawDashboardText($"CPU: {metrics.CurrentCPUUsage:F1}%", x, y); y += lineHeight;
            DrawDashboardText($"Memory: {metrics.MemoryUsageMB} MB", x, y); y += lineHeight;
            DrawDashboardText($"Render: {metrics.RenderTimeMs:F1} ms", x, y); y += lineHeight;
            DrawDashboardText($"Calc: {metrics.CalculationTimeMs:F1} ms", x, y); y += lineHeight;
            DrawDashboardText($"Queued Ticks: {metrics.QueuedTicks}", x, y); y += lineHeight;
            DrawDashboardText($"Active Patterns: {metrics.ActivePatterns}", x, y); y += lineHeight;
            DrawDashboardText($"Large Orders: {metrics.LargeOrdersTracked}", x, y); y += lineHeight;
            DrawDashboardText($"Price Levels: {footprintData.Count}", x, y); y += lineHeight;
        }

        private void DrawDashboardText(string text, float x, float y)
        {
            RenderTarget.DrawText(
                text,
                textFormat,
                new SharpDX.RectangleF(x, y, 240, 20),
                textBrush
            );
        }

        private void DisposeBrushes()
        {
            textBrush?.Dispose();
            bidBrush?.Dispose();
            askBrush?.Dispose();
            backgroundBrush?.Dispose();
            textFormat?.Dispose();
        }

        #endregion
    }
}