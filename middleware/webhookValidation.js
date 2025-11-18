const crypto = require('crypto');

/**
 * Stripe Webhook Signature Validation
 */
const validateStripeWebhook = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!signature || !secret) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing webhook signature or secret'
    });
  }
  
  try {
    const elements = signature.split(',');
    const timestamp = elements.find(e => e.startsWith('t=')).split('=')[1];
    const sig = elements.find(e => e.startsWith('v1=')).split('=')[1];
    
    // Check timestamp (reject events older than 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
      return res.status(400).json({
        status: 'error',
        message: 'Webhook timestamp too old'
      });
    }
    
    // Verify signature
    const payload = `${timestamp}.${JSON.stringify(req.body)}`;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid webhook signature'
      });
    }
    
    req.webhookEventId = req.body.id;
    next();
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid webhook signature format'
    });
  }
};

/**
 * PayPal Webhook Signature Validation
 */
const validatePayPalWebhook = (req, res, next) => {
  const webhookId = req.headers['paypal-transmission-id'];
  
  if (!webhookId) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing PayPal webhook ID'
    });
  }
  
  req.webhookEventId = webhookId;
  next();
};

/**
 * Webhook Idempotency Check
 */
const webhookIdempotency = new Set();

const checkWebhookIdempotency = (req, res, next) => {
  const eventId = req.webhookEventId || req.body.id;
  
  if (!eventId) {
    return next();
  }
  
  if (webhookIdempotency.has(eventId)) {
    return res.status(200).json({
      status: 'success',
      message: 'Event already processed (idempotent)'
    });
  }
  
  webhookIdempotency.add(eventId);
  
  // Clean up old events (keep last 10000)
  if (webhookIdempotency.size > 10000) {
    const iterator = webhookIdempotency.values();
    for (let i = 0; i < 1000; i++) {
      webhookIdempotency.delete(iterator.next().value);
    }
  }
  
  next();
};

module.exports = {
  validateStripeWebhook,
  validatePayPalWebhook,
  checkWebhookIdempotency
};
