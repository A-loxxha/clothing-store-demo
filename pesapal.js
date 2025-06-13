const axios = require('axios');
require('dotenv').config();

const baseURL = "https://cybqa.pesapal.com";
let accessToken = '';

async function authenticate() {
  const authHeader = 'Basic ' + Buffer.from(
    `${process.env.PESAPAL_CONSUMER_KEY}:${process.env.PESAPAL_CONSUMER_SECRET}`
  ).toString('base64');

  const res = await axios.post(`${baseURL}/api/Auth/RequestToken`, null, {
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  accessToken = res.data.token;
  return accessToken;
}

async function initiatePayment(order) {
  if (!accessToken) await authenticate();

  const res = await axios.post(`${baseURL}/api/Transactions/SubmitOrderRequest`, order, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  return res.data;
}

module.exports = { authenticate, initiatePayment };