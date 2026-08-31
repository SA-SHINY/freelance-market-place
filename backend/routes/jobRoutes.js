const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs, getJob, createJob, updateJob, deleteJob,
  submitProposal, updateProposal, getMyJobs,
} = require('../controllers/jobController');

router.get('/my', protect, getMyJobs);
router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', protect, authorize('client'), createJob);
router.put('/:id', protect, authorize('client'), updateJob);
router.delete('/:id', protect, authorize('client'), deleteJob);
router.post('/:id/proposals', protect, authorize('freelancer'), submitProposal);
router.put('/:id/proposals/:proposalId', protect, authorize('client'), updateProposal);

module.exports = router;
