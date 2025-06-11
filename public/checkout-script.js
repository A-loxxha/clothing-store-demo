const API_BASE = 'https://clothing-store-demo.onrender.com';
const cart = JSON.parse(localStorage.getItem('cart')) || [];

// Elements
const cartItems = document.getElementById('cart-items');
const totalDisplay = document.getElementById('total-amount');
const paymentRadios = document.getElementsByName('payment_method');
const mpesaField = document.getElementById('mpesa-field');

let productStock = {};

async function fetchStock() {
  const res = await fetch(`${API_BASE}/api/products`);
  const products = await res.json();
  products.forEach(p => productStock[p._id] = p.stock || Infinity);
}

function renderCart() {
  // Render logic (same as before), hide/show mpesa field based on selection
  // ...
}

// Toggle visibility of Mpesa input
paymentRadios.forEach(r => r.addEventListener('change', () => {
  mpesaField.style.display = r.value === 'mpesa' ? 'block' : 'none';
}));

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const method = [...paymentRadios].find(r => r.checked).value;
  const form = e.target;

  const shipping = {
    full_name: form.fullName.value,
    address: form.address.value,
    city: form.city.value,
    postal_code: form.postal.value,
    country: form.country.value
  };

  const amount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const payload = {
    shipping,
    amount,
    currency: 'KES',
    payment_method: method,
  };

  if (method === 'mpesa') {
    let phone = form.mpesaPhone.value.trim();
    if (!/^07\d{8}$/.test(phone)) return alert('Enter a valid Safaricom number.');
    payload.phone_number = phone.replace(/^0/, '254');
  }

  try {
    const res = await fetch('https://your-server.com/api/pay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: form.fullName.value,
    email: 'user@example.com', // or collect from user
    phone,
    amount: totalKES,
    paymentMethod: payment // 'mpesa' or 'card'
  })
});
const data = await res.json();
if (data.success) {
  window.location.href = data.redirect_url; // Take user to Pesapal's checkout
}

  } catch (err) {
    console.error(err);
    alert('Error initiating Pesapal payment.');
  }
});

// Kick things off
fetchStock().then(renderCart);
    