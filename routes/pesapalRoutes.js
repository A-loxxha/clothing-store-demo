const express = require('express');
const router = express.Router();
const { authenticate, initiatePayment } = require('../pesapal');
const axios = require('axios');
const Order = require('../models/order');
const Product = require('../models/product'); // ✅ Import product model

// M-PESA Route
router.post('/mpesa', async (req, res) => {
  try {
    const token = await authenticate();
    const { phone, amount, cart, shipping } = req.body;

    // ✅ Check if stock is available
    for (const item of cart) {
      const product = await Product.findById(item.id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Not enough stock for ${item.name}` });
      }
    }

    const order = {
      id: `ORDER-${Date.now()}`,
      currency: 'KES',
      amount: parseFloat(amount).toFixed(2).toString(),
      description: 'Clothing Store Order',
      callback_url: 'https://yourdomain.com/thank-you.html',
      notification_id: process.env.PESAPAL_NOTIFICATION_ID,
      billing_address: {
        email_address: shipping.email || 'unknown@example.com',
        phone_number: shipping.phone || phone || '254700000000',
        country_code: 'KE',
        first_name: shipping.name || 'Customer',
        line_1: shipping.area || 'Nairobi',
        city: 'Nairobi'
      }
    };

    const response = await initiatePayment(order);

    // ✅ Save order
    const newOrder = new Order({
      cart,
      shipping,
      phone,
      paymentMethod: 'mpesa',
      totalAmount: parseFloat(amount)
    });
    await newOrder.save();

    // ✅ Reduce stock
    for (const item of cart) {
      await Product.findByIdAndUpdate(item.id, {
        $inc: { stock: -item.quantity }
      });
    }

    res.json({ success: true, ...response });
  } catch (err) {
    console.error('PESAPAL M-PESA ERROR:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to initiate M-Pesa payment' });
  }
});


// CARD Route
router.post('/initiate', async (req, res) => {
  try {
    const token = await authenticate();
    const { amount, cart, shipping } = req.body;

    // ✅ Check stock before saving
    for (const item of cart) {
      const product = await Product.findById(item.id);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Not enough stock for ${item.name}` });
      }
    }

    const order = {
      id: `ORDER-${Date.now()}`,
      currency: 'KES',
      amount: parseFloat(amount).toFixed(2).toString(),
      description: 'Clothing Store Card Payment',
      callback_url: 'https://yourdomain.com/thank-you.html',
      notification_id: process.env.PESAPAL_NOTIFICATION_ID,
      billing_address: {
        email_address: shipping.email || 'unknown@example.com',
        phone_number: shipping.phone || '254700000000',
        country_code: 'KE',
        first_name: shipping.name || 'Customer',
        line_1: shipping.area || 'Nairobi',
        city: 'Nairobi'
      }
    };

    const response = await initiatePayment(order);

    // ✅ Save order
    const newOrder = new Order({
      cart,
      shipping,
      phone: shipping.phone,
      paymentMethod: 'card',
      totalAmount: parseFloat(amount)
    });
    await newOrder.save();

    // ✅ Reduce stock
    for (const item of cart) {
      await Product.findByIdAndUpdate(item.id, {
        $inc: { stock: -item.quantity }
      });
    }

    res.json({ success: true, redirect_url: response.redirect_url });
  } catch (err) {
    console.error('PESAPAL CARD ERROR:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to initiate card payment' });
  }
});

module.exports = router;
