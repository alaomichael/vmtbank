const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// create user model
const userSchema = new mongoose.Schema({
  //user details
  firstName: {
    type: String,
    trim: true,
    required: [false, 'please input your first name!'],
    validate: [validator.isAlpha, 'First name should contain only alphabets'],
  },

  lastName: {
    type: String,
    trim: true,
    required: [false, 'please input your last name!'],
    validate: [validator.isAlpha, 'Last name should contain only alphabets'],
  },

  email: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: [true, 'please provide your email'],
    validate: [validator.isEmail, 'please provide a valid email'],
  },

  phoneNumber: {
    type: String,
    trim: true,
    required: [true, 'please provide a phone number'],
    validate: [validator.isMobilePhone, 'please provide valid phone number'],
  },

  password: {
    type: String,
    trim: true,
    minlength: 8,
    select: false,
    required: [true, 'please provide a password'],
  },

  confirmPassword: {
    type: String,
    trim: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same',
    },
    required: [true, 'please confirm your password'],
  },

 
      profileImageUrl: {
    type: String,
    trim: true,
  },  
  cloudinaryId: {
    type: String,
    trim: true,
  },
      category: {
    type: String,
    trim: true,
      enum: ['current', 'savings'],
  },
      services: {
    type: String,
    trim: true,
    },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },

  createAt: {
    type: Date,
    default: Date,
  },

  passwordResetToken: String,
  passwordResetExpires: Date,
});

// middleware hook for hashing passwords when created or chnaged
userSchema.pre('save', async function (next) {
  //only run this function if password was actually created or modified
  if (!this.isModified('password')) return next();

  //Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete confirm password field
  this.confirmPassword = undefined;
});

//instance method for comparing passwords
userSchema.methods.correctPassword = async function (password, hashPassword) {
  return await bcrypt.compare(password, hashPassword);
};

//instance method to create forget password or password reset token
userSchema.methods.createPasswordResetToken = function () {
  //create random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  //hash random token and save to database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  //save save password reset expiration date to database
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

//initialize user model
const User = mongoose.model('User', userSchema);

//export user model
module.exports = User;
