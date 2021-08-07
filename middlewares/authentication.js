/* eslint-disable arrow-body-style */
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

//import user model
const User = require('../models/userModel');

//protected routes
exports.protect = async (req, res, next) => {
  try {
    //check if authentication header contain token
    let token;
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Invalid authorization header' });
    }

    //split authentication header and get token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    //verify token
    if (!token) {
      return res.status(401).json({
        message: 'You are not logged in! please login to gain access',
      });
    }
    const decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    // check if token is valid
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid authorization token' });
    }

    //check if current user exist
    const currentUser = await User.findById(decodedToken.id);
    if (!currentUser) {
      return res.status(401).json({
        message: 'the user with this token nolonger exist! please login again',
      });
    }

    //give user access
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err,
    });
  }
};

//restrict user route
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'you do not have permission to access this route',
      });
    }
    next();
  };
};
