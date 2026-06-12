import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const BIHAR_DISTRICTS = [
  'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga', 'Nalanda',
  'Munger', 'Saharsa', 'Purnea', 'Saran', 'Sitamarhi', 'Vaishali',
  'Begusarai', 'Ara (Bhojpur)', 'Motihari (East Champaran)', 'Hajipur (Vaishali)',
  'Chapra (Saran)', 'Siwan', 'Gopalganj', 'Bettiah (West Champaran)',
  'Samastipur', 'Madhubani', 'Supaul', 'Araria', 'Kishanganj',
  'Katihar', 'Sheikhpura', 'Lakhisarai', 'Jamui', 'Banka', 'Nawada',
  'Aurangabad', 'Rohtas', 'Kaimur', 'Jehanabad', 'Arwal', 'Sheohar'
];

export default function Register() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', district: '', password: '', confirm_password: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required.';
    if (!form.email.includes('@')) errs.email = 'Enter a valid email.';
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit Indian phone number.';
    if (!form.district) errs.district = 'Please select your district.';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match.';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        district: form.district,
        password: form.password,
      });

      login(res.data.user, res.data.token);
      toast.success('🎉 Welcome to BiharBazaar!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side */}
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-logo">🛍️</div>
            <h2>Join Bihar's Biggest<br />Marketplace</h2>
            <p>Create a free account and start buying or selling today.</p>
            <ul className="auth-benefits">
              <li><CheckCircle size={16} /> Post unlimited free listings</li>
              <li><CheckCircle size={16} /> Connect with local buyers & sellers</li>
              <li><CheckCircle size={16} /> Manage your items from dashboard</li>
              <li><CheckCircle size={16} /> 100% free — no hidden charges</li>
            </ul>
          </div>
        </div>

        {/* Right Side — Form */}
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <UserPlus size={28} className="auth-form-icon" />
              <h1>Create Account</h1>
              <p>Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="full_name">Full Name</label>
                  <input id="full_name" name="full_name" type="text" className="form-input"
                    placeholder="Rajan Kumar" value={form.full_name} onChange={handleChange} />
                  {errors.full_name && <span className="form-error">{errors.full_name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input id="phone" name="phone" type="tel" className="form-input"
                    placeholder="9876543210" value={form.phone} onChange={handleChange} maxLength={10} />
                  {errors.phone && <span className="form-error">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input id="email" name="email" type="email" className="form-input"
                  placeholder="rajan@example.com" value={form.email} onChange={handleChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="district">District (Bihar)</label>
                <select id="district" name="district" className="form-select"
                  value={form.district} onChange={handleChange}>
                  <option value="">— Select your district —</option>
                  {BIHAR_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.district && <span className="form-error">{errors.district}</span>}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="input-with-icon">
                    <input id="password" name="password" type={showPass ? 'text' : 'password'}
                      className="form-input" placeholder="Min. 6 characters"
                      value={form.password} onChange={handleChange} />
                    <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="form-error">{errors.password}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="confirm_password">Confirm Password</label>
                  <input id="confirm_password" name="confirm_password"
                    type={showPass ? 'text' : 'password'} className="form-input"
                    placeholder="Repeat password" value={form.confirm_password} onChange={handleChange} />
                  {errors.confirm_password && <span className="form-error">{errors.confirm_password}</span>}
                </div>
              </div>

              <button id="register-submit" type="submit" className="btn btn-primary btn-full btn-lg"
                disabled={loading}>
                {loading ? <><span className="btn-spinner" /> Registering...</> : <><UserPlus size={18} /> Create Account</>}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
