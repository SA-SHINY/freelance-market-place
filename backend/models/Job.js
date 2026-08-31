const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'withdrawn'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const jobSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  skills: [{ type: String }],
  budgetType: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
  budgetMin: { type: Number },
  budgetMax: { type: Number },
  deadline: { type: Date },
  duration: { type: String, enum: ['less_than_1_month', '1_to_3_months', '3_to_6_months', 'more_than_6_months'] },
  experienceLevel: { type: String, enum: ['entry', 'intermediate', 'expert'], default: 'intermediate' },
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'cancelled'], default: 'open' },
  proposals: [proposalSchema],
  attachments: [{ type: String }],
  views: { type: Number, default: 0 },
  hiredFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
