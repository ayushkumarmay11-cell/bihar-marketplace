import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import '../styles/ChatRoom.css'; // Will create this

export default function ChatRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/api/chat/${id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await api.post(`/api/chat/${id}`, { content: newMessage });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="loading-wrapper"><div className="spinner" /></div>;
  }

  return (
    <div className="chat-page">
      <div className="container chat-container">
        <div className="chat-header">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/inbox')}>
            <ArrowLeft size={16} /> {t('chat_back')}
          </button>
        </div>

        <div className="chat-box">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">Say hi! Start the conversation.</div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`chat-message ${isMe ? 'me' : 'other'}`}>
                    <div className="chat-bubble">{msg.content}</div>
                    <div className="chat-time">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder={t('chat_placeholder')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="chat-input"
            />
            <button 
              type="submit" 
              className="btn btn-primary chat-send-btn"
              disabled={sending || !newMessage.trim()}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
