import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/Card';
import './Connections.css';

const Connections = () => {
  const { user } = useContext(AuthContext);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const res = await api.get('/connections');
      setConnections(res.data);
    } catch (err) {
      console.error('Failed to fetch connections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await api.put(`/connections/${id}`, { status });
      fetchConnections();
    } catch (err) {
      console.error('Failed to update connection', err);
    }
  };

  if (loading) return <div className="text-center mt-xl">Loading connections...</div>;

  const pendingRequests = connections.filter(c => c.status === 'pending' && c.recipient._id === user._id);
  const myConnections = connections.filter(c => c.status === 'accepted');

  return (
    <div className="connections-container container animate-fade-in">
      <h2 className="mb-lg text-center">My Network</h2>
      
      <div className="grid gap-xl connections-grid">
        <div className="connection-column">
          <Card className="p-lg">
            <h3 className="mb-md">Pending Requests ({pendingRequests.length})</h3>
            {pendingRequests.length === 0 && <p className="text-muted">No pending requests.</p>}
            <div className="flex flex-col gap-sm">
              {pendingRequests.map(req => (
                <div key={req._id} className="connection-item flex items-center justify-between p-sm border-bottom">
                  <div className="flex items-center gap-sm">
                    <div className="post-avatar">{req.requester.name.charAt(0)}</div>
                    <div>
                      <h4 className="m-0">{req.requester.name}</h4>
                      <p className="text-muted m-0" style={{fontSize: '0.8rem'}}>{req.requester.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-xs">
                    <button onClick={() => handleAction(req._id, 'accepted')} className="btn btn-primary btn-sm">Accept</button>
                    <button onClick={() => handleAction(req._id, 'rejected')} className="btn btn-secondary btn-sm">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="connection-column">
          <Card className="p-lg">
            <h3 className="mb-md">My Connections ({myConnections.length})</h3>
            {myConnections.length === 0 && <p className="text-muted">You have no connections yet. Start exploring!</p>}
            <div className="flex flex-col gap-sm">
              {myConnections.map(conn => {
                const otherUser = conn.requester._id === user._id ? conn.recipient : conn.requester;
                return (
                  <div key={conn._id} className="connection-item flex items-center justify-between p-sm border-bottom">
                    <div className="flex items-center gap-sm">
                      <div className="post-avatar">{otherUser.name.charAt(0)}</div>
                      <div>
                        <h4 className="m-0">{otherUser.name}</h4>
                        <p className="text-muted m-0" style={{fontSize: '0.8rem'}}>{otherUser.title}</p>
                      </div>
                    </div>
                    <a href={`/profile/${otherUser._id}`} className="btn btn-secondary btn-sm">Profile</a>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Connections;
