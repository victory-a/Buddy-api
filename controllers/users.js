const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware');
const { User } = require('../models');

// Search DB with provided id
const searchById = (model, id) => {
  const result = model.findById(id);
  return result;
};

// Get all users
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({ success: true, data: users });
});

// Get single user
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await searchById(User, req.params.userId);

  res.status(200).json({ success: true, data: user });
});

// Follow a user
exports.follow = asyncHandler(async (req, res, next) => {
  const userToFollow = await searchById(User, req.params.requesteduser);

  if (!userToFollow) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  const self = await searchById(User, req.user.id);

  if (self.id === req.params.requesteduser) {
    return next(new ErrorResponse(`Can't follow self`, 400));
  } else if (self.following.includes(req.params.requesteduser)) {
    return next(new ErrorResponse(`Already following user`, 400));
  }

  self.following.push(userToFollow);
  await self.save();

  res.status(200).json({ success: true, data: self });
});

exports.unfollow = asyncHandler(async (req, res, next) => {
  const userToUnfollow = await searchById(User, req.params.requesteduser);

  if (!userToUnfollow) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  const self = await searchById(User, req.user.id);

  if (self.id === req.params.requesteduser) {
    return next(new ErrorResponse(`Can't unfollow self`, 400));
  } else if (self.following.includes(req.params.requesteduser)) {
    return next(new ErrorResponse(`Currently not following user`, 400));
  }

  self.following.pull(userToUnfollow);
  res.status(200).json({ success: true, data: self });
});

