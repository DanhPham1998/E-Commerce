const express = require('express');
const router = express.Router({ mergeParams: true });

const reviewController = require('./../controllers/reviewController');
const { protect, authorize } = require('./../middlewares/authProtect');

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(protect, reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .put(protect, reviewController.updateReview)
  .delete(protect, reviewController.deleteReview);

module.exports = router;
