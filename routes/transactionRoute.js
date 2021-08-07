const express = require('express');

//initialize  express router
const router = express.Router();

//import auction controller
const transactionController = require('../controllers/transactionController');

//import rolebase controller
const { protect, restrictTo } = require('../middlewares/authentication');

router
  .route('/')
  .post(protect, transactionController.createtransaction)
  .get(protect, transactionController.getAlltransactions);

router
  .route('/:id')
  .get(protect, transactionController.gettransaction)
  .patch(protect, restrictTo('admin', 'user'), transactionController.updatetransaction)
  .delete(protect, restrictTo('admin'), transactionController.deletetransaction);

module.exports = router;
