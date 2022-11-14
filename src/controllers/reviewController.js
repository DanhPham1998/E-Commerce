const Review = require('./../models/reviewModel');
const Product = require('./../models/productModel');
const Order = require('./../models/oderModel');

const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('../middlewares/catchAsync');
const ApiFeatures = require('./../utils/apiFeatures');

// @desc      Get All Review
// @route     GET /api/v1/reviews
// @route     GET /api/v1/product/:productId/reviews
// @access    Public
exports.getAllReview = catchAsync(async (req, res, next) => {
  let queryFind = {};

  if (req.params.productId) queryFind = { product: req.params.productId };

  const features = new ApiFeatures(
    Review.find(queryFind).populate({
      path: 'product',
      select: 'name',
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const review = await features.query;

  res.status(200).json({
    success: true,
    result: review.length,
    data: review,
  });
});

// @desc      Get Review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'product',
    select: 'name',
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with ID: ${req.params.id}`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc      Create Review
// @route     POST /api/v1/product/:productId/reviews
// @access    Private
exports.createReview = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  req.body.product = req.params.productId;

  // Check product exist
  let product = await Product.findById(req.params.productId);
  if (!product) {
    return next(
      new ErrorResponse(
        `No product found with ID: ${req.params.productId}`,
        404
      )
    );
  }

  // Check the user has made a purchase(kiểm tra đã mua hàng chưa)
  const order = await Order.find({
    user: req.user.id,
    'orderItems.product': req.params.productId,
  });
  if (order.length === 0) {
    return next(new ErrorResponse(`You do not buy this product`, 404));
  }

  // Check Only 1 Reivew/ 1 User of 1 pruduct
  const review = await Review.findOne({
    product: req.params.productId,
    user: req.user.id,
  });
  if (review) {
    return next(
      new ErrorResponse(`You already have a review for this product`, 401)
    );
  }

  // Create Review
  const newReview = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: newReview,
  });
});

// @desc      Update Review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No Review found with id:${req.params.id}`, 404)
    );
  }

  // Check User có phải người tạo ra review này không, chuyển review.user từ obj thành String
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Your are not update this review because your are not creator review:${req.params.id}`,
        401
      )
    );
  }

  //req.body.isChange = true;
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc      Detete Review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.deleteReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No Review found with id:${req.params.id}`, 404)
    );
  }

  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `Your are not delete this review because your are not creator review:${req.params.id}`,
        401
      )
    );
  }

  await review.remove();

  res.status(204).json({
    success: true,
    data: {},
  });
});
