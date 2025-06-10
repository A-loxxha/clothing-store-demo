// server.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

// ── Routes ──
const productRoutes = require('./routes/products');
const userRoutes    = require('./routes/userRoutes'); // 👈 Added user auth routes

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──
app.use(cors());
app.use(express.json()); // for JSON bodies
// ── Serve static frontend files ──

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Optional: Handle default route to serve home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});


// ── API Routes ──
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes); // 👈 Add user routes under /api/users

// ── Connect to MongoDB ──
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
