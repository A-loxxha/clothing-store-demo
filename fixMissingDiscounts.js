// utils/fixMissingDiscounts.js (optional utility script)
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/mabel_shop').then(async () => {
  const result = await Product.updateMany(
    { discount: { $exists: false } },
    { $set: { discount: 0, isOffer: false } }
  );
  console.log(`Updated ${result.modifiedCount} products`);
  mongoose.disconnect();
});
