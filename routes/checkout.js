// routes/checkout.js
const express = require('express');
const router = express.Router();
const { handleCheckout } = require('../controllers/checkoutController');

router.post('/', handleCheckout);

module.exports = router;
