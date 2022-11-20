const User = require('./../models/userModel');
const Product = require('./../models/productModel');
const Cart = require('./../models/cartModel');

const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('../middlewares/catchAsync');

// @desc      Get Cart Me
// @route     GET /api/v1/carts/:id
// @access    Private
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    return next(new ErrorResponse(`No cart found account`, 404));
  }

  res.status(201).json({
    success: true,
    data: cart,
  });
});

// @desc      Add Product To Cart
// @route     POST /api/v1/carts/
// @access    Private
exports.addProductToCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ userId });
  const product = await Product.findOne({ _id: productId });

  // Check product exists
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const price = product.price;
  const name = product.name;

  // Check card exists this user
  if (!cart) {
    cart = await Cart.create({
      userId,
      items: [{ productId, name, quantity, price }],
      totalPrice: quantity * price,
    });
  } else {
    const productIndex = cart.items.findIndex(
      (item) => item.productId == productId
    );

    //Check productId exists in card
    if (productIndex > -1) {
      let productCurrent = cart.items[productIndex];
      productCurrent.quantity += quantity * 1;

      // Tính toán lai toàn bộ items trong cart
      cart.totalPrice = cart.items.reduce((total, curr) => {
        return total + curr.quantity * curr.price;
      }, 0);

      // Gán lại product lấy ra = product đã xử lý
      cart.items[productIndex] = productCurrent;
      await cart.save();
    } else {
      cart.items.push({ productId, name, quantity, price });
      cart.totalPrice = cart.items.reduce((total, curr) => {
        return total + curr.quantity * curr.price;
      }, 0);
      await cart.save();
    }
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc      Update Product To Cart
// @route     PUT /api/v1/carts/
// @access    Private
exports.updateCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return next(new ErrorResponse(`No cart found account`, 404));
  }

  const productIndex = cart.items.findIndex(
    (item) => item.productId == productId
  );

  if (productIndex < -1) {
    return next(new ErrorResponse(`No product found`, 404));
  }
  cart.items[productIndex].quantity = quantity;
  cart.totalPrice = cart.items.reduce((total, current) => {
    return total + current.quantity * current.price;
  }, 0);

  await cart.save();

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc      Delete Product To Cart
// @route     DELETE /api/v1/carts/
// @access    Private
exports.deleteProductCart = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const productId = req.query.productId;

  let cart = await Cart.findOne({ userId });

  if (cart) {
    const productIndex = cart.items.findIndex(
      (item) => item.productId == productId
    );

    if (productIndex > -1) {
      let productCurrent = cart.items[productIndex];

      // Tính lại totalPrice
      cart.totalPrice -= productCurrent.quantity * productCurrent.price;
      if (cart.totalPrice < 0) cart.totalPrice = 0;

      // Xoá product ra khỏi cart
      cart.items.splice(productIndex, 1);
      await cart.save();
    } else {
      return next(new ErrorResponse(`Product not found`, 404));
    }
  } else {
    cart = {};
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});
