const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getPost,
  getPosts,
  createPost,
  editPost,
  deletePost,
  replyPost,
  getReplies,
  likePost,
  unlikePost
} = require('../controllers/posts');

const router = express.Router();

router.use(protect);
router
  .route('/')
  .get(getPosts)
  .post(createPost);

router.get('/user/:userId', getPosts);

router
  // .get('/posts', getPosts)
  .route('/:postId')
  .get(getPost)
  .put(editPost)
  .delete(deletePost);

router
  .route('/:postId/reply')
  .get(getReplies)
  .post(replyPost);

router.put('/like/:postId', likePost);
router.put('/unlike/:postId', unlikePost);

module.exports = router;
