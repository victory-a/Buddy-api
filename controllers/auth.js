const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const { asyncHandler } = require('../middleware');
const { User } = require('../models');

// SENDS A RESPONSE WITH TOKEN IN BODY AND COOKIE
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getAuthToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};

// REGISTER USER
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const user = await User.create({ firstName, lastName, email, password });
  sendTokenResponse(user, 201, res);
});

// LOGIN
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse(`Kindly provide an email and password`, 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  if (!(await user.verifyPassword(password))) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// NAME AND EMAIL UPDATE
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fields = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    gender: req.body.gender,
    bio: req.body.bio,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: user });
});

exports.currentUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'following',
    select: 'firstName lastName'
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// LOGOUT
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000) });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// UPDATE USER PASSWORD
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  const isVerified = await user.verifyPassword(currentPassword);

  if (!isVerified) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// SEND A TOKEN TO PROVIDED EMAIL TO RESET PASWORD
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(`There is no user with that email`, 404));
  }
  const resetToken = user.getResetPasswordToken();
  const resetUrl = `${req.get('Origin')}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested
  the reset of a password. Click on this link to reset your password: \n\n ${resetUrl} \n\n Kindly ignore this message if you didn't initiate a password reset`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message
    });

    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, data: 'Email sent!' });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse(`Email could not be sent`, 500));
  }
});

// RESET USER PASSWORD IF PROVIDEED TOKEN MATCHES THAT IN DATABASE
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword, confirmPassword } = req.body;
  if (!newPassword && !confirmPassword) {
    return next(
      new ErrorResponse('New password and confirm password required', 400)
    );
  } else if (newPassword !== confirmPassword) {
    return next(new ErrorResponse('Password mismatch', 400));
  }

  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  console.log(resetPasswordToken);
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  user.remove();
  res.status(200).json({ success: true, data: {} });
});
