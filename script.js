const API_BASE = 'http://localhost:3000/api';
let sessionId = localStorage.getItem('sessionId') || generateSessionId();

if (!localStorage.getItem('sessionId')) {
    localStorage.setItem('sessionId', sessionId);
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// User authentication functions
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function updateUserNavigation() {
    const user = getCurrentUser();
    const userActions = document.querySelector('.user-actions');

    if (userActions) {
        const signinLink = userActions.querySelector('.user-link');

        if (user) {
            // User is signed in
            signinLink.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
            signinLink.href = '#';
            signinLink.onclick = function(e) {
                e.preventDefault();
                showUserMenu();
            };
        } else {
            // User is not signed in
            signinLink.innerHTML = `<i class="fas fa-user"></i> Sign In`;
            signinLink.href = 'signin.html';
            signinLink.onclick = null;
        }
    }
}

function showUserMenu() {
    const user = getCurrentUser();
    if (!user) return;

    const existingMenu = document.querySelector('.user-dropdown-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.className = 'user-dropdown-menu';
    menu.innerHTML = `
        <div class="user-dropdown-header">
            <div class="user-dropdown-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div>
                <div class="user-dropdown-name">${user.name}</div>
                <div class="user-dropdown-email">${user.email}</div>
            </div>
        </div>
        <div class="user-dropdown-divider"></div>
        <a href="account.html" class="user-dropdown-item">
            <i class="fas fa-user-circle"></i> My Account
        </a>
        <a href="#" onclick="signOut()" class="user-dropdown-item">
            <i class="fas fa-sign-out-alt"></i> Logout
        </a>
    `;

    const userLink = document.querySelector('.user-link');
    if (userLink) {
        const container = userLink.parentElement;
        container.style.position = 'relative';
        container.appendChild(menu);

        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!container.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 0);
    }
}

// Forgot password functionality
function resetPasswordViaEmail(email) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
        alert('No account found with this email address');
        return false;
    }

    user.password = '123456';
    const updatedUsers = users.map(u => u.email === email ? user : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    alert('Password has been reset to 123456. Please sign in with your new password.');
    return true;
}

function signOut() {
    localStorage.removeItem('currentUser');
    location.reload();
}

// Sample products data with full descriptions
const sampleProducts = [
    { id: 1, name: 'Aam (Mango)', price: 150, description: 'Premium fresh mango sourced directly from orchards in Bangladesh. Rich in vitamins A and C, perfect for daily nutrition. Sweet taste, high quality, organic cultivation. Best during mango season. Delivery guaranteed fresh within 2 days.', image: 'mango.jpeg', category: 'Plants', rating: 4.8 },
    { id: 2, name: 'Decorative Green Plant', price: 200, description: 'Beautiful ornamental green plant perfect for indoor decoration. Low maintenance, air-purifying properties. Ideal for living rooms, offices, and bedrooms. Comes with basic care guide. Enhances home decor while improving air quality.', image: 'plant.png', category: 'Plants', rating: 4.6 },
    { id: 3, name: 'Knowledge Gardening Book', price: 300, description: 'Comprehensive guide to gardening and plant care. Covers soil preparation, watering techniques, pest control, and seasonal planting. Beautifully illustrated with 200+ photos. Perfect for beginners and experienced gardeners alike.', image: 'book.png', category: 'Books', rating: 4.9 },
    { id: 4, name: 'Organic Premium Seeds', price: 50, description: 'High-quality organic seeds for your garden. Includes vegetables, herbs, and flower seeds. 100% natural, no GMOs, no pesticides. Perfect germination rate. Includes detailed planting instructions for each variety.', image: 'flowers.jpeg', category: 'Plants', rating: 4.3 },
    { id: 5, name: 'Dragon Fruit Plant', price: 400, description: 'Exotic dragon fruit plant (Pitaya) ready for cultivation. Produces beautiful pink fruits with sweet taste. Requires 2-3 years for first fruiting. Includes care manual and fertilizer. Perfect for tropical gardens.', image: 'dragon.jpeg', category: 'Plants', rating: 5.0 },
    { id: 6, name: 'Pomegranate Plant', price: 500, description: 'Healthy pomegranate plant bearing sweet fruits. Known for high antioxidant content. Grows well in moderate climate. Produces fruits in 2-3 years. Comes with planting guide and basic fertilizer.', image: 'lebu.png', category: 'Plants', rating: 4.0 },
    { id: 7, name: 'Rose Plant - Mixed Colors', price: 200, description: 'Beautiful rose plant with fragrant flowers in red, pink, and white varieties. Perfect for gardens and decorative purposes. Year-round blooming with proper care. Includes pruning guide and fertilizer.', image: 'golap.jpeg', category: 'Plants', rating: 4.5 },
    { id: 8, name: 'Tulip Bulbs Collection', price: 850, description: 'Premium colorful tulip bulbs for spring gardening. Multiple color varieties included. Creates stunning garden displays. Imported from best growers. Includes planting depth guide and care instructions.', image: 'flowers.jpeg', category: 'Plants', rating: 4.0 },
    { id: 9, name: 'Garden Decor Set', price: 600, description: 'Complete decorative planter and accessory set for your garden. Includes ceramic pots, hanging planters, garden stakes, and decorative stones. Modern design, weather-resistant. Transform your garden into a paradise.', image: 'decoration.jpeg', category: 'Plants', rating: 4.2 },
    { id: 10, name: 'Areca Palm - Large Bush', price: 995, description: 'Large Bush Areca Palm with white premium planter. Elegant indoor plant, excellent air purifier. Height: 4-5 feet. Low maintenance, bright indirect light preferred. Perfect for modern home decoration.', image: 'plant.png', category: 'Plants', rating: 4.7 },
    { id: 11, name: 'Rhapis Palm - Medium', price: 1080, description: 'Medium size Bush Shape Rhapis Palm with black designer planter. Sophisticated indoor decoration. Non-toxic plant, safe for pets. Height: 3-4 feet. Slow growing, long-lasting investment.', image: 'plant.png', category: 'Plants', rating: 4.5 },
    { id: 12, name: 'Snake Plant Premium', price: 1295, description: 'Big size bushy Snake Plant with large golden white premium pot. One of the best air-purifying plants. Requires minimal care, very resilient. Height: 4-5 feet. Perfect for contemporary interior design.', image: 'alovera.jpeg', category: 'Plants', rating: 4.8 },
    { id: 13, name: 'Aloe Vera Plant', price: 180, description: 'Medicinal aloe vera plant for home use. Natural gel with healing properties. Excellent for skin care and minor burns. Low maintenance succulent. Thrives in sunny locations. Includes care guide.', image: 'alovera.jpeg', category: 'Plants', rating: 4.4 },
    { id: 14, name: 'Baganbilas Plant', price: 250, description: 'Traditional Bangladeshi flowering plant with beautiful purple flowers. Fragrant blooms, attracts butterflies. Easy to grow, suitable for balconies and gardens. Brings cultural beauty to your home.', image: 'baganbilas.jpg', category: 'Plants', rating: 4.2 },
    { id: 15, name: 'Pink Gerbera Flowers', price: 120, description: 'Beautiful pink gerbera flowers with stunning blooms. Fresh cut flowers, long-lasting. Perfect for decorations, gifts, and special occasions. Comes with flower food and care instructions.', image: 'beautiful-pink-gerbera-flowers-close-up_392895-346546.avif', category: 'Flowers', rating: 4.6 },
    { id: 16, name: 'Cosmos Flowers', price: 90, description: 'Colorful cosmos flower plant with vibrant pink, white, and orange blooms. Attracts butterflies and bees. Easy to grow, blooms throughout summer. Perfect for cottage gardens and balconies.', image: 'cosmos.jpg', category: 'Flowers', rating: 4.3 },
    { id: 17, name: 'CSE Book 1 - Data Structures', price: 450, description: 'Computer Science Engineering textbook on Data Structures and Algorithms. Comprehensive coverage with practical examples. Perfect for students and professionals. Well-illustrated with 500+ pages.', image: 'cse book 1.jpg', category: 'Books', rating: 4.7 },
    { id: 18, name: 'CSE Book - Advanced Concepts', price: 400, description: 'Advanced CSE concepts book covering database management, networking, and software engineering. In-depth explanations with real-world case studies. Essential reference for developers.', image: 'cse book.jpg', category: 'Books', rating: 4.8 },
    { id: 19, name: 'Professional Garden Decoration Service', price: 800, description: 'Expert garden decoration service by professional landscapers. Full garden design, plant arrangement, and installation. One-time service includes consultation. Transform your outdoor space beautifully.', image: 'decoration-service 1.jpeg', category: 'Services', rating: 4.9 },
    { id: 20, name: 'Premium Landscaping Service', price: 950, description: 'Comprehensive landscaping service with design, installation, and maintenance plan. Includes pathways, water features, and lighting. Professional team, 1-year follow-up care included.', image: 'decoration-service 2.jpeg', category: 'Services', rating: 4.8 },
    { id: 21, name: 'Basic Garden Setup Service', price: 700, description: 'Essential garden setup service for beginners. Includes soil preparation, basic planting, and care training. Perfect for first-time gardeners. One-time consultation and setup included.', image: 'decoration-service 3.jpeg', category: 'Services', rating: 4.5 },
    { id: 22, name: 'Science & Nature Educational Book', price: 350, description: 'Comprehensive science and nature educational book covering botany, ecology, and sustainable gardening. Beautifully illustrated with scientific accuracy. Perfect for students and nature enthusiasts.', image: 'science book.jpg', category: 'Books', rating: 4.6 },
    { id: 23, name: 'Sunflower Plant', price: 150, description: 'Bright yellow sunflower plant with large golden blooms. Cheerful garden addition, attracts beneficial insects. Tall variety, ideal for creating natural screens. Includes planting depth guide.', image: 'sunflower.jpg', category: 'Plants', rating: 4.4 }
];

// Fetch products (now from local data)
function loadProducts() {
    const products = sampleProducts;

    const section2 = document.querySelector('.shop-section2');
    const section3 = document.querySelector('.shop-section3');

    if (section2) {
        const products2 = products.slice(0, 6);
        populateSection(section2, products2);
    }

    if (section3) {
        const products3 = products.slice(6, 12);
        populateSection(section3, products3);
    }
}

function loadCategoryPageIfNeeded() {
    const category = document.body.dataset.category;
    const section = document.querySelector('.category-products');
    if (!category || !section) return;

    const products = sampleProducts.filter(p => p.category === category);
    renderCategoryProducts(section, products, category);
}

function renderCategoryProducts(section, products, category) {
    section.innerHTML = '';
    const heading = document.querySelector('.category-title');
    if (heading) {
        heading.textContent = `${category} Collection`;
    }

    if (products.length === 0) {
        section.innerHTML = `<div class="empty-state">No products found in ${category}.</div>`;
        return;
    }

    products.forEach(product => {
        const card = createProductCard(product);
        section.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'box';
    card.innerHTML = `
        <div class="box-content">
          <div class="box-img"></div>
          <h3 class="product-name"></h3>
          <div class="rating"></div>
          <a class="p-price"></a>
          <p class="product-description"></p>
          <a class="product-link" href="#">View Details</a>
          <p class="delivery">FREE Delivery</p>
          <div class="product-buttons">
              <button class="cart-button border">${product.category === 'Services' ? 'Book Service' : 'Add To Cart'}</button>
              <button class="buy-now-button border" ${product.category === 'Services' ? 'style="display: none;"' : ''}>Buy Now</button>
          </div>
        </div>
    `;
    const content = card.querySelector('.box-content');
    const imgDiv = content.querySelector('.box-img');
    imgDiv.style.backgroundImage = `url('${product.image}')`;
    imgDiv.setAttribute('aria-label', product.name);

    content.querySelector('.product-name').textContent = product.name;
    content.querySelector('.product-description').textContent = product.description;
    content.querySelector('.rating').innerHTML = generateStars(product.rating);
    content.querySelector('.p-price').textContent = `৳ ${product.price}`;
    const productLink = content.querySelector('.product-link');
    productLink.href = `product-detail.html?id=${product.id}`;

    const cartButton = content.querySelector('.cart-button');
    cartButton.setAttribute('data-product-id', product.id);
    if (product.category === 'Services') {
        cartButton.addEventListener('click', () => bookService(product.id));
    } else {
        cartButton.addEventListener('click', () => addToCart(product.id));
    }

    const buyNowButton = content.querySelector('.buy-now-button');
    if (buyNowButton && product.category !== 'Services') {
        buyNowButton.setAttribute('data-product-id', product.id);
        buyNowButton.addEventListener('click', () => buyNow(product.id));
    }

    return card;
}

function loadProductDetailPageIfNeeded() {
    const detailSection = document.querySelector('.product-detail');
    if (!detailSection) return;

    const productId = getQueryParam('id');
    if (!productId) {
        detailSection.innerHTML = '<p class="empty-state">Product not found.</p>';
        return;
    }

    const product = sampleProducts.find(p => p.id == productId);
    if (!product) {
        detailSection.innerHTML = '<p class="empty-state">Product not found.</p>';
        return;
    }
    renderProductDetail(product);
}

function renderProductDetail(product) {
    const imgEl = document.querySelector('.detail-image');
    const nameEl = document.querySelector('.detail-name');
    const descEl = document.querySelector('.detail-description');
    const priceEl = document.querySelector('.detail-price');
    const ratingEl = document.querySelector('.detail-rating');
    const addButton = document.querySelector('.detail-add-button');
    const categoryLink = document.querySelector('.detail-category-link');

    if (imgEl) imgEl.style.backgroundImage = `url('${product.image}')`;
    if (nameEl) nameEl.textContent = product.name;
    if (descEl) descEl.textContent = product.description;
    if (priceEl) priceEl.textContent = `৳ ${product.price}`;
    if (ratingEl) ratingEl.innerHTML = generateStars(product.rating);
    if (categoryLink) {
        categoryLink.href = `${product.category === 'Fruits' ? 'mango.html' : product.category === 'Books' ? 'book.html' : 'plant.html'}`;
        categoryLink.textContent = `View more ${product.category}`;
    }
    if (addButton) {
        addButton.setAttribute('data-product-id', product.id);
        addButton.addEventListener('click', () => addToCart(product.id));
    }

    // Add Buy Now button functionality
    const buyButton = document.querySelector('.detail-buy-button');
    if (buyButton) {
        buyButton.setAttribute('data-product-id', product.id);
        buyButton.addEventListener('click', () => buyNow(product.id));
    }
}

function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}

function populateSection(section, products) {
    const boxes = section.querySelectorAll('.box');
    boxes.forEach((box, index) => {
        const product = products[index];
        const content = box.querySelector('.box-content');
        if (!content || !product) return;

        // Update image
        const imgDiv = content.querySelector('.box-img');
        if (imgDiv) {
            imgDiv.style.backgroundImage = `url('${product.image}')`;
            imgDiv.setAttribute('aria-label', product.name);
        }

        // Update title
        const title = content.querySelector('.product-name') || content.querySelector('p');
        if (title) title.textContent = product.name;

        // Update description
        const descriptionEl = content.querySelector('.product-description');
        if (descriptionEl) {
            descriptionEl.textContent = product.description;
        }

        // Add rating
        let ratingDiv = content.querySelector('.rating');
        if (!ratingDiv) {
            ratingDiv = document.createElement('div');
            ratingDiv.className = 'rating';
            content.insertBefore(ratingDiv, content.querySelector('a.p-price'));
        }
        ratingDiv.innerHTML = generateStars(product.rating);

        // Update price
        const priceLink = content.querySelector('.p-price');
        if (priceLink) priceLink.textContent = `৳ ${product.price}`;

        // Add delivery if needed
        let deliveryP = content.querySelector('.delivery');
        if (!deliveryP) {
            deliveryP = document.createElement('p');
            deliveryP.className = 'delivery';
            deliveryP.textContent = 'FREE Delivery';
            const buttonsDiv = content.querySelector('.product-buttons') || content.querySelector('button').parentNode;
            content.insertBefore(deliveryP, buttonsDiv);
        }

        // Add product detail link if present
        const productLink = content.querySelector('.product-link');
        if (productLink) {
            productLink.textContent = 'View Details';
            productLink.href = `product-detail.html?id=${product.id}`;
        }

        // Update button data
        const cartButton = content.querySelector('.cart-button');
        const buyNowButton = content.querySelector('.buy-now-button');
        if (cartButton) {
            cartButton.setAttribute('data-product-id', product.id);
            if (product.category === 'Services') {
                cartButton.textContent = 'Book Service';
                if (buyNowButton) {
                    buyNowButton.style.display = 'none';
                }
            }
        }
        if (buyNowButton && product.category !== 'Services') {
            buyNowButton.setAttribute('data-product-id', product.id);
        }
    });
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    stars += ` <span>(${rating})</span>`;
    return stars;
}

// Cart functions
function initCart() {
    updateCartCount();
}

function addToCart(productId, quantity = 1) {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        alert('Please sign in to add items to your cart.');
        window.location.href = 'signin.html';
        return;
    }

    const product = sampleProducts.find(p => p.id == productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id == productId);
    if (existing) {
        existing.quantity = Number(existing.quantity || 0) + Number(quantity);
        existing.price = Number(existing.price || product.price);
        existing.total = Number(existing.price) * Number(existing.quantity);
    } else {
        cart.push({ id: productId, name: product.name, price: product.price, quantity: Number(quantity), total: Number(product.price) * Number(quantity) });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Added to cart!');
}

function buyNow(productId, quantity = 1) {
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        alert('Please sign in to purchase items.');
        window.location.href = 'signin.html';
        return;
    }

    const product = sampleProducts.find(p => p.id == productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id == productId);
    if (existing) {
        existing.quantity = Number(existing.quantity || 0) + Number(quantity);
        existing.price = Number(existing.price || product.price);
        existing.total = Number(existing.price) * Number(existing.quantity);
    } else {
        cart.push({ id: productId, name: product.name, price: product.price, quantity: Number(quantity), total: Number(product.price) * Number(quantity) });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

    // Redirect to billing page
    window.location.href = 'billing.html';
}

function bookService(productId) {
    const product = sampleProducts.find(p => p.id == productId);
    if (!product) return;

    // Show booking form for services
    showServiceBookingForm(product);
}

function showServiceBookingForm(product) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'service-booking-modal';
    modal.innerHTML = `
        <div class="service-booking-overlay">
            <div class="service-booking-content">
                <div class="service-booking-header">
                    <h2>Book ${product.name}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="service-booking-body">
                    <div class="service-info">
                        <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                        <div>
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <p class="price">৳${product.price}</p>
                        </div>
                    </div>
                    <form id="serviceBookingForm" class="booking-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="customerName">Full Name *</label>
                                <input type="text" id="customerName" name="customerName" required>
                            </div>
                            <div class="form-group">
                                <label for="customerEmail">Email *</label>
                                <input type="email" id="customerEmail" name="customerEmail" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="customerPhone">Phone Number *</label>
                                <input type="tel" id="customerPhone" name="customerPhone" required>
                            </div>
                            <div class="form-group">
                                <label for="serviceDate">Preferred Date *</label>
                                <input type="date" id="serviceDate" name="serviceDate" required min="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="serviceAddress">Service Address *</label>
                            <textarea id="serviceAddress" name="serviceAddress" required placeholder="Enter your complete address"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="specialRequests">Special Requests</label>
                            <textarea id="specialRequests" name="specialRequests" placeholder="Any special requirements or instructions"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="cancel-btn">Cancel</button>
                            <button type="submit" class="book-btn">Book Service</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = modal.querySelector('#serviceBookingForm');

    const closeModal = () => {
        modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close on outside click
    modal.querySelector('.service-booking-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const bookingData = {
            serviceId: product.id,
            serviceName: product.name,
            customerName: formData.get('customerName'),
            customerEmail: formData.get('customerEmail'),
            customerPhone: formData.get('customerPhone'),
            serviceDate: formData.get('serviceDate'),
            serviceAddress: formData.get('serviceAddress'),
            specialRequests: formData.get('specialRequests'),
            price: product.price,
            bookingDate: new Date().toISOString(),
            status: 'confirmed'
        };

        // Save booking to localStorage
        const bookings = JSON.parse(localStorage.getItem('serviceBookings') || '[]');
        bookings.push(bookingData);
        localStorage.setItem('serviceBookings', JSON.stringify(bookings));

        alert(`Service booked successfully! Booking ID: ${Date.now()}`);
        closeModal();
    });
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function attachAddToCartHandlers() {
    document.querySelectorAll('.cart-button').forEach(button => {
        const productId = button.getAttribute('data-product-id');
        const product = sampleProducts.find(p => p.id == productId);

        if (product && product.category === 'Services') {
            button.addEventListener('click', () => bookService(productId));
        } else {
            button.addEventListener('click', () => {
                if (productId) {
                    addToCart(parseInt(productId));
                }
            });
        }
    });

    document.querySelectorAll('.buy-now-button').forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product-id');
            if (productId) {
                buyNow(parseInt(productId));
            }
        });
    });
}

// Checkout function (client-side)
function checkout(shippingAddress) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        alert('Cart is empty');
        return null;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.05;
    const shipping = 50;
    const total = subtotal + tax + shipping;

    const orderId = 'ORD' + Date.now();

    return {
        orderId,
        subtotal,
        tax,
        shipping,
        total,
        items: cart,
        shippingAddress
    };
}

// Load invoice (not needed, but keep for compatibility)
function loadInvoice(orderId) {
    // For client-side, invoice is generated locally
    return null;
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchBtn');

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (!query) return;

    let results = sampleProducts.filter(product => {
        return product.name.toLowerCase().includes(query) ||
               product.description.toLowerCase().includes(query) ||
               product.category.toLowerCase().includes(query);
    });

    if (results.length > 0) {
        // Store search results and redirect to gallery with filter
        localStorage.setItem('searchResults', JSON.stringify(results));
        localStorage.setItem('searchQuery', query);
        window.location.href = 'gallery.html?search=' + encodeURIComponent(query);
    } else {
        alert('No products found for "' + query + '".');
    }
}

function loadBestsellers() {
    const bestsellersGrid = document.getElementById('bestsellersGrid');
    if (!bestsellersGrid) return;

    // Get top 8 products by rating for bestsellers
    const bestsellers = sampleProducts
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);

    bestsellersGrid.innerHTML = '';
    bestsellers.forEach((product, index) => {
        const bestsellerCard = document.createElement('div');
        bestsellerCard.className = 'bestseller-card';
        bestsellerCard.innerHTML = `
            <div class="bestseller-badge">#${index + 1}</div>
            <div class="bestseller-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="bestseller-content">
                <h4 class="bestseller-title">${product.name}</h4>
                <div class="bestseller-rating">${generateStars(product.rating)}</div>
                <div class="bestseller-price">৳ ${product.price}</div>
                <div class="bestseller-buttons">
                    <button class="bestseller-btn buy-btn" onclick="buyNow(${product.id})">
                        <i class="fas fa-bolt"></i> Buy
                    </button>
                    <button class="bestseller-btn cart-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <a href="product-detail.html?id=${product.id}" class="bestseller-btn view-btn">
                        <i class="fas fa-eye"></i> View Details
                    </a>
                </div>
                <div class="bestseller-category">${product.category}</div>
            </div>
        `;
        bestsellersGrid.appendChild(bestsellerCard);
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadBestsellers();
    initCart();
    attachAddToCartHandlers();
    initSearch();
    loadProductDetailPageEnhanced();
    updateUserNavigation();
    updateUserNavLink();
});

function printInvoice() {
    window.print();
}

// ===== WISHLIST FUNCTIONS =====
function addToWishlist(productId) {
    const product = sampleProducts.find(p => p.id === productId);
    if (!product) return;

    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!wishlist.find(item => item.id === productId)) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        alert('Added to wishlist!');
    } else {
        alert('Already in wishlist!');
    }
}

// ===== ORDERS FUNCTIONS =====
function saveOrder(orderData) {
    const orderId = 'ORD' + Date.now();
    const orderDate = new Date().toISOString();

    let orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    orders.push({
        id: orderId,
        ...orderData,
        date: orderDate,
        status: 'Pending'
    });
    localStorage.setItem('userOrders', JSON.stringify(orders));

    // Also save to all orders for admin
    let allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    allOrders.push({
        id: orderId,
        ...orderData,
        date: orderDate,
        status: 'Pending',
        customerName: (getCurrentUser() || {}).name || (orderData.customer && orderData.customer.email) || 'Guest'
    });
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
}

// ===== FILTERING FUNCTIONS =====
function filterGallery(filter) {
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ===== SEARCH FUNCTIONS =====
function searchProducts(query) {
    if (!query.trim()) return [];

    const results = sampleProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );

    return results;
}

function performSearch(query) {
    if (query.trim() === '') {
        alert('Please enter a search term');
        return;
    }

    const results = searchProducts(query);
    localStorage.setItem('searchResults', JSON.stringify(results));
    window.location.href = 'gallery.html?search=' + encodeURIComponent(query);
}

// ===== CART MANAGEMENT FUNCTIONS =====
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartQuantity(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = parseInt(quantity);
        item.total = item.price * item.quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
}

// ===== UTILITY FUNCTIONS =====
function formatCurrency(amount) {
    return '৳' + parseFloat(amount).toLocaleString('en-BD', { maximumFractionDigits: 2 });
}

function getCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((sum, item) => sum + (item.total || 0), 0);
}

function getCartItemCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// ===== PRODUCT DETAIL ENHANCEMENTS =====
function loadRelatedProducts(categoryName) {
    const relatedProducts = sampleProducts.filter(p => p.category === categoryName).slice(0, 4);
    const relatedGrid = document.getElementById('relatedProducts');
    
    if (relatedGrid) {
        relatedGrid.innerHTML = relatedProducts.map(product => `
            <div class="product-card">
                <div class="product-image" style="background-image: url('${product.image}')"></div>
                <h4>${product.name}</h4>
                <div class="rating">${generateStars(product.rating)}</div>
                <p class="price">৳ ${product.price}</p>
                <a href="product-detail.html?id=${product.id}" class="btn-secondary">View Details</a>
            </div>
        `).join('');
    }
}

function loadProductReviews(productId) {
    const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    const productReviews = reviews.filter(r => r.productId == productId);
    const reviewsList = document.getElementById('reviewsList');
    
    if (!reviewsList) return;
    
    if (productReviews.length === 0) {
        reviewsList.innerHTML = '<p class="empty-state">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviewsList.innerHTML = productReviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <strong>${review.userName}</strong>
                <div class="review-rating">${generateStars(review.rating)}</div>
            </div>
            <p class="review-date">${new Date(review.date).toLocaleDateString()}</p>
            <p class="review-text">${review.text}</p>
        </div>
    `).join('');
}

function submitReview(productId, rating, reviewText) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please sign in to submit a review');
        window.location.href = 'signin.html';
        return;
    }
    
    let reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
    reviews.push({
        productId: productId,
        userName: user.name,
        rating: parseInt(rating),
        text: reviewText,
        date: new Date().toISOString()
    });
    localStorage.setItem('reviews', JSON.stringify(reviews));
    
    // Reload reviews
    loadProductReviews(productId);
    alert('Review submitted successfully!');
    document.getElementById('reviewForm').reset();
}

function setupProductDetailPage() {
    const detailSection = document.querySelector('.product-detail-container');
    if (!detailSection) return;

    const productId = getQueryParam('id');
    if (!productId) return;

    const product = sampleProducts.find(p => p.id == productId);
    if (!product) return;

    // Setup wishlist button
    const wishlistBtn = document.querySelector('.detail-wishlist-button');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => addToWishlist(productId));
    }

    // Setup review form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const rating = document.getElementById('reviewRating').value;
            const text = document.getElementById('reviewText').value;
            submitReview(productId, rating, text);
        });
    }

    // Load related products and reviews
    loadRelatedProducts(product.category);
    loadProductReviews(productId);
}

// ===== ACCOUNT PAGE FUNCTIONS =====
function editProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    const newName = prompt('Enter new name:', user.name);
    if (newName && newName.trim()) {
        user.name = newName.trim();
        localStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('userName').textContent = user.name;
        alert('Profile updated successfully!');
    }
}

function addAddress() {
    const street = prompt('Enter street address:');
    if (!street) return;
    
    const city = prompt('Enter city:');
    if (!city) return;
    
    const state = prompt('Enter state/province:');
    if (!state) return;
    
    const zipcode = prompt('Enter zipcode:');
    if (!zipcode) return;
    
    const phone = prompt('Enter phone number:');
    if (!phone) return;
    
    const label = prompt('Enter address label (e.g., Home, Office):');
    if (!label) return;
    
    let addresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
    addresses.push({ street, city, state, zipcode, phone, label });
    localStorage.setItem('userAddresses', JSON.stringify(addresses));
    
    if (window.loadUserAddresses) {
        loadUserAddresses();
    }
    
    alert('Address added successfully!');
}

function editAddress(index) {
    const addresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
    if (index >= addresses.length) return;
    
    const addr = addresses[index];
    const label = prompt('Enter address label:', addr.label);
    if (!label) return;
    
    const street = prompt('Enter street address:', addr.street);
    if (!street) return;
    
    const city = prompt('Enter city:', addr.city);
    if (!city) return;
    
    addresses[index] = { ...addr, label, street, city };
    localStorage.setItem('userAddresses', JSON.stringify(addresses));
    
    if (window.loadUserAddresses) {
        loadUserAddresses();
    }
    
    alert('Address updated successfully!');
}

// ===== UPDATE USER NAVIGATION =====
function updateUserNavLink() {
    const user = getCurrentUser();
    const userNavLink = document.getElementById('userNavLink');
    
    if (!userNavLink) return;
    
    if (user) {
        userNavLink.href = 'account.html';
        userNavLink.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
    } else {
        userNavLink.href = 'signin.html';
        userNavLink.innerHTML = '<i class="fas fa-user"></i> Sign In';
    }
}

// ===== ENHANCED PRODUCT DETAIL RENDERING =====
function renderProductDetailEnhanced(product) {
    const imgEl = document.querySelector('.detail-image');
    const nameEl = document.querySelector('.detail-name');
    const descEl = document.querySelector('.detail-description');
    const priceEl = document.querySelector('.detail-price');
    const ratingEl = document.querySelector('.detail-rating');
    const addButton = document.querySelector('.detail-add-button');
    const categoryLink = document.querySelector('.detail-category-link');
    const specsDiv = document.getElementById('productSpecs');

    if (imgEl) imgEl.style.backgroundImage = `url('${product.image}')`;
    if (nameEl) nameEl.textContent = product.name;
    if (descEl) descEl.textContent = product.description;
    if (priceEl) priceEl.textContent = `৳ ${product.price}`;
    if (ratingEl) ratingEl.innerHTML = generateStars(product.rating);
    
    // Add product specifications
    if (specsDiv) {
        specsDiv.innerHTML = `
            <div class="spec-item">
                <span class="spec-label">Category:</span>
                <span class="spec-value">${product.category}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Price:</span>
                <span class="spec-value">৳ ${product.price}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Rating:</span>
                <span class="spec-value">${product.rating}/5</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">Availability:</span>
                <span class="spec-value">In Stock</span>
            </div>
        `;
    }
    
    if (categoryLink) {
        categoryLink.href = `${product.category === 'Fruits' ? 'mango.html' : product.category === 'Books' ? 'book.html' : product.category === 'Flowers' ? 'flower.html' : product.category === 'Decoration' || product.category === 'Services' ? 'decoration.html' : 'plant.html'}`;
        categoryLink.textContent = `View more ${product.category}`;
    }
    
    if (addButton) {
        addButton.setAttribute('data-product-id', product.id);
        addButton.addEventListener('click', () => addToCart(product.id));
    }

    const buyButton = document.querySelector('.detail-buy-button');
    if (buyButton) {
        buyButton.setAttribute('data-product-id', product.id);
        buyButton.addEventListener('click', () => buyNow(product.id));
    }
}

// Update the loadProductDetailPageIfNeeded function to use enhanced rendering
const originalLoadProductDetail = loadProductDetailPageIfNeeded;
function loadProductDetailPageEnhanced() {
    const detailSection = document.querySelector('.product-detail');
    if (!detailSection) return;

    const productId = getQueryParam('id');
    if (!productId) {
        detailSection.innerHTML = '<p class="empty-state">Product not found.</p>';
        return;
    }

    const product = sampleProducts.find(p => p.id == productId);
    if (!product) {
        detailSection.innerHTML = '<p class="empty-state">Product not found.</p>';
        return;
    }
    renderProductDetailEnhanced(product);
    setupProductDetailPage();
}
