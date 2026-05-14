# BearishBully Directional Bias Engine - Deployment Checklist

## 1. Supabase Setup
- [ ] Run setup.sql in Supabase SQL Editor
- [ ] Verify daily_bias table exists
- [ ] Confirm RLS policies are active
- [ ] Test with sample INSERT (should succeed with service key)

## 2. Local Testing
- [ ] Copy .env.example to .env
- [ ] Fill in all environment variables
- [ ] Install Python dependencies:
      cd bias-engine
      pip install -r requirements.txt
- [ ] Run engine locally:
      python bias_engine.py
- [ ] Verify row appears in Supabase daily_bias table
- [ ] Check Telegram for alert (if configured)

## 3. GitHub Secrets Setup
- [ ] Go to GitHub repo → Settings → Secrets → Actions
- [ ] Add secrets:
      NEXT_PUBLIC_SUPABASE_URL
      SUPABASE_SERVICE_ROLE_KEY
      TELEGRAM_BOT_TOKEN (optional)
      TELEGRAM_CHAT_ID (optional)
      PCR_API_URL (optional)

## 4. GitHub Actions
- [ ] Push code to GitHub
- [ ] Go to Actions tab
- [ ] Run "Daily Bias Engine" workflow manually
- [ ] Check workflow logs for errors
- [ ] Verify new row in Supabase
- [ ] Confirm cron schedule is set (11:30 UTC = 6:30 AM EST)

## 5. Next.js Integration
- [ ] Verify API route works:
      curl http://localhost:3000/api/bias/latest?symbol=SPX
- [ ] Add BiasWidget to dashboard
- [ ] Test widget displays latest bias
- [ ] Verify auto-refresh works

## 6. Production Deployment
- [ ] Deploy Next.js app (Vercel/etc)
- [ ] Add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars (server-only)
- [ ] Test production API endpoint
- [ ] Monitor first automated run at 6:30 AM EST

## 7. Monitoring
- [ ] Check Supabase logs daily
- [ ] Monitor GitHub Actions success rate
- [ ] Verify Telegram alerts arrive
- [ ] Track bias accuracy vs market moves

## Troubleshooting
- If Python errors: Check requirements.txt versions
- If Supabase 403: Verify service role key
- If no data: Check yfinance symbol formats
- If Telegram fails: Verify bot token and chat ID
- If GitHub Actions fails: Check secrets are set

## Next Enhancements
- [ ] Add PCR data source
- [ ] Integrate real economic calendar API
- [ ] Build backtest harness
- [ ] Add version tracking to records
- [ ] Set up error monitoring (Sentry)