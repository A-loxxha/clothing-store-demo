const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  cart: [{ 
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    img: String 
  }],
  shipping: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    area: { type: String, required: true } // e.g., "CBD", "Westlands"
  },
  paymentMethod: { type: String, default: 'card' },
  totalAmount: Number,
  status: {
    type: String,
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
