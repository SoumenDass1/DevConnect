import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      
      // Auto-mark notifications as read when visiting the page
      if (res.data.some(n => !n.read)) {
        await api.put('/notifications/read');
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <span className="noti-icon like">❤️</span>;
      case 'comment':
        return <span className="noti-icon comment">💬</span>;
      case 'connection_request':
        return <span className="noti-icon request">🤝</span>;
      case 'connection_accepted':
        return <span className="noti-icon accepted">🎉</span>;
      default:
        return <span className="noti-icon">🔔</span>;
    }
  };

  return (
    <div className="notifications-container container animate-fade-in">
      <Card className="notifications-card mx-auto">
        <div className="flex justify-between items-center mb-lg">
          <h2>Notifications</h2>
          <button className="btn btn-secondary btn-sm" onClick={fetchNotifications}>🔄 Refresh</button>
        </div>

        {loading ? (
          <div className="text-center text-muted">Loading notifications...</div>
        ) : (
          <div className="notifications-list flex flex-col gap-sm">
            {notifications.length === 0 ? (
              <p className="text-center text-muted p-lg">No notifications yet. Connect with others to start receiving updates!</p>
            ) : (
              notifications.map((noti) => (
                <div 
                  key={noti._id} 
                  className={`notification-item flex items-start gap-md p-md ${!noti.read ? 'unread' : ''}`}
                >
                  <div className="flex items-center gap-xs">
                    {getNotificationIcon(noti.type)}
                    <Link to={`/profile/${noti.sender?._id}`}>
                      {noti.sender?.profilePicture ? (
                        <img src={noti.sender.profilePicture} alt="Avatar" className="noti-avatar" />
                      ) : (
                        <div className="noti-avatar-placeholder">
                          {noti.sender?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>
                  </div>

                  <div className="flex-1">
                    <p className="noti-text">
                      <Link to={`/profile/${noti.sender?._id}`} className="noti-sender-name">
                        {noti.sender?.name}
                      </Link>{' '}
                      {noti.type === 'like' && 'liked your post.'}
                      {noti.type === 'comment' && 'commented on your post.'}
                      {noti.type === 'connection_request' && 'sent you a connection request.'}
                      {noti.type === 'connection_accepted' && 'accepted your connection request!'}
                    </p>
                    
                    {/* Excerpt of post or text details */}
                    {noti.post && (
                      <Link to={`/posts/${noti.post?._id}`} className="noti-post-preview">
                        "{noti.post.content?.substring(0, 80)}..."
                      </Link>
                    )}

                    {!noti.post && noti.text && noti.type === 'comment' && (
                      <p className="noti-comment-text">{noti.text.split(': "')[1]?.slice(0, -3)}</p>
                    )}

                    <span className="noti-time text-muted">{timeAgo(noti.createdAt)}</span>
                  </div>

                  {noti.type === 'connection_request' && (
                    <Link to="/connections" className="btn btn-secondary btn-xs">Manage</Link>
                  )}
                  {noti.post && (
                    <Link to={`/posts/${noti.post?._id}`} className="btn btn-secondary btn-xs">View</Link>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;
