const express = require('express');
const router = express.Router();

// Import Controller/Middleware
const productController = require('./../controllers/productController');
const { protect, authorize } = require('./../middlewares/authProtect');
const {
  uploadProductImage,
  settingProductImages,
} = require('./../middlewares/uploadImage');

// Import Router Other
const reviewRoute = require('./../routes/reviewRoute');

// Re-router
router.use('/:productId/reviews', reviewRoute);

// Router
router
  .route('/get-product-sold/:day')
  .get(protect, authorize('admin'), productController.getProductSold);

router
  .route('/')
  .get(productController.getAllProduct)
  .post(
    protect,
    authorize('admin'),
    uploadProductImage,
    settingProductImages,
    productController.createProduct
  );

router
  .route('/:id')
  .get(productController.getProduct)
  .put(
    protect,
    authorize('admin'),
    uploadProductImage,
    settingProductImages,
    productController.updateProduct
  )
  .delete(protect, authorize('admin'), productController.deleteProduct);

module.exports = router;
