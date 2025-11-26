-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enforce data access controls at database level
-- ============================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS TABLE POLICIES
-- ============================================================

-- Users can only see their own data
CREATE POLICY user_select_own ON users
  FOR SELECT
  USING (id = current_setting('app.current_user_id')::uuid);

-- Users can update their own data
CREATE POLICY user_update_own ON users
  FOR UPDATE
  USING (id = current_setting('app.current_user_id')::uuid);

-- Admin can see all users
CREATE POLICY admin_select_all_users ON users
  FOR SELECT
  USING (current_setting('app.is_admin', true)::boolean = true);

-- ============================================================
-- KYC SESSIONS POLICIES
-- ============================================================

-- Users can only see their own KYC sessions
CREATE POLICY kyc_session_select_own ON kyc_sessions
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Users can insert their own KYC sessions
CREATE POLICY kyc_session_insert_own ON kyc_sessions
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);

-- Admin can see all KYC sessions
CREATE POLICY admin_select_all_kyc ON kyc_sessions
  FOR SELECT
  USING (current_setting('app.is_admin', true)::boolean = true);

-- ============================================================
-- KYC DOCUMENTS POLICIES
-- ============================================================

-- Users can only see their own documents
CREATE POLICY kyc_doc_select_own ON kyc_documents
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Users can insert their own documents
CREATE POLICY kyc_doc_insert_own ON kyc_documents
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);

-- Admin can see all documents
CREATE POLICY admin_select_all_docs ON kyc_documents
  FOR SELECT
  USING (current_setting('app.is_admin', true)::boolean = true);

-- ============================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================

-- Users can only see their own subscriptions
CREATE POLICY subscription_select_own ON subscriptions
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Admin can see all subscriptions
CREATE POLICY admin_select_all_subscriptions ON subscriptions
  FOR SELECT
  USING (current_setting('app.is_admin', true)::boolean = true);

-- ============================================================
-- PAYMENT CUSTOMERS POLICIES
-- ============================================================

-- Users can only see their own payment info
CREATE POLICY payment_customer_select_own ON payment_customers
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Admin can see all payment customers
CREATE POLICY admin_select_all_payment_customers ON payment_customers
  FOR SELECT
  USING (current_setting('app.is_admin', true)::boolean = true);

-- ============================================================
-- HELPER FUNCTION TO SET USER CONTEXT
-- ============================================================

CREATE OR REPLACE FUNCTION set_user_context(p_user_id uuid, p_is_admin boolean DEFAULT false)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', p_user_id::text, false);
  PERFORM set_config('app.is_admin', p_is_admin::text, false);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- NOTES:
-- - RLS is enforced at database level
-- - Application must call set_user_context() after auth
-- - Admin bypass requires is_admin flag
-- - All SELECT/INSERT/UPDATE/DELETE operations filtered
-- ============================================================
