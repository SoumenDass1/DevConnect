const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getPublicProfile,
  searchUsers,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(searchUsers);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/:id').get(getPublicProfile);

module.exports = router;
