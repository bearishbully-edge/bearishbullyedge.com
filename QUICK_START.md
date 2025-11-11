# ⚡ Quick Start Guide - BearishBully Edge

**Get your terminal running in under 30 minutes.**

---

## 🎯 What You're Building

A professional trading terminal that:
- Tracks MNQ volume delta in real-time
- Stores data securely in Supabase
- Displays beautiful visualizations
- Scales to add Bias Engine, COT, Calendar later

---

## ⏱️ 30-Minute Setup

### ✅ Step 1: Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Click "New Project"
   - Name: `bearishbully-edge`
   - Database Password: (save this!)
   - Region: Closest to you
3. Wait for project to provision (~2 minutes)
4. Go to **SQL Editor** → New Query
5. Copy/paste contents of `supabase/schema.sql`
6. Click **Run** (should see "Success")
7. Go to **Settings → API**
8. Copy these 3 values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (⚠️ SECRET!)
   ```

✅ **Supabase ready!**

---

### ✅ Step 2: Local Setup (10 minutes)

```bash
# 1. Navigate to project
cd bearishbully-edge

# 2. Install dependencies
npm install
# (Takes ~2-3 minutes)

# 3. Create environment file
cp .env.example .env.local

# 4. Edit .env.local with your text editor
nano .env.local
# (Paste your Supabase values from Step 1)

# 5. Start development server
npm run dev
```

Open browser to [http://localhost:3000](http://localhost:3000)

**You should see:** The BearishBully terminal with placeholder panels.

✅ **Local environment ready!**

---

### ✅ Step 3: Test API (5 minutes)

```bash
# Test 1: Single bar insert
curl -X POST http://localhost:3000/api/volume \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "MNQ",
    "bar_time": "2025-11-03T14:30:00Z",
    "open_volume": 15420,
    "close_volume": 12350,
    "delta_volume": 3070,
    "timeframe": "1m",
    "source": "NinjaTrader"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Successfully inserted 1 volume bar(s)",
  "inserted": 1
}
```

```bash
# Test 2: Batch insert (sample data)
curl -X POST http://localhost:3000/api/volume \
  -H "Content-Type: application/json" \
  -d @scripts/sampleData.json
```

Refresh your browser - **Volume Widget should show data!**

✅ **API working!**

---

### ✅ Step 4: Deploy to Vercel (10 minutes)

```bash
# 1. Initialize Git
git init
git add .
git commit -m "Initial BearishBully Edge setup"

# 2. Create GitHub repo (go to github.com)
# - Click "New repository"
# - Name: bearishbully-edge
# - Click "Create"

# 3. Push code
git remote add origin https://github.com/YOUR_USERNAME/bearishbully-edge.git
git branch -M main
git push -u origin main
```

Now deploy:

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click "Add New" → "Project"
3. Import `bearishbully-edge` repo
4. **Add environment variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```
5. Click "Deploy" (takes ~2 minutes)
6. Copy your live URL: `https://bearishbully-edge.vercel.app`

Test live API:
```bash
curl -X POST https://bearishbully-edge.vercel.app/api/volume \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "MNQ",
    "bar_time": "2025-11-03T15:00:00Z",
    "open_volume": 12000,
    "close_volume": 10000,
    "delta_volume": 2000,
    "timeframe": "1m",
    "source": "Test"
  }'
```

✅ **Live terminal deployed!**

---

## 🎉 Success Checklist

You're done when:

- [ ] Terminal loads at your Vercel URL
- [ ] Volume Widget displays sample data
- [ ] API accepts POST requests
- [ ] Data appears in Supabase table
- [ ] No errors in browser console

---

## 🚀 What's Next?

### Option 1: Connect NinjaTrader (Real Data)
Read: `NINJATRADER_INTEGRATION.md`
- Install NinjaScript strategy
- Point it to your Vercel API
- Start collecting live MNQ volume

### Option 2: Start Phase 2 (TradingView Charts)
- Integrate TradingView Lightweight Charts
- Plot volume delta on price chart
- Add candlestick visualization

### Option 3: Build Bias Engine (Phase 3)
- Collect SPX, VIX, PCR data
- Calculate daily bias score
- Display in right sidebar panel

---

## 🐛 Common First-Time Issues

### Issue: `npm install` fails
**Fix:** Update Node.js to v18+
```bash
node --version  # Should be 18.0.0 or higher
```

### Issue: Supabase schema won't run
**Fix:** Make sure you're in SQL Editor, not Table Editor

### Issue: Volume Widget shows "No data"
**Fix:** Insert test data first (see Step 3 above)

### Issue: Vercel deployment fails
**Fix:** Check build logs - usually missing environment variables

---

## 📁 Project File Structure

```
bearishbully-edge/
├── 📄 README.md                  ← Full documentation
├── 📄 DEPLOYMENT_CHECKLIST.md    ← Deployment guide
├── 📄 NINJATRADER_INTEGRATION.md ← NinjaTrader setup
├── 📄 QUICK_START.md             ← This file
├── components/
│   ├── MainTerminalLayout.tsx    ← Main UI
│   └── VolumeWidget.tsx          ← Volume display
├── lib/
│   ├── supabaseAdmin.ts          ← Server-side DB client
│   └── supabaseClient.ts         ← Browser-side DB client
├── pages/
│   ├── api/
│   │   └── volume.ts             ← API endpoint
│   └── index.tsx                 ← Home page
├── scripts/
│   ├── sampleData.json           ← Test data
│   └── test-api.sh               ← API test script
├── supabase/
│   └── schema.sql                ← Database schema
└── utils/
    └── validateVolumeBar.ts      ← Data validation
```

---

## 💡 Pro Tips

1. **Keep terminal open during market hours** to verify data flow
2. **Check Supabase daily** to monitor data quality
3. **Use 5m timeframe first** to reduce API calls while testing
4. **Add more symbols gradually** (start with MNQ only)
5. **Save your Vercel URL** in a bookmark

---

## 📞 Help Resources

- **Full docs:** `README.md`
- **Deployment help:** `DEPLOYMENT_CHECKLIST.md`
- **NinjaTrader setup:** `NINJATRADER_INTEGRATION.md`
- **API errors:** Check Vercel function logs
- **Database issues:** Check Supabase logs

---

## 🎯 Your Mission

1. ✅ Complete 30-minute setup
2. ✅ Verify terminal works
3. 🔜 Connect live data source
4. 🔜 Add more instruments
5. 🔜 Build Bias Engine (Phase 3)

**Welcome to the BearishBully ecosystem!** 🐻📈

---

*Built with: Next.js 14, Supabase, TypeScript, TailwindCSS*
