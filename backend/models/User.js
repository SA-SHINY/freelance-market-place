const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, minlength: 6 },
  role: { type: String, enum: ['freelancer', 'client', 'admin'], required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 500 },
  location: { type: String },
  phone: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  skills: [{ type: String }],
  hourlyRate: { type: Number },
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
    link: String,
  }],
  education: [{
    institution: String,
    degree: String,
    year: String,
  }],
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String,
  }],
  category: { type: String },

  company: { type: String },
  website: { type: String },
  totalJobsPosted: { type: Number, default: 0 },

  razorpayAccountId: { type: String },  // freelancer's Razorpay linked account (Route)
  razorpayContactId: { type: String },  // freelancer's Razorpay contact ID (for payout)

  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  emailNotifications: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
