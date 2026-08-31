const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getServices, getService, createService, updateService, deleteService, getMyServices,
} = require('../controllers/serviceController');

router.get('/my', protect, authorize('freelancer'), getMyServices);
router.get('/', getServices);
router.get('/:id', getService);
router.post('/', protect, authorize('freelancer'), createService);
router.put('/:id', protect, authorize('freelancer'), updateService);
router.delete('/:id', protect, authorize('freelancer'), deleteService);

module.exports = router;
