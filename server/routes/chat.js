const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticateToken } = require('../middleware/authMiddleware');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Start a conversation or get existing one
router.post('/init', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const buyerId = req.user.id;

    // Get item to find seller
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('seller_id')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const sellerId = item.seller_id;

    if (buyerId === sellerId) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    // Check if conversation exists
    const { data: existingConvo, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('item_id', itemId)
      .eq('buyer_id', buyerId)
      .maybeSingle();

    if (existingConvo) {
      return res.json({ conversationId: existingConvo.id });
    }

    // Create new conversation
    const { data: newConvo, error: createError } = await supabase
      .from('conversations')
      .insert([{ item_id: itemId, buyer_id: buyerId, seller_id: sellerId }])
      .select('id')
      .single();

    if (createError) throw createError;

    res.status(201).json({ conversationId: newConvo.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all conversations for the user
router.get('/inbox', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // We get conversations where user is buyer or seller
    // And we join with items and profiles
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id, created_at,
        items ( id, title, images, is_sold ),
        buyer:buyer_id ( id, full_name, avatar_url ),
        seller:seller_id ( id, full_name, avatar_url )
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format data so it's easier for the frontend
    const formattedInbox = data.map(convo => {
      const isBuyer = convo.buyer.id === userId;
      const otherUser = isBuyer ? convo.seller : convo.buyer;
      
      return {
        id: convo.id,
        item: convo.items,
        otherUser,
        isBuying: isBuyer,
        created_at: convo.created_at
      };
    });

    res.json(formattedInbox);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a conversation
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of the conversation
    const { data: convo, error: convoError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .single();

    if (convoError || !convo) {
      return res.status(403).json({ error: 'Not authorized or conversation not found' });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content required' });
    }

    // Verify user is part of the conversation
    const { data: convo, error: convoError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .single();

    if (convoError || !convo) {
      return res.status(403).json({ error: 'Not authorized or conversation not found' });
    }

    const { data: message, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim()
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
