const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Middleware: Require user to be logged in
 */
const requireLogin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized: Login required' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user; // ✅ Attach user info to request object
    next();
  } catch (err) {
    console.error('requireLogin error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware: Require user to be an admin
 */
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    req.user = user; // ✅ Attach admin info to request
    next();
  } catch (err) {
    console.error('requireAdmin error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  requireLogin,
  requireAdmin
};
