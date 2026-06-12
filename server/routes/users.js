const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/users/:id — Get user profile
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, district, created_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/users/me — Update own profile (protected)
router.put('/me', authMiddleware, async (req, res) => {
  const { full_name, phone, district } = req.body;
  const userId = req.user.id;

  try {
    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (district) updateData.district = district;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: 'Profile updated successfully!', user: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error updating profile.' });
  }
});

module.exports = router;
