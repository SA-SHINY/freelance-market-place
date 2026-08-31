const Job = require('../models/Job');
const Notification = require('../models/Notification');

exports.getJobs = async (req, res) => {
  try {
    const {
      search, category, skills, budgetMin, budgetMax,
      experienceLevel, duration, sort = '-createdAt', page = 1, limit = 12
    } = req.query;

    const query = { status: 'open' };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (skills) query.skills = { $in: skills.split(',') };
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (duration) query.duration = duration;
    if (budgetMin || budgetMax) {
      query.budgetMin = {};
      if (budgetMin) query.budgetMin.$gte = Number(budgetMin);
      if (budgetMax) query.budgetMax = { $lte: Number(budgetMax) };
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('client', 'name avatar rating company location totalJobsPosted')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      jobs,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'name avatar bio rating company website location totalJobsPosted')
      .populate('proposals.freelancer', 'name avatar rating skills totalReviews');

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, client: req.user._id });
    await require('../models/User').findByIdAndUpdate(req.user._id, { $inc: { totalJobsPosted: 1 } });
    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, job: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Job.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitProposal = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Job is not open for proposals' });
    }

    const alreadyProposed = job.proposals.some(p => p.freelancer.toString() === req.user._id.toString());
    if (alreadyProposed) {
      return res.status(400).json({ success: false, message: 'You already submitted a proposal' });
    }

    job.proposals.push({ freelancer: req.user._id, ...req.body });
    await job.save();

    await Notification.create({
      recipient: job.client,
      type: 'new_proposal',
      title: 'New Proposal Received',
      message: `${req.user.name} submitted a proposal for "${job.title}"`,
      link: `/jobs/${job._id}`,
    });

    if (req.io) req.io.to(job.client.toString()).emit('notification', { type: 'new_proposal' });

    res.status(201).json({ success: true, message: 'Proposal submitted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProposal = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const proposal = job.proposals.id(req.params.proposalId);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const { status } = req.body;
    proposal.status = status;

    if (status === 'accepted') {
      job.status = 'in_progress';
      job.hiredFreelancer = proposal.freelancer;

      job.proposals.forEach(p => {
        if (p._id.toString() !== req.params.proposalId) p.status = 'rejected';
      });

      await Notification.create({
        recipient: proposal.freelancer,
        type: 'proposal_accepted',
        title: 'Proposal Accepted!',
        message: `Your proposal for "${job.title}" was accepted`,
        link: `/jobs/${job._id}`,
      });

      if (req.io) req.io.to(proposal.freelancer.toString()).emit('notification', { type: 'proposal_accepted' });
    } else if (status === 'rejected') {
      await Notification.create({
        recipient: proposal.freelancer,
        type: 'proposal_rejected',
        title: 'Proposal Update',
        message: `Your proposal for "${job.title}" was not selected`,
        link: `/jobs/${job._id}`,
      });
    }

    await job.save();
    res.json({ success: true, message: `Proposal ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const query = req.user.role === 'client'
      ? { client: req.user._id }
      : { 'proposals.freelancer': req.user._id };

    const jobs = await Job.find(query)
      .populate('client', 'name avatar company')
      .sort('-createdAt');

    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
