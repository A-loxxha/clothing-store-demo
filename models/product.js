const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  category: { type: String, default: '' },
  size: { type: String, required: true },
  color: { type: String, required: true },
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
  imageUrl:            { type: String, default: '' },
  hoverImageUrl:       { type: String, default: '' },
  imagePublicId:       { type: String, default: '' }, 
  hoverImagePublicId:  { type: String, default: '' }  
}, { timestamps: true });

// ✅ Automatically set isOffer before saving
productSchema.pre('save', function (next) {
  this.isOffer = this.discount > 0;
  next();
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
