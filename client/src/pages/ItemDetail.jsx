import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Tag, Calendar, User, CheckCircle, Share2, Heart } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/ItemDetail.css';

const CATEGORY_EMOJIS = {
  Electronics: '📱', Furniture: '🪑', Vehicles: '🚗',
  Books: '📚', Clothes: '👕', 'Agricultural Tools': '🌾', Other: '📦',
};

const CONDITION_COLORS = {
  'Like New': 'badge-green', Good: 'badge-blue', Fair: 'badge-yellow', Old: 'badge-gray',
};

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/items/${id}`);
        setItem(res.data.item);
      } catch {
        toast.error('Item not found.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Could not copy link.');
    }
  };

  if (loading) {
    return <div className="loading-wrapper" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  }

  if (!item) return null;

  const emoji = CATEGORY_EMOJIS[item.category] || '📦';
  const conditionClass = CONDITION_COLORS[item.condition] || 'badge-gray';
  const hasImages = item.images && item.images.length > 0;
  const formattedDate = new Date(item.created_at).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const isOwner = user?.id === item.seller_id;

  return (
    <div className="item-detail-page">
      <div className="container">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={15} /> Back to listings
        </button>

        <div className="item-detail-grid">
          {/* Left: Images */}
          <div className="item-detail-images">
            <div className="item-main-image">
              {hasImages ? (
                <img src={item.images[selectedImage]} alt={item.title} />
              ) : (
                <div className="item-detail-placeholder">{emoji}</div>
              )}
              {item.is_sold && (
                <div className="item-detail-sold-banner">SOLD</div>
              )}
            </div>

            {hasImages && item.images.length > 1 && (
              <div className="item-thumbnails">
                {item.images.map((img, i) => (
                  <button
                    key={i}
                    id={`thumb-${i}`}
                    className={`item-thumb ${i === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="item-detail-info">
            <div className="item-detail-badges">
              <span className={`badge ${conditionClass}`}>{item.condition}</span>
              <span className="badge badge-orange">{emoji} {item.category}</span>
              {item.is_sold && <span className="badge badge-red">Sold</span>}
            </div>

            <h1 className="item-detail-title">{item.title}</h1>

            <div className="item-detail-price">
              ₹{Number(item.price).toLocaleString('en-IN')}
            </div>

            <div className="item-detail-meta-list">
              <div className="item-detail-meta-row">
                <MapPin size={15} /> <span>{item.location}, Bihar</span>
              </div>
              <div className="item-detail-meta-row">
                <Calendar size={15} /> <span>Listed on {formattedDate}</span>
              </div>
              <div className="item-detail-meta-row">
                <Tag size={15} /> <span>{item.category} · {item.condition}</span>
              </div>
            </div>

            <div className="divider" />

            <h3 className="item-detail-section-label">Description</h3>
            <p className="item-detail-description">{item.description}</p>

            <div className="divider" />

            {/* Seller Card */}
            <div className="seller-card">
              <div className="seller-avatar">
                {item.profiles?.full_name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div className="seller-info">
                <div className="seller-name">
                  <User size={14} />
                  {item.profiles?.full_name || 'Seller'}
                </div>
                <div className="seller-location">
                  <MapPin size={13} /> {item.profiles?.district || item.location}
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isOwner && !item.is_sold && (
              <div className="item-detail-actions">
                {isLoggedIn ? (
                  showPhone ? (
                    <a
                      id="call-seller-btn"
                      href={`tel:+91${item.profiles?.phone}`}
                      className="btn btn-primary btn-full btn-lg"
                    >
                      <Phone size={18} />
                      Call: +91 {item.profiles?.phone}
                    </a>
                  ) : (
                    <button
                      id="show-phone-btn"
                      className="btn btn-primary btn-full btn-lg"
                      onClick={() => setShowPhone(true)}
                    >
                      <Phone size={18} />
                      Show Seller's Contact
                    </button>
                  )
                ) : (
                  <Link to="/login" className="btn btn-primary btn-full btn-lg">
                    <Phone size={18} />
                    Login to Contact Seller
                  </Link>
                )}
                <button id="share-btn" className="btn btn-secondary" onClick={handleShare}>
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            )}

            {isOwner && (
              <div className="item-detail-owner-actions">
                <div className="badge badge-blue" style={{ padding: '0.5rem 1rem' }}>
                  <CheckCircle size={14} /> This is your listing
                </div>
                <Link to="/dashboard" className="btn btn-secondary btn-sm">
                  Manage in Dashboard
                </Link>
              </div>
            )}

            {item.is_sold && (
              <div className="item-sold-notice">
                <span>🚫 This item has been sold.</span>
                <Link to="/" className="btn btn-secondary btn-sm">Browse More</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
