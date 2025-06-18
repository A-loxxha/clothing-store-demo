// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  category: { type: String, default: '' },
  stock:    { type: Number, default: 0 },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isOffer: {
    type: Boolean,
    default: false
  },
  imageUrl:       { type: String, default: '' }, // main image
  hoverImageUrl:  { type: String, default: '' }  // second image (on hover)
}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);