const Review = require('../models/Review');
const User = require('../models/User');
const Contract = require('../models/Contract');
const Notification = require('../models/Notification');

const recalcRating = async (userId) => {
  const stats = await Review.aggregate([
    { $match: { reviewee: userId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const avgRating = stats[0]?.avgRating || 0;
  const count = stats[0]?.count || 0;

  await User.findByIdAndUpdate(userId, {
    rating: Math.round(avgRating * 10) / 10,
    totalReviews: count,
  });
};

exports.createReview = async (req, res) => {
  try {
    const { contractId, rating, comment, communication, quality, expertise, deadlineAdherence } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Contract must be completed before reviewing' });
    }

    const isClient = contract.client.toString() === req.user._id.toString();
    const isFreelancer = contract.freelancer.toString() === req.user._id.toString();
    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const reviewee = isClient ? contract.freelancer : contract.client;

    const existing = await Review.findOne({ contract: contractId, reviewer: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this contract' });
    }

    const review = await Review.create({
      contract: contractId,
      reviewer: req.user._id,
      reviewee,
      service: contract.service,
      rating,
      comment,
      communication,
      quality,
      expertise,
      deadlineAdherence,
    });

    await recalcRating(reviewee);

    if (contract.service) {
      const Service = require('../models/Service');
      const serviceStats = await Review.aggregate([
        { $match: { service: contract.service } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      await Service.findByIdAndUpdate(contract.service, {
        rating: Math.round((serviceStats[0]?.avgRating || 0) * 10) / 10,
        totalReviews: serviceStats[0]?.count || 0,
      });
    }

    await Notification.create({
      recipient: reviewee,
      type: 'new_review',
      title: 'New Review Received',
      message: `${req.user.name} left you a ${rating}-star review`,
      link: `/profile/${reviewee}`,
    });

    if (req.io) req.io.to(reviewee.toString()).emit('notification', { type: 'new_review' });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { reviewee: req.params.userId, isPublic: true };

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('reviewer', 'name avatar role')
      .populate('contract', 'title')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, reviews, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.respondToReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.reviewee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the reviewee can respond' });
    }
    if (review.response?.comment) {
      return res.status(400).json({ success: false, message: 'Response already submitted' });
    }

    review.response = { comment: req.body.comment, createdAt: Date.now() };
    await review.save();

    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getContractReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ contract: req.params.contractId })
      .populate('reviewer', 'name avatar role')
      .populate('reviewee', 'name avatar role');
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
