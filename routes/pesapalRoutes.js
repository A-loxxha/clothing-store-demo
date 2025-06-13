const express = require('express');
const router = express.Router();
const { authenticate, initiatePayment } = require('../pesapal');
const axios = require('axios');

// M-PESA Route
router.post('/mpesa', async (req, res) => {
  try {
    const token = await authenticate();
    const { phone, amount, cart, shipping } = req.body;

    const order = {
      id: `ORDER-${Date.now()}`,
      currency: 'KES',
      amount,
      description: 'Clothing Store Order',
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

    const response = await initiatePayment(order);
    console.log('Pesapal card payment response:', response);
    res.json({ success: true, ...response });
  } catch (err) {
  console.error('PESAPAL CARD ERROR:', err.response?.data || err.message);
  res.status(500).json({ success: false, message: 'Failed to initiate card payment' });
}
});

// CARD Route — fix route name to match frontend
router.post('/initiate', async (req, res) => {
  try {
    const token = await authenticate();
    const { amount, cart, shipping } = req.body;

    const order = {
      id: `ORDER-${Date.now()}`,
      currency: 'KES',
      amount,
      description: 'Clothing Store Card Payment',
      callback_url: 'https://yourdomain.com/thank-you.html',
      notification_id: process.env.PESAPAL_NOTIFICATION_ID,
      billing_address: {
        email_address: 'customer@example.com',
        phone_number: '254700000000', // Or get from shipping if available
        country_code: 'KE',
        first_name: shipping.name || 'Customer',
        line_1: shipping.address,
        city: shipping.city
      }
    };

    const response = await initiatePayment(order);
    res.json({ success: true, redirect_url: response.redirect_url });
  } catch (err) {
    console.error('PESAPAL CARD ERROR:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to initiate card payment' });
  }
});

module.exports = router;
