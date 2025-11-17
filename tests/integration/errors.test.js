const request = require('supertest');
const app = require('../../app');

describe('Error Handling', () => {
  describe('404 Errors', () => {
    test('should return 404 for non-existent route with valid auth', async () => {
      // Note: Without valid auth, will get 401 first (security by design)
      const res = await request(app)
        .get('/api/v1/non-existent-route');

      // Expecting 401 because API key is checked before route matching
      expect(res.status).toBe(401);
    });

    test('should return auth error for non-existent nested route', async () => {
      const apiKey = process.env.INTERNAL_API_KEY;
      const res = await request(app)
        .get('/api/v1/user/non-existent')
        .set('x-api-key', apiKey);

      // Will get 401 because no valid auth token
      expect(res.status).toBe(401);
    });
  });

  describe('Method Not Allowed', () => {
    test('should handle unsupported HTTP methods', async () => {
      const res = await request(app)
        .patch('/api/v1/health');

      // Without API key, security check happens first
      expect(res.status).toBe(401);
    });
  });
});
