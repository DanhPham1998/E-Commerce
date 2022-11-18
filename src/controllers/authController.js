const crypto = require('crypto');

const User = require('./../models/userModel');
const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('../middlewares/catchAsync');
const Email = require('./../utils/email');
const { sendTokenResponse } = require('./../utils/sendTokenResponse');

// @desc      Register User
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new ErrorResponse(`Password are not the same`, 401));
  }
  // Create User
  const user = await User.create({
    name,
    email,
    password,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);

  await new Email(user, url).sendWelcome();
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
    //console.log(err);
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

  if (req.body.password !== req.body.passwordConfirm) {
    return next(new ErrorResponse(`Password are not the same`, 401));
  }

  // Set new password and xoa 2 cai resettoken va resetExpire
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Create Token
  sendTokenResponse(user, 200, res);
});

// @desc      Send Verify Email
// @route     POST /api/v1/auth/veifyemail
// @access    Private
exports.sendVerifyEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email });

  if (!user) {
    return next(
      new ErrorResponse(`Email ${req.user.email} does not exist`, 401)
    );
  }

  // Generate and hash resetPasswordToken
  const verifyToken = user.getEmailVerifyToken();

  // Save resetoken and tokenExpire DB
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const url = `${req.protocol}://${req.get('host')}/api/v1/auth/verify/${
    req.user.id
  }/${verifyToken}`;

  // Send Mail
  try {
    await new Email(user, url).sendVerifyEmail();

    res.status(200).json({
      status: 200,
      data: 'An Email sent to your account please verify',
    });
  } catch (err) {
    //console.log(err);
    user.verifyEmailToken = undefined;
    user.verifyEmailExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be send', 500));
  }
});

// @desc      Verify Email
// @route     GET /api/v1/auth/verify/:iduser/:verifytoken
// @access    Public
exports.verifyEmail = catchAsync(async (req, res, next) => {
  // Get hased Token
  const verifyToken = crypto
    .createHash('sha256')
    .update(req.params.verifytoken)
    .digest('hex');

  const idUser = req.params.iduser;
  // Get User with resettoken
  const user = await User.findOne({
    _id: idUser,
    verifyEmailToken: verifyToken,
    verifyEmailExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('No found with verify email token', 400));
  }

  // Set verifyEmai = true, remove verifyEmailToken and verifyEmailExpire

  user.verifyEmai = true;
  user.verifyEmailToken = undefined;
  user.verifyEmailExpire = undefined;
  await user.save();
  // await User.updateOne(
  //   { _id: idUser },
  //   {
  //     $set: {
  //       verifyEmai: true,
  //       verifyEmailToken: undefined,
  //       verifyEmailExpire: undefined,
  //     },
  //   },
  //   { runValidators: false }
  // );

  res.status(200).json({
    success: true,
    data: 'Email verified sucessfully',
  });
});
