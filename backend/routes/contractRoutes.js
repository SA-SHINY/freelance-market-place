const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createContract, getContracts, getContract, updateContractStatus,
  updateMilestone, sendMessage, submitDelivery, requestRevision,
} = require('../controllers/contractController');

router.post('/', protect, createContract);
router.get('/', protect, getContracts);
router.get('/:id', protect, getContract);
router.put('/:id/status', protect, updateContractStatus);
router.put('/:id/milestones/:milestoneId', protect, updateMilestone);
router.post('/:id/messages', protect, sendMessage);
router.post('/:id/deliver', protect, submitDelivery);
router.post('/:id/revision', protect, requestRevision);

module.exports = router;
