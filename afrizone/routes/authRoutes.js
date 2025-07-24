const express = require('express');
const router = express.Router();
const { 
  authUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile,
  addToFavorites,
  removeFromFavorites
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/login', authUser);
router.post('/register', registerUser);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/favorites/:id')
  .post(protect, addToFavorites)
  .delete(protect, removeFromFavorites);

module.exports = router;
