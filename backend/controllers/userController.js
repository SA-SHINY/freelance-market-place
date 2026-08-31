const User = require('../models/User');
const Review = require('../models/Review');
const Service = require('../models/Service');
const Contract = require('../models/Contract');

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -razorpayAccountId -razorpayContactId -resetPasswordToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const reviews = await Review.find({ reviewee: user._id })
      .populate('reviewer', 'name avatar role')
      .sort('-createdAt')
      .limit(5);

    let services = [];
    if (user.role === 'freelancer') {
      services = await Service.find({ freelancer: user._id, isActive: true }).limit(6);
    }

    res.json({ success: true, user, reviews, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'bio', 'location', 'phone', 'avatar',
      'skills', 'hourlyRate', 'availability', 'portfolio', 'education', 'experience', 'category',
      'company', 'website', 'emailNotifications',
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFreelancers = async (req, res) => {
  try {
    const {
      search, category, skills, minRate, maxRate,
      rating, availability, page = 1, limit = 12, sort = '-rating'
    } = req.query;

    const query = { role: 'freelancer', isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category) query.category = category;
    if (skills) query.skills = { $in: skills.split(',') };
    if (availability) query.availability = availability;
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }
    if (rating) query.rating = { $gte: Number(rating) };

    const total = await User.countDocuments(query);
    const freelancers = await User.find(query)
      .select('-password -razorpayAccountId -razorpayContactId')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const Service = require('../models/Service');
    const freelancerIds = freelancers.map(f => f._id);
    const services = await Service.find({
      freelancer: { $in: freelancerIds },
      isActive: true,
    }).select('freelancer title packages.basic.price images rating totalReviews orders');

    const serviceMap = {};
    services.forEach(s => {
      const key = s.freelancer.toString();
      if (!serviceMap[key]) serviceMap[key] = [];
      if (serviceMap[key].length < 3) serviceMap[key].push(s);
    });

    const result = freelancers.map(f => ({
      ...f.toObject(),
      services: serviceMap[f._id.toString()] || [],
    }));

    res.json({
      success: true,
      freelancers: result,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let stats = {};

    if (role === 'freelancer') {
      const [activeContracts, completedContracts, totalEarnings, pendingProposals] = await Promise.all([
        Contract.countDocuments({ freelancer: userId, status: 'active' }),
        Contract.countDocuments({ freelancer: userId, status: 'completed' }),
        Contract.aggregate([
          { $match: { freelancer: userId, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$freelancerAmount' } } },
        ]),
        Contract.countDocuments({ freelancer: userId, status: 'pending' }),
      ]);

      stats = {
        activeContracts,
        completedContracts,
        totalEarnings: totalEarnings[0]?.total || 0,
        pendingProposals,
        rating: req.user.rating,
        totalReviews: req.user.totalReviews,
      };
    } else {
      const [activeContracts, completedContracts, totalSpent, openJobs] = await Promise.all([
        Contract.countDocuments({ client: userId, status: 'active' }),
        Contract.countDocuments({ client: userId, status: 'completed' }),
        Contract.aggregate([
          { $match: { client: userId, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        require('../models/Job').countDocuments({ client: userId, status: 'open' }),
      ]);

      stats = {
        activeContracts,
        completedContracts,
        totalSpent: totalSpent[0]?.total || 0,
        openJobs,
      };
    }

    const recentContracts = await Contract.find({
      [role === 'freelancer' ? 'freelancer' : 'client']: userId,
    })
      .populate(role === 'freelancer' ? 'client' : 'freelancer', 'name avatar rating')
      .sort('-createdAt')
      .limit(5);

    res.json({ success: true, stats, recentContracts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
