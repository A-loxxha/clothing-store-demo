const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.PESAPAL_BASE_URL;
let accessToken = '';

async function authenticate() {
  const res = await axios.post(`${baseURL}/api/Auth/RequestToken`, {
    consumer_key: process.env.PESAPAL_CONSUMER_KEY,
    consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
  });

  accessToken = res.data.token;
  return accessToken;
}

async function initiatePayment(order) {
  if (!accessToken) await authenticate();

  const res = await axios.post(`${baseURL}/api/Transactions/SubmitOrderRequest`, order, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  return res.data;
}

module.exports = { authenticate, initiatePayment };
