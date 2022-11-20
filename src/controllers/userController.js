const User = require('./../models/userModel');

const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('../middlewares/catchAsync');
const ApiFeatures = require('./../utils/apiFeatures');
const { filterObj } = require('./../middlewares/uploadImage');
const { sendTokenResponse } = require('./../utils/sendTokenResponse');
const fs = require('fs');

// @desc      Get Me
// @route     GET /api/v1/users/me
// @access    Private-User
exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

// @desc      Get Me
// @route     GET /api/v1/users/me
// @access    Private-User
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
// @route     PUT /api/v1/users/updatepassword
// @access    Private-User
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

  if (password !== passwordConfirm) {
    return next(new ErrorResponse(`Password are not the same`, 401));
  }

  user.password = password;
  await user.save();

  sendTokenResponse(user, 201, res);
});

// @desc      Create A User
// @route     POST /api/v1/users/
// @access    Private -- Admin
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new ErrorResponse(`Password are not the same`, 401));
  }

  // Create User
  const newuser = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json({
    success: true,
    data: newuser,
  });
});

// @desc      Get All User
// @route     GET /api/v1/users/
// @access    Private -- Admin
exports.getAllUser = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(User.find(), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const user = await features.query;

  res.status(201).json({
    success: true,
    result: user.length,
    data: user,
  });
});

// @desc      Get User
// @route     GET /api/v1/users/:id
// @access    Private -- Admin
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`No user found with that ID ${req.params.id}`, 404)
    );
  }
  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc      Update Role User
// @route     PUT /api/v1/users/:id
// @access    Private -- Admin
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc      Delete User
// @route     GET /api/v1/users/:id
// @access    Private -- Admin
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  const urlAvatar = user.avatar;

  fs.unlink(`src/public/img/users/${urlAvatar}`, (err) => {
    if (err) {
      return next(new ErrorResponse(`Delete Error`, 401));
    }
  });
  user.remove();

  res.status(204).json({
    success: true,
  });
});
