// routes/products.js
const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const mongoose = require('mongoose');
const Product  = require('../models/product');
const fs       = require('fs');

const router = express.Router();

// ── Ensure uploads folder exists ──
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// ── Multer storage configuration ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// ── Helper to get base URL ──
const getBaseUrl = (req) =>
  process.env.NODE_ENV === 'production'
    ? 'https://clothing-store-demo.onrender.com'
    : `${req.protocol}://${req.get('host')}`;

// ── POST /api/products — create new product ──
router.post('/', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('🔹 Incoming POST body:', req.body);
    console.log('🔹 Incoming files:', req.files);

    // 1) Parse and sanitize discount
    let discountNum = parseInt(req.body.discount, 10);
    if (isNaN(discountNum) || discountNum < 0) discountNum = 0;
    if (discountNum > 100) discountNum = 100;
    const isOffer = discountNum > 0;

    // 2) Build image URLs
    const baseUrl = getBaseUrl(req);
    let imageUrl = '';
    let hoverImageUrl = '';

    if (req.files.image1 && req.files.image1.length > 0) {
      imageUrl = `${baseUrl}/uploads/${req.files.image1[0].filename}`;
    }
    if (req.files.image2 && req.files.image2.length > 0) {
      hoverImageUrl = `${baseUrl}/uploads/${req.files.image2[0].filename}`;
    }

    // 3) Create new product document
    const product = new Product({
      name:          req.body.name,
      price:         parseFloat(req.body.price) || 0,
      category:      req.body.category || '',
      stock:         parseInt(req.body.stock, 10) || 0,
      discount:      discountNum,
      isOffer,
      imageUrl,
      hoverImageUrl
    });

    const saved = await product.save();
    console.log('✅ Saved product:', saved);
    return res.status(201).json(saved);

  } catch (err) {
    console.error('❌ Error creating product:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/products — get all products ──
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    return res.json(products);
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /api/products/:id — update a product ──
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Parse and sanitize discount
    let discountNum = parseInt(req.body.discount, 10);
    if (isNaN(discountNum) || discountNum < 0) discountNum = 0;
    if (discountNum > 100) discountNum = 100;
    const isOffer = discountNum > 0;

    // Update fields
    const updateData = {
      name:     req.body.name,
      price:    parseFloat(req.body.price) || 0,
      category: req.body.category || '',
      stock:    parseInt(req.body.stock, 10) || 0,
      discount: discountNum,
      isOffer
    };

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('✅ Updated product:', updated);
    return res.json(updated);

  } catch (err) {
    console.error('❌ Error updating product:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /api/products/:id — delete a product ──
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('🗑️ Deleted product:', deleted);
    return res.json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error('❌ Error deleting product:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;