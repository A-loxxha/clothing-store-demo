const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: String, // Optional if using JWT
  resetToken: String,              // ✅ Add this
  resetTokenExpires: Date 
});

module.exports = mongoose.model('User', userSchema);
