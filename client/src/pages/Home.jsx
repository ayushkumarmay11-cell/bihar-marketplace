import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, TrendingUp, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import ItemCard from '../components/ItemCard';
import '../styles/Home.css';
import '../styles/ItemCard.css';

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Vehicles', 'Books', 'Clothes', 'Agricultural Tools', 'Other'];
const DISTRICTS = [
  'All Districts', 'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga',
  'Nalanda', 'Munger', 'Saharsa', 'Purnea', 'Saran', 'Sitamarhi', 'Vaishali',
  'Begusarai', 'Ara', 'Motihari', 'Hajipur', 'Chapra', 'Siwan', 'Gopalganj'
];

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [district, setDistrict] = useState('All Districts');
  const [showFilters, setShowFilters] = useState(false);

  const fetchItems = async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 12 };
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      if (district !== 'All Districts') params.district = district;

      const res = await api.get('/api/items', { params });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
      setPage(pg);
    } catch (err) {
      console.error('Error fetching items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(1);
  }, [category, district]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(1);
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge animate-fadeInUp">
            <Zap size={13} />
            Bihar's #1 Second-Hand Marketplace
          </div>
          <h1 className="hero-title animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Buy & Sell Old Things<br />
            <span className="hero-title-accent">Across Bihar</span>
          </h1>
          <p className="hero-subtitle animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Find great deals on used electronics, furniture, vehicles, and more — from sellers in your district.
          </p>

          {/* Search Bar */}
          <form className="hero-search animate-fadeInUp" onSubmit={handleSearch} style={{ animationDelay: '0.3s' }}>
            <div className="hero-search-inner">
              <Search size={20} className="hero-search-icon" />
              <input
                id="home-search"
                type="text"
                placeholder="Search for mobile, cycle, sofa, books..."
                className="hero-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary hero-search-btn">
                Search
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="hero-stats animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="hero-stat">
              <span className="hero-stat-num">{total}+</span>
              <span className="hero-stat-label">Active Listings</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">38</span>
              <span className="hero-stat-label">Districts Covered</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">Free to Use</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="filters-section">
        <div className="container">
          <div className="filters-row">
            <div className="category-tags">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  id={`cat-${cat.replace(/\s/g, '-')}`}
                  className={`tag ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={15} />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="advanced-filters animate-fadeInUp">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">District</label>
                <select
                  className="form-select"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Listings Section */}
      <section className="section listings-section">
        <div className="container">
          <div className="listings-header">
            <div>
              <h2 className="section-title">
                {category !== 'All' ? `${category} Listings` : 'Latest Listings'}
              </h2>
              <p className="section-subtitle">
                {total} item{total !== 1 ? 's' : ''} found
                {district !== 'All Districts' ? ` in ${district}` : ' across Bihar'}
              </p>
            </div>
            <Link to="/list-item" className="btn btn-primary">
              <TrendingUp size={16} />
              Sell Your Item
            </Link>
          </div>

          {loading ? (
            <div className="loading-wrapper">
              <div>
                <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading listings...</p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No items found</h3>
              <p>Try changing filters or be the first to sell in this category!</p>
              <Link to="/list-item" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Post an Item <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  id={`page-${pg}`}
                  className={`pagination-btn ${pg === page ? 'active' : ''}`}
                  onClick={() => fetchItems(pg)}
                >
                  {pg}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon">🔒</div>
              <h3>Safe & Verified</h3>
              <p>All users are verified via email. Trade with confidence.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">📍</div>
              <h3>Bihar Focused</h3>
              <p>Built exclusively for Bihar — find buyers & sellers near you.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">💰</div>
              <h3>Completely Free</h3>
              <p>Post unlimited listings for free. No hidden charges ever.</p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">⚡</div>
              <h3>Quick Deals</h3>
              <p>Direct seller contact. No middlemen. Fast transactions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
