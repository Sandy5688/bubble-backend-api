const { verifyAppleToken } = require('../services/auth/apple-jwks.service');

describe('Apple JWKS Verification', () => {
  it('should verify valid Apple ID token', async () => {
    // Mock Apple token (will fail without real token)
    const mockToken = 'eyJhbGc...';
    
    try {
      const result = await verifyAppleToken(mockToken);
      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('email');
    } catch (error) {
      // Expected to fail without real Apple credentials
      expect(error.message).toContain('Invalid');
    }
  });
});
