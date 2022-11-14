const Product = require('./../models/productModel');

const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('../middlewares/catchAsync');
const ApiFeatures = require('./../utils/apiFeatures');

// @desc      Create A Product
// @route     POST /api/v1/products
// @access    Private--Admin
exports.createProduct = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  const newproduct = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: newproduct,
  });
});

// @desc      Get All Product
// @route     GET /api/v1/products
// @access    Public
exports.getAllProduct = catchAsync(async (req, res, next) => {
  console.log(req.query);
  const features = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const product = await features.query;

  res.status(200).json({
    success: true,
    result: product.length,
    data: product,
  });
});

// @desc      Get A Product
// @route     GET /api/v1/products/:id
// @access    Public
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with ID:${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: product,
  });

  // PROMISE
  // const product = Product.findById(req.params.id)
  //   .then((data) => {
  //     res.status(200).json({
  //       success: true,
  //       data: data,
  //     });
  //   })
  //   .catch((err) => {
  //     res.status(404).json({
  //       success: 'fail',
  //       err: err,
  //     });
  //   });
});

// @desc      Update Product
// @route     PUT /api/v1/products/:id
// @access    Private--Admin
exports.updateProduct = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with ID:${req.params.id}`, 404)
    );
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc      Delete Product
// @route     DELETE /api/v1/products/:id
// @access    Private--Admin
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with ID:${req.params.id}`, 404)
    );
  }

  await product.remove();

  res.status(204).json({
    success: true,
  });
});
