// global.js
export function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalQty = cart.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    if (totalQty > 0) {
      badge.textContent = totalQty;
      badge.style.display = 'inline';
    } else {
      badge.style.display = 'none';
    }
  }
}

// Modal close handlers
export function setupModalCloseListeners() {
  document.querySelector('.close')?.addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
    updateCartBadge();
  });

  window.addEventListener('click', (e) => {
    const modal = document.getElementById('productModal');
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}
