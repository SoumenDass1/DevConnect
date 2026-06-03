import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/Card';
import './Feed.css';

/* Helper: renders post text with hashtag highlighting and newline support */
const PostContent = ({ text }) => {
  const parts = text.split(/(\s#\w+)/g);
  return (
    <p className="post-content">
      {text.split('\n').map((line, li) => (
        <span key={li}>
          {line.split(/(\s#\w+)/g).map((part, i) =>
            part.trim().startsWith('#')
              ? <span key={i} className="hashtag">{part}</span>
              : part
          )}
          <br />
        </span>
      ))}
    </p>
  );
};

const Feed = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);

  // Inline comment states
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [inlineCommentText, setInlineCommentText] = useState('');

  const fetchPosts = async () => {
    try {
      // Fetch connection-filtered feed (GET /api/posts/feed)
      const res = await api.get('/posts/feed');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPosts(); 
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    const data = new FormData();
    data.append('content', content);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const res = await api.post('/posts', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPosts([res.data, ...posts]);
      setContent('');
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.put(`/posts/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data } : p));
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleInlineCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!inlineCommentText.trim()) return;

    try {
      const res = await api.post(`/posts/${postId}/comment`, { text: inlineCommentText });
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: res.data } : p));
      setInlineCommentText('');
    } catch (err) {
      console.error('Failed to submit comment inline', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="feed-container container flex gap-lg animate-fade-in">

      {/* ---- Left Sidebar: Mini Profile ---- */}
      <aside className="feed-sidebar">
        <Card className="profile-mini-card text-center sticky-top">
          <Link to={`/profile/${user?._id}`} className="avatar-link">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Avatar" className="profile-mini-avatar-img mx-auto" />
            ) : (
              <div className="profile-mini-avatar mx-auto">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <Link to={`/profile/${user?._id}`} className="post-author-link">
            <h3 className="profile-mini-name">{user?.name}</h3>
          </Link>
          <p className="text-muted profile-mini-title">{user?.title || 'Developer'}</p>
          <hr className="divider" />
          <div className="profile-mini-links flex flex-col gap-sm">
            <Link to={`/profile/${user?._id}`} className="sidebar-link">📋 View My Profile</Link>
            <Link to="/dashboard" className="sidebar-link">🗂 My Projects</Link>
            <Link to="/connections" className="sidebar-link">🤝 My Connections</Link>
            <Link to="/settings" className="sidebar-link">⚙️ Profile Settings</Link>
          </div>
        </Card>
      </aside>

      {/* ---- Main Feed ---- */}
      <main className="feed-main flex-1">

        {/* Create Post Box */}
        <Card className="create-post-card mb-lg animate-slide-up">
          <div className="flex items-center gap-sm mb-sm">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Avatar" className="post-avatar-img" />
            ) : (
              <div className="post-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            )}
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>What's your latest achievement, <strong>{user?.name?.split(' ')[0]}</strong>?</p>
          </div>
          
          <form onSubmit={handlePostSubmit} className="flex flex-col gap-sm">
            <textarea
              className="form-input post-textarea"
              rows="3"
              placeholder="Share an update, certificate milestone, or project award..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>

            {/* Image attachment preview */}
            {imagePreview && (
              <div className="image-attachment-preview">
                <img src={imagePreview} alt="Upload preview" className="attachment-img" />
                <button type="button" className="btn-close" onClick={() => { setImageFile(null); setImagePreview(''); }}>❌</button>
              </div>
            )}

            <div className="flex justify-between items-center mt-sm">
              <label className="btn btn-secondary pointer flex items-center gap-xs">
                📸 Attach Image
                <input type="file" onChange={handleImageChange} accept="image/*" className="hidden" />
              </label>
              
              <div className="flex gap-sm">
                <span className="text-muted" style={{ fontSize: '0.8rem', alignSelf: 'center' }}>
                  Use #hashtags
                </span>
                <button type="submit" className="btn btn-primary" disabled={!content.trim() && !imageFile}>
                  Post
                </button>
              </div>
            </div>
          </form>
        </Card>

        {/* Posts Feed */}
        {loading ? (
          <div className="text-center text-muted mt-xl">Loading feed...</div>
        ) : (
          <div className="posts-list flex flex-col gap-md">
            {posts.length === 0 && (
              <p className="text-center text-muted mt-xl">No posts yet. Share your first achievement!</p>
            )}
            {posts.map((post, i) => {
              const isLiked = post.likes.includes(user?._id);
              const isOwnPost = post.user?._id?.toString() === user?._id?.toString();
              const isCommentsExpanded = activeCommentPostId === post._id;

              return (
                <Card
                  key={post._id}
                  className={`post-card animate-slide-up-delay-${i % 2 === 0 ? '1' : '2'}`}
                >
                  {/* Post Header */}
                  <div className="post-header flex justify-between items-start mb-md">
                    <div className="flex items-center gap-sm">
                      <Link to={`/profile/${post.user?._id}`}>
                        {post.user?.profilePicture ? (
                          <img src={post.user.profilePicture} alt="Avatar" className="post-avatar-img-lg" />
                        ) : (
                          <div className="post-avatar-lg">
                            {post.user?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-col" style={{ gap: '2px' }}>
                        <Link to={`/profile/${post.user?._id}`} className="post-author-link">
                          <h4 className="post-author">{post.user?.name}</h4>
                        </Link>
                        <p className="text-muted post-author-title">{post.user?.title}</p>
                        <span className="post-date text-muted">{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>

                    {isOwnPost && (
                      <button className="btn-action text-error" onClick={() => handleDeletePost(post._id)}>
                        🗑️ Delete
                      </button>
                    )}
                  </div>

                  {/* Post Body */}
                  <PostContent text={post.content} />

                  {/* Post Image Attachment */}
                  {post.image && (
                    <div className="post-attachment-wrap mt-md mb-sm">
                      <img src={post.image} alt="Post attachment" className="post-attachment-img" />
                    </div>
                  )}

                  {/* Likes & Comments Count */}
                  <div className="post-stats flex justify-between mt-md mb-sm">
                    <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {post.likes.length > 0 && `❤️ ${post.likes.length} ${post.likes.length === 1 ? 'like' : 'likes'}`}
                    </span>
                    <Link to={`/posts/${post._id}`} className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {post.comments.length > 0 ? `${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}` : '0 comments'}
                    </Link>
                  </div>

                  <hr className="divider" />

                  {/* Action Buttons */}
                  <div className="post-actions flex gap-lg mt-sm">
                    <button
                      className={`btn-action ${isLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(post._id)}
                    >
                      {isLiked ? '❤️' : '🤍'} Like
                    </button>
                    
                    <button 
                      className="btn-action"
                      onClick={() => {
                        setActiveCommentPostId(isCommentsExpanded ? null : post._id);
                      }}
                    >
                      💬 Comment
                    </button>
                    
                    <Link to={`/posts/${post._id}`} className="btn-action">
                      ↗️ Open Thread
                    </Link>
                  </div>

                  {/* Inline Comments Section */}
                  {isCommentsExpanded && (
                    <div className="comments-section mt-md">
                      <form onSubmit={(e) => handleInlineCommentSubmit(e, post._id)} className="inline-comment-form flex gap-sm mt-sm mb-md">
                        <input
                          type="text"
                          className="form-input flex-1"
                          placeholder="Write a comment..."
                          value={inlineCommentText}
                          onChange={(e) => setInlineCommentText(e.target.value)}
                          required
                        />
                        <button type="submit" className="btn btn-primary btn-sm">Comment</button>
                      </form>

                      {post.comments.length > 0 && (
                        <div className="comments-list flex flex-col gap-sm">
                          {post.comments.slice(0, 3).map((comment, ci) => (
                            <div key={ci} className="comment-item flex gap-sm mt-sm">
                              {comment.user?.profilePicture ? (
                                <img src={comment.user.profilePicture} alt="Avatar" className="comment-avatar-img" />
                              ) : (
                                <div className="comment-avatar">
                                  {comment.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="comment-bubble">
                                <Link to={`/profile/${comment.user?._id}`} className="comment-name">
                                  <strong>{comment.name}</strong>
                                </Link>
                                <p className="comment-text">{comment.text}</p>
                              </div>
                            </div>
                          ))}
                          {post.comments.length > 3 && (
                            <Link to={`/posts/${post._id}`} className="text-primary block mt-xs text-center" style={{ fontSize: '0.8rem' }}>
                              View all {post.comments.length} comments
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;
