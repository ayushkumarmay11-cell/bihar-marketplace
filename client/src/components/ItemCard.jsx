import { Link } from 'react-router-dom';
import { MapPin, Tag, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/ItemCard.css';

const CATEGORY_EMOJIS = {
  Electronics: '📱',
  Furniture: '🪑',
  Vehicles: '🚗',
  Books: '📚',
  Clothes: '👕',
  'Agricultural Tools': '🌾',
  Other: '📦',
};

const CONDITION_COLORS = {
  'Like New': 'badge-green',
  Good: 'badge-blue',
  Fair: 'badge-yellow',
  Old: 'badge-gray',
};

export default function ItemCard({ item }) {
  const { t } = useLanguage();
  const emoji = CATEGORY_EMOJIS[item.category] || '📦';
  const conditionClass = CONDITION_COLORS[item.condition] || 'badge-gray';

  const imageUrl = item.images && item.images.length > 0
    ? item.images[0]
    : null;

  return (
    <Link to={`/item/${item.id}`} className="item-card card">
      <div className="item-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={item.title} loading="lazy" />
        ) : (
          <div className="item-card-placeholder">
            <span>{emoji}</span>
          </div>
        )}
        {item.is_sold && (
          <div className="item-card-sold-overlay">
            <span>{t('card_sold')}</span>
          </div>
        )}
        <div className="item-card-category-badge">
          {emoji} {item.category}
        </div>
      </div>

      <div className="card-body item-card-body">
        <h3 className="item-card-title">{item.title}</h3>

        <div className="item-card-price">
          ₹{Number(item.price).toLocaleString('en-IN')}
        </div>

        <div className="item-card-meta">
          <span className={`badge ${conditionClass}`}>{item.condition}</span>
          <span className="item-card-location">
            <MapPin size={12} />
            {item.location}
          </span>
        </div>
      </div>
    </Link>
  );
}
