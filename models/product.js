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
  imagePublicId: String,
  hoverImagePublicId: String,

}, { timestamps: true });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);