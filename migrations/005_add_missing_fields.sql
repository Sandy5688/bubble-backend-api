-- Add missing fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0;

-- Add missing fields to kyc_documents
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing fields to otp_codes
ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS method TEXT;
ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS destination TEXT;
ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add missing fields to magic_links
ALTER TABLE magic_links ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON magic_links(expires_at);
