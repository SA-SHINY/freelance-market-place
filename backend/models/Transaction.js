const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  contract:    { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  payer:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payee:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  amount:      { type: Number, required: true },
  platformFee: { type: Number, required: true },
  netAmount:   { type: Number, required: true },
  currency:    { type: String, default: 'INR' },

  type:   { type: String, enum: ['escrow', 'release', 'refund', 'milestone'], required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed', 'refunded'], default: 'pending' },
  razorpayOrderId:    { type: String },
  razorpayPaymentId:  { type: String },
  razorpayTransferId: { type: String },
  razorpaySignature:  { type: String },

  description: { type: String },
  milestoneId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
