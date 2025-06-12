const Order = require('../models/order');
// const pesapal = require('../utils/pesapal'); // optionally import Pesapal SDK here

exports.handleCheckout = async (req, res) => {
  try {
    const { cart, shipping, payment, phone } = req.body;

    if (!cart || cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    if (!shipping || !payment) return res.status(400).json({ error: 'Missing data' });

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      cart,
      shipping,
      paymentMethod: payment,
      phone,
      totalAmount
    });

    await newOrder.save();

    // 👇 Trigger Pesapal payment
    // const response = await pesapal.initiatePayment({ phone, amount: totalAmount, method: payment });

    // Simulate successful STK push
    res.json({ success: true, message: 'Order saved. Payment initiated.' });

  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
