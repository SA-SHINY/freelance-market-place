const Service = require('../models/Service');

exports.getServices = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      rating, sort = '-createdAt', page = 1, limit = 12
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (rating) query.rating = { $gte: Number(rating) };
    if (minPrice || maxPrice) {
      query['packages.basic.price'] = {};
      if (minPrice) query['packages.basic.price'].$gte = Number(minPrice);
      if (maxPrice) query['packages.basic.price'].$lte = Number(maxPrice);
    }

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .populate('freelancer', 'name avatar rating totalReviews location availability')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      services,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('freelancer', 'name avatar bio rating totalReviews skills location availability hourlyRate');

    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    await Service.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    const Review = require('../models/Review');
    const reviews = await Review.find({ service: service._id })
      .populate('reviewer', 'name avatar role')
      .sort('-createdAt')
      .limit(10);

    res.json({ success: true, service, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const service = await Service.create({ ...req.body, freelancer: req.user._id });
    res.status(201).json({ success: true, service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (service.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, service: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    if (service.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Service.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ freelancer: req.user._id }).sort('-createdAt');
    res.json({ success: true, services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
