const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware');
const { User } = require('../models');

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId).populate({
    path: 'following',
    select: 'name'
  });

  res.status(200).json({ success: true, data: user });
});

exports.follow = asyncHandler(async (req, res, next) => {
  const userToBeFollowed = await User.findById(req.params.requestedUser);

  if (!userToBeFollowed) {
    return next(
      new ErrorResponse(
        `User with ID ${req.params.requestedUser} not found`,
        404
      )
    );
  }

  const user = await User.findById(req.user.id);

  if (user.id === req.params.requestedUser) {
    return next(new ErrorResponse(`Can't follow self`, 400));
  } else if (user.following.includes(req.params.requestedUser)) {
    return next(new ErrorResponse(`Already following user`, 400));
  }

  user.following.push(userToBeFollowed);
  await user.save();

  res.status(200).json({ success: true, data: user });
});
