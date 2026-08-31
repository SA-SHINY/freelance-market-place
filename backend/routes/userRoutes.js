const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUser, updateProfile, getFreelancers, getDashboard } = require('../controllers/userController');

router.get('/freelancers', getFreelancers);
router.get('/dashboard', protect, getDashboard);
router.put('/profile', protect, updateProfile);
router.get('/:id', getUser);

module.exports = router;
