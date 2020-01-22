const express = require('express');
const {
  follow,
  getUser,
  getUsers,
  unfollow,
  profileImage,
  getUserFollowers,
  getUserFollowing
} = require('../controllers/users');

const { getLikedPosts } = require('../controllers/posts');

const posts = require('./posts');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use('/:userId/posts', posts);

router.get('/', getUsers);
router.get('/:userId/liked', getLikedPosts);
router.put('/photo', protect, profileImage);
router.get('/:userId', getUser);
router.put('/follow/:userId', protect, follow);
router.get('/:userId/followers', protect, getUserFollowers);
router.get('/:userId/following', protect, getUserFollowing);
router.put('/unfollow/:userId', protect, unfollow);

module.exports = router;
