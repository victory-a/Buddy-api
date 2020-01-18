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
  const files = req.files;
  const post = {
    text: req.body.text,
    caption: req.body.caption,
    author: req.user.id
  };

  if (files) {
    files.file.names = [];
    if (req.files.file instanceof Array) {
      if (req.files.file.length > 2) {
        return next(
          new ErrorResponse(`Max number of images per post (2) exceeded`, 400)
        );
      }
      files.file.multiple = true;
    }
    post.images = imageUpload(files.file, req.user.id, 'post', next);
  }

  const data = await Post.create(post);
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
