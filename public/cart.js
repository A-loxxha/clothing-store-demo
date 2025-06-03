console.log("Loaded cart.js on", window.location.pathname);
console.log("Stored cart:", localStorage.getItem("cart"));

document.addEventListener('DOMContentLoaded', () => {
  let cart;
  try {
    const stored = JSON.parse(localStorage.getItem('cart'));
    cart = Array.isArray(stored) ? stored : [];
  } catch (e) {
    cart = [];
  }
  console.log('Loaded cart:', cart);

  const cartButton         = document.getElementById('cart-button');
  const cartDropdown       = document.getElementById('cart-dropdown');
  const cartItemsContainer = document.getElementById('cart-items');
  const emptyMsg           = document.getElementById('empty-msg');
  const cartTotal          = document.getElementById('cart-total');
  const checkoutBtn        = document.getElementById('checkout-btn');

  if (cartButton && cartDropdown) {
    cartButton.addEventListener('click', () => {
      cartDropdown.style.display =
        cartDropdown.style.display === 'block' ? 'none' : 'block';
    });
  }

  // Save helper
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Saved cart:', cart);
  }

  // Render cart dropdown
  function updateCartMenu() {
    if (!cartItemsContainer || !emptyMsg || !cartTotal || !checkoutBtn) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      emptyMsg.style.display    = 'block';
      cartTotal.style.display   = 'none';
      checkoutBtn.style.display = 'none';
      return;
    }

    emptyMsg.style.display    = 'none';
    cartTotal.style.display   = 'block';
    checkoutBtn.style.display = 'block';

    cart.forEach(item => {
      total += item.price * item.quantity;

      const li = document.createElement('li');
      li.classList.add('cart-item');
      li.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="cart-thumb" />
        <div class="cart-details">
          <strong>${item.name}</strong><br/>
          Qty: ${item.quantity} — KES ${item.price * item.quantity}
        </div>
        <button class="remove-btn" data-id="${item.id}">✖</button>
      `;
      cartItemsContainer.appendChild(li);
    });

    cartTotal.textContent = `Total: KES ${total}`;

    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartMenu();
      });
    });
  }

  // GLOBAL handler for dynamic buttons
  document.body.addEventListener('click', (event) => {
  if (event.target.classList.contains('add-to-cart')) {
    handleAdd(event);
  }
});


  function handleAdd(event) {
    const button = event.currentTarget;
    const id    = button.dataset.id;
    const name  = button.dataset.name;
    const price = parseInt(button.dataset.price, 10);
    const img   = button.dataset.img;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ id, name, price, img, quantity: 1 });
    }

    saveCart();
    updateCartMenu();
  }

  // Initial call
  updateCartMenu();

  checkoutBtn?.addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });

  // Attach listeners to any add-to-cart buttons already present
  if (typeof window.attachAddToCartListeners === 'function') {
    window.attachAddToCartListeners();
  }
});

/////avoid undefined data saves

function handleAdd(event) {
  const button = event.currentTarget;
  const id    = button.dataset.id;
  const name  = button.dataset.name;
  const price = parseInt(button.dataset.price, 10);
  const img   = button.dataset.img;

  if (!id || !name || !price || !img) {
    console.warn('Invalid product data:', { id, name, price, img });
    return;
  }

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, name, price, img, quantity: 1 });
  }

  saveCart();
  updateCartMenu();
}

