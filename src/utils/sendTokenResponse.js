// Tạo Jsonweb Token và res token và thêm cookie vào
exports.sendTokenResponse = (user, statusCode, res) => {
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
};
