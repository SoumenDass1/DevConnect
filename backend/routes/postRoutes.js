const express = require('express');
const router = express.Router();
const {
  getPosts,
  getFeedPosts,
  getPostById,
  createPost,
  editPost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get all posts or Create post
router.route('/')
  .get(protect, getPosts)
  .post(protect, upload.single('image'), createPost);

// Connection feed
router.route('/feed')
  .get(protect, getFeedPosts);

// Single post operations
router.route('/:id')
  .get(protect, getPostById)
  .put(protect, upload.single('image'), editPost)
  .delete(protect, deletePost);

// Like operations (Support POST, PUT toggle, and DELETE unlike)
router.route('/:id/like')
  .post(protect, likePost)
  .put(protect, likePost)
  .delete(protect, unlikePost);

// Comments
router.route('/:id/comment')
  .post(protect, addComment);

router.route('/:id/comment/:commentId')
  .delete(protect, deleteComment);

module.exports = router;
