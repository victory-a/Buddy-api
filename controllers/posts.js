const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware');
const { Post } = require('../models');
const imageUpload = require('../utils/imageUpload');

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
    return next(
      new ErrorResponse(`Post with Id of ${req.params.postId} not found`, 404)
    );
  }

  res.status(200).json({ success: true, data: post });
});

exports.createPost = asyncHandler(async (req, res, next) => {
  // add check for max 2 photos post
  const data = {
    text: req.body.text,
    caption: req.body.caption,
    author: req.user.id
  };

  await Post.create(data);
  // if (req.files) {
  //   imageUpload(req.files.file, req.user.id, 'post', next);
  // }
  // if (req.files.file instanceof Array) {
  //   req.files.file.forEach(file => console.log(file.name));
  // } else {
  //   console.log('no file');
  // }
  res.status(200).json({ success: true, data });
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  // CHECK IF THE POST CONTAINED AN IMAGE AND DELETE THE IMAGE FILE
  const post = Post.findByIdAndRemove(req.params.postId);

  if (!post) {
    return next(
      new ErrorResponse(`Post with Id of ${req.params.postId} not found`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
});
