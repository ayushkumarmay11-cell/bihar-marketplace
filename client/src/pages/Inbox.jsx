import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Inbox.css'; // Will create this

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const res = await api.get('/api/chat/inbox');
        setConversations(res.data);
      } catch (err) {
        console.error('Failed to load inbox:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  if (loading) {
    return <div className="loading-wrapper"><div className="spinner" /></div>;
  }

  return (
    <div className="inbox-page">
      <div className="container">
        <h1 className="inbox-title">
          <MessageSquare size={24} /> {t('inbox_title')}
        </h1>

        {conversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h3>{t('inbox_no_messages')}</h3>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              {t('nav_browse')} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="inbox-list">
            {conversations.map((convo) => (
              <div 
                key={convo.id} 
                className="inbox-card" 
                onClick={() => navigate(`/chat/${convo.id}`)}
              >
                <div className="inbox-card-left">
                  <div className="inbox-avatar">
                    {convo.otherUser.full_name[0].toUpperCase()}
                  </div>
                  <div className="inbox-details">
                    <div className="inbox-name">{convo.otherUser.full_name}</div>
                    <div className="inbox-role">
                      <span className={`badge ${convo.isBuying ? 'badge-blue' : 'badge-green'}`}>
                        {convo.isBuying ? t('inbox_buying') : t('inbox_selling')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="inbox-card-right">
                  <div className="inbox-item-info">
                    <img 
                      src={convo.item?.images?.[0] || 'https://via.placeholder.com/50'} 
                      alt={convo.item?.title} 
                      className="inbox-item-img"
                    />
                    <span className="inbox-item-title">{convo.item?.title}</span>
                  </div>
                  <ArrowRight size={18} className="inbox-arrow" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
