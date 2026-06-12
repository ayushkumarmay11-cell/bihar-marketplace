import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, Menu, X, Plus, LogOut, LayoutDashboard, Mail } from 'lucide-react';
import '../styles/Navbar.css';

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="navbar-logo-text">Bihar</span>
            <span className="navbar-logo-accent">Bazaar</span>
          </div>
        </Link>

        <div className="navbar-links">
          <button className="lang-toggle" onClick={toggleLanguage} style={{ background: 'none', border: '1px solid #ddd', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginRight: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🌐 {language === 'en' ? 'हिन्दी' : 'EN'}
          </button>
          <Link to="/" className="navbar-link">{t('nav_browse')}</Link>
          {isLoggedIn ? (
            <>
              <Link to="/inbox" className="navbar-link">{t('nav_inbox')}</Link>
              <Link to="/list-item" className="navbar-link">{t('nav_sell')}</Link>
              <Link to="/dashboard" className="navbar-link">{t('nav_dashboard')}</Link>
              <div className="navbar-user">
                <div className="navbar-avatar">{user?.full_name?.[0]?.toUpperCase()}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> {t('nav_logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">{t('nav_login')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <Plus size={14} /> {t('nav_register')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile">
          <button className="lang-toggle" onClick={toggleLanguage} style={{ background: 'none', border: '1px solid #ddd', padding: '8px', margin: '16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: 'calc(100% - 32px)', justifyContent: 'center' }}>
            🌐 {language === 'en' ? 'Switch to Hindi (हिन्दी)' : 'Switch to English (EN)'}
          </button>
          <Link to="/" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">{t('nav_browse')}</Link>
          {isLoggedIn ? (
            <>
              <Link to="/inbox" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">
                <Mail size={16} /> {t('nav_inbox')}
              </Link>
              <Link to="/list-item" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">
                <Plus size={16} /> {t('nav_sell')}
              </Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">
                <LayoutDashboard size={16} /> {t('nav_dashboard')}
              </Link>
              <button onClick={handleLogout} className="navbar-mobile-link navbar-mobile-logout">
                <LogOut size={16} /> {t('nav_logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">{t('nav_login')}</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">{t('nav_register')}</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
