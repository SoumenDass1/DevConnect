const Post = require('../models/Post');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');

// @desc    Get all posts (Global Feed)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name title profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get timeline feed (Connections + Own posts)
// @route   GET /api/posts/feed
// @access  Private
const getFeedPosts = async (req, res) => {
  try {
    // Find all accepted connections
    const acceptedConnections = await Connection.find({
      $or: [
        { requester: req.user._id, status: 'accepted' },
        { recipient: req.user._id, status: 'accepted' }
      ]
    });

    const connectionIds = acceptedConnections.map(c => 
      c.requester.toString() === req.user._id.toString() ? c.recipient : c.requester
    );

    // Feed includes own posts and connection posts
    const feedIds = [req.user._id, ...connectionIds];

    let posts = await Post.find({ user: { $in: feedIds } })
      .populate('user', 'name title profilePicture')
      .populate('comments.user', 'name profilePicture')
      .sort({ createdAt: -1 });

    // Fallback if feed has no posts, show global posts
    if (posts.length === 0) {
      posts = await Post.find()
        .populate('user', 'name title profilePicture')
        .populate('comments.user', 'name profilePicture')
        .sort({ createdAt: -1 });
    }

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name title profilePicture')
      .populate('comments.user', 'name profilePicture');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/posts/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const newPost = new Post({
      user: req.user._id,
      content: req.body.content,
      image: imageUrl,
    });

    const post = await newPost.save();
    
    // Populate user info before returning
    await post.populate('user', 'name title profilePicture');
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a post
// @route   PUT /api/posts/:id
// @access  Private
const editPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Verify ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this post' });
    }

    post.content = req.body.content || post.content;
    if (req.file) {
      post.image = `/uploads/posts/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      post.image = req.body.image;
    }

    const updatedPost = await post.save();
    await updatedPost.populate('user', 'name title profilePicture');
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Verify ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or Unlike a post (Toggle or Explicit)
// @route   PUT/POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user._id);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(userId => userId.toString() !== req.user._id.toString());
    } else {
      // Like
      post.likes.push(req.user._id);

      // Create Notification if not liking own post
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'like',
          post: post._id,
          text: `${req.user.name} liked your post.`,
        });
      }
    }
    
    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Explicit Unlike a post
// @route   DELETE /api/posts/:id/like
// @access  Private
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.likes = post.likes.filter(userId => userId.toString() !== req.user._id.toString());
    await post.save();
    res.json(post.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      user: req.user._id,
      name: req.user.name,
      text: req.body.text,
    };

    post.comments.push(newComment);
    await post.save();

    // Populate comments user details
    await post.populate('comments.user', 'name profilePicture');

    // Create Notification if commenting on someone else's post
    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        text: `${req.user.name} commented on your post: "${req.body.text.substring(0, 30)}..."`,
      });
    }

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment from a post
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.find(c => c._id.toString() === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment does not exist' });
    }

    // Verify ownership (comment author or post author can delete)
    if (comment.user.toString() !== req.user._id.toString() && post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
    await post.save();
    
    await post.populate('comments.user', 'name profilePicture');
    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
