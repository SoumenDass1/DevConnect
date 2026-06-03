const Connection = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Send connection request
// @route   POST /api/connections
// @access  Private
const sendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'Connection already exists or pending' });
    }

    const connection = new Connection({
      requester: req.user._id,
      recipient: recipientId
    });

    await connection.save();

    // Create Notification
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: 'connection_request',
      text: `${req.user.name} sent you a connection request.`,
    });

    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all connections and requests
// @route   GET /api/connections
// @access  Private
const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }]
    }).populate('requester recipient', 'name title profilePicture');

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update connection status
// @route   PUT /api/connections/:id
// @access  Private
const updateConnection = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    // Only recipient can accept/reject
    if (connection.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    connection.status = status;
    await connection.save();

    // Trigger notification and add to user arrays if accepted
    if (status === 'accepted') {
      await Notification.create({
        recipient: connection.requester,
        sender: req.user._id,
        type: 'connection_accepted',
        text: `${req.user.name} accepted your connection request.`,
      });

      // Populate user connection list for both users
      await User.findByIdAndUpdate(connection.requester, {
        $addToSet: { connections: connection.recipient }
      });
      await User.findByIdAndUpdate(connection.recipient, {
        $addToSet: { connections: connection.requester }
      });
    }

    res.json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendRequest, getConnections, updateConnection };
