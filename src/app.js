const express = require('express');
const morgan = require('morgan');
const colors = require('colors'); // Tạo màu console.log
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: 'src/config/.env' });

// Import everything
const globalErrorHandle = require('./middlewares/handlerError');

// Security Web
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

// Router import
const productRouter = require('./routes/productRoute');
const authRouter = require('./routes/authRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const cartRouter = require('./routes/cartRoute');
const orderRouter = require('./routes/orderRoute');
const couponRouter = require('./routes/couponRoute');

const app = express();

// Dev logger URL
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Tránh SQL injection
app.use(mongoSanitize());

// Set Dns và giấu ip, lọc header
app.use(helmet());

// Tránh chèn dữ liệu có code html js
app.use(xss());

// Lọc params
app.use(hpp());

// Rate limit request with 1 IP
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Set static folder
app.use(express.static(path.join(__dirname, 'src/public')));

// Router
app.use('/api/v1/products', productRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/coupons', couponRouter);

// Global Error Handle
app.use(globalErrorHandle);

module.exports = app;
