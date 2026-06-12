const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabaseClient');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, full_name, phone, district } = req.body;

  if (!email || !password || !full_name || !phone || !district) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // Insert into profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name,
        phone,
        district,
        email,
      });

    if (profileError) {
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(userId);
      return res.status(500).json({ error: 'Failed to create profile. Please try again.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email, full_name, district },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { id: userId, email, full_name, phone, district },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userId = authData.user.id;

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch user profile.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: userId, email: profile.email, full_name: profile.full_name, district: profile.district },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: profile,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.id)
      .single();

    return res.json({ user: profile });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
