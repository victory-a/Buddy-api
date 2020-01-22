const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware');
const { Post, Reply } = require('../models');

exports.getPosts = asyncHandler(async (req, res, next) => {
  let posts;

  req.params.userId
    ? (posts = await Post.find({ author: req.params.userId }))
    : (posts = await Post.find({ author: req.user.id }));

  res.status(200).json({ status: true, count: posts.length, data: posts });
});

exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(
      new ErrorResponse(`Post with Id of ${req.params.postId} not found`, 404)
    );
  }

  res.status(200).json({ success: true, data: post });
});

exports.createPost = asyncHandler(async (req, res, next) => {
  const post = {
    text: req.body.text,
    author: req.user.id
  };

  const data = await Post.create(post);
  res.status(200).json({ success: true, data });
});

exports.editPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new ErrorResponse(`Post not found`, 404));
  }

  post.text = req.body.text;
  post.isEdited = true;

  const data = await post.save({ new: true, runValidators: true });
  res.status(200).json({ success: true, data });
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = Post.findByIdAndRemove(req.params.postId);

  if (!post) {
    return next(
      new ErrorResponse(`Post with Id of ${req.params.postId} not found`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
});

exports.replyPost = asyncHandler(async (req, res, next) => {
  const user = req.user.id;
  const text = req.body.text;

  const originalPost = await Post.findById(req.params.postId).select('id');

  if (!originalPost) {
    return next(new ErrorResponse(`Post not found`, 404));
  }

  const reply = await Post.create({ text: text, author: user });

  await Reply.create({
    author: originalPost.author,
    replier: user,
    post: originalPost.id,
    reply: reply.id
  });

  res.status(200).json({ success: true, data: reply });
});

exports.getReplies = asyncHandler(async (req, res, next) => {
  const post = req.params.postId;

  const replies = await Reply.find({ post }).populate('reply');

  res.status(200).json({ success: true, data: replies });
});
