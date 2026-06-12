import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Menu, X, Plus, User, LogOut, LayoutDashboard } from 'lucide-react';
import '../styles/Navbar.css';

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="navbar-logo-text">Bihar</span>
            <span className="navbar-logo-accent">Bazaar</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Browse</Link>
          {isLoggedIn ? (
            <>
              <Link to="/list-item" className="navbar-link">Sell Item</Link>
              <Link to="/dashboard" className="navbar-link">My Listings</Link>
              <div className="navbar-user">
                <div className="navbar-avatar">{user?.full_name?.[0]?.toUpperCase()}</div>
                <span className="navbar-username">{user?.full_name?.split(' ')[0]}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <Plus size={14} /> Register
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
          <Link to="/" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">Browse</Link>
          {isLoggedIn ? (
            <>
              <Link to="/list-item" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">
                <Plus size={16} /> Sell Item
              </Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">
                <LayoutDashboard size={16} /> My Listings
              </Link>
              <button onClick={handleLogout} className="navbar-mobile-link navbar-mobile-logout">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
