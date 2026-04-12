const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const createToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
  };

  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  const options = {
    expiresIn: '7d',
  };

  return jwt.sign(payload, secret, options);
};

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const emailStr = String(email).trim().toLowerCase();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
    if (!emailOk) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          'Database is not connected. Please ensure MongoDB is running and MONGODB_URI is correct.',
      });
    }

    const existingUser = await User.findOne({ email: emailStr });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const user = new User({
      name: String(name).trim(),
      email: emailStr,
      password,
    });
    await user.save();

    const token = createToken(user);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Error during signup:', err);
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    if (err && err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }

    if (err && /MongoServerSelectionError|ECONNREFUSED/i.test(String(err.message || err))) {
      return res.status(503).json({
        message:
          'Database is not connected. Please ensure MongoDB is running and MONGODB_URI is correct.',
      });
    }

    res.status(500).json({ message: err?.message || 'Error creating account.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          'Database is not connected. Please ensure MongoDB is running and MONGODB_URI is correct.',
      });
    }

    const emailStr = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: emailStr });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Error signing in.' });
  }
});

// List users for profile directory view (protected)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          'Database is not connected. Please ensure MongoDB is running and MONGODB_URI is correct.',
      });
    }

    const users = await User.find({}, { name: 1, email: 1, createdAt: 1 }).sort({ createdAt: -1 });
    return res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ message: 'Unable to fetch users.' });
  }
});

module.exports = router;

