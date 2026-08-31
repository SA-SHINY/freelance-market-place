const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/config');
const Contract = require('../models/Contract');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');

let _razorpay;
const getRazorpay = () => {
  if (!_razorpay) {
    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env');
    }
    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _razorpay;
};

const PLATFORM_FEE = config.platformFeePercent;
const verifySignature = (orderId, paymentId, signature) => {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
};
exports.createOrder = async (req, res) => {
  try {
    const { contractId } = req.body;
    const contract = await Contract.findById(contractId).populate('freelancer', 'name email');

    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const amountPaise = Math.round(contract.totalAmount * 100);
    if (contract.razorpayOrderId) {
      try {
        const existingOrder = await getRazorpay().orders.fetch(contract.razorpayOrderId);
        if (existingOrder.status === 'created') {
          return res.json({
            success:  true,
            orderId:  existingOrder.id,
            amount:   existingOrder.amount,
            currency: existingOrder.currency,
            keyId:    process.env.RAZORPAY_KEY_ID,
            prefill:  { name: req.user.name, email: req.user.email },
          });
        }
        await Contract.findByIdAndUpdate(contractId, { razorpayOrderId: null });
      } catch {
        await Contract.findByIdAndUpdate(contractId, { razorpayOrderId: null });
      }
    }

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `contract_${contract._id}`,
      notes: {
        contractId:   contract._id.toString(),
        clientId:     req.user._id.toString(),
        freelancerId: contract.freelancer._id.toString(),
      },
    });

    await Contract.findByIdAndUpdate(contractId, {
      razorpayOrderId: order.id,
      escrowAmount:    contract.totalAmount,
    });

    res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
      prefill:  { name: req.user.name, email: req.user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.verifyPayment = async (req, res) => {
  try {
    const { contractId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ success: false, message: 'Payment verification failed — invalid signature' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    await Contract.findByIdAndUpdate(contractId, {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'active',
    });

    await Transaction.create({
      contract:          contractId,
      payer:             contract.client,
      payee:             contract.freelancer,
      amount:            contract.totalAmount,
      platformFee:       contract.platformFee,
      netAmount:         contract.freelancerAmount,
      type:              'escrow',
      status:            'completed',
      razorpayOrderId:   razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      description:       `Escrow funded for: ${contract.title}`,
    });

    await Notification.create({
      recipient: contract.freelancer,
      type: 'contract_started',
      title: 'Escrow Funded — Work Can Begin',
      message: `Payment secured in escrow for "${contract.title}". You can start work now.`,
      link: `/contracts/${contract._id}`,
    });

    if (req.io) req.io.to(contract.freelancer.toString()).emit('notification', { type: 'contract_started' });

    res.json({ success: true, message: 'Payment verified and escrow funded' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.releasePayment = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId)
      .populate('freelancer', 'name email razorpayAccountId');

    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the client can release payment' });
    }
    if (!contract.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'Escrow not funded yet' });
    }

    const amountPaise = Math.round(contract.freelancerAmount * 100);

    let transferId = null;

    if (contract.freelancer.razorpayAccountId) {
      const transfer = await getRazorpay().payments.transfer(contract.razorpayPaymentId, {
        transfers: [{
          account:  contract.freelancer.razorpayAccountId,
          amount:   amountPaise,
          currency: 'INR',
          notes: {
            contractId:   contract._id.toString(),
            freelancerId: contract.freelancer._id.toString(),
          },
          on_hold: 0,
        }],
      });
      transferId = transfer.items?.[0]?.id;
    }

    await Contract.findByIdAndUpdate(contract._id, {
      status:             'completed',
      razorpayTransferId: transferId,
      completedAt:        Date.now(),
      escrowAmount:       0,
    });

    await Transaction.create({
      contract:           contract._id,
      payer:              contract.client,
      payee:              contract.freelancer._id,
      amount:             contract.totalAmount,
      platformFee:        contract.platformFee,
      netAmount:          contract.freelancerAmount,
      type:               'release',
      status:             'completed',
      razorpayPaymentId:  contract.razorpayPaymentId,
      razorpayTransferId: transferId,
      description:        `Payment released for: ${contract.title}`,
    });

    await Notification.create({
      recipient: contract.freelancer._id,
      type: 'payment_released',
      title: 'Payment Released — Project Completed!',
      message: `$${contract.freelancerAmount.toFixed(2)} has been transferred to your account. "${contract.title}" is now complete.`,
      link: `/contracts/${contract._id}`,
    });

    await Notification.create({
      recipient: contract.client,
      type: 'contract_completed',
      title: 'Project Completed',
      message: `You have successfully completed "${contract.title}". Don't forget to leave a review!`,
      link: `/contracts/${contract._id}`,
    });

    if (req.io) {
      req.io.to(contract.freelancer._id.toString()).emit('notification', { type: 'payment_released' });
      req.io.to(contract.client.toString()).emit('notification', { type: 'contract_completed' });
    }

    res.json({
      success: true,
      message: transferId
        ? 'Payment transferred to freelancer via Razorpay Route'
        : 'Contract marked complete. Freelancer payout pending account linking.',
      transferId,
      amount: contract.freelancerAmount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createMilestoneOrder = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.contractId);
    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });
    if (milestone.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Milestone must be approved first' });
    }

    const order = await getRazorpay().orders.create({
      amount:   Math.round(milestone.amount * 100),
      currency: 'INR',
      receipt:  `milestone_${milestone._id}`,
      notes: {
        contractId:  contract._id.toString(),
        milestoneId: milestone._id.toString(),
      },
    });

    milestone.razorpayOrderId = order.id;
    await contract.save();

    res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
      prefill:  { name: req.user.name, email: req.user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyMilestonePayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const contract = await Contract.findById(req.params.contractId)
      .populate('freelancer', 'name email razorpayAccountId');

    if (!contract) return res.status(404).json({ success: false, message: 'Contract not found' });

    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ success: false, message: 'Signature verification failed' });
    }

    const milestone = contract.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

    const platformFee     = milestone.amount * PLATFORM_FEE;
    const freelancerShare = milestone.amount - platformFee;
    let transferId = null;

    if (contract.freelancer.razorpayAccountId) {
      const transfer = await getRazorpay().payments.transfer(razorpay_payment_id, {
        transfers: [{
          account:  contract.freelancer.razorpayAccountId,
          amount:   Math.round(freelancerShare * 100),
          currency: 'INR',
          on_hold:  0,
        }],
      });
      transferId = transfer.items?.[0]?.id;
    }

    milestone.status           = 'paid';
    milestone.razorpayPaymentId = razorpay_payment_id;
    await contract.save();

    await Transaction.create({
      contract:           contract._id,
      payer:              contract.client,
      payee:              contract.freelancer._id,
      amount:             milestone.amount,
      platformFee,
      netAmount:          freelancerShare,
      type:               'milestone',
      status:             'completed',
      razorpayOrderId:    razorpay_order_id,
      razorpayPaymentId:  razorpay_payment_id,
      razorpayTransferId: transferId,
      milestoneId:        milestone._id,
    });

    await Notification.create({
      recipient: contract.freelancer._id,
      type: 'payment_received',
      title: 'Milestone Payment Received',
      message: `$${freelancerShare.toFixed(2)} received for milestone: "${milestone.title}"`,
      link: `/contracts/${contract._id}`,
    });

    res.json({ success: true, message: 'Milestone payment verified and released' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;

    const query = { $or: [{ payer: userId }, { payee: userId }] };
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('contract', 'title')
      .populate('payer', 'name avatar')
      .populate('payee', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      transactions,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRazorpayKey = async (req, res) => {
  res.json({ success: true, keyId: process.env.RAZORPAY_KEY_ID });
};

exports.razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body      = JSON.stringify(req.body);
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expected) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;

    switch (event) {
      case 'payment.captured': {
        const payment    = payload.payment.entity;
        const contractId = payment.notes?.contractId;
        if (contractId) {
          const exists = await Transaction.findOne({ razorpayPaymentId: payment.id });
          if (!exists) {
            const contract = await Contract.findById(contractId);
            if (contract) {
              await Contract.findByIdAndUpdate(contractId, {
                razorpayPaymentId: payment.id,
                status: 'active',
              });
              await Transaction.create({
                contract:          contractId,
                payer:             contract.client,
                payee:             contract.freelancer,
                amount:            payment.amount / 100,
                platformFee:       (payment.amount / 100) * PLATFORM_FEE,
                netAmount:         (payment.amount / 100) * (1 - PLATFORM_FEE),
                type:              'escrow',
                status:            'completed',
                razorpayOrderId:   payment.order_id,
                razorpayPaymentId: payment.id,
              });
              console.log(`Webhook: payment captured for contract ${contractId}`);
            }
          }
        }
        break;
      }
      case 'payment.failed': {
        const payment    = payload.payment.entity;
        const contractId = payment.notes?.contractId;
        if (contractId) {
          await Transaction.findOneAndUpdate(
            { razorpayOrderId: payment.order_id },
            { status: 'failed' }
          );
          console.log(`Webhook: payment failed for contract ${contractId}`);
        }
        break;
      }
      case 'transfer.processed': {
        const transfer = payload.transfer.entity;
        console.log(`Webhook: transfer ${transfer.id} processed`);
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
