const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getPost,
  getPosts,
  createPost,
  editPost,
  deletePost
} = require('../controllers/posts');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getPosts)
  .post(protect, createPost);

router
  .route('/:postId')
  .get(getPost)
  .put(editPost)
  .delete(protect, deletePost);

module.exports = router;
