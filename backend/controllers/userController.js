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
      user.headline = req.body.headline || req.body.title || user.headline || user.title;
      user.profilePicture = req.body.profilePicture || user.profilePicture;
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

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const imageUrl = `/uploads/avatars/${req.file.filename}`;
    user.profilePicture = imageUrl;
    await user.save();

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add experience entry
// @route   POST /api/users/experience
// @access  Private
const addExperience = async (req, res) => {
  try {
    const { company, position, startDate, endDate, description } = req.body;
    
    if (!company || !position) {
      return res.status(400).json({ message: 'Company and Position are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.experience.push({
      company,
      position,
      startDate,
      endDate,
      description,
    });

    const updatedUser = await user.save();
    res.status(201).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete experience entry
// @route   DELETE /api/users/experience/:expId
// @access  Private
const deleteExperience = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.experience = user.experience.filter(
      (exp) => exp._id.toString() !== req.params.expId
    );

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add education entry
// @route   POST /api/users/education
// @access  Private
const addEducation = async (req, res) => {
  try {
    const { school, degree, field, graduationDate } = req.body;
    
    if (!school) {
      return res.status(400).json({ message: 'School is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.education.push({
      school,
      degree,
      field,
      graduationDate,
    });

    const updatedUser = await user.save();
    res.status(201).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete education entry
// @route   DELETE /api/users/education/:eduId
// @access  Private
const deleteEducation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.education = user.education.filter(
      (edu) => edu._id.toString() !== req.params.eduId
    );

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getPublicProfile,
  searchUsers,
  uploadProfilePicture,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation,
};
