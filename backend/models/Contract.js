const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: String,
  amount:      { type: Number, required: true },
  dueDate:     Date,
  status:      { type: String, enum: ['pending','in_progress','submitted','approved','paid'], default: 'pending' },
  submittedAt: Date,
  approvedAt:  Date,
  razorpayOrderId:   String,
  razorpayPaymentId: String,
});

const contractSchema = new mongoose.Schema({
  job:     { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  client:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title:       { type: String, required: true },
  description: String,
  totalAmount:     { type: Number, required: true },
  platformFee:     { type: Number, required: true },
  freelancerAmount:{ type: Number, required: true },

  paymentType: { type: String, enum: ['fixed','milestone','hourly'], default: 'fixed' },
  milestones:  [milestoneSchema],

  status: {
    type: String,
    enum: ['pending','active','paused','completed','cancelled','disputed'],
    default: 'pending',
  },

  startDate: { type: Date, default: Date.now },
  endDate:   Date,
  deadline:  Date,

  razorpayOrderId:    String,
  razorpayPaymentId:  String,
  razorpaySignature:  String,
  razorpayTransferId: String,
  escrowAmount:       { type: Number, default: 0 },
  deliveryFiles: [{ name: String, url: String, uploadedAt: Date }],
  deliveryNote:  String,
  deliveredAt:   Date,
  completedAt:        Date,
  cancelledAt:        Date,
  cancellationReason: String,

  messages: [{
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content:   String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);
