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
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getUsers);
router.put('/photo', protect, profileImage);
router.get('/:userId', getUser);
router.put('/follow/:userId', protect, follow);
router.get('/:userId/followers', protect, getUserFollowers);
router.get('/:userId/following', protect, getUserFollowing);
router.put('/unfollow/:userId', protect, unfollow);

module.exports = router;
