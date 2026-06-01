const Project = require('../models/Project');

// @desc    Get logged in user projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get projects by user ID (public)
// @route   GET /api/projects/user/:id
// @access  Public
const getProjectsByUser = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.params.id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  const { title, description, technologies, link, repoLink, imageUrl } = req.body;

  try {
    const project = new Project({
      user: req.user._id,
      title,
      description,
      technologies,
      link,
      repoLink,
      imageUrl,
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  const { title, description, technologies, link, repoLink, imageUrl } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (project && project.user.toString() === req.user._id.toString()) {
      project.title = title || project.title;
      project.description = description || project.description;
      project.technologies = technologies || project.technologies;
      project.link = link !== undefined ? link : project.link;
      project.repoLink = repoLink !== undefined ? repoLink : project.repoLink;
      project.imageUrl = imageUrl !== undefined ? imageUrl : project.imageUrl;

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found or user unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project && project.user.toString() === req.user._id.toString()) {
      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found or user unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProjects, getProjectsByUser, createProject, updateProject, deleteProject };
