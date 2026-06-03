import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/Card';
import './Messages.css';

const Messages = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/messages/conversations/list');
        setConversations(res.data);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      }
    };
    fetchConversations();
  }, []);

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    if (activeChatUser) {
      fetchMessages(activeChatUser._id);
      // Simple polling for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(activeChatUser._id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeChatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUser) return;
    try {
      const res = await api.post('/messages', {
        recipientId: activeChatUser._id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="messages-container container flex animate-fade-in gap-md">
      {/* Sidebar: Conversations List */}
      <Card className="conversations-sidebar flex flex-col p-0">
        <h3 className="p-md border-bottom m-0">Chats</h3>
        <div className="conversations-list overflow-y-auto">
          {conversations.length === 0 && <p className="p-md text-muted">No conversations yet.</p>}
          {conversations.map(cUser => (
            <div 
              key={cUser._id} 
              className={`conversation-item flex items-center gap-sm p-md cursor-pointer border-bottom ${activeChatUser?._id === cUser._id ? 'active' : ''}`}
              onClick={() => setActiveChatUser(cUser)}
            >
              <div className="post-avatar">{cUser.name.charAt(0)}</div>
              <div>
                <h4 className="m-0">{cUser.name}</h4>
                <p className="text-muted m-0 truncate" style={{fontSize: '0.8rem', maxWidth: '150px'}}>{cUser.title}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="chat-main flex-1 flex flex-col p-0">
        {activeChatUser ? (
          <>
            <div className="chat-header p-md border-bottom flex items-center gap-sm">
              <div className="post-avatar">{activeChatUser.name.charAt(0)}</div>
              <h3 className="m-0">{activeChatUser.name}</h3>
            </div>
            
            <div className="chat-messages flex-1 p-md overflow-y-auto flex flex-col gap-sm">
              {messages.map((msg) => {
                const isMine = msg.sender === user._id;
                return (
                  <div key={msg._id} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                    {msg.content}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area p-md border-top flex gap-sm" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                className="form-input flex-1 m-0" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>Send</button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted">
            Select a conversation to start chatting
          </div>
        )}
      </Card>
    </div>
  );
};

export default Messages;
