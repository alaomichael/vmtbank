const mongoose = require('mongoose');
const validator = require('validator');

const transactionSchema = new mongoose.Schema({
  //event details
  senderName: {
    type: String,
    trim: true,
    required: [true, 'please provide your full name'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, 'please provide your email address'],
    validate: [validator.isEmail, 'please provide a valid email address'],
  },
      transactionTitle: {
    type: String,
    trim: true,
   },
      transactionDescription: {
    type: String,
    trim: true, },
      transactionDate: {
    type: Date,
    trim: true,
    required: [true, 'please provide transaction date'],
  },
      category: {
    type: String,
    trim: true,
  },
      receiverName: {
    type: String,
    trim: true,
    required: [true, 'please provide your receiver\'s name'],
  },
      
deposit: {
    type: Number,
    trim: true,
   
  },
withdrawal: {
    type: Number,
    trim: true,
   
  },
accountBalance: {
    type: Number,
    trim: true,
    required: [true, 'please provide receiver account balance'],
  },
transactionHistory: {
    type: String,
    trim: true,
  },
receiverAccountNumber: {
    type: String,
    trim: true,
    required: [true, 'please provide receiver\'s account number'],
  },

  transactionType: {
    type: String,
    trim: true,
    enum: [
      'current',
      'savings'
    ],
    required: [true, 'please provide transaction type'],
  },
  
});

const Transaction = mongoose.model('Event', transactionSchema);

module.exports = Transaction;
