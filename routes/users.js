const express = require('express');
const { follow, getUser, getUsers, unfollow } = require('../controllers/users');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getUsers);
router.get('/:userId', getUser);
router.put('/follow/:requesteduser', protect, follow);
router.put('/unfollow/:requesteduser', protect, unfollow);

module.exports = router;
