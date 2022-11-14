const express = require('express');
const router = express.Router();

const authController = require('./../controllers/authController');
const { protect } = require('./../middlewares/authProtect');

router.route('/register').post(authController.register);
router.route('/login').post(authController.login);
router.route('/logout').get(protect, authController.logout);

router.route('/forgotpassword').post(authController.forgotPassword);
router.route('/resetpassword/:resettoken').put(authController.resetPassword);

module.exports = router;
