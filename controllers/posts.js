const ErrorResponse = require('../utils/errorResponse');
const { asyncHandler } = require('../middleware');
const { Post, Reply, Like, User } = require('../models');

exports.getPosts = asyncHandler(async (req, res, next) => {
  let posts;

  req.params.userId
    ? (posts = await Post.find({ author: req.params.userId })
        .populate('likes')
        .populate({ path: 'likers', select: 'firstName lastName photo' })
        .populate({ path: 'author', select: 'firstName lastName photo' }))
    : (posts = await Post.find()
        .populate('likes')
        .populate({ path: 'likers', select: 'firstName lastName photo' })
        .populate({ path: 'author', select: 'firstName lastName photo' }));

  return res
    .status(200)
    .json({ status: true, count: posts.length, data: posts });
});

exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId)
    .populate('likes')
    .populate('likers')
    .populate({ path: 'author', select: 'firstName lastName photo' });

  if (!post) {
    return next(
      new ErrorResponse(`Post with Id of ${req.params.postId} not found`, 404)
    );
  }

  return res.status(200).json({ success: true, data: post });
});

exports.createPost = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  const post = {
    text: req.body.text,
    author: req.user.id,
    photo: req.user.photo
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
  return res.status(200).json({ success: true, data });
});

exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(
      new ErrorResponse(`Post with Id of ${req.params.postId} not found`, 404)
    );
  }

  if (post.author.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to carry out this action`, 403)
    );
  }

  post.remove();
  return res.status(200).json({ success: true, data: {} });
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

  return res.status(200).json({ success: true, data: reply });
});

exports.getReplies = asyncHandler(async (req, res, next) => {
  const post = req.params.postId;

  const replies = await Reply.find({ post }).populate('reply');

  return res.status(200).json({ success: true, data: replies });
});

exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new ErrorResponse(`Invalid post`, 404));
  }

  await Like.create({
    post: post.id,
    author: post.author,
    liker: req.user.id
  });

  return res.status(200).json({ success: true, data: {} });
});

exports.unlikePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new ErrorResponse(`Invalid post`, 404));
  }

  const liked = await Like.findOne({
    post: req.params.postId,
    liker: req.user.id
  });

  if (!liked) {
    return next(new ErrorResponse(`You have not liked this post`, 400));
  }

  await liked.remove();
  return res.status(200).json({ success: true, data: {} });
});

exports.getLikedPosts = asyncHandler(async (req, res, next) => {
  const likedPosts = await Like.find({ liker: req.params.userId })
    .populate('post')
    .populate('likes')
    .populate({ path: 'author', select: 'firstName lastName photo' });
  // .populate('author');

  return res
    .status(200)
    .json({ success: true, count: likedPosts.length, data: likedPosts });
});
