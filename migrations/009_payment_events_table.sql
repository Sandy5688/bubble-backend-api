-- Create payment_events table for webhook deduplication
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now add the unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_event_id 
ON payment_events(event_id);
