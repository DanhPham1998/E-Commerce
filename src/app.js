const express = require('express');
const morgan = require('morgan');
const colors = require('colors'); // Tạo màu console.log
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: 'src/config/.env' });

// Import everything
const globalErrorHandle = require('./middlewares/handlerError');

// Router import
const productRouter = require('./routes/productRoute');
const authRouter = require('./routes/authRoute');

const app = express();

// Dev logger URL
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(__dirname, 'src/public')));

// Router
app.use('/api/v1/products', productRouter);
app.use('/api/v1/auth', authRouter);

// Global Error Handle
app.use(globalErrorHandle);

module.exports = app;
