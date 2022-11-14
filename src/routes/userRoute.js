const express = require('express');
const router = express.Router();

// Import
const userController = require('./../controllers/userController');
const { protect, authorize } = require('./../middlewares/authProtect');
const {
  uploadUserImage,
  settingUserImage,
} = require('./../middlewares/uploadImage');

// Router-- User
router.route('/me').get(protect, userController.getMe);
router
  .route('/updateme')
  .put(protect, uploadUserImage, settingUserImage, userController.updateMe);
router.route('/updatepassword').put(protect, userController.updatePassword);

// Vì MiddleWare chạy theo thứ tự nên các hàm dưới cần phải chạy qua MiddleWare này để Xác thực đăng nhập
router.use(protect, authorize('admin'));

// Router -- Admin
router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .put(userController.updateUserRole)
  .delete(userController.deleteUser);

module.exports = router;
