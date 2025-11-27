-- Migration: Add Row Level Security Context Functions
-- Description: Adds functions to set user context for RLS policies

-- Create function to set user context
CREATE OR REPLACE FUNCTION set_user_context(
  p_user_id UUID,
  p_user_role TEXT DEFAULT 'user'
) RETURNS VOID AS $$
BEGIN
  -- Set the current user ID in session
  PERFORM set_config('app.current_user_id', p_user_id::TEXT, false);
  PERFORM set_config('app.current_user_role', p_user_role, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user context
CREATE OR REPLACE FUNCTION get_user_context()
RETURNS TABLE(user_id UUID, user_role TEXT) AS $$
BEGIN
  RETURN QUERY SELECT 
    NULLIF(current_setting('app.current_user_id', true), '')::UUID,
    NULLIF(current_setting('app.current_user_role', true), '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clear user context
CREATE OR REPLACE FUNCTION clear_user_context()
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', false);
  PERFORM set_config('app.current_user_role', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION set_user_context IS 'Sets user context for Row Level Security';
COMMENT ON FUNCTION get_user_context IS 'Gets current user context';
COMMENT ON FUNCTION clear_user_context IS 'Clears user context';
