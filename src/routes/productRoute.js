const express = require('express');
const router = express.Router();

const productController = require('./../controllers/productController');
const { protect, authorize } = require('./../middlewares/authProtect');

router
  .route('/')
  .get(productController.getAllProduct)
  .post(protect, authorize('admin'), productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
