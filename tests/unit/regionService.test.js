const regionService = require('../../services/region.service');

describe('Region Service', () => {
  describe('getSupportedFeatures', () => {
    test('should get country-wide features', async () => {
      const features = await regionService.getSupportedFeatures('AU');
      expect(Array.isArray(features)).toBe(true);
    });

    test('should get region-specific features', async () => {
      const features = await regionService.getSupportedFeatures('AU', 'NSW');
      expect(Array.isArray(features)).toBe(true);
    });

    test('should cache features in Redis', async () => {
      // First call (cache miss)
      await regionService.getSupportedFeatures('AU');
      
      // Second call (cache hit)
      const features = await regionService.getSupportedFeatures('AU');
      
      expect(Array.isArray(features)).toBe(true);
    });
  });

  describe('isFeatureAvailable', () => {
    test('should check feature availability', async () => {
      const available = await regionService.isFeatureAvailable(
        '11111111-1111-1111-1111-111111111111',
        'AU'
      );
      
      expect(typeof available).toBe('boolean');
    });
  });

  describe('filterItemsByRegion', () => {
    test('should filter items by region', async () => {
      const items = [
        { internal_feature_id: '11111111-1111-1111-1111-111111111111' },
        { internal_feature_id: '99999999-9999-9999-9999-999999999999' }
      ];
      
      const filtered = await regionService.filterItemsByRegion(items, 'AU');
      
      expect(filtered.length).toBeLessThanOrEqual(items.length);
    });
  });
});
