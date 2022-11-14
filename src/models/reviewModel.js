const mongoose = require('mongoose');
const Product = require('./productModel');

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    maxlength: [30, 'Title of review not more 30 character'],
  },
  comment: {
    type: String,
    required: [true, 'Plase add a comment'],
    minlength: [10, 'Comment of review great than 10 character'],
    maxlength: [200, 'Comment of review more than 200 character'],
  },
  rating: {
    type: Number,
    max: [10, 'Rating of review not great than 10'],
    min: [1, 'Title of review let than 1'],
  },
  isChange: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Static method to get avg of review rating
reviewSchema.statics.getAverageRating = async function (pruductId) {
  const obj = await this.aggregate([
    {
      // Lấy ra tất cả review có product là pruductId
      $match: { product: pruductId },
    },
    {
      // Gộp chung những preview để tính toán
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 },
      },
    },
  ]);

  //console.log('Math', obj);

  // [ { _id: new ObjectId("636f1a8972bf49178b5c3fc6"), averageRating: 8.5 } ]
  // Check nếu không có giá trị để đặc mặc định averageRating = 10, numOfReviews =0
  if (obj.length > 0) {
    await Product.findByIdAndUpdate(pruductId, {
      averageRating: Math.ceil(obj[0].averageRating * 10) / 10,
      numOfReviews: obj[0].numOfReviews,
    });
  } else {
    await Product.findByIdAndUpdate(pruductId, {
      averageRating: 10,
      numOfReviews: 0,
    });
  }
};

// Call affter create/update 1 review
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.product);
});

// Call affter remove 1 review
reviewSchema.post('remove', async function () {
  await this.constructor.getAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
