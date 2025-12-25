// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let filteredProducts = [...products];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const continueShopping = document.getElementById('continueShopping');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const sortFilter = document.getElementById('sortFilter');
const resetFilters = document.getElementById('resetFilters');
const productModal = document.getElementById('productModal');
const closeProduct = document.getElementById('closeProduct');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const toast = document.getElementById('toast');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
    updateCartCount();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    cartBtn.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartModal);
    closeProduct.addEventListener('click', closeProductModal);
    closeCheckout.addEventListener('click', closeCheckoutModal);
    continueShopping.addEventListener('click', closeCartModal);
    checkoutBtn.addEventListener('click', openCheckout);
    searchInput.addEventListener('input', handleSearch);
    categoryFilter.addEventListener('change', handleFilters);
    priceFilter.addEventListener('change', handleFilters);
    sortFilter.addEventListener('change', handleFilters);
    resetFilters.addEventListener('click', resetAllFilters);
    checkoutForm.addEventListener('submit', handleCheckout);
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) closeCartModal();
    });
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
    });
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeCheckoutModal();
    });
}

// Display Products
function displayProducts(productsToDisplay) {
    if (productsToDisplay.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280; padding: 3rem;">No products found</p>';
        return;
    }

    productsGrid.innerHTML = productsToDisplay.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.discount ? `<span class="product-badge">${product.discount}% OFF</span>` : ''}
            </div>
            <div class="product-content">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">${generateStars(product.rating)}</span>
                    <span class="review-count">(${product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="price">$${product.price.toFixed(2)}</span>
                    ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="quick-view-btn" onclick="openProductDetail(${product.id})">Quick View</button>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Generate Star Rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    return stars;
}

// Search Functionality
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
    applyFiltersAndSort();
}

// Filter Functionality
function handleFilters() {
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    let result = [...filteredProducts];

    // Category Filter
    const category = categoryFilter.value;
    if (category) {
        result = result.filter(p => p.category === category);
    }

    // Price Filter
    const priceRange = priceFilter.value;
    if (priceRange) {
        const [min, max] = priceRange === '500+' ? [500, Infinity] : priceRange.split('-').map(Number);
        result = result.filter(p => p.price >= min && p.price <= max);
    }

    // Sorting
    const sortBy = sortFilter.value;
    switch (sortBy) {
        case 'price-low':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            result.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
        default:
            result.sort((a, b) => b.id - a.id);
    }

    displayProducts(result);
}

function resetAllFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    priceFilter.value = '';
    sortFilter.value = 'newest';
    filteredProducts = [...products];
    applyFiltersAndSort();
}

// Product Detail Modal
function openProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('detailImage').src = product.image;
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailRating').textContent = generateStars(product.rating);
    document.getElementById('detailReviews').textContent = `${product.reviews} reviews`;
    document.getElementById('detailDescription').textContent = product.description;
    document.getElementById('detailPrice').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('detailOriginalPrice').textContent = `$${product.originalPrice.toFixed(2)}`;
    document.getElementById('detailSku').textContent = product.sku;
    document.getElementById('detailStock').textContent = `${product.stock} items`;
    document.getElementById('detailCategory').textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    document.getElementById('quantity').value = 1;

    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn.onclick = () => {
        addToCart(productId);
        closeProductModal();
        showToast(`${product.name} added to cart!`);
    };

    document.getElementById('qtyIncrease').onclick = () => {
        const input = document.getElementById('quantity');
        if (input.value < product.stock) input.value++;
    };

    document.getElementById('qtyDecrease').onclick = () => {
        const input = document.getElementById('quantity');
        if (input.value > 1) input.value--;
    };

    productModal.classList.add('active');
}

function closeProductModal() {
    productModal.classList.remove('active');
}

// Cart Management
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const quantity = parseInt(document.getElementById('quantity')?.value || 1);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    saveCart();
    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    displayCartItems();
    showToast('Item removed from cart');
}

function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        if (item.quantity === 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            displayCartItems();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = total;
}

// Cart Modal
function openCart() {
    cartModal.classList.add('active');
    displayCartItems();
}

function closeCartModal() {
    cartModal.classList.remove('active');
}

function displayCartItems() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-bag"></i><p>Your cart is empty</p></div>';
        document.querySelector('.cart-summary').style.display = 'none';
        document.querySelector('.cart-actions').style.display = 'none';
        return;
    }

    document.querySelector('.cart-summary').style.display = 'block';
    document.querySelector('.cart-actions').style.display = 'flex';

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        </div>
    `).join('');

    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Checkout
function openCheckout() {
    if (cart.length === 0) {
        showToast('Please add items to cart first', 'error');
        return;
    }
    checkoutModal.classList.add('active');
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
}

function handleCheckout(e) {
    e.preventDefault();
    showToast('Order placed successfully! 🎉', 'success');
    cart = [];
    saveCart();
    updateCartCount();
    checkoutForm.reset();
    closeCheckoutModal();
    closeCartModal();
    setTimeout(() => {
        location.reload();
    }, 2000);
}

// Toast Notifications
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast-notification show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Lazy Loading Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// Smooth scroll to sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
