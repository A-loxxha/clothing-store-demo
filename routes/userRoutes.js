const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const crypto = require('crypto');
const sendVerificationEmail = require('../utils/sendEmail');
const sendEmail = require('../utils/sendEmail');


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
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Email Verified</title>
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        background: #f4f4f9;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }

      .message-box {
        background: white;
        padding: 40px 30px;
        border-radius: 15px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 400px;
      }

      h2 {
        color: #4CAF50;
        margin-bottom: 10px;
      }

      p {
        color: #555;
        font-size: 16px;
        margin-bottom: 20px;
      }

      a {
        display: inline-block;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
        transition: background-color 0.3s ease;
      }

      a:hover {
        background-color: #45a049;
      }
    </style>
  </head>
  <body>
    <div class="message-box">
      <h2>✅ Email Verified</h2>
      <p>Your email has been successfully verified.</p>
      <a href="https://clothing-store-demo.onrender.com/login.html">Login Now</a>
    </div>
  </body>
  </html>
`);

  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).send('Server error during verification');
  }
});

///resend-verification///

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

///////-----forgot-password-----//////

const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // You may reuse nodemailer logic

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;

    await sendEmail(user.email, {
      subject: 'Password Reset',
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background: #ceb974; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If the button doesn’t work, use this link:</p>
        <p>${resetLink}</p>
      `
    });

    res.json({ message: 'Reset link sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


///////-----reset-password-----/////////

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
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
