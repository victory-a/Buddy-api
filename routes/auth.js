const express = require('express');
const {
  register,
  login,
  logout,
  updateDetails,
  currentUser,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteUser
} = require('../controllers/auth');

const router = express.Router();

const { protect, authorize } = require('../middleware/index').auth;

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/currentuser', protect, authorize('user'), currentUser);
router.get('/logout', logout);
router.delete('/deleteuser', protect, deleteUser);

module.exports = router;
