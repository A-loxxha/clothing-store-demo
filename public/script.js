document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector('.navbar');
  const searchForm = document.querySelector('.search-form');
  const menuBtn = document.querySelector('#menu-btn');
  const searchBtn = document.querySelector('#search-btn');
  const cartBtn = document.querySelector('#cart-btn');
  const cartItem = document.querySelector('.cart-items-container');

  // Navbar toggle
  if (menuBtn) {
    menuBtn.onclick = () => navbar.classList.toggle('active');
  }

  if (searchBtn) {
    searchBtn.onclick = () => {
      searchForm.classList.toggle('active');
      navbar.classList.remove('active');
    };
  }

  if (cartBtn) {
    cartBtn.onclick = () => {
      navbar.classList.remove('active');
    };
  }

  window.onscroll = () => {
    navbar.classList.remove('active');
  };

  // Animate .content
  const contentObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('show');
    });
  });

  document.querySelectorAll('.content').forEach(el => contentObserver.observe(el));
  document.querySelectorAll('.header').forEach(el => contentObserver.observe(el));

  // Category sidebar toggle
  const categoryToggle = document.querySelector('.category-toggle');
  const categoryOverlay = document.getElementById('categoryOverlay');
  const closeCategory = document.querySelector('.close-category');

  if (categoryToggle && categoryOverlay && closeCategory) {
    categoryToggle.addEventListener('click', () => {
      categoryOverlay.classList.add('active');
      categoryOverlay.style.display = 'block';
      document.body.classList.add('no-scroll');
    });

    closeCategory.addEventListener('click', () => {
      categoryOverlay.classList.remove('active');
      setTimeout(() => {
        categoryOverlay.style.display = 'none';
        document.body.classList.remove('no-scroll');
      }, 300);
    });

    categoryOverlay.addEventListener('click', (e) => {
      if (e.target === categoryOverlay) closeCategory.click();
    });
  }

  // Filter products
  const filterButtons = document.querySelectorAll('.filters');
  const productCards = document.querySelectorAll('.product-card1');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      productCards.forEach(card => {
        const matches = category === 'all' || card.dataset.category === category;
        card.style.display = matches ? 'block' : 'none';
      });
    });
  });

  // Load offers if #offers container exists
  const container = document.getElementById('offers');
  if (container) {
    container.innerHTML = '';
    fetch('https://clothing-store-demo.onrender.com/api/products')
      .then(res => res.json())
      .then(products => {
        products.forEach(product => {
          const card = document.createElement('div');
          card.className = 'product-card1';
          card.setAttribute('data-category', product.category);
          card.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p class="price">KES.${product.price}</p>
            <button class="add-to-cart"
              data-id="${product._id}"
              data-name="${product.name}"
              data-price="${product.price}"
              data-img="${product.imageUrl}">
              Add to Cart
            </button>
          `;
          container.appendChild(card);
        });
      })
      .catch(err => {
        console.error(err);
        container.innerHTML = '<p>Error loading products</p>';
      });
  }

  // Handle add to cart
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      const btn = e.target;
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price);
      const img = btn.dataset.img;

      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id, name, price, img, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      alert(`${name} added to cart!`);
    }
  });
});
