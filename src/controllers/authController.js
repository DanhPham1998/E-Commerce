const crypto = require('crypto');

const User = require('./../models/userModel');
const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('../middlewares/catchAsync');
const ApiFeatures = require('./../utils/apiFeatures');
const Email = require('./../utils/email');
const { filterObj } = require('./../middlewares/uploadImage');

// @desc      Register User
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  // Create User
  const user = await User.create({
    name,
    email,
    password,
    passwordConfirm,
  });

  // Create Token
  sendTokenResponse(user, 201, res);
});

// @desc      Login User
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check null email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please enter email and password', 400));
  }

  // Check email exist
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Email is not exist', 401));
  }

  // Check password Match (trùng khớp) trong db khi mã hoá
  const isPassword = await user.checkPassword(password);
  if (!isPassword) {
    return next(new ErrorResponse('Email or password wrong', 401));
  }

  // Create Token
  sendTokenResponse(user, 201, res);
});

// @desc      Logout User
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = catchAsync(async (req, res, next) => {
  // Logout là xoá cookies của web nhưng có thuộc tính httpOnly: true khi tạo cookie nên không thể xoá
  // Nên làm ghi đề cookie của web là 'loggedout' nhưng chỉ có thòi hạn là 10s để không lưu
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(204).json({
    status: 'success',
    data: {},
  });
});

// @desc      Get Me
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

// @desc      Get Me
// @route     GET /api/v1/auth/me
// @access    Private
exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  //Check password trong DB vs currenpassword
  if (!(await user.checkPassword(req.body.currentPassword || 'None'))) {
    return next(new ErrorResponse('Curent password is not correct', 401));
  }

  // lọc dữ liệu req.body gửi lên tránh gửi role, password...
  const fileterBody = filterObj(req.body, 'email', 'name');

  // Thêm photo nếu có
  if (req.file) fileterBody.avatar = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(req.user.id, fileterBody, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    data: updateUser,
  });
});

// @desc      Update Password User
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  if (!currentPassword || !password || !passwordConfirm) {
    return next(
      new ErrorResponse('CurrentPassword, password, passwordConfirm null', 401)
    );
  }

  const user = await User.findById(req.user.id).select('+password');

  //Check password trong DB vs currenpassword
  if (!(await user.checkPassword(currentPassword))) {
    return next(new ErrorResponse('Curent password is not correct', 401));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  sendTokenResponse(user, 201, res);
});

// @desc      Forgot Password User
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(`Email ${req.body.email} does not exist`, 401)
    );
  }

  // Generate and hash resetPasswordToken
  const resetToken = user.getResetPasswordToken();

  // Save resetoken and tokenExpire DB
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  // Send Mail
  try {
    await new Email(user, url).sendResetPassword();

    res.status(200).json({
      status: 200,
      data: 'Email send',
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be send', 500));
  }
});

// @desc      Reset Password User
// @route     Put /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get hased Token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  console.log(resetPasswordToken);
  // Get User with resettoken
  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid resetToken', 400));
  }

  // Set new password and xoa 2 cai resettoken va resetExpire
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Create Token
  sendTokenResponse(user, 200, res);
});

// Tạo Jsonweb Token và res token và thêm cookie vào
function sendTokenResponse(user, statusCode, res) {
  // Create JsonWebToken
  const token = user.createJwT();

  // Cookie Option
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Response accessToken, cookie
  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ status: 'success', token });
}
