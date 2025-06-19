// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/order');

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ error: 'Server error fetching orders' });
  }
});

module.exports = router;
