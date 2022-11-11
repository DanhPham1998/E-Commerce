const User = require('./../models/userModel');

const ErrorResponse = require('./../utils/errorResponse');
const catchAsync = require('../middlewares/catchAsync');
const ApiFeatures = require('./../utils/apiFeatures');

// @desc      Get All User
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getAllUser = catchAsync(async (req, res, next) => {
  const total = await User.count();
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const user = await features.query;
  res.status(200).json({
    status: 'success',
    result: user.length,
    totalAllUser: total,
    data: user,
  });
});
