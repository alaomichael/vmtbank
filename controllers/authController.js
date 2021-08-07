const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');

//import  user  model
const User = require('../models/userModel');
//import utilty email
const sendEmail = require('../utils/email');

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
    data: {
      user,
    },
});
};

//registration route
exports.signup = async (req, res, next) => {
  try {
    //fetch registration detail from req body
    const {
          firstName,
      lastName,
      email,
      password,
      confirmPassword,
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
      email,
      password,
      confirmPassword,
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
    //create jwt token and send to user client
    createSendToken(newUser, 201, res, req);
  } catch (err) {
    if (err.code === 11000) {
      return next(createError(400, 'User/Vendor already exist'));
    }
    if (err.name === 'ValidationError') {
      return next(createError(422, err.message));
    }
    next(err);
  }
};

//login route
exports.login = async (req, res, next) => {
  try {
    //fetch user from req body
    const { email, password } = req.body;

    //check if email and password exist
    if (!email || !password) {
      throw createError(404, 'Please provide email and password');
    }
    //check if email and password exist
    const user = await User.findOne({ email }).select('+password');

    //check if user exist and password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      throw createError(404, 'Incorrect email or password');
    }
    //create jwt token  and  send token to client
    createSendToken(user, 200, res, req);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(createError(422, err.message));
    }
    next(err);
  }
};

exports.forgotpassword = async (req, res, next) => {
  //get user base on  POSTED email
  const user = await User.findOne({ email: req.body.email });

  //check if user exist
  if (!user) {
    return next(createError(404, 'There is no user with this email address'));
  }

  //generate password reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //seed it to user's email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetpassword${resetToken}`;

  const message = `We are sending you this email because you requested for password reset. Click on this link  ${resetUrl} to create a new password.\n If you didn't request for password reset , you can ignore this email. Your password will not be changed.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    return res.status(200).json({
      status: 'success',
      message: 'Your password reset token was successfully sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    next(
      createError(500, 'There was an error sending email, try again later!.')
    );
  }
  next();
};

exports.resetpassword = async (req, res, next) => {
  try {
    //Get user based on token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    //if token has not expired, and there is user set the new password
    if (!user) {
      return next(createError(404, 'Token is invalid or has expired'));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //create jwt token and send to client
    createSendToken(user, 200, res, req);
  } catch (err) {
    next(err);
  }
};