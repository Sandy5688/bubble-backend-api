const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { paymentLimiter } = require('../middleware/security');

router.post('/stripe/create', paymentLimiter, paymentController.createStripePayment);
router.post('/paypal/create', paymentLimiter, paymentController.createPayPalPayment);
router.post('/confirm', paymentLimiter, paymentController.confirmPayment);
router.post('/refund/:transactionId', paymentLimiter, paymentController.refundPayment);
router.get('/:transactionId', paymentController.getTransaction);
router.post('/webhook/stripe', paymentController.stripeWebhook);
router.post('/webhook/paypal', paymentController.stripeWebhook);

module.exports = router;
