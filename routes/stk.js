// backend/routes/stk.js
require('dotenv').config();

const express = require('express');
const axios = require('axios');
const router = express.Router();

const shortcode = '174379';
const passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2c2c61db1f1d1e6e5d7c49efb3b7c1df';
const consumerKey = 'DvuQ1fH1RbEbOB33XcTCcyM6UfIrFVuOSR7Qo6j89a4pAqjo';
const consumerSecret = 'ZytXcGGZ5QjGbXyGG4tuEn0tfwzot5ERVhP2uyQYhgnyArRK023V1dIGIAGrYMGj';
const callbackUrl = 'https://1297-105-160-79-18.ngrok-free.app /api/stk-callback'; // Must be HTTPS in production

// Generate base64 password
function generatePassword(timestamp) {
  return Buffer.from(shortcode + passkey + timestamp).toString('base64');
}

// Get access token
async function getToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
}

// STK Push route
  router.post('/', async (req, res) => {
  const { phone, amount } = req.body;
  try {
    const token = await getToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = generatePassword(timestamp);

    const stkRes = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: 'TestOrder',
      TransactionDesc: 'Checkout payment'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    res.json({ success: true, response: stkRes.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
