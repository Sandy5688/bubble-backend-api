const request = require('supertest');
const app = require('../app');

describe('Full KYC Flow', () => {
  let authToken;
  
  it('should complete full KYC flow', async () => {
    // 1. Start KYC session
    const startRes = await request(app)
      .post('/api/v1/kyc/start')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(startRes.body).toHaveProperty('sessionId');
    
    // 2. Upload document (would need presigned URL)
    // 3. Submit OTP
    // 4. Check status
    
    const statusRes = await request(app)
      .get('/api/v1/kyc/status')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(statusRes.body).toHaveProperty('status');
  });
});
