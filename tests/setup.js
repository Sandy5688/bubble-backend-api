// Global test setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.INTERNAL_API_KEY = 'test-internal-api-key';
process.env.INTERNAL_HMAC_SECRET = 'test-hmac-secret-for-testing-at-least-32-chars-long';

// Supabase test config
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Encryption test config
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-min';

// Redis test config
process.env.REDIS_URL = 'redis://localhost:6379';

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
