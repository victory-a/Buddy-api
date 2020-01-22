const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getPost,
  getPosts,
  createPost,
  editPost,
  deletePost,
  replyPost,
  getReplies
} = require('../controllers/posts');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getPosts)
  .post(protect, createPost);

router
  .route('/:postId')
  .get(getPost)
  .put(editPost)
  .delete(protect, deletePost);

router
  .route('/:postId/reply')
  .get(protect, getReplies)
  .post(protect, replyPost);

module.exports = router;
