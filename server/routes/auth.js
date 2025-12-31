const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register Route - WITH BETTER ERROR LOGGING
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration request received');
    console.log('Request body:', req.body);

    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Validation failed: Missing fields');
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    console.log('✅ All fields provided');

    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('✅ User does not exist, creating new user...');

    // Create user
    const user = new User({ name, email, password });
    await user.save();

    console.log('✅ User created successfully:', user._id);

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Token generated');

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

    console.log('✅ Registration complete');

  } catch (error) {
    console.error('❌ Registration error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login request received');
    console.log('Request body:', req.body);

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('❌ Validation failed: Missing fields');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    console.log('🔍 Looking for user...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found');

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password incorrect');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Password correct');

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

    console.log('✅ Login complete');

  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error details:', error.message);
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get Current User (Protected Route Example)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;