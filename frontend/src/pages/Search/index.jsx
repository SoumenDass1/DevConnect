import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card';
import Input from '../../components/Input';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (searchKeyword = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/users?keyword=${searchKeyword}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when navigated from navbar with keyword
  useEffect(() => {
    const kw = searchParams.get('keyword') || '';
    setKeyword(kw);
    fetchUsers(kw);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(keyword);
  };

  return (
    <div className="search-container container animate-fade-in">
      <div className="search-header text-center mb-xl">
        <h2>Discover Developers</h2>
        <p className="text-muted">Find developers by name, title, or skills to collaborate with.</p>

        <form onSubmit={handleSearch} className="search-form mt-md mx-auto">
          <Input
            name="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by React, Node.js, Designer..."
          />
          <button type="submit" className="btn btn-primary ml-sm">Search</button>
        </form>
      </div>

      {loading ? (
        <div className="text-center mt-xl">Loading developers...</div>
      ) : (
        <div className="users-grid">
          {users.length === 0 && <p className="text-center w-full">No developers found matching your criteria.</p>}
          {users.map((u, i) => (
            <Card key={u._id} className={`user-card text-center animate-slide-up-delay-${i % 3 === 0 ? '1' : '2'}`}>
              <div className="user-avatar mx-auto">{u.name.charAt(0).toUpperCase()}</div>
              <h3>{u.name}</h3>
              <p className="user-title text-primary mb-sm">{u.title}</p>

              <div className="user-skills flex justify-center gap-xs mb-md">
                {u.skills && u.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="tech-badge">{skill}</span>
                ))}
                {u.skills && u.skills.length > 3 && <span className="tech-badge">+{u.skills.length - 3}</span>}
              </div>

              <Link to={`/profile/${u._id}`} className="btn btn-secondary btn-block">View Profile</Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
