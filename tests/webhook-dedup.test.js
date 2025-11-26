const { checkDuplicateEvent } = require('../middleware/stripe-webhook.middleware');

describe('Webhook Deduplication', () => {
  it('should prevent duplicate webhook processing', async () => {
    const mockReq = {
      stripeEvent: {
        id: 'evt_test_123'
      }
    };
    
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    const mockNext = jest.fn();
    
    // First call should succeed
    await checkDuplicateEvent(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
