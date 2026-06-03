const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, sendMessage);
router.route('/conversations/list').get(protect, getConversations);
router.route('/:userId').get(protect, getMessages);

module.exports = router;
