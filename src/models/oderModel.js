const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      phoneNo: {
        type: Number,
        required: true,
      },
    },

    orderItems: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: Number,
      },
    ],

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },

    paymentMethods: {
      type: String,
      required: [true, 'Please add payment methods'],
      enum: {
        values: ['cod', 'momo'],
        message: 'Payment methods is either: cod, momo',
      },
    },

    paidAt: {
      type: Date,
    },

    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    bill: {
      type: Number,
      required: true,
      default: 0,
    },

    orderStatus: {
      type: String,
      required: true,
      default: 'Processing',
    },
    coupon: {
      type: mongoose.Schema.ObjectId,
      ref: 'Coupon',
    },
    deliveredAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.pre('save', function (next) {
  this.populate({
    path: 'coupon',
    select: 'codeCoupon discount',
  });

  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
