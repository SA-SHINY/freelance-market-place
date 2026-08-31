const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accountType: {
    type: String,
    enum: ['bank', 'upi'],
    required: true
  },
  accountHolderName: {
    type: String,
    default: ''
  },
  accountNumber: {
    type: String,
    default: ''
  },
  accountLast4: {
    type: String,
    default: ''
  },
  ifsc: {
    type: String,
    default: ''
  },
  upi: {
    type: String,
    default: ''
  },
  bankName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'failed'],
    default: 'pending'
  },
  verifiedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payout', payoutSchema);