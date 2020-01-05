const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware');
const ErrorRespose = require('../utils/errorResponse');
const { User } = require('../models');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorRespose(`Not authorized to access this route`, 401));
  }

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodeToken.id);

    next();
  } catch (error) {
    return next(new ErrorRespose(`Not authorized to access this route`, 401));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorRespose(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
