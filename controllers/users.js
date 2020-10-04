const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware');
const { User, Fan } = require('../models');

// Get all users
// AUTHORIZE FOR ADMIN ONLY
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({ success: true, count: users.length, data: users });
});

// Get single user
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  res.status(200).json({ success: true, data: user });
});

exports.profileImage = asyncHandler(async (req, res, next) => {
  const user = req.user.id;

  if (req.files.file instanceof Array) {
    return next(new ErrorResponse(`Choose one uimage file`, 400));
  }

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

  file.name = `photo_${user}${path.parse(file.name).ext}`;

  file.mv(
    `${process.env.PROFILE_IMAGE_UPLOAD_PATH}/${file.name}`,
    async err => {
      if (err) {
        // console.log(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }

      await User.findByIdAndUpdate(user, { photo: file.name });

      res.status(200).json({ sucess: true, data: file.name });
    }
  );
});

// Follow a user
exports.follow = asyncHandler(async (req, res, next) => {
  const user = req.user.id;
  const userToFollow = await User.findById(req.params.userId);

  if (!userToFollow) {
    return next(new ErrorResponse(`User not found`, 404));
  }

  if (user === userToFollow.id) {
    return next(new ErrorResponse(`Can't follow self`, 400));
  } else if (await Fan.findOne({ follower: user, followed: userToFollow.id })) {
    return next(new ErrorResponse(`Already following user`, 400));
  }

  const data = await Fan.create({
    follower: user,
    followed: userToFollow
  });

  res.status(200).json({ success: true, data });
});

// Unfollow a user
exports.unfollow = asyncHandler(async (req, res, next) => {
  const user = req.user.id;

  const isFollowingUser = await Fan.find({
    follower: user,
    followed: req.params.userId
  });

  if (!isFollowingUser) {
    return next(new ErrorResponse(`Currently not following user`, 400));
  }

  await isFollowingUser[0].remove();

  res.status(200).json({ success: true, data: {} });
});

exports.getUserFollowers = asyncHandler(async (req, res, next) => {
  const followers = await Fan.find({
    followed: req.params.userId
  }).populate({ path: 'follower', select: 'firstName lastName bio photo' });

  if (!followers) {
    return next(new ErrorResponse('User currently has no followers'), 404);
  }

  res.status(200).json({ success: true, data: followers });
});

exports.getUserFollowing = asyncHandler(async (req, res, next) => {
  const following = await Fan.find({
    follower: req.params.userId
  }).populate({ path: 'followed', select: 'firstName lastName bio photo' });

  if (!following) {
    return next(new ErrorResponse('User currently not following anyone'), 404);
  }

  res.status(200).json({ success: true, data: following });
});
