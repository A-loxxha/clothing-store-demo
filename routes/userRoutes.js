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
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).send('Invalid or expired verification token');

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send(`
      <h2>Email Verified ✅</h2>
      <p>You can now <a href="/login.html">log in</a>.</p>
    `);
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).send('Server error during verification');
  }
});

///resend-verification///

const crypto = require('crypto');

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    const newToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = newToken;
    await user.save();

    await sendVerificationEmail(user.email, newToken); // ✅ Correct usage
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ message: 'Could not send email' });
  }
});




// ── Get Logged-in User ──
router.get('/me', requireLogin, async (req, res) => {
  try {
    // User is already attached by requireLogin middleware
    const user = req.user;

   if (!user.isVerified) {
  return res.status(403).json({ message: 'Please check your inbox and verify your email to continue.' });
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
