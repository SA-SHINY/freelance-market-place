const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'new_proposal', 'proposal_accepted', 'proposal_rejected',
      'contract_created', 'contract_started', 'contract_completed', 'contract_cancelled',
      'payment_received', 'payment_released', 'milestone_approved',
      'new_message', 'new_review', 'job_posted',
      'delivery_submitted', 'revision_requested',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  data: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
