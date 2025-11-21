-- Region-based feature filtering table
-- Allows different features per country/region

CREATE TABLE IF NOT EXISTS tenant_regions (
  country_code TEXT NOT NULL,
  region_code TEXT NULL,
  supported_features UUID[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (country_code, region_code)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tenant_regions_country 
  ON tenant_regions(country_code) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_tenant_regions_active 
  ON tenant_regions(is_active);

-- GIN index for array containment queries
CREATE INDEX IF NOT EXISTS idx_tenant_regions_features 
  ON tenant_regions USING GIN(supported_features);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_tenant_regions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_regions_updated_at
  BEFORE UPDATE ON tenant_regions
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_regions_updated_at();

-- Sample data for testing
INSERT INTO tenant_regions (country_code, region_code, supported_features, is_active)
VALUES 
  ('AU', NULL, ARRAY['11111111-1111-1111-1111-111111111111'::UUID, '22222222-2222-2222-2222-222222222222'::UUID], true),
  ('AU', 'NSW', ARRAY['11111111-1111-1111-1111-111111111111'::UUID, '77777777-7777-7777-7777-777777777777'::UUID], true),
  ('US', NULL, ARRAY['33333333-3333-3333-3333-333333333333'::UUID], true),
  ('US', 'CA', ARRAY['33333333-3333-3333-3333-333333333333'::UUID, '88888888-8888-8888-8888-888888888888'::UUID], true),
  ('GB', NULL, ARRAY['44444444-4444-4444-4444-444444444444'::UUID], true),
  ('CA', NULL, ARRAY['55555555-5555-5555-5555-555555555555'::UUID], true),
  ('NZ', NULL, ARRAY['66666666-6666-6666-6666-666666666666'::UUID], true)
ON CONFLICT (country_code, region_code) DO NOTHING;

COMMENT ON TABLE tenant_regions IS 'Defines which features are available in each country/region';
COMMENT ON COLUMN tenant_regions.supported_features IS 'Array of internal feature UUIDs (never human names)';
COMMENT ON COLUMN tenant_regions.region_code IS 'State/province code (e.g., NSW, CA) - NULL for country-wide';
