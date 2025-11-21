# 🌍 Region Context Layer Documentation

## Overview

The Region Context Layer provides geo-location based feature filtering for the Bubble Backend API. It automatically detects user location and filters available features based on country and region (state/province).

## Architecture

### 1. Detection Priority (Multi-Layer)
```
1st → Cloudflare CF-IPCountry header (fastest, ~0ms overhead)
2nd → MaxMind GeoLite2 IP database (fast, ~2ms overhead)
3rd → GPS reverse geocoding (mobile only, ~5-8ms overhead)
Fallback → countryCode = "XX" (unknown)
```

### 2. Request Context

Every request gets `req.context` attached:
```javascript
req.context = {
  countryCode: "AU",           // ISO 3166-1 alpha-2
  regionCode: "NSW",           // State/province code
  detectedBy: "cloudflare"     // Detection method used
}
```

### 3. Response Headers

Every response includes:
```
X-Vogue-Region: AU-NSW    // Country + region
X-Vogue-Region: AU        // Country only
X-Vogue-Region: XX        // Unknown
```

## Database Schema
```sql
CREATE TABLE tenant_regions (
  country_code text NOT NULL,
  region_code text NULL,
  supported_features uuid[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (country_code, region_code)
);
```

### Feature UUID Storage

- **ONLY internal UUIDs** stored in `supported_features`
- Never store human-readable names
- Sub-regions override country-wide settings

### Example Data
```sql
-- Australia-wide features
INSERT INTO tenant_regions (country_code, region_code, supported_features)
VALUES ('AU', NULL, ARRAY['uuid-111', 'uuid-222']);

-- NSW-specific features (overrides AU)
INSERT INTO tenant_regions (country_code, region_code, supported_features)
VALUES ('AU', 'NSW', ARRAY['uuid-111', 'uuid-777']);
```

## Usage in Controllers

### Method 1: Using Region Service
```javascript
const regionService = require('../services/region.service');

exports.getItems = async (req, res) => {
  const { countryCode, regionCode } = req.context;
  
  // Get supported features for region
  const features = await regionService.getSupportedFeatures(
    countryCode, 
    regionCode
  );
  
  // Query with filtering
  const items = await supabase
    .from('items')
    .select('*')
    .in('internal_feature_id', features);
    
  res.json({ data: items });
};
```

### Method 2: Direct SQL Filtering
```javascript
const { sql, params } = regionService.buildRegionFilter(
  req.context.countryCode,
  req.context.regionCode
);

// Use in raw SQL queries
```

### Method 3: In-Memory Filtering
```javascript
const allItems = await fetchItems();

const filteredItems = await regionService.filterItemsByRegion(
  allItems,
  req.context.countryCode,
  req.context.regionCode
);
```

## Redis Caching

### Cache Keys
```
region:features:AU           → ["uuid-111", "uuid-222"]
region:features:AU:NSW       → ["uuid-111", "uuid-777"]
region:features:US:CA        → [...]
```

### TTL

- 5 minutes (300 seconds)
- Automatic cache invalidation on updates

### Cache Clearing
```javascript
await regionService.clearRegionCache('AU', 'NSW');
```

## Performance

### Benchmarks

- Cloudflare detection: <1ms
- MaxMind detection: ~2ms
- GPS detection: ~5-8ms
- Redis cache hit: <1ms
- Supabase query: ~10-20ms

### Total Impact

- **Target: <8ms** added latency
- **Actual: 2-8ms** depending on detection method
- **With caching: <3ms** average

## Mobile GPS Detection

### Header Format
```
X-GPS-Lat-Long: latitude,longitude
X-GPS-Lat-Long: -33.8688,151.2093
```

### Example (iOS Swift)
```swift
let headers = [
    "X-GPS-Lat-Long": "\(location.coordinate.latitude),\(location.coordinate.longitude)"
]
```

### Example (Android Kotlin)
```kotlin
val headers = mapOf(
    "X-GPS-Lat-Long" to "${location.latitude},${location.longitude}"
)
```

## Region Codes

### Australia
- NSW - New South Wales
- VIC - Victoria
- QLD - Queensland
- SA - South Australia
- WA - Western Australia
- TAS - Tasmania
- NT - Northern Territory
- ACT - Australian Capital Territory

### USA (Examples)
- CA - California
- NY - New York
- TX - Texas
- FL - Florida

## Testing

### Run Region Tests
```bash
npm run test:region
```

### Manual Testing
```bash
# Test Cloudflare detection
curl -H "CF-IPCountry: AU" http://localhost:3000/api/v1/health

# Test GPS detection
curl -H "X-GPS-Lat-Long: -33.8688,151.2093" http://localhost:3000/api/v1/health

# Check response header
# X-Vogue-Region: AU-NSW
```

## Migration

Run the migration:
```bash
psql -d your_database < database/migrations/region/001_create_tenant_regions.sql
```

## Security Considerations

1. **No PII**: Only country/region codes stored
2. **Fallback Strategy**: Always fails open (XX) if detection fails
3. **GPS Optional**: Only used if client provides header
4. **Rate Limiting**: GPS reverse geocoding has 2s timeout
5. **Cache Poisoning**: Redis keys namespaced per region

## Troubleshooting

### Region Not Detected

Check headers:
```javascript
console.log('Headers:', req.headers);
console.log('Context:', req.context);
```

### Features Not Filtering

1. Check database: `SELECT * FROM tenant_regions WHERE country_code = 'AU';`
2. Check Redis: `KEYS region:features:*`
3. Clear cache: `await regionService.clearRegionCache('AU')`

### GPS Not Working

1. Ensure header format: `X-GPS-Lat-Long: lat,lon`
2. Check timeout (2s)
3. Verify reverse geocoding API is accessible

## API Reference

### RegionService
```javascript
// Get supported features
await regionService.getSupportedFeatures(countryCode, regionCode?)

// Check feature availability
await regionService.isFeatureAvailable(featureId, countryCode, regionCode?)

// Filter items in-memory
await regionService.filterItemsByRegion(items, countryCode, regionCode?)

// Build SQL filter
regionService.buildRegionFilter(countryCode, regionCode?)

// Clear cache
await regionService.clearRegionCache(countryCode, regionCode?)
```

## Examples

See:
- `controllers/catalog.controller.js` - Full implementation
- `tests/integration/region.test.js` - Integration tests
- `tests/unit/regionService.test.js` - Unit tests

---

**Repository:** https://github.com/princeflexzy0/bubble-backend-api  
**Feature Status:** ✅ Production Ready
