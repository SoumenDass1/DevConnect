const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectsByUser,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProjects).post(protect, createProject);
router
  .route('/:id')
  .put(protect, updateProject)
  .delete(protect, deleteProject);
router.route('/user/:id').get(getProjectsByUser);

module.exports = router;
