const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReview, getUserReviews, respondToReview, getContractReviews,
} = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);
router.post('/:id/response', protect, respondToReview);
router.get('/contract/:contractId', protect, getContractReviews);

module.exports = router;
