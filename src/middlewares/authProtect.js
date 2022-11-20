const User = require('./../models/userModel');

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('./catchAsync');
const ErrorResponse = require('./../utils/errorResponse');

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from req.header and cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Check null token
  if (!token) {
    return next(new ErrorResponse('Your are not logged in! Please login', 401));
  }

  // Giai ma token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).populate({
    path: 'couponUse',
    select: 'codeCoupon discount -_id',
  });
  //console.log(currentUser);
  //Check account exist
  if (!currentUser) {
    return next(new ErrorResponse('Your account not exist', 401));
  }

  //Kiểm tra mật khẩu người dùng có thây đổi sau thời điểm phát hành accessToken không, nếu có không cho đăng nhập
  if (currentUser.checkChangePassword(decoded.iat)) {
    return next(
      new ErrorResponse('User has change password! Please login again', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
