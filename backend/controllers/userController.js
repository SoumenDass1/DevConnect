const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.title = req.body.title || user.title;
      user.bio = req.body.bio || user.bio;
      user.resumeUrl = req.body.resumeUrl || user.resumeUrl;
      user.portfolioTheme = req.body.portfolioTheme || user.portfolioTheme;
      
      if (req.body.skills) {
        user.skills = req.body.skills;
      }
      if (req.body.socialLinks) {
        user.socialLinks = { ...user.socialLinks, ...req.body.socialLinks };
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public profile by ID
// @route   GET /api/users/:id
// @access  Public
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users
// @route   GET /api/users
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { title: { $regex: req.query.keyword, $options: 'i' } },
            { skills: { $regex: req.query.keyword, $options: 'i' } }
          ],
        }
      : {};

    const users = await User.find({ ...keyword }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { getUserProfile, updateUserProfile, getPublicProfile, searchUsers };
