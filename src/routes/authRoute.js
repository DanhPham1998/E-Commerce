const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const { protect } = require('./../middlewares/authProtect');
const { uploadPhoto, settingsPhoto } = require('./../middlewares/uploadImage');

router.route('/register').post(authController.register);
router.route('/login').post(authController.login);
router.route('/logout').get(protect, authController.logout);

router.route('/me').get(protect, authController.getMe);
router
  .route('/updateme')
  .put(
    protect,
    uploadPhoto,
    settingsPhoto('user', 'users'),
    authController.updateMe
  );
router.route('/updatepassword').put(protect, authController.updatePassword);

router.route('/forgotpassword').post(authController.forgotPassword);
router.route('/resetpassword/:resettoken').put(authController.resetPassword);

module.exports = router;
