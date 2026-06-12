import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, CheckSquare, AlertCircle, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';

const CATEGORY_EMOJIS = {
  Electronics: '📱', Furniture: '🪑', Vehicles: '🚗',
  Books: '📚', Clothes: '👕', 'Agricultural Tools': '🌾', Other: '📦',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/items/seller/${user.id}`);
      setItems(res.data.items || []);
    } catch (err) {
      toast.error('Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSold = async (itemId, currentStatus) => {
    try {
      await api.put(`/api/items/${itemId}`, { is_sold: !currentStatus });
      setItems(items.map((item) =>
        item.id === itemId ? { ...item, is_sold: !currentStatus } : item
      ));
      toast.success(currentStatus ? 'Item marked as available!' : 'Item marked as sold!');
    } catch (err) {
      toast.error('Failed to update item status.');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setDeletingId(itemId);
    try {
      await api.delete(`/api/items/${itemId}`);
      setItems(items.filter((item) => item.id !== itemId));
      toast.success('Listing deleted.');
    } catch (err) {
      toast.error('Failed to delete listing.');
    } finally {
      setDeletingId(null);
    }
  };

  const activeItems = items.filter((i) => !i.is_sold);
  const soldItems = items.filter((i) => i.is_sold);

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-user-info">
            <div className="dashboard-avatar">{user?.full_name?.[0]?.toUpperCase()}</div>
            <div>
              <h1 className="dashboard-greeting">Hello, {user?.full_name?.split(' ')[0]}! 👋</h1>
              <p className="dashboard-district">📍 {user?.district} · {user?.email}</p>
            </div>
          </div>
          <Link to="/list-item" className="btn btn-primary">
            <Plus size={18} /> Post New Item
          </Link>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="dash-stat">
            <div className="dash-stat-num">{items.length}</div>
            <div className="dash-stat-label">Total Listings</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-num" style={{ color: 'var(--success)' }}>{activeItems.length}</div>
            <div className="dash-stat-label">Active</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-num" style={{ color: 'var(--text-muted)' }}>{soldItems.length}</div>
            <div className="dash-stat-label">Sold</div>
          </div>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="loading-wrapper"><div className="spinner" /></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No listings yet</h3>
            <p>Start selling your unused items today!</p>
            <Link to="/list-item" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <Plus size={16} /> Post Your First Item
            </Link>
          </div>
        ) : (
          <div className="dashboard-items">
            {items.map((item) => (
              <div key={item.id} className={`dash-item-card ${item.is_sold ? 'sold' : ''}`}>
                {/* Image */}
                <div className="dash-item-image">
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.title} />
                    : <span className="dash-item-emoji">{CATEGORY_EMOJIS[item.category] || '📦'}</span>
                  }
                  {item.is_sold && <div className="dash-sold-badge">SOLD</div>}
                </div>

                {/* Info */}
                <div className="dash-item-info">
                  <div>
                    <h3 className="dash-item-title">{item.title}</h3>
                    <div className="dash-item-meta">
                      <span className="badge badge-orange">₹{Number(item.price).toLocaleString('en-IN')}</span>
                      <span className="badge badge-gray">{item.category}</span>
                      <span className="badge badge-blue">{item.condition}</span>
                    </div>
                    <p className="dash-item-desc">{item.description?.slice(0, 100)}...</p>
                  </div>

                  <div className="dash-item-actions">
                    <button
                      id={`mark-sold-${item.id}`}
                      className={`btn btn-sm ${item.is_sold ? 'btn-secondary' : 'btn-outline'}`}
                      onClick={() => handleMarkSold(item.id, item.is_sold)}
                    >
                      <CheckSquare size={14} />
                      {item.is_sold ? 'Mark Available' : 'Mark Sold'}
                    </button>
                    <Link to={`/item/${item.id}`} className="btn btn-secondary btn-sm">
                      View
                    </Link>
                    <button
                      id={`delete-${item.id}`}
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                    >
                      <Trash2 size={14} />
                      {deletingId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
