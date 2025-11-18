# Post-Deployment Checklist

## 1. Environment Variables
- [ ] All secrets added to Railway/production environment
- [ ] SENTRY_DSN configured
- [ ] ALLOWED_ORIGINS set to production domains
- [ ] Database credentials verified
- [ ] AWS S3 credentials verified
- [ ] Stripe webhook secret configured
- [ ] All API keys tested

## 2. Security Verification
- [ ] HTTPS enforced
- [ ] HSTS headers active
- [ ] CORS restricted to production domains
- [ ] Rate limiting active
- [ ] Webhook signatures verified

## 3. Health Checks
- [ ] `/health` endpoint responding
- [ ] Database connection verified
- [ ] Redis connection verified
- [ ] S3 connection verified

## 4. Monitoring
- [ ] Sentry error tracking active
- [ ] Log aggregation configured
- [ ] Uptime monitoring enabled

## 5. Testing
- [ ] Auth endpoints tested
- [ ] Payment webhooks tested
- [ ] File upload tested
- [ ] AI endpoints tested

## 6. Secret Rotation
- [ ] SUPABASE_SERVICE_ROLE_KEY rotated
- [ ] JWT_SECRET rotated
- [ ] ENCRYPTION_KEY rotated
- [ ] Stripe keys verified
- [ ] AWS keys verified
