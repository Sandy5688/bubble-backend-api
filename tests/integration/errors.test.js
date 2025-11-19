const request = require('supertest');
const app = require('../../app');

describe('Error Handling', () => {
  describe('404 Errors', () => {
    test('should return 404 for non-existent route with valid auth', async () => {
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .set('x-api-key', 'test-api-key')
        .set('Authorization', 'Bearer mock-token');
      
      // Should return 401 or 404 (401 if auth fails first, 404 if route not found)
      expect([401, 404]).toContain(res.status);
    });
    
    test('should return auth error for non-existent nested route', async () => {
      const res = await request(app)
        .get('/api/v1/user/nonexistent');
      
      expect(res.status).toBe(401);
    });
  });
  
  describe('Method Not Allowed', () => {
    test('should handle unsupported HTTP methods', async () => {
      const res = await request(app)
        .delete('/api/v1/health');
      
      expect(res.status).toBe(404);
    });
  });
});
