const express = require('express');
const { follow, getUser } = require('../controllers/users');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', getUser);
router.put('/follow/:requestedUser', protect, follow);

module.exports = router;
