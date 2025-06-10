let navbar =document.querySelector('.navbar');

document.querySelector('#menu-btn').onclick = () =>{
    navbar.classList.toggle('active');
    
}

let searchForm =document.querySelector('.search-form');

document.querySelector('#search-btn').onclick = () =>{
    searchForm.classList.toggle('active');
    navbar.classList.remove('active');

}

///////////////////

 document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });

    document.querySelectorAll('.content').forEach(element => {
        observer.observe(element);
    });
});

 /////
 document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });

    document.querySelectorAll('.header').forEach(element => {
        observer.observe(element);
    });
});

//////category side menu///////

  const categoryToggle = document.querySelector('.category-toggle');
const categoryOverlay = document.getElementById('categoryOverlay');
const closeCategory = document.querySelector('.close-category');

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
  }, 300); // match the slide transition
});

// Optional: Close when clicking outside the sidebar
categoryOverlay.addEventListener('click', (e) => {
  if (e.target === categoryOverlay) {
    closeCategory.click();
  }
});







let cartItem =document.querySelector('.cart-items-container');

document.querySelector('#cart-btn').onclick = () =>{
    navbar.classList.remove('active');
}



window.onscroll = () =>{
    navbar.classList.remove('active');
}
const filterButtons = document.querySelectorAll('.filters');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.category;

    productCards.forEach(card => {
      const matches = category === 'all' || card.dataset.category === category;
      card.style.display = matches ? 'block' : 'none';
    });
  });
});

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('offers');   // or  '#offers'
  container.innerHTML = ''; // Clear static cards

  try {
    const res = await fetch('https://clothing-store-demo.onrender.com/api/products');
    const products = await res.json();

    if (!res.ok) throw new Error(products.error || 'Failed to fetch');

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
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Error loading products</p>';
  }
});

/**handle add to cart*/
document.addEventListener('DOMContentLoaded', () => {
  // Initialize cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Delegate click handler to dynamically loaded buttons
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
