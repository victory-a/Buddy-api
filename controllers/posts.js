const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware');
const { Post, User } = require('../models');

exports.getPosts = asyncHandler(async (req, res, next) => {
  let posts;

  req.params.userId
    ? (posts = await Post.find({ author: req.params.userId }))
    : (posts = await Post.find());

  res.status(200).json({ status: true, count: posts.length, data: posts });
});

exports.getPost = asyncHandler(async (req, res, next) => {
  const post = Post.findById(req.params.postId);

  if (!post) {
    return next(new ErrorResponse(`Post with Id of ${req.params.postId}`));
  }

  res.status(200).json({ success: true, data: post });
});

// exports.publishPost = asyncHandler(async (req, res, next) => {
//   const body = 
// })

exports.deletePost = asyncHandler(async (req, res, next) => {
  // CHECK IF THE POST CONTAINED AN IMAGE AND DELETE THE IMAGE FILE
  const post = Post.findByIdAndRemove(req.params.postId);

  if (!post) {
    return next(new ErrorResponse(`Post with Id of ${req.params.postId}`));
  }

  res.status(200).json({ success: true, data: {} });
});
