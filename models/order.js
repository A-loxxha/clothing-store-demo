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
    name: String,
    address: String,
    city: String,
    postal: String,
    country: String
  },
  paymentMethod: String,
  phone: String,
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
