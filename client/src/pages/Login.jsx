import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.full_name?.split(' ')[0]}! 👋`);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel */}
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-logo">🔑</div>
            <h2>Welcome Back to<br />BiharBazaar</h2>
            <p>Sign in to manage your listings, discover deals, and connect with buyers and sellers across Bihar.</p>
            <div style={{ marginTop: '2rem' }}>
              <div className="login-testimonial">
                <div className="login-testimonial-avatar">R</div>
                <div>
                  <p className="login-testimonial-text">"Sold my old laptop in just 2 days! Great platform for Bihar."</p>
                  <p className="login-testimonial-name">— Rahul, Patna</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <LogIn size={28} className="auth-form-icon" />
              <h1>Sign In</h1>
              <p>Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="rajan@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <input
                    id="login-password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" className="btn btn-primary btn-full btn-lg"
                disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading
                  ? <><span className="btn-spinner" /> Signing in...</>
                  : <><LogIn size={18} /> Sign In</>
                }
              </button>
            </form>

            <p className="auth-switch" style={{ marginTop: '1.5rem' }}>
              New to BiharBazaar? <Link to="/register">Create a free account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
