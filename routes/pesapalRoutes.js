// routes/pesapalRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, initiatePayment } = require('../pesapal');
const axios = require('axios');

router.post('/mpesa', async (req, res) => {
  try {
    const token = await authenticate();
    const { phone, amount, cart, shipping } = req.body;

    const order = {
      id: `ORDER-${Date.now()}`, // Unique order ID
      currency: 'KES',
      amount,
      description: 'Clothing Store Order',
      callback_url: 'https://yourdomain.com/thank-you.html', // or your real callback
      notification_id: process.env.PESAPAL_NOTIFICATION_ID,
      billing_address: {
        email_address: 'customer@example.com',
        phone_number: phone,
        country_code: 'KE',
        first_name: shipping.name || 'Customer',
        line_1: shipping.address,
        city: shipping.city
      }
    };
    console.log('Pesapal Order Payload:', order);

    const response = await initiatePayment(order);
    res.json({ success: true, ...response });
  } catch (err) {
    console.error('PESAPAL ERROR:', err.response?.data || err.message, err.stack);

    res.status(500).json({ success: false, message: 'Failed to initiate M-Pesa payment' });
  }
});

// Bank card + redirect-based payment route
router.post('/card', async (req, res) => {
  try {
    const token = await authenticate();
    const { phone, amount, cart, shipping } = req.body;

    const order = {
      id: `ORDER-${Date.now()}`,
      currency: 'KES',
      amount,
      description: 'Clothing Store Card Payment',
      callback_url: 'https://yourdomain.com/thank-you.html',
      notification_id: process.env.PESAPAL_NOTIFICATION_ID,
      billing_address: {
        email_address: 'customer@example.com',
        phone_number: phone,
        country_code: 'KE',
        first_name: shipping.name || 'Customer',
        line_1: shipping.address,
        city: shipping.city
      }
    };

    console.log('Pesapal Card Order Payload:', order);

    const response = await initiatePayment(order);

    // This contains a redirect_url
    res.json({ success: true, redirect_url: response.redirect_url });
  } catch (err) {
    console.error('PESAPAL CARD ERROR:', err.response?.data || err.message, err.stack);
    res.status(500).json({ success: false, message: 'Failed to initiate card payment' });
  }
});

module.exports = router;
