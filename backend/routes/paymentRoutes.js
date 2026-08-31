const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  verifyPayment,
  releasePayment,
  createMilestoneOrder,
  verifyMilestonePayment,
  getTransactions,
  getRazorpayKey,
  razorpayWebhook,
} = require('../controllers/paymentController');

router.post('/webhook', razorpayWebhook);

router.get('/razorpay-key',                                       protect, getRazorpayKey);
router.post('/create-order',                                      protect, createOrder);
router.post('/verify',                                            protect, verifyPayment);
router.post('/release/:contractId',                               protect, releasePayment);
router.post('/milestone/:contractId/:milestoneId',                protect, createMilestoneOrder);
router.post('/milestone/:contractId/:milestoneId/verify',         protect, verifyMilestonePayment);
router.get('/transactions',                                       protect, getTransactions);

module.exports = router;
