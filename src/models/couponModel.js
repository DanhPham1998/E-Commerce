const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  codeCoupon: {
    type: String,
    required: [true, 'Please add a coupon code'],
    unique: true,
    lowercase: true,
  },
  discount: {
    type: Number,
    required: [true, 'Please add discount '],
  },
  quantity: {
    type: Number,
    required: [true, 'Plase add quantity conpon'],
  },
  startDate: {
    type: Date,
    required: [true, 'Plase add a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Plase add a end date'],
  },
  public: {
    type: Boolean,
    default: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
