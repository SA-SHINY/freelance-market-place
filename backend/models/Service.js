const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  tags: [{ type: String }],
  images: [{ type: String }],

  packages: {
    basic: {
      name: { type: String, default: 'Basic' },
      description: String,
      price: { type: Number, required: true },
      deliveryDays: { type: Number, required: true },
      revisions: { type: Number, default: 1 },
      features: [String],
    },
    standard: {
      name: { type: String, default: 'Standard' },
      description: String,
      price: Number,
      deliveryDays: Number,
      revisions: { type: Number, default: 3 },
      features: [String],
    },
    premium: {
      name: { type: String, default: 'Premium' },
      description: String,
      price: Number,
      deliveryDays: Number,
      revisions: { type: Number, default: -1 }, 
      features: [String],
    },
  },

  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
