const express = require('express');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get messages for a room
router.get('/messages/:room', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room })
      .sort({ timestamp: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

module.exports = router;