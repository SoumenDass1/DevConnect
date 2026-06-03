const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getPublicProfile,
  searchUsers,
  uploadProfilePicture,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(searchUsers);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// LinkedIn Feature Routes
router.post('/profile-picture', protect, upload.single('avatar'), uploadProfilePicture);
router.post('/experience', protect, addExperience);
router.delete('/experience/:expId', protect, deleteExperience);
router.post('/education', protect, addEducation);
router.delete('/education/:eduId', protect, deleteEducation);

router.route('/:id').get(getPublicProfile);

module.exports = router;
