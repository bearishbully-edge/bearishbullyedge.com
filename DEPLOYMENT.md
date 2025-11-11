# 🚀 BearishBully Edge - Deployment Checklist

## Pre-Deployment

### Code Quality
- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] No console.error in production code (except error handlers)
- [ ] All TODO comments addressed or tracked
- [ ] Code reviewed and tested locally

### Environment Setup
- [ ] `.env.local` configured correctly
- [ ] All environment variables documented
- [ ] No sensitive keys in source code
- [ ] `.gitignore` includes `.env.local`

### Database
- [ ] Supabase schema deployed
- [ ] RLS policies verified and tested
- [ ] Helper functions working correctly
- [ ] Sample data tested (then removed if needed)
- [ ] Database indexes created
- [ ] Backup strategy in place

### Testing
- [ ] API endpoint tested with curl
- [ ] API endpoint tested with Node.js script
- [ ] Volume widget displays data correctly
- [ ] Real-time updates working
- [ ] Error states tested and display correctly
- [ ] Loading states tested

## Vercel Deployment

### Initial Setup
- [ ] Vercel account created
- [ ] Vercel CLI installed globally
- [ ] Project linked to Vercel: `vercel link`

### Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, Preview, Development)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (Production only - keep secret!)
- [ ] `MNQ_DEFAULT_SYMBOL` (Optional - all environments)

### Build Configuration
- [ ] Build command: `next build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm install`
- [ ] Node version: 18.x or higher

### Domain Setup (Optional)
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] SSL certificate verified
- [ ] HTTPS enforced

## Post-Deployment

### Verification
- [ ] Production URL accessible
- [ ] Volume widget loads without errors
- [ ] API endpoint responds correctly
- [ ] Real-time updates functional
- [ ] No console errors in browser
- [ ] Mobile responsive design works
- [ ] Performance metrics acceptable

### Monitoring
- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Supabase logs reviewed
- [ ] API rate limits configured if needed

### Security
- [ ] Service role key not exposed to frontend
- [ ] RLS policies preventing unauthorized writes
- [ ] CORS configured for production domain
- [ ] API endpoints rate-limited if needed
- [ ] Environment variables secured

### Documentation
- [ ] README.md updated with production URL
- [ ] API documentation accurate
- [ ] Environment variables documented
- [ ] Deployment process documented

## NinjaTrader Integration (Future)

### When Ready to Connect Live Data
- [ ] NinjaTrader 8 installed and configured
- [ ] Rithmic or other data feed connected
- [ ] Volume data export script created
- [ ] API endpoint URL configured in NT8
- [ ] Test with paper trading account first
- [ ] Monitor initial data quality
- [ ] Set up error alerting

## Rollback Plan

### If Issues Arise
1. **Immediate**: Revert to previous Vercel deployment
   ```bash
   vercel rollback
   ```

2. **Database**: Restore from Supabase backup if needed
   - Dashboard → Database → Backups

3. **Environment**: Verify environment variables match expected values

4. **Logs**: Check Vercel and Supabase logs for errors
   - Vercel: Dashboard → Logs
   - Supabase: Dashboard → Logs → API

## Performance Optimization (Future)

- [ ] Enable Vercel Edge Functions if needed
- [ ] Configure CDN caching for static assets
- [ ] Optimize bundle size (check with `npm run build`)
- [ ] Add loading skeletons for better UX
- [ ] Implement lazy loading for heavy components
- [ ] Set up database connection pooling if needed

## Monitoring & Alerts

### Set Up Monitoring For:
- [ ] API response times
- [ ] Database query performance
- [ ] Error rates
- [ ] Volume data ingestion rate
- [ ] Real-time subscription health

### Alert Thresholds:
- [ ] API errors > 5% of requests
- [ ] Database connection failures
- [ ] Missing volume data for > 10 minutes
- [ ] Abnormal data values (validation failures)

## Scaling Preparation (Phase 2+)

- [ ] Database read replicas if needed
- [ ] API rate limiting strategy
- [ ] Caching layer for frequently accessed data
- [ ] Load testing completed
- [ ] Auto-scaling configured on Vercel

## Compliance & Legal

- [ ] Terms of Service reviewed
- [ ] Privacy Policy updated
- [ ] Data retention policy defined
- [ ] GDPR compliance if serving EU users
- [ ] Financial data regulations considered

---

## Quick Deploy Commands

```bash
# Development preview
vercel

# Production deployment
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Rollback to previous deployment
vercel rollback
```

---

## Emergency Contacts

- **Supabase Support**: support@supabase.io
- **Vercel Support**: support@vercel.com
- **Project Lead**: [Your contact info]

---

**Last Updated**: November 2025
**Checklist Version**: 1.0
