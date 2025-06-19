const express = require('express');
const router = express.Router();
const Order = require('../models/order');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/track?phone=2547XXXXXXX
router.get('/track', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  try {
    const orders = await Order.find({ 'shipping.phone': phone }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Tracking error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update status
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
