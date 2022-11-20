const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    minlength: [5, 'Name user must have min 5 charracters'],
    maxlength: [20, 'Name user must have max 20 charracters'],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: [true, 'Please add a email'],
    validate: [validator.isEmail, 'Please provide a email'],
  },
  avatar: String,
  role: {
    type: String,
    enum: ['user', 'manager'],
    required: [true, 'Please add a role user'],
    default: 'user',
  },
  password: {
    type: String,
    minlength: [6, 'A password  must have min or equal then 6 characters'],
    maxlength: [40, 'A password  must have more or equal then 40 characters'],
    select: false,
  },
  // passwordConfirm: {
  //   type: String,
  //   required: [true, 'Please comfirm your password'],
  //   validate: {
  //     // Nên nhớ chỉ hoạt động với lệnh CREATE và SAVE!!!

  //     validator: function (el) {
  //       return el === this.password;
  //     },
  //     message: 'Password are not the same',
  //   },
  // },
  verifyEmai: {
    type: Boolean,
    default: false,
  },
  couponUse: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Coupon',
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verifyEmailToken: String,
  verifyEmailExpire: Date,
  changePasswordAt: Date,
  createAt: {
    type: Date,
    default: Date.now,
  },
});

// Bcrypt password
userSchema.pre('save', async function (next) {
  // Bỏ qua nếu password không thay đổi
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  this.passwordConfirm = undefined;
  next();
});

// Create ChangePasswordAt khi change password hoặc reset password
userSchema.pre('save', function (next) {
  // Bỏ qua khi password không thay dôi và khi tạo account
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.changePasswordAt = Date.now() - 1000; // Trừ 1000 ms để tránh login lỗi
  next();
});

// Sign JWT and return
userSchema.methods.createJwT = function () {
  // Trả về jwt mã hoá 3 giá trị
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Check password(Mã hoá luôn password khi User nhập vào để so sánh)
userSchema.methods.checkPassword = async function (enterPassword) {
  // Return True nếu password đúng và false nếu password sai
  return await bcrypt.compare(enterPassword, this.password);
};

// Generate and hash reset password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash resettoken and set resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set exprire 10 minite
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

// Check Time token vs changePasswordAt
userSchema.methods.checkChangePassword = function (JwtTimeStamp) {
  if (this.changePasswordAt) {
    // Convert date sang timestamp và đổi sang 10 chứ sô thay vì 13 (đổi giây sang ms)
    const timestampChangePW = Math.floor(
      this.changePasswordAt.getTime() / 1000
    );
    return JwtTimeStamp < timestampChangePW;
  }
  return false;
};

// Generate and verify email token
userSchema.methods.getEmailVerifyToken = function () {
  // Generate token
  const emailToken = crypto.randomBytes(20).toString('hex');

  // Hash resettoken and set resetPasswordToken field
  this.verifyEmailToken = crypto
    .createHash('sha256')
    .update(emailToken)
    .digest('hex');

  // Set exprire 10 minite
  this.verifyEmailExpire = Date.now() + 10 * 60 * 1000;
  return emailToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
