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
    email: String,
    phone: String,
    area: String // Delivery location in Nairobi
  },
  paymentMethod: String, // "card", "mpesa", etc.
  totalAmount: Number,
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
