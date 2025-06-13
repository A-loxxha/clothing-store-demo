// server.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const { initiatePayment } = require('./pesapal');


// ── Routes ──
const productRoutes = require('./routes/products');
const userRoutes    = require('./routes/userRoutes'); // 👈 Added user auth routes
const checkoutRoutes = require('./routes/checkout'); //
const pesapalRoutes = require('./routes/pesapalRoutes');
console.log('checkoutRoutes loaded:', typeof checkoutRoutes); // should be 'function'

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json()); // for JSON bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));


// ── API Routes ──
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); // 👈 Add user routes under /api/users
app.use('/api/checkout', checkoutRoutes); // 👈 Add this below other app.use()
app.use('/api/pesapal', pesapalRoutes);

app.post('/api/pay', async (req, res) => {
  const { name, email, phone, amount, paymentMethod } = req.body;

  const order = {
    id: Date.now().toString(),
    currency: 'KES',
    amount,
    description: 'Fashion purchase',
    callback_url: process.env.CALLBACK_URL,
    notification_id: '',
    billing_address: {
      email_address: email,
      phone_number: phone,
      first_name: name,
      line_1: 'Address not provided',
      city: 'Nairobi',
      country_code: 'KE'
    }
  };

  try {
    const result = await initiatePayment(order);
    res.json({ success: true, redirect_url: result.redirect_url });
  } catch (err) {
  console.error('PESAPAL ERROR:', err.response?.data || err.message);
  res.status(500).json({ success: false, message: 'Failed to initiate M-Pesa payment' });
}

});

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// ── Connect to MongoDB ──
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

