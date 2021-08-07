const createError = require('http-errors');
const mongoose = require('mongoose');

//import  user  model
const Transaction = require('../models/transactionModel');

//create Transaction routes
exports.createTransaction = async (req, res, next) => {
  try {
    //fetch Transactions from req body
    const {
      senderName,
      email,
phoneNumber,
      transactionTitle,
      transactionDescription,
      transactionDate,
      category,
      receiverName,
      transactionType,
deposit,
withdrawal,
accountBalance,
receiverAccountNumber,
    } = req.body;
    //create Transaction and store to database
    const transaction = await Transaction.create({
         senderName,
      email,
phoneNumber,
      transactionTitle,
      transactionDescription,
      transactionDate,
      category,
      receiverName,
      transactionType,
deposit,
withdrawal,
accountBalance,
receiverAccountNumber,
    });
    //send Transaction to client
    res.status(201).json({
      status: 'success',
      data: {
        transaction,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(createError(400, 'Transaction already done'));
    }
    if (err.name === 'ValidationError') {
      return next(createError(422, err.message));
    }
    next(err);
  }
};

//Get all Transaction routes
exports.getAllTransactions = async (req, res, next) => {
  try {
    //check req query for filters
    //if filters, find filter from Transaction models
    //fetch all Transactions
    const conditions = {};
    if (req.query.category) conditions.category = req.query.category;
    if (req.query.transactionDate) conditions.transactionDate = req.query.transactionDate;
    if (req.query.receiverName) conditions.receiverName = req.query.receiverName;

    //find Transaction from database
    const transaction = await Transaction.find(conditions);
    //send Transaction to client
    res.status(200).json({
      status: 'success',
      result: transaction.length,
      data: {
        transaction,
      },
    });
  } catch (err) {
    next(err);
  }
};

//Get a single Transaction routes
exports.getTransaction = async (req, res, next) => {
  try {
    //find Transaction from database by id
    const transaction = await Transaction.findById(req.params.id);
    //check if Transaction exists
    if (!transaction) {
      throw createError(404, 'Transaction does not exist');
    }
    //send Transaction to client
    res.status(200).json({
      status: 'success',
      data: {
        transaction,
      },
    });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return next(createError(400, 'Invalid Transaction ID'));
    }
    next(err);
  }
};

//update Transaction routes
exports.updateTransaction = async (req, res, next) => {
  try {
    //search database by Transaction id and update
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    //check if Transaction exists
    if (!transaction) {
      throw createError(404, 'Transaction does not exist');
    }

    //send Transaction update to client
    res.status(200).json({
      status: 'success',
      data: {
        transaction,
      },
    });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return next(createError(400, 'Invalid Transaction ID'));
    }
    next(err);
  }
};

//delete Transaction routes
exports.deleteTransaction = async (req, res, next) => {
  try {
    //search database by Transaction id and delete
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    //check if Transaction exists
    if (!transaction) {
      throw createError(404, 'Transaction does not exist');
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return next(createError(400, 'Invalid Transaction ID'));
    }
    next(err);
  }
};
