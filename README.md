# 🐻 BearishBully Edge - MNQ Volume Terminal

**Professional-grade trading terminal combining true volume analytics from NinjaTrader with secure storage and a next-gen Next.js frontend.**

---

## 🎯 What This Is

The **first foundation component** of the BearishBully ecosystem:
- Real-time MNQ volume delta tracking
- Secure API for NinjaTrader data ingestion
- Professional terminal UI (Thinkorswim-inspired)
- Scalable architecture ready for Phase 2 additions (COT, Bias Engine, Calendar)

---

## 🏗️ Architecture

```
NinjaTrader 8 → POST /api/volume → Supabase (PostgreSQL) → Next.js Terminal UI
```

**Tech Stack:**
- **Frontend:** Next.js 14, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL + RLS)
- **Deployment:** Vercel (recommended)

---

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- (Optional) Vercel account for deployment

### Step 1: Clone and Install

```bash
# Navigate to project directory
cd bearishbully-edge

# Install dependencies
npm install
```

### Step 2: Set Up Supabase

1. **Create a new Supabase project** at [app.supabase.com](https://app.supabase.com)

2. **Run the SQL schema:**
   - Go to SQL Editor in your Supabase dashboard
   - Copy contents of `supabase/schema.sql`
   - Run the script

3. **Get your API keys:**
   - Go to Settings → API
   - Copy:
     - `Project URL`
     - `anon/public key`
     - `service_role key` (⚠️ Keep this SECRET!)

### Step 3: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local
```

Your `.env.local` should look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
MNQ_DEFAULT_SYMBOL=MNQ
```

### Step 4: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the terminal.

---

## 🧪 Testing the API

### Test with cURL

```bash
# Single volume bar insert
curl -X POST http://localhost:3000/api/volume \
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
  }'
```

### Run Test Suite

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

### Test with JavaScript (Node.js)

```javascript
const sampleData = {
  symbol: "MNQ",
  related_symbol: "QQQ",
  bar_time: new Date().toISOString(),
  open_volume: 15420,
  close_volume: 12350,
  delta_volume: 3070,
  timeframe: "1m",
  source: "NinjaTrader"
};

fetch('http://localhost:3000/api/volume', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(sampleData)
})
  .then(res => res.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err));
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub:**

```bash
git init
git add .
git commit -m "Initial BearishBully Edge setup"
git branch -M main
git remote add origin https://github.com/yourusername/bearishbully-edge.git
git push -u origin main
```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Deploy!

3. **Your terminal will be live at:** `https://bearishbully-edge.vercel.app`

### Alternative: Deploy to Other Platforms

- **Netlify:** Similar to Vercel, use Git integration
- **Railway:** `railway up` (add env vars in dashboard)
- **Self-hosted:** `npm run build && npm start` (requires Node.js server)

---

## 🔐 Security Notes

### Row Level Security (RLS)

The database is protected with RLS policies:
- ✅ **Service role** (API) can INSERT data
- ✅ **Authenticated users** can READ data
- ✅ **Anonymous users** can READ data (optional - enabled by default)
- ❌ **Public writes** are BLOCKED

### API Key Protection

- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the browser
- Only use in API routes (`pages/api/*`)
- Keep `.env.local` in `.gitignore`

### Production Recommendations

1. Add API rate limiting (use Vercel Edge Config or Upstash Redis)
2. Add authentication (Supabase Auth) for write operations
3. Monitor API usage in Vercel/Supabase dashboards
4. Enable CORS restrictions in production

---

## 📊 Data Schema

### `volume_data` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `symbol` | TEXT | Futures symbol (MNQ, NQ, ES, etc.) |
| `related_symbol` | TEXT | Related equity symbol (QQQ, SPY, etc.) |
| `bar_time` | TIMESTAMPTZ | Bar close time (UTC) |
| `open_volume` | NUMERIC | Buy volume |
| `close_volume` | NUMERIC | Sell volume |
| `delta_volume` | NUMERIC | Buy - Sell (positive = bullish) |
| `timeframe` | TEXT | Bar timeframe (1m, 5m, 15m, etc.) |
| `source` | TEXT | Data source (NinjaTrader, Rithmic, etc.) |
| `created_at` | TIMESTAMPTZ | Record creation timestamp |

### Validation Rules

- `open_volume` and `close_volume` must be ≥ 0
- `delta_volume` must equal `open_volume - close_volume`
- `bar_time` must be valid ISO 8601 timestamp
- `bar_time` cannot be > 5 minutes in the future
- `timeframe` must be one of: `1m, 5m, 15m, 30m, 1h, 4h, 1d`
- `symbol` must be one of: `MNQ, NQ, ES, MES, YM, MYM, RTY, M2K`
- `source` must be one of: `NinjaTrader, Rithmic, CQG, Manual`

---

## 🔌 NinjaTrader Integration

### Option 1: Custom NinjaScript (Recommended)

Create a NinjaScript strategy that sends volume data to your API:

```csharp
// Pseudo-code - customize for your needs
protected override void OnBarUpdate()
{
    if (CurrentBar < 1) return;
    
    var volumeData = new {
        symbol = "MNQ",
        bar_time = Time[0].ToUniversalTime().ToString("o"),
        open_volume = Volume[0],  // Adjust based on your data source
        close_volume = Volume[1],
        delta_volume = Volume[0] - Volume[1],
        timeframe = "1m",
        source = "NinjaTrader"
    };
    
    SendToAPI("https://your-api-url.vercel.app/api/volume", volumeData);
}
```

### Option 2: Export to CSV → Manual Upload

1. Export volume data from NinjaTrader
2. Format as JSON (use `scripts/sampleData.json` as template)
3. POST to `/api/volume` endpoint

### Option 3: Real-Time Integration via Rithmic/CQG

If using Rithmic or CQG data feed:
1. Build custom connector in Python/Node.js
2. Subscribe to volume delta events
3. POST to API in real-time

---

## 🛠️ Development Workflow

### Project Structure

```
bearishbully-edge/
├── components/          # React components
│   ├── MainTerminalLayout.tsx
│   └── VolumeWidget.tsx
├── lib/                 # Shared utilities
│   ├── supabaseAdmin.ts
│   └── supabaseClient.ts
├── pages/
│   ├── api/            # API routes
│   │   └── volume.ts
│   ├── _app.tsx
│   └── index.tsx
├── scripts/            # Test scripts & sample data
│   ├── sampleData.json
│   └── test-api.sh
├── styles/
│   └── globals.css
├── supabase/
│   └── schema.sql      # Database schema
├── utils/
│   └── validateVolumeBar.ts
├── .env.example
├── package.json
└── README.md
```

### Adding Features

This is **Phase 1** of the BearishBully ecosystem. Next phases include:

- **Phase 2:** TradingView Lightweight Charts integration
- **Phase 3:** Directional Bias Engine + COT Overlay
- **Phase 4:** Economic Calendar Sync
- **Phase 5:** Volume Heatmap + Cycle Predictor

Each feature plugs into this terminal as modular components.

---

## 📈 Monitoring & Maintenance

### Database Cleanup

Run this in Supabase SQL Editor monthly:

```sql
SELECT cleanup_old_volume_data(30);  -- Removes data older than 30 days
```

### Check API Health

```bash
curl https://your-api-url.vercel.app/api/volume
# Should return: {"success":false,"error":"Method not allowed. Use POST."}
```

### Monitor in Supabase

- Go to Database → Table Editor → `volume_data`
- Check row count and last `bar_time`
- View recent data: `SELECT * FROM latest_volume_summary;`

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

✅ **Fix:** Check `.env.local` exists and contains all 3 required variables

### Error: "Database insertion failed"

✅ **Fix:** Run `supabase/schema.sql` in SQL Editor

### Volume Widget shows "No data"

✅ **Fix:** Insert test data using `scripts/test-api.sh`

### API returns 500 error

✅ **Fix:** Check Vercel logs or `npm run dev` console for error details

---

## 💡 Tips & Best Practices

1. **Keep service_role key secret** - Never commit to Git
2. **Use UTC timestamps** - All `bar_time` values should be ISO 8601 UTC
3. **Batch inserts** - Send arrays of bars to reduce API calls
4. **Rate limit** - Don't exceed 100 requests/minute (add rate limiting in production)
5. **Monitor costs** - Check Supabase usage dashboard monthly

---

## 📞 Support

For issues specific to this codebase:
- Check error logs in browser console or terminal
- Review validation errors in API responses
- Verify Supabase schema matches `schema.sql`

For trading/strategy questions:
- Refer to BearishBully Master Blueprint (Document 1)

---

## 📜 License

Proprietary - BearishBully Ecosystem © 2025

---

## 🚀 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Insert test data
3. ✅ Verify Volume Widget displays data
4. 🔜 Connect NinjaTrader live feed
5. 🔜 Add TradingView charts (Phase 2)
6. 🔜 Build Directional Bias Engine (Phase 3)

**You're now ready to start collecting real volume data!** 🎉
