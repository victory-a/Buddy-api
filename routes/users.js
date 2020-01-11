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
router.put('/follow/:requesteduser', protect, follow);
router.get('/:requesteduser/followers', protect, getUserFollowers);
router.get('/:requesteduser/following', protect, getUserFollowing);
router.put('/unfollow/:requesteduser', protect, unfollow);

module.exports = router;
