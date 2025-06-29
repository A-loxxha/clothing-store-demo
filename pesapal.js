const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.PESAPAL_BASE_URL || "https://pay.pesapal.com";
let accessToken = '';

async function authenticate() {
  try {
    const res = await axios.post(`${baseURL}/v3/api/Auth/RequestToken`, {
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    });
    accessToken = res.data.token;
    return accessToken;
  } catch (error) {
    console.error("🔒 PESAPAL AUTH ERROR:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Pesapal");
  }
}

async function getToken() {
  if (!accessToken) {
    await authenticate();
  }
  return accessToken;
}

async function initiatePayment(order) {
  try {
    const token = await getToken();

    const res = await axios.post(`${baseURL}/v3/api/Transactions/SubmitOrderRequest`, order, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return res.data;
  } catch (error) {
    console.error("💳 PESAPAL ERROR:", error.response?.data || error.message);
    throw new Error("Failed to initiate payment");
  }
}

module.exports = { authenticate, initiatePayment };
