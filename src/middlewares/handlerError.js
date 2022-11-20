const ErrorResponse = require('./../utils/errorResponse');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.log('ERROR --------------------------------'.bold.red.underline);
    console.log('ERROR xxx', err);
    sendErrorDev(err, req, res);
  } else {
    let error = JSON.parse(JSON.stringify(err));

    error.message = err.message;

    //console.log(error); // err.name, error.message, err.stack, err.code

    // Mongoose bad ObjectId DB (Id invalid )
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    // Mongoose duplicate key error (Dữ liệu tạo ra trùng)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // Mongoosee Validation Error (Xác thực dữ liệu nhập vào)
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    // Json web token wrong
    if (error.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError(error);

    sendErrorProd(error, req, res);
  }
};

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    //error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

// @Xử lý tất cả các lỗi có thê bắt cho Api production

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} with ID: ${err.value}`;
  return new ErrorResponse(message, 404);
};

const handleDuplicateFieldsDB = (err) => {
  // Dùng Rexex tìm 1 chuối trong ngoặc "";
  // Log ra de xem console.log(err.message);
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ErrorResponse(message, 400);
};

const handleValidationErrorDB = (err) => {
  const value = Object.values(err.errors).map((item) => item.message);
  const message = `Invalid input data: ${value.join(', ')}`;
  return new ErrorResponse(message, 400);
};

const handleJsonWebTokenError = (err) => {
  const message = `Access Token Invalid`;
  return new ErrorResponse(message, 404);
};
