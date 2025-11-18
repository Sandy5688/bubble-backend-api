const crypto = require('crypto');

/**
 * HMAC Request Signature Validation Middleware
 */
const validateHMAC = (req, res, next) => {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];
  const apiKey = req.headers['x-api-key'];
  
  // Skip HMAC for public routes
  const publicRoutes = ['/health', '/api/v1/health', '/api/v1/auth/signup', '/api/v1/auth/signin'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  
  // Check required headers
  if (!signature || !timestamp || !apiKey) {
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Missing required headers: x-signature, x-timestamp, x-api-key'
    });
  }
  
  // Validate timestamp (reject requests older than 5 minutes)
  const requestTime = parseInt(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);
  const timeDiff = Math.abs(currentTime - requestTime);
  
  if (timeDiff > 300) {
    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Request timestamp expired (must be within 5 minutes)'
    });
  }
  
  // Validate API key
  const validApiKey = process.env.INTERNAL_API_KEY;
  if (apiKey !== validApiKey) {
    return res.status(403).json({
      status: 'error',
      code: 403,
      message: 'Invalid API key'
    });
  }
  
  // Generate expected signature
  const method = req.method;
  const url = req.originalUrl;
  const body = req.body ? JSON.stringify(req.body) : '';
  const payload = `${timestamp}${method}${url}${body}`;
  
  const expectedSignature = crypto
    .createHmac('sha256', validApiKey)
    .update(payload)
    .digest('hex');
  
  // Compare signatures (timing-safe)
  if (!crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )) {
    return res.status(403).json({
      status: 'error',
      code: 403,
      message: 'Invalid request signature'
    });
  }
  
  next();
};

/**
 * Helper function to generate HMAC signature
 */
const generateSignature = (timestamp, method, url, body, secret) => {
  const payload = `${timestamp}${method}${url}${body || ''}`;
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
};

module.exports = { validateHMAC, generateSignature };
