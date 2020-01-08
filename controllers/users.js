const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware');
const { User } = require('../models');

// Get all users
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().populate({
    path: 'following',
    select: 'name'
  });
  const count = await User.countDocuments();

  res.status(200).json({ success: true, count, data: users });
});

// Get single user
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  res.status(200).json({ success: true, data: user });
});

exports.profileImage = asyncHandler(async (req, res, next) => {
  const self = req.user.id;

  if (!req.files) {
    return next(new ErrorResponse(`Kindly upload a file`, 400));
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  if (file.size > process.env.MAX_PROFILE_IMAGE_SIZE) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_PROFILE_IMAGE_SIZE}`,
        400
      )
    );
  }

  file.name = `photo_${self}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, function(err) {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    res.status(200).json({ sucess: true });
  });
});

// Follow a user
exports.follow = asyncHandler(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.requesteduser);

  if (!userToFollow) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  const self = await User.findById(req.user.id);

  if (self.id === req.params.requesteduser) {
    return next(new ErrorResponse(`Can't follow self`, 400));
  } else if (self.following.includes(req.params.requesteduser)) {
    return next(new ErrorResponse(`Already following user`, 400));
  }

  self.following.push(userToFollow);
  await self.save();

  res.status(200).json({ success: true, data: self });
});

// Unfollow a user
exports.unfollow = asyncHandler(async (req, res, next) => {
  const userToUnfollow = await User.findById(req.params.requesteduser);

  if (!userToUnfollow) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  const self = await User.findById(req.user.id);

  if (self.id === req.params.requesteduser) {
    return next(new ErrorResponse(`Can't unfollow self`, 400));
  } else if (self.following.includes(req.params.requesteduser)) {
    return next(new ErrorResponse(`Currently not following user`, 400));
  }

  self.following.pull(userToUnfollow);
  res.status(200).json({ success: true, data: self });
});
