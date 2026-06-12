const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabaseClient');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/items — Get all items with optional filters
router.get('/', async (req, res) => {
  const { category, search, district, min_price, max_price, page = 1, limit = 12 } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let query = supabase
      .from('items')
      .select(`
        *,
        profiles (full_name, phone, district)
      `, { count: 'exact' })
      .eq('is_sold', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    if (district) {
      query = query.eq('location', district);
    }
    if (min_price) {
      query = query.gte('price', parseInt(min_price));
    }
    if (max_price) {
      query = query.lte('price', parseInt(max_price));
    }

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      items: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    console.error('Get items error:', err);
    return res.status(500).json({ error: 'Server error fetching items.' });
  }
});

// GET /api/items/:id — Get single item
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        profiles (id, full_name, phone, district, email)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    return res.json({ item: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/items/upload — Upload images to Supabase Storage
router.post('/upload', authMiddleware, upload.array('images', 4), async (req, res) => {
  try {
    const uploadedUrls = [];
    for (const file of req.files) {
      const fileName = `${req.user.id}/${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
      
      const { data, error } = await supabase.storage
        .from('item-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ error: 'Storage error: ' + error.message });
      }

      const { data: urlData } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    return res.status(200).json({ urls: uploadedUrls });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Server error uploading images.' });
  }
});

// POST /api/items — Create new listing (protected)
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, price, category, condition, images, location } = req.body;
  const seller_id = req.user.id;

  if (!title || !description || !price || !category || !condition || !location) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const { data, error } = await supabase
      .from('items')
      .insert({
        title,
        description,
        price: parseFloat(price),
        category,
        condition,
        images: images || [],
        location,
        seller_id,
        is_sold: false,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ message: 'Item listed successfully!', item: data });
  } catch (err) {
    console.error('Create item error:', err);
    return res.status(500).json({ error: 'Server error creating item.' });
  }
});

// PUT /api/items/:id — Update item (protected, owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, price, category, condition, images, location, is_sold } = req.body;
  const userId = req.user.id;

  try {
    // Check ownership
    const { data: existing } = await supabase
      .from('items')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existing || existing.seller_id !== userId) {
      return res.status(403).json({ error: 'You can only edit your own listings.' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (condition !== undefined) updateData.condition = condition;
    if (images !== undefined) updateData.images = images;
    if (location !== undefined) updateData.location = location;
    if (is_sold !== undefined) updateData.is_sold = is_sold;

    const { data, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: 'Item updated successfully!', item: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error updating item.' });
  }
});

// DELETE /api/items/:id — Delete item (protected, owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Check ownership
    const { data: existing } = await supabase
      .from('items')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existing || existing.seller_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own listings.' });
    }

    const { error } = await supabase.from('items').delete().eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error deleting item.' });
  }
});

// GET /api/items/seller/:sellerId — Get all items by a seller
router.get('/seller/:sellerId', async (req, res) => {
  const { sellerId } = req.params;

  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ items: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
