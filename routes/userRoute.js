const express = require('express');

//initialize  express router
const router = express.Router();

//import authentication controller
const authController = require('../controllers/authController');

//import user controller
const userController = require('../controllers/userController');

//import rolebase controller
const { protect, restrictTo } = require('../middlewares/authentication');

//mouting routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotpassword', authController.forgotpassword);
router.patch('/resetpassword/:token', authController.resetpassword);

router
  .route('/')
  .post(protect, restrictTo('admin'), userController.createUser)
  .get(protect, restrictTo('admin'), userController.getAllUsers);

router
  .route('/:id')
  .get(protect, restrictTo('admin'), userController.getUser)
  .patch(protect, restrictTo('admin'), userController.updateUser)
  .delete(protect, restrictTo('admin'), userController.deleteUser);

module.exports = router;
