const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { requireAdmin } = require('../middleware/auth');


// Multer for file parsing (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAdmin, upload.fields([{ name: 'image1' }, { name: 'image2' }]), async (req, res) => {

  try {
    const { name, price, discount, stock, category, size, color } = req.body;
    const files = req.files;

    if (!files || !files.image1 || files.image1.length === 0) {
      return res.status(400).json({ error: 'Main image is required.' });
    }

    // Helper to upload to Cloudinary
    const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'clothing-store' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result); // 👈 returns full result with public_id
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};


  const image1Result = await uploadToCloudinary(files.image1[0]);
  const image2Result = files.image2?.[0]
  ? await uploadToCloudinary(files.image2[0])
  : image1Result;

  const newProduct = new Product({
  name,
  price,
  discount,
  stock,
  category,
  size,
  color,
  imageUrl: image1Result.secure_url,
  hoverImageUrl: image2Result.secure_url,
  imagePublicId: image1Result.public_id,
  hoverImagePublicId: image2Result.public_id,
  isOffer: Number(discount) > 0
});



    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {

  try {
    // 🔥 Inject logic to set isOffer automatically
    const discount = Number(req.body.discount);
    req.body.isOffer = discount > 0;

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});


router.delete('/:id', requireAdmin, async (req, res) => {

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });

    // 🧼 Delete images from Cloudinary
    const idsToDelete = [product.imagePublicId, product.hoverImagePublicId].filter(Boolean);
    for (const publicId of idsToDelete) {
      await cloudinary.uploader.destroy(publicId);
    }

    await product.deleteOne();
    res.sendStatus(204);
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});


module.exports = router;
