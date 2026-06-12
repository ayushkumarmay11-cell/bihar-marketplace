import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon"><ShoppingBag size={18} /></div>
              <span>Bihar<span style={{ color: 'var(--primary)' }}>Bazaar</span></span>
            </div>
            <p className="footer-tagline">
              Bihar's trusted marketplace for buying and selling second-hand goods.
              From electronics to furniture — find great deals near you.
            </p>
            <div className="footer-badges">
              <span className="badge badge-orange">🔒 Safe Trading</span>
              <span className="badge badge-blue">📍 Bihar Only</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Browse All Items</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/list-item">Sell an Item</Link></li>
              <li><Link to="/dashboard">My Dashboard</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/?category=Electronics">📱 Electronics</Link></li>
              <li><Link to="/?category=Furniture">🪑 Furniture</Link></li>
              <li><Link to="/?category=Vehicles">🚗 Vehicles</Link></li>
              <li><Link to="/?category=Books">📚 Books</Link></li>
              <li><Link to="/?category=Agricultural+Tools">🌾 Agricultural Tools</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4>Bihar Divisions</h4>
            <ul>
              <li>Patna • Gaya • Muzaffarpur</li>
              <li>Bhagalpur • Darbhanga • Nalanda</li>
              <li>Munger • Saharsa • Purnea</li>
              <li>Saran • Sitamarhi • Vaishali</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} BiharBazaar. Made with ❤️ for Bihar.</p>
          <p className="footer-disclaimer">
            Always meet in public places and verify items before payment. Stay safe!
          </p>
        </div>
      </div>
    </footer>
  );
}
