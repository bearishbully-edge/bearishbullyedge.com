# 🚀 BearishBully Edge - Deployment Checklist

## Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All files present in project directory
- [ ] `.env.local` created with your Supabase credentials
- [ ] Tested API locally with `npm run dev`
- [ ] Ran test script: `./scripts/test-api.sh`
- [ ] Verified Volume Widget displays data

### 2. Supabase Setup
- [ ] Supabase project created
- [ ] SQL schema executed (`supabase/schema.sql`)
- [ ] RLS policies enabled and verified
- [ ] API keys copied (URL, anon, service_role)
- [ ] Test data inserted successfully

### 3. Git Setup
- [ ] Repository initialized (`git init`)
- [ ] `.gitignore` excludes `.env.local`
- [ ] Initial commit created
- [ ] Pushed to GitHub/GitLab

---

## Vercel Deployment Steps

### Step 1: Import Project
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Select "Next.js" as framework preset

### Step 2: Configure Environment Variables
Add these in Vercel dashboard under "Environment Variables":

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
MNQ_DEFAULT_SYMBOL=MNQ
```

⚠️ **IMPORTANT:** Mark `SUPABASE_SERVICE_ROLE_KEY` as sensitive/secret

### Step 3: Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Note your deployment URL: `https://bearishbully-edge.vercel.app`

### Step 4: Post-Deployment Verification

Test API endpoint:
```bash
curl -X POST https://your-deployment-url.vercel.app/api/volume \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "MNQ",
    "bar_time": "2025-11-03T14:30:00Z",
    "open_volume": 1000,
    "close_volume": 800,
    "delta_volume": 200,
    "timeframe": "1m",
    "source": "NinjaTrader"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully inserted 1 volume bar(s)",
  "inserted": 1,
  "data": [...]
}
```

- [ ] API returns 200 status
- [ ] Data appears in Supabase table
- [ ] Terminal UI loads at deployment URL
- [ ] Volume Widget displays data

---

## Production Optimizations (Optional)

### Security Enhancements
- [ ] Add API rate limiting (Upstash Redis + Vercel Edge)
- [ ] Enable Supabase Auth for user accounts
- [ ] Add IP whitelisting for NinjaTrader server
- [ ] Set up custom domain with SSL

### Performance
- [ ] Enable Vercel Analytics
- [ ] Add Supabase connection pooling (if > 1000 req/min)
- [ ] Implement caching for volume summary queries
- [ ] Add error monitoring (Sentry/LogRocket)

### Monitoring
- [ ] Set up Vercel deployment notifications
- [ ] Enable Supabase database alerts
- [ ] Create Slack/Discord webhook for critical errors
- [ ] Schedule weekly data cleanup cron job

---

## Common Deployment Issues

### Issue: Build fails with "Module not found"
**Fix:** 
```bash
npm install
git add package-lock.json
git commit -m "Add package-lock"
git push
```

### Issue: API returns 500 in production but works locally
**Fix:** Check Vercel function logs for error details
- Go to Vercel dashboard → Deployment → Functions tab
- Look for errors in `/api/volume` function

### Issue: Environment variables not working
**Fix:** 
- Ensure variable names match exactly (case-sensitive)
- Redeploy after adding/changing env vars
- Check "Include in all Environments" is enabled

### Issue: CORS errors from NinjaTrader
**Fix:** Add CORS headers in `pages/api/volume.ts`:
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

---

## Cost Estimates

### Free Tier Limits
- **Vercel:** 100GB bandwidth, 100 serverless function hours/month
- **Supabase:** 500MB database, 2GB bandwidth, 50MB file storage

### Expected Usage (Phase 1)
- **API calls:** ~10,000/day (1 per minute for 1 trading day)
- **Database size:** ~50MB/month (1m bars, MNQ only)
- **Bandwidth:** ~5GB/month

💰 **Total Cost:** $0/month (stays within free tier)

### Upgrade Triggers
- Upgrade to **Vercel Pro ($20/mo)** if:
  - Bandwidth > 100GB/month
  - Need custom domains beyond 1
  - Want advanced analytics

- Upgrade to **Supabase Pro ($25/mo)** if:
  - Database > 500MB
  - Need more than 50,000 API requests/day
  - Want point-in-time recovery

---

## Maintenance Schedule

### Daily
- [ ] Monitor Vercel function logs for errors
- [ ] Check Volume Widget is updating

### Weekly
- [ ] Review API request count
- [ ] Check database size in Supabase
- [ ] Verify latest `bar_time` is current

### Monthly
- [ ] Run database cleanup: `SELECT cleanup_old_volume_data(30);`
- [ ] Review Vercel/Supabase usage vs. limits
- [ ] Check for Next.js/dependency updates

---

## Rollback Plan

If deployment breaks:

1. **Revert in Vercel:**
   - Go to Deployments tab
   - Find last working deployment
   - Click "..." → "Redeploy"

2. **Restore Database:**
   - Supabase auto-backups daily (Pro tier)
   - Free tier: manually export data before major changes

3. **Local Development:**
   - Always test changes locally first
   - Use separate Supabase project for staging

---

## Success Criteria

Your deployment is successful when:

✅ Terminal loads at `https://your-app.vercel.app`
✅ API accepts POST requests without errors
✅ Volume Widget displays real-time data
✅ Supabase table populates with new bars
✅ No console errors in browser DevTools
✅ Vercel function logs show successful requests

---

## Next Steps After Deployment

1. **Configure NinjaTrader** (see `NINJATRADER_INTEGRATION.md`)
2. **Start Phase 2:** TradingView chart integration
3. **Add more instruments:** ES, RTY, YM
4. **Build Directional Bias Engine** (Phase 3)

🎉 **Congratulations! Your BearishBully Edge terminal is live!**
