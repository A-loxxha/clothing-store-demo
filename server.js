// server.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
const productRoutes = require('./routes/products');

app.use(express.static(path.join(__dirname, 'public')));


const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// ── Middleware ──
app.use(cors());
app.use(express.json()); // for JSON bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.redirect('/Home.html');
});

// ── Connect to MongoDB ──
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

