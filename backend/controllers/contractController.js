const Contract = require('../models/Contract');
const Notification = require('../models/Notification');
const config = require('../config/config');

const PLATFORM_FEE = config.platformFeePercent;

exports.createContract = async (req, res) => {
  try {
    const { freelancerId, jobId, serviceId, title, description, totalAmount, paymentType, milestones, deadline } = req.body;

    const platformFee = totalAmount * PLATFORM_FEE;
    const freelancerAmount = totalAmount - platformFee;

    const contract = await Contract.create({
      client: req.user._id,
      freelancer: freelancerId,
      job: jobId,
      service: serviceId,
      title,
      description,
      totalAmount,
      platformFee,
      freelancerAmount,
      paymentType: paymentType || 'fixed',
      milestones: milestones || [],
      deadline,
    });

    await Notification.create({
      recipient: freelancerId,
      type: 'contract_created',
      title: 'New Contract Offer',
      message: `${req.user.name} sent you a contract: "${title}"`,
      link: `/contracts/${contract._id}`,
    });

    if (req.io) req.io.to(freelancerId.toString()).emit('notification', { type: 'contract_created' });

    res.status(201).json({ success: true, contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getContracts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const role = req.user.role;

    const query = { [role === 'client' ? 'client' : 'freelancer']: req.user._id };
    if (status) query.status = status;

    const total = await Contract.countDocuments(query);
    const contracts = await Contract.find(query)
      .populate(role === 'client' ? 'freelancer' : 'client', 'name avatar rating')
      .populate('job', 'title')
      .populate('service', 'title')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, contracts, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('client', 'name avatar email company')
      .populate('freelancer', 'name avatar email skills rating')
      .populate('job', 'title description')
      .populate('service', 'title packages')
      .populate('messages.sender', 'name avatar');

    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const isParty = contract.client._id.toString() === req.user._id.toString() ||
      contract.freelancer._id.toString() === req.user._id.toString();
    if (!isParty) return res.status(403).json({ success: false, message: 'Not authorized' });

    res.json({ success: true, contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateContractStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const isClient = contract.client.toString() === req.user._id.toString();
    const isFreelancer = contract.freelancer.toString() === req.user._id.toString();

    if (status === 'active' && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'Only freelancer can accept contract' });
    }
    if (status === 'completed' && !isClient) {
      return res.status(403).json({ success: false, message: 'Only client can mark as completed' });
    }

    contract.status = status;
    if (status === 'cancelled') {
      contract.cancelledAt = Date.now();
      contract.cancellationReason = reason;
    }
    if (status === 'completed') contract.completedAt = Date.now();

    await contract.save();

    const recipientId = isClient ? contract.freelancer : contract.client;
    await Notification.create({
      recipient: recipientId,
      type: status === 'active' ? 'contract_started' : status === 'completed' ? 'contract_completed' : 'contract_cancelled',
      title: `Contract ${status === 'active' ? 'Started' : status === 'completed' ? 'Completed' : 'Cancelled'}`,
      message: `Contract "${contract.title}" status updated to ${status}`,
      link: `/contracts/${contract._id}`,
    });

    if (req.io) req.io.to(recipientId.toString()).emit('notification', { type: `contract_${status}` });

    res.json({ success: true, contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMilestone = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const { status } = req.body;
    milestone.status = status;
    if (status === 'submitted') milestone.submittedAt = Date.now();
    if (status === 'approved') milestone.approvedAt = Date.now();

    await contract.save();
    res.json({ success: true, contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    const isParty = contract.client.toString() === req.user._id.toString() ||
      contract.freelancer.toString() === req.user._id.toString();
    if (!isParty) return res.status(403).json({ success: false, message: 'Not authorized' });

    contract.messages.push({ sender: req.user._id, content: req.body.content });
    await contract.save();

    const recipientId = contract.client.toString() === req.user._id.toString()
      ? contract.freelancer
      : contract.client;

    if (req.io) {
      req.io.to(recipientId.toString()).emit('new_message', {
        contractId: contract._id,
        sender: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
        content: req.body.content,
      });
    }

    res.json({ success: true, message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitDelivery = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    contract.deliveryNote = req.body.note;
    contract.deliveredAt = Date.now();
    if (req.body.files) contract.deliveryFiles = req.body.files;

    await contract.save();

    await Notification.create({
      recipient: contract.client,
      type: 'delivery_submitted',
      title: 'Work Delivered',
      message: `${req.user.name} delivered work for "${contract.title}"`,
      link: `/contracts/${contract._id}`,
    });

    if (req.io) req.io.to(contract.client.toString()).emit('notification', { type: 'delivery_submitted' });

    res.json({ success: true, contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.requestRevision = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the client can request revisions' });
    }
    if (!contract.deliveredAt) {
      return res.status(400).json({ success: false, message: 'No delivery submitted yet' });
    }

    contract.deliveredAt = null;
    contract.deliveryNote = null;

    contract.messages.push({
      sender: req.user._id,
      content: `Revision requested: ${req.body.comment}`,
      createdAt: new Date(),
    });
    await contract.save();

    await Notification.create({
      recipient: contract.freelancer,
      type: 'revision_requested',
      title: 'Revision Requested',
      message: `${req.user.name} requested a revision: "${req.body.comment}"`,
      link: `/contracts/${contract._id}`,
    });

    if (req.io) req.io.to(contract.freelancer.toString()).emit('notification', { type: 'revision_requested' });

    res.json({ success: true, message: 'Revision requested — freelancer can resubmit', contract });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
