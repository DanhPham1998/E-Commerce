const express = require('express');
const router = express.Router();

// Import
const couponController = require('./../controllers/couponController');
const { protect, authorize } = require('./../middlewares/authProtect');

router.route('/checkcoupon').get(protect, couponController.checkCoupon);

router
  .route('/')
  .get(couponController.getAllCoupon)
  .post(protect, authorize('admin'), couponController.createCoupon);

router
  .route('/:id')
  .get(couponController.getACoupon)
  .put(protect, authorize('admin'), couponController.updateCoupon)
  .delete(protect, authorize('admin'), couponController.deleteCoupon);

module.exports = router;
