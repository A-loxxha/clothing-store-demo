const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/sendEmail');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; // ✅ Now consistent

// ── Register ──
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    verificationToken
  });

  await sendVerificationEmail(user.email, verificationToken);

  res.status(201).json({ message: 'User registered. Check your email to verify your account.' });
});

// ── Login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'None',  
  maxAge: 7 * 24 * 60 * 60 * 1000
});




    res.json({
      message: 'Login successful',
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Logout ──
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  });
  res.json({ message: 'Logged out' });
});

// ── Create Verification Route ──
router.get('/verify/:token', async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token });

  if (!user) return res.status(400).send('Invalid or expired verification token.');

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.send('✅ Email verified! You can now log in.');
});


// ── Get Logged-in User ──
router.get('/me', requireLogin, async (req, res) => {
  try {
    // User is already attached by requireLogin middleware
    const user = req.user;

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    res.set('Cache-Control', 'no-store');
    return res.json(user); // No password included due to .select('-password') in middleware
  } catch (err) {
    console.error('Error in /me:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});



// ✅ Example admin-only route
router.get('/admin-check', requireAdmin, (req, res) => {

  res.json({ message: 'Welcome, admin!' });
});


module.exports = router;
