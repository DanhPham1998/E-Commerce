class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // check neu loi bat dau la 4 thi fail

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;
