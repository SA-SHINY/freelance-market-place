const express = require('express');
const router = express.Router();
const Payout = require('../models/Payout');
const { protect } = require('../middleware/auth');

const getBankNameFromIFSC = (ifsc) => {
  const map = {
    'HDFC': 'HDFC Bank',
    'ICIC': 'ICICI Bank',
    'SBIN': 'State Bank of India',
    'AXIS': 'Axis Bank',
    'KOTAK': 'Kotak Mahindra Bank',
    'YESB': 'Yes Bank',
    'IDBI': 'IDBI Bank',
    'PNB': 'Punjab National Bank',
    'CANB': 'Canara Bank',
    'UBIN': 'Union Bank of India'
  };
  return map[ifsc.substring(0,4)] || 'Unknown Bank';
};

router.post('/save-payout', protect, async (req, res) => {
  try {
    console.log('Save payout request body:', req.body); // DEBUG

    const { accountType, accountHolderName, accountNumber, ifsc, upi } = req.body;

    if (!accountType) {
      return res.status(400).json({ success: false, message: 'Account type is required' });
    }

    if (accountType === 'bank') {
      if (!accountHolderName || !accountNumber || !ifsc) {
        return res.status(400).json({ success: false, message: 'All bank account fields are required' });
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) {
        return res.status(400).json({ success: false, message: 'Invalid IFSC code format' });
      }
      if (!/^\d{9,18}$/.test(accountNumber.replace(/\s/g, ''))) {
        return res.status(400).json({ success: false, message: 'Account number should be 9-18 digits' });
      }
    }

    if (accountType === 'upi') {
      if (!upi) {
        return res.status(400).json({ success: false, message: 'UPI ID is required' });
      }
      if (!/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upi)) {
        return res.status(400).json({ success: false, message: 'Invalid UPI ID format' });
      }
    }

    let payout = await Payout.findOne({ userId: req.user.id });

    const updateData = {
      accountType,
      accountHolderName: accountHolderName || '',
      accountNumber: accountNumber || '',
      accountLast4: accountNumber ? accountNumber.slice(-4) : '',
      ifsc: ifsc ? ifsc.toUpperCase() : '',
      upi: upi || '',
      bankName: ifsc ? getBankNameFromIFSC(ifsc.toUpperCase()) : '',
      status: 'active',
      verifiedAt: new Date(),
      updatedAt: new Date()
    };

    if (payout) {
      Object.assign(payout, updateData);
      await payout.save();
      return res.json({ success: true, message: 'Payout details updated', account: payout });
    } else {
      const newPayout = new Payout({ userId: req.user.id, ...updateData });
      await newPayout.save();
      return res.status(201).json({ success: true, message: 'Payout details saved', account: newPayout });
    }

  } catch (error) {
    console.error('Error saving payout:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

router.get('/payout-status', protect, async (req, res) => {
  try {
    const payout = await Payout.findOne({ userId: req.user.id });
    if (!payout) {
      return res.status(404).json({ success: false, message: 'No payout details found' });
    }
    res.json({ success: true, account: payout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/delete-payout', protect, async (req, res) => {
  try {
    await Payout.findOneAndDelete({ userId: req.user.id });
    res.json({ success: true, message: 'Payout details removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;