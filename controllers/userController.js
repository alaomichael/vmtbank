const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const mongoose = require('mongoose');

//import  user  model
const User = require('../models/userModel');

// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, req) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  //remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

//create user route
exports.createUser = async (req, res, next) => {
  try {
    //fetch user details from req body
    const {
      firstName,
      lastName,
      brandName,
      email,
      password,
      confirmPassword,
      vendorType,
      city,
      state,
      address,
 phoneNumber,
   about,
      profileImageUrl,
      category,
      services,
      role,
    } = req.body;

    // create user and save to database
    const newUser = await User.create({
      firstName,
      lastName,
      brandName,
      email,
      password,
      confirmPassword,
      vendorType,
      city,
      state,
      address,
 phoneNumber,
   about,
      profileImageUrl,
      category,
      services,
      role,
    });
    //send user to client
    createSendToken(newUser, 201, res, req);
  } catch (err) {
    if (err.code === 11000) {
      return next(createError(400, 'User already exist'));
    }
    if (err.name === 'ValidationError') {
      return next(createError(422, err.message));
    }
    next(err);
  }
};

//Get all user route
exports.getAllUsers = async (req, res, next) => {
  try {
    //check req query for filters
    //if filters, find filter from event models
    //fetch all events
    const conditions = {};
    if (req.query.role) conditions.role = req.query.role;

    //find users from database
    const users = await User.find(conditions);
    //send users to client
    res.status(200).json({
      status: 'success',
      result: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    next(err);
  }
};

//Get a single user
exports.getUser = async (req, res, next) => {
  try {
    //find  user from database by id
    const user = await User.findById(req.params.id);
    //check if user exists
    if (!user) {
      throw createError(404, 'User does not exist');
    }
    //send user to client
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return next(createError(400, 'Invalid user ID'));
    }
    next(err);
  }
};

//update user route
exports.updateUser = async (req, res, next) => {
  try {
    //search database by user id and update
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    //check if user exists
    if (!user) {
      throw createError(404, 'User does not exist');
    }
    //send updated user to client
    createSendToken(user, 200, res, req);
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return next(createError(400, 'Invalid user ID'));
    }
    next(err);
  }
};

//Delete a user
exports.deleteUser = async (req, res, next) => {
  try {
    //search database by user id and delete
    const user = await User.findByIdAndDelete(req.params.id);
    //check if user exists
    if (!user) {
      throw createError(404, 'User does not exist');
    }
    //send user to client
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    if (err instanceof mongoose.CastError) {
      return next(createError(400, 'Invalid user ID'));
    }
    next(err);
  }
};
