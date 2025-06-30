const express = require('express');
const router = express.Router();
const { authenticate, initiatePayment } = require('../pesapal');
const Order = require('../models/order');
const Product = require('../models/product');

// ─────────────────────────────────────────────
// 🔁 Helper to validate product stock
async function validateStock(cart) {
  console.log('🔍 Validating stock for cart:', cart);
  for (const item of cart) {
    const product = await Product.findById(item.id);
    if (!product) {
      throw new Error(`Product with ID ${item.id} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Not enough stock for ${item.name}`);
    }
  }
  console.log('✅ Stock validation passed');
}

// ─────────────────────────────────────────────
// 💵 M-PESA Route
router.post('/mpesa', async (req, res) => {
  try {
  
    const token = await authenticate();
  

    const { phone, amount, cart, shipping } = req.body;

    await validateStock(cart);

    const order = {
      id: `ORDER-${Date.now()}`,
      currency: 'KES',
      amount: parseFloat(amount).toFixed(2).toString(),
      description: 'Clothing Store Order',
      callback_url: 'https://clothing-store-demo.onrender.com/thank-you.html',
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

    console.log('📦 Initiating M-Pesa order with Pesapal:', order);
    const response = await initiatePayment(order);
    console.log('✅ Pesapal responded:', response);

    const newOrder = new Order({
      cart,
      shipping,
      phone,
      paymentMethod: 'mpesa',
      totalAmount: parseFloat(amount)
    });
    await newOrder.save();
    console.log('💾 Order saved to DB');

    for (const item of cart) {
      await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.quantity } });
    }
    console.log('📉 Stock levels updated');

    res.json({ success: true, ...response });
  } catch (err) {
    console.error('❌ PESAPAL M-PESA ERROR:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to initiate M-Pesa payment' });
  }
});

// ─────────────────────────────────────────────
// 💳 CARD PAYMENT Route
router.post('/initiate', async (req, res) => {
  try {
    console.log("🚀 [INITIATE] Incoming card payment request");
    console.log("🛒 CART:", req.body.cart);
    console.log("📦 SHIPPING:", req.body.shipping);
    console.log("💰 AMOUNT:", req.body.amount);

    const token = await authenticate();
     console.log("✅ Authenticated, token:", token);
    const { amount, cart, shipping } = req.body;

    await validateStock(cart);

    const order = {
      id: `ORDER-${Date.now()}`,
      currency: 'KES',
      amount: parseFloat(amount).toFixed(2).toString(),
      description: 'Clothing Store Card Payment',
      callback_url: 'https://clothing-store-demo.onrender.com/thank-you.html',
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

    console.log('📦 Initiating Card order with Pesapal:', order);
    const response = await initiatePayment(order);
    console.log('✅ Pesapal responded:', response);

    const newOrder = new Order({
      cart,
      shipping,
      phone: shipping.phone,
      paymentMethod: 'card',
      totalAmount: parseFloat(amount)
    });
    await newOrder.save();
    console.log('💾 Order saved to DB');

    for (const item of cart) {
      await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.quantity } });
    }
    console.log('📉 Stock levels updated');

    res.json({ success: true, redirect_url: response.redirect_url });
  } catch (err) {
    console.error('💳 PESAPAL CARD ERROR:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to initiate card payment' });
  }
});

module.exports = router;
