const express = require('express');
const router = express.Router();

// Import
const cartController = require('./../controllers/cartController');
const { protect } = require('./../middlewares/authProtect');

router
  .route('/')
  .get(protect, cartController.getCart)
  .post(protect, cartController.addProductToCart)
  .put(protect, cartController.updateCart)
  .delete(protect, cartController.deleteProductCart);

module.exports = router;
