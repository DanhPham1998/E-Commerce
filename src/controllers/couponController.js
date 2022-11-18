const User = require('./../models/userModel');
const Coupon = require('./../models/couponModel');

const ApiFeatures = require('./../utils/apiFeatures');
const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('../middlewares/catchAsync');
const { sendTokenResponse } = require('./../utils/sendTokenResponse');

// @desc      Create Coupon
// @route     POST /api/v1/coupon/
// @access    Private -- admin
exports.createCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    success: true,
    data: coupon,
  });
});

// @desc      Get All Coupon
// @route     GET /api/v1/coupon/
// @access    Public
exports.getAllCoupon = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Coupon.find(), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const coupon = await features.query;

  res.status(200).json({
    success: true,
    result: coupon.length,
    data: coupon,
  });
});

// @desc      Get A Coupon
// @route     GET /api/v1/coupon/:id
// @access    Public
exports.getACoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(
      new ErrorResponse(`No coupon found this ID:${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: coupon,
  });
});

// @desc      Update  Coupon
// @route     PUT /api/v1/coupon/:id
// @access    Private -- admin
exports.updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    return next(
      new ErrorResponse(`No coupon found this ID:${req.params.id}`, 404)
    );
  }

  res.status(201).json({
    success: true,
    data: coupon,
  });
});

// @desc      Delete  Coupon
// @route     DELETE /api/v1/coupon/:id
// @access    Private -- admin
exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return next(
      new ErrorResponse(`No coupon found this ID:${req.params.id}`, 404)
    );
  }

  res.status(204).json({
    success: true,
    data: {},
  });
});

// @desc      Check Coupon
// @route     GET /api/v1/coupon/checkcoupon
// @access    Private
exports.checkCoupon = catchAsync(async (req, res, next) => {
  //Check coupon exist
  const coupon = await Coupon.findOne({
    codeCoupon: req.query.codecoupon,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });
  if (!coupon) {
    return next(
      new ErrorResponse(`Coupon ${req.query.codecoupon} exist or expired`, 404)
    );
  }

  // Check user is use this coupon
  if (req.user.couponUse.coupon.includes(coupon._id)) {
    return next(
      new ErrorResponse(`You has been counpon ${req.query.codecoupon}`, 404)
    );
  }

  console.log(req.query.codecoupon);
  res.status(200).json({
    success: true,
    data: coupon,
  });
});
