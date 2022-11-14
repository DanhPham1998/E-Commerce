const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter product Name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please Enter product Description'],
  },
  price: {
    type: Number,
    required: [true, 'Please Enter product Price'],
    maxLength: [8, 'Price cannot exceed 8 characters'],
  },
  averageRating: {
    type: Number,
    default: 10,
    min: [1, 'Ratting must be at least 1'],
    max: [10, 'Ratting must can not be more than 10'],
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  imageCover: {
    type: String,
    default: 'product-default.jpeg',
  },
  images: [String],
  category: {
    type: String,
    required: [true, 'Please Enter Product Category'],
  },
  stock: {
    type: Number,
    required: [true, 'Please Enter product Stock'],
    maxLength: [4, 'Stock cannot exceed 4 characters'],
    default: 1,
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
