const Message = require('../models/Message');

// @desc    Get conversation between logged-in user and another user
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherUserId },
        { sender: otherUserId, recipient: req.user._id }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users the logged-in user has chatted with
// @route   GET /api/messages/conversations/list
// @access  Private
const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    }).populate('sender recipient', 'name title');

    // Extract unique users
    const usersMap = new Map();
    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === req.user._id.toString() ? msg.recipient : msg.sender;
      if (otherUser && !usersMap.has(otherUser._id.toString())) {
        usersMap.set(otherUser._id.toString(), otherUser);
      }
    });

    res.json(Array.from(usersMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage, getConversations };
