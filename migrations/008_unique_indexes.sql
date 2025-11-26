-- Add UNIQUE indexes for critical fields

-- Prevent duplicate Stripe subscriptions
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_id 
ON subscriptions(stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;

-- Prevent duplicate webhook event processing

-- Prevent duplicate OTP codes per session
CREATE UNIQUE INDEX IF NOT EXISTS idx_otp_codes_session 
ON otp_codes(session_id) 
WHERE used = false;

-- Prevent duplicate magic links per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_magic_links_token 
ON magic_links(token) 
WHERE used = false;
