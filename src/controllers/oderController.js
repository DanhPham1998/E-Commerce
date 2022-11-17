const Product = require('./../models/productModel');
const Order = require('./../models/oderModel');
const Coupon = require('./../models/couponModel');

const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('../middlewares/catchAsync');
const ApiFeatures = require('./../utils/apiFeatures');
const User = require('../models/userModel');

// @desc      Create New Order
// @route     POST /api/v1/orders/
// @access    Private
exports.newOrder = catchAsync(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    coupon,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    coupon,
    user: req.user._id,
  });
  // Update coupon user use
  if (coupon)
    await User.findByIdAndUpdate(req.user.id, { $push: { couponUse: coupon } });

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

// @desc      Add Coupon Order
// @route     PUT /api/v1/orders/:id/addcoupon/
// @access    Private -- Admin
exports.addCouponOrder = catchAsync(async (req, res, next) => {
  // Check exist order
  let order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ErrorResponse(`No Order found with ID:${req.params.id}`, 404)
    );
  }

  // Check coupon exist
  const coupon = await Coupon.findOne({
    codeCoupon: req.body.codecoupon,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });
  if (!coupon) {
    return next(
      new ErrorResponse(`Coupon ${req.body.codeCoupon} exist or expired`, 404)
    );
  }

  if (req.user.couponUse.includes(coupon)) {
    return next(
      new ErrorResponse(`You has been counpon ${req.body.codeCoupon}`, 404)
    );
  }
  console.log(coupon);

  // Update order with coupon
  order.coupon = coupon._id;
  await order.save();

  //

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

// @desc      Get A Order Me
// @route     GET /api/v1/orders/
// @access    Private
exports.getOrderMe = catchAsync(async (req, res, next) => {
  const order = await Order.find({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    result: order.length,
    data: order,
  });
});

// @desc      Get A Order User
// @route     GET /api/v1/orders/:id
// @access    Private -- Admin
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with this Id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

// @desc      Get All Order
// @route     GET /api/v1/orders/
// @access    Private -- Admin
exports.getAllOrder = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Order.find(), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const order = await features.query;

  let totalAmout = 0;

  // Lấy ra tất cả đơn order và giá tiền
  order.forEach((itemOrder) => {
    totalAmout += itemOrder.totalPrice;
  });

  res.status(200).json({
    status: 'success',
    totalAmout,
    data: order,
  });
});

// @desc      Update Order
// @route     PUT /api/v1/orders/:id
// @access    Private -- Admin
exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  const input = ['Prepare goods', 'Shipped', 'Shipped fail', 'Delivered'];
  if (!input.find((item) => item === req.body.status)) {
    return next(new ErrorResponse(`Status order illegal`, 404));
  }

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with this id ${req.params.id}`, 404)
    );
  }

  // Kiểm tra nếu đơn hàng đã giao thì bỏ qua
  if (order.orderStatus === 'Delivered') {
    return next(
      new ErrorResponse(`You have already delivered this order`, 400)
    );
  }

  // Kiểm tra nếu đơn hàng nếu đã giao thất bại
  if (order.orderStatus === 'Shipped fail') {
    return next(new ErrorResponse(`You have shipped fail this order`, 400));
  }

  // Update lại đơn hàng trong kho khi chuẩn bị hàng
  if (req.body.status === 'Prepare goods') {
    order.orderItems.forEach(async (itemOrder) => {
      await updateStock(itemOrder.product, itemOrder.quantity, true);
    });
  }

  // Update trạng thái khi chuyển sang giao hàng
  if (req.body.status === 'Shipped') {
    order.orderStatus = req.body.status;
  }

  // Update lại hàng trong kho khi giao hàng thất bại
  if (req.body.status === 'Shipped fail') {
    order.orderItems.forEach(async (itemOrder) => {
      await updateStock(itemOrder.product, itemOrder.quantity, false);
    });
  }

  // Kiểm tra nếu đơn hàng nếu admin update đơn này là đã giao thì tạo thơi gian giao
  if (req.body.status === 'Delivered') {
    order.deliveredAt = Date.now();
  }

  order.orderStatus = req.body.status;

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    status: 'success',
  });
});

// @desc      Delete Order
// @route     DELETE /api/v1/orders/:id
// @access    Private -- Admin
exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with this id ${req.params.id}`, 404)
    );
  }

  await order.remove();

  res.status(200).json({
    status: 'success',
    data: order,
  });
});

async function updateStock(idProduct, quantityProduct, isSuccess) {
  const product = await Product.findById(idProduct);

  if (isSuccess) {
    product.stock -= quantityProduct;
  } else {
    product.stock += quantityProduct;
  }
  await product.save({ validateBeforeSave: false });
}
