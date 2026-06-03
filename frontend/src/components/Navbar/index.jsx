import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Poll for unread notification count
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        const unread = res.data.filter(n => !n.read).length;
        setUnreadNotifications(unread);
      } catch (err) {
        console.error('Failed to get notifications in navbar', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 6000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="navbar glass-panel">
      <div className="container navbar-container flex items-center justify-between">
        <Link to={user ? '/feed' : '/'} className="navbar-logo">
          Dev<span className="text-primary">Connect</span>
        </Link>

        {/* Navbar Search Bar */}
        <form onSubmit={handleSearch} className="navbar-search-form flex items-center">
          <div className="navbar-search-wrap flex items-center">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search developers, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="navbar-links flex items-center gap-md">
          {user ? (
            <>
              <Link to="/feed" className="nav-link">Home</Link>
              <Link to="/connections" className="nav-link">Connections</Link>
              <Link to="/messages" className="nav-link">Messages</Link>
              
              {/* Notifications Link with Badge */}
              <Link to="/notifications" className="nav-link notification-bell-link">
                <span>🔔</span>
                {unreadNotifications > 0 && (
                  <span className="notification-badge">{unreadNotifications}</span>
                )}
              </Link>

              <Link to={`/profile/${user._id}`} className="nav-link-avatar" title={user.name}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Avatar" className="nav-avatar-img" />
                ) : (
                  <div className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                )}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
