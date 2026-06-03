import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/Card';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`);
      setPost(res.data);
    } catch (err) {
      console.error('Failed to get post', err);
      setError('Post not found or has been deleted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await api.put(`/posts/${post._id}/like`);
      setPost({ ...post, likes: res.data });
    } catch (err) {
      console.error('Failed to like post', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      setPost({ ...post, comments: res.data });
      setCommentText('');
    } catch (err) {
      console.error('Failed to submit comment', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await api.delete(`/posts/${post._id}/comment/${commentId}`);
      setPost({ ...post, comments: res.data });
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      navigate('/feed');
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return <div className="text-center mt-xl text-muted">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div className="container text-center mt-xl">
        <Card className="max-w-md mx-auto p-lg">
          <h3>Error</h3>
          <p className="text-muted mt-sm">{error || 'Post not found'}</p>
          <Link to="/feed" className="btn btn-primary mt-md inline-block">Back to Home Feed</Link>
        </Card>
      </div>
    );
  }

  const isLiked = post.likes.includes(user?._id);
  const isPostAuthor = post.user?._id?.toString() === user?._id?.toString();

  return (
    <div className="post-detail-container container animate-fade-in">
      <Card className="post-detail-card mx-auto">
        
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

          {isPostAuthor && (
            <button className="btn-action text-error" onClick={handleDeletePost}>🗑️ Delete Post</button>
          )}
        </div>

        {/* Post Content */}
        <div className="post-detail-content-area mb-md">
          <p className="post-content-full">{post.content}</p>
          {post.image && (
            <div className="post-detail-image-wrap mt-md">
              <img src={post.image} alt="Post Attachment" className="post-detail-img" />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="post-stats flex gap-md mt-sm mb-sm text-muted">
          <span>{post.likes.length > 0 && `❤️ ${post.likes.length} ${post.likes.length === 1 ? 'like' : 'likes'}`}</span>
          <span>{post.comments.length > 0 && `💬 ${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}`}</span>
        </div>

        <hr className="divider" />

        {/* Post Actions */}
        <div className="post-actions flex gap-lg mt-sm mb-md">
          <button className={`btn-action ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
            {isLiked ? '❤️' : '🤍'} Like
          </button>
          <span className="btn-action">💬 Comment</span>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <h3>Comments ({post.comments.length})</h3>

          <form onSubmit={handleCommentSubmit} className="comment-form flex gap-sm mt-md mb-lg">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="form-input flex-1"
              required
            />
            <button type="submit" className="btn btn-primary">Comment</button>
          </form>

          <div className="comments-list flex flex-col gap-sm">
            {post.comments.map((comment) => {
              const isCommentAuthor = comment.user?._id?.toString() === user?._id?.toString();
              const canDeleteComment = isCommentAuthor || isPostAuthor;

              return (
                <div key={comment._id} className="comment-item flex justify-between items-start p-sm">
                  <div className="flex gap-sm">
                    <Link to={`/profile/${comment.user?._id}`}>
                      {comment.user?.profilePicture ? (
                        <img src={comment.user.profilePicture} alt="Avatar" className="comment-avatar-img" />
                      ) : (
                        <div className="comment-avatar">
                          {comment.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>
                    <div className="comment-bubble">
                      <Link to={`/profile/${comment.user?._id}`} className="comment-author-name">
                        <strong>{comment.name}</strong>
                      </Link>
                      <p className="comment-text">{comment.text}</p>
                      <span className="text-muted block mt-xs" style={{ fontSize: '0.72rem' }}>
                        {timeAgo(comment.date)}
                      </span>
                    </div>
                  </div>

                  {canDeleteComment && (
                    <button className="btn-action text-error" onClick={() => handleDeleteComment(comment._id)}>
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </Card>
    </div>
  );
};

export default PostDetail;
