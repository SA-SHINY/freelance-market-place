const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },

  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },

  communication: { type: Number, min: 1, max: 5 },
  quality: { type: Number, min: 1, max: 5 },
  expertise: { type: Number, min: 1, max: 5 },
  deadlineAdherence: { type: Number, min: 1, max: 5 },

  response: {
    comment: String,
    createdAt: Date,
  },

  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
