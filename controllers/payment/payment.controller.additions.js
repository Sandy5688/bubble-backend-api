// ADD THESE TO controllers/payment/payment.controller.js

const stripeIdempotency = require('../../services/payment/stripe-idempotency.service');

// REPLACE createCustomer method:
const createCustomer = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    // Use idempotent customer creation
    const customer = await stripeIdempotency.createCustomerIdempotent(email, userId);

    // Store in database
    await query(
      `INSERT INTO payment_customers (user_id, stripe_customer_id, email, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET stripe_customer_id = $2`,
      [userId, customer.id, email]
    );

    res.json({ success: true, customer });
  } catch (error) {
    logger.error('Create customer failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
};

// REPLACE createSubscription method:
const createSubscription = async (req, res) => {
  try {
    const { priceId } = req.body;
    const userId = req.user.id;

    // Check for duplicate subscription
    await stripeIdempotency.checkDuplicateSubscription(userId, priceId);

    // Get customer
    const customerResult = await query(
      'SELECT stripe_customer_id FROM payment_customers WHERE user_id = $1',
      [userId]
    );

    if (customerResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'No customer found' });
    }

    const customerId = customerResult.rows[0].stripe_customer_id;

    // Create subscription with idempotency
    const subscription = await stripeIdempotency.createSubscriptionIdempotent(
      customerId,
      priceId,
      userId
    );

    res.json({ success: true, subscription });
  } catch (error) {
    logger.error('Create subscription failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
};

// ADD grace tier activation:
const activateGraceTier = async (req, res) => {
  try {
    const userId = req.user.id;
    const tierService = require('../../services/payment/subscription-tier.service');

    const result = await tierService.activateGraceTier(userId);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.reason });
    }

    res.json({ success: true, tier: result.tier, message: 'Grace tier activated' });
  } catch (error) {
    logger.error('Grace tier activation failed', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Export the new method
module.exports.activateGraceTier = activateGraceTier;
