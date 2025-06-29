const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.PESAPAL_BASE_URL || "https://pay.pesapal.com";
let accessToken = '';

// 🧠 Utility: Log all axios responses cleanly
function logAxiosResponse(label, response) {
  console.log(`✅ ${label} SUCCESS:`, {
    status: response.status,
    data: response.data
  });
}

// 🧠 Utility: Log axios errors more verbosely
function logAxiosError(label, error) {
  if (error.response) {
    console.error(`❌ ${label} ERROR (Response):`, {
      status: error.response.status,
      data: error.response.data
    });
  } else if (error.request) {
    console.error(`❌ ${label} ERROR (Request):`, error.request);
  } else {
    console.error(`❌ ${label} ERROR (Message):`, error.message);
  }
}

// 🔐 Authenticate with Pesapal
async function authenticate() {
  console.log('🔐 Authenticating with Pesapal...');
  try {
    const res = await axios.post(`${baseURL}/api/Auth/RequestToken`, {
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
    });

    logAxiosResponse('AUTH', res);
    accessToken = res.data.token;
    console.log('🔑 Access Token received:', accessToken);
    return accessToken;
  } catch (error) {
    logAxiosError('AUTH', error);
    throw new Error("Failed to authenticate with Pesapal");
  }
}

// 🧾 Submit payment order
async function initiatePayment(order) {
  try {
    if (!accessToken) {
      console.log('ℹ️ No token available, calling authenticate()');
      await authenticate();
    }

    console.log('📤 Sending payment order to Pesapal:', order);

    const res = await axios.post(`${baseURL}/api/Transactions/SubmitOrderRequest`, order, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    logAxiosResponse('SUBMIT ORDER', res);
    return res.data;
  } catch (error) {
    logAxiosError('SUBMIT ORDER', error);
    throw new Error("Failed to initiate payment");
  }
}

// 🪪 Utility if needed externally
async function getToken() {
  if (!accessToken) {
    await authenticate();
  }
  return accessToken;
}

module.exports = {
  authenticate,
  initiatePayment,
  getToken
};
