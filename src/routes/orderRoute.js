const express = require('express');
const router = express.Router();

const orderController = require('./../controllers/oderController');
const { protect, authorize } = require('./../middlewares/authProtect');

// Middware Protect
router.use(protect);

router.route('/').post(orderController.createOrder);
router.route('/me').get(orderController.getOrderMe);

router.route('/').get(authorize('admin'), orderController.getAllOrder);
router
  .route('/:id')
  .get(authorize('admin'), orderController.getOrder)
  .put(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = router;
