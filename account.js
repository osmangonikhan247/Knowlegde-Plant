// Account Management Functions
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadUserOrders();
    loadUserMessages();
    loadUserAddresses();
    loadWishlist();

    // Check URL hash for tab switching
    const hash = window.location.hash.substring(1);
    if (hash) {
        switchTab(hash);
    }
});

function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }

    document.getElementById('userName').textContent = user.name || 'N/A';
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userPhone').textContent = user.phone || 'N/A';
    document.getElementById('userMemberSince').textContent = user.createdAt ?
        new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) :
        'N/A';
}

function loadUserOrders() {
    const user = getCurrentUser();
    if (!user) return;

    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const userOrders = orders.filter(order => order.customer.email === user.email);

    const ordersList = document.getElementById('ordersList');

    if (userOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-bag"></i>
                <p>No orders yet. Start shopping!</p>
                <a href="gallery.html" class="btn-primary">Browse Products</a>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = userOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3>Order #${order.id}</h3>
                    <p class="order-date">${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="order-status status-${order.status.toLowerCase()}">
                    ${order.status}
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} (x${item.quantity})</span>
                        <span>৳${item.total.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <strong>Total: ৳${order.total.toFixed(2)}</strong>
            </div>
            <div class="order-actions">
                <button class="btn-primary" onclick="viewOrderDetails('${order.id}')">Track Order</button>
            </div>
        </div>
    `).join('');
}

function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert('Order not found.');
        return;
    }

    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');

    const statusSteps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const progressHtml = `
        <div class="order-progress">
            ${statusSteps.map(step => `
                <div class="order-step ${statusSteps.indexOf(step) <= statusSteps.indexOf(order.status) ? 'active' : ''}">
                    <span class="step-dot"></span>
                    <span class="step-label">${step}</span>
                </div>
            `).join('')}
        </div>
    `;

    content.innerHTML = `
        <div class="order-details-card">
            <h3>Order #${order.id}</h3>
            <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            ${progressHtml}
            <div class="order-items-detail">
                <h4>Items</h4>
                ${order.items.map(item => `
                    <div class="order-item-detail">
                        <span>${item.name} (x${item.quantity})</span>
                        <span>৳${item.total.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-summary-detail">
                <p><strong>Subtotal:</strong> ৳${(order.subtotal || 0).toFixed(2)}</p>
                <p><strong>Tax:</strong> ৳${(order.tax || 0).toFixed(2)}</p>
                <p><strong>Shipping:</strong> ৳${(order.shipping || 0).toFixed(2)}</p>
                <p><strong>Total:</strong> ৳${(order.total || 0).toFixed(2)}</p>
            </div>
            ${order.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>` : ''}
            <button class="btn-secondary" onclick="closeOrderModal()">Close</button>
        </div>
    `;

    modal.style.display = 'block';
}

function closeOrderModal() {
    document.getElementById('orderDetailsModal').style.display = 'none';
}

function loadUserMessages() {
    const user = getCurrentUser();
    if (!user) return;

    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const userMessages = messages.filter(msg => msg.email === user.email);
    const messagesList = document.getElementById('messagesList');

    if (userMessages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-envelope-open-text"></i>
                <p>No messages yet. Send us a message and the admin will reply here.</p>
                <button class="btn-primary" onclick="showNewMessageModal()">Send Message</button>
            </div>
        `;
        return;
    }

    messagesList.innerHTML = userMessages.map(message => `
        <div class="message-card">
            <div class="message-header">
                <h3>${message.subject}</h3>
                <span>${new Date(message.date).toLocaleDateString()}</span>
            </div>
            <div class="message-body">
                <p><strong>Your message:</strong></p>
                <p>${message.message}</p>
            </div>
            ${message.replies && message.replies.length ? `
                <div class="message-replies">
                    <p><strong>Admin replies:</strong></p>
                    ${message.replies.map(reply => `
                        <div class="reply-item">
                            <span class="reply-meta">${reply.from === 'admin' ? 'Admin' : 'You'} • ${new Date(reply.date).toLocaleDateString()}</span>
                            <p>${reply.text}</p>
                        </div>
                    `).join('')}
                </div>
            ` : `<div class="message-replies empty"><p>No reply yet from the admin.</p></div>`}
        </div>
    `).join('');
}

function showNewMessageModal() {
    document.getElementById('messageModal').style.display = 'block';
    document.getElementById('messageForm').reset();
}

function closeMessageModal() {
    document.getElementById('messageModal').style.display = 'none';
}

function saveNewMessage(event) {
    event.preventDefault();

    const user = getCurrentUser();
    if (!user) {
        alert('Please sign in to send a message.');
        return;
    }

    const subject = document.getElementById('messageSubject').value.trim();
    const messageText = document.getElementById('messageText').value.trim();

    if (!subject || !messageText) {
        alert('Please fill in both subject and message.');
        return;
    }

    const newMessage = {
        id: Date.now(),
        name: user.name,
        email: user.email,
        subject: subject,
        message: messageText,
        date: new Date().toISOString(),
        status: 'unread',
        replies: []
    };

    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    messages.push(newMessage);
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    closeMessageModal();
    loadUserMessages();
    alert('Message sent successfully! Admin will reply here.');
}

function loadUserAddresses() {
    const user = getCurrentUser();
    if (!user) return;

    const allAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
    const userAddresses = allAddresses.filter(addr => addr.email === user.email);

    const addressesList = document.getElementById('addressesList');

    if (userAddresses.length === 0) {
        addressesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-home"></i>
                <p>No addresses saved yet</p>
            </div>
        `;
        return;
    }

    addressesList.innerHTML = userAddresses.map((addr, index) => `
        <div class="address-card">
            <div class="address-header">
                <h4>${addr.label}</h4>
                <div class="address-actions">
                    <button onclick="editAddress(${index})" class="btn-small">Edit</button>
                    <button onclick="deleteAddress(${index})" class="btn-small btn-danger">Delete</button>
                </div>
            </div>
            <div class="address-details">
                <p>${addr.street}</p>
                <p>${addr.city}${addr.state ? ', ' + addr.state : ''}${addr.zipcode ? ', ' + addr.zipcode : ''}</p>
                ${addr.phone ? `<p>Phone: ${addr.phone}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function loadWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const wishlistItems = document.getElementById('wishlistItems');

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart"></i>
                <p>Your wishlist is empty</p>
                <a href="gallery.html" class="btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }

    wishlistItems.innerHTML = wishlist.map(item => `
        <div class="wishlist-item">
            <img src="${item.image}" alt="${item.name}" class="wishlist-image">
            <div class="wishlist-info">
                <h4>${item.name}</h4>
                <p class="price">৳${item.price}</p>
                <div class="wishlist-actions">
                    <button onclick="addToCart(${item.id})" class="btn-primary">Add to Cart</button>
                    <button onclick="removeFromWishlist(${item.id})" class="btn-secondary">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.account-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from menu items
    document.querySelectorAll('.account-menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName).classList.add('active');

    // Add active class to menu item
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
}

function editProfile() {
    alert('Profile editing functionality will be implemented soon.');
}

function showAddressModal(addressIndex = null) {
    const modal = document.getElementById('addressModal');
    const form = document.getElementById('addressForm');
    const title = document.getElementById('modalTitle');

    if (addressIndex !== null) {
        // Edit mode
        const user = getCurrentUser();
        const allAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
        const userAddresses = allAddresses.filter(addr => addr.email === user.email);
        const address = userAddresses[addressIndex];

        title.textContent = 'Edit Address';
        document.getElementById('addressLabel').value = address.label;
        document.getElementById('street').value = address.street;
        document.getElementById('city').value = address.city;
        document.getElementById('state').value = address.state || '';
        document.getElementById('zipcode').value = address.zipcode || '';
        document.getElementById('phone').value = address.phone || '';

        form.dataset.editIndex = addressIndex;
    } else {
        // Add mode
        title.textContent = 'Add New Address';
        form.reset();
        delete form.dataset.editIndex;
    }

    modal.style.display = 'block';
}

function closeAddressModal() {
    document.getElementById('addressModal').style.display = 'none';
}

document.getElementById('addressForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user) return;

    const addressData = {
        email: user.email,
        label: document.getElementById('addressLabel').value,
        street: document.getElementById('street').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipcode: document.getElementById('zipcode').value,
        phone: document.getElementById('phone').value
    };

    let allAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');

    if (this.dataset.editIndex !== undefined) {
        // Edit existing address
        const editIndex = parseInt(this.dataset.editIndex);
        const userAddresses = allAddresses.filter(addr => addr.email === user.email);
        const globalIndex = allAddresses.findIndex(addr => addr === userAddresses[editIndex]);
        allAddresses[globalIndex] = addressData;
    } else {
        // Add new address
        allAddresses.push(addressData);
    }

    localStorage.setItem('userAddresses', JSON.stringify(allAddresses));
    loadUserAddresses();
    closeAddressModal();
    alert('Address saved successfully!');
});

document.getElementById('messageForm').addEventListener('submit', saveNewMessage);

function editAddress(index) {
    showAddressModal(index);
}

function deleteAddress(index) {
    if (!confirm('Are you sure you want to delete this address?')) return;

    const user = getCurrentUser();
    if (!user) return;

    let allAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
    const userAddresses = allAddresses.filter(addr => addr.email === user.email);
    const globalIndex = allAddresses.findIndex(addr => addr === userAddresses[index]);

    allAddresses.splice(globalIndex, 1);
    localStorage.setItem('userAddresses', JSON.stringify(allAddresses));
    loadUserAddresses();
    alert('Address deleted successfully!');
}

function signOut() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function changePassword() {
    const currentPassword = prompt('Enter your current password:');
    if (!currentPassword) return;

    const newPassword = prompt('Enter your new password:');
    if (!newPassword) return;

    const confirmPassword = prompt('Confirm your new password:');
    if (!confirmPassword) return;

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters long!');
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        alert('User not found!');
        return;
    }

    // Verify current password
    if (user.password !== currentPassword) {
        alert('Current password is incorrect!');
        return;
    }

    // Update password
    user.password = newPassword;

    // Update in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        users[userIndex] = user;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Password changed successfully!');
    } else {
        alert('Error updating password. Please try again.');
    }
}

function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.')) {
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        alert('User not found!');
        return;
    }

    // Remove user from users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.filter(u => u.email !== user.email);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Remove user's orders
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const updatedOrders = orders.filter(order => order.customer.email !== user.email);
    localStorage.setItem('userOrders', JSON.stringify(updatedOrders));

    // Remove user's addresses
    const addresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
    const updatedAddresses = addresses.filter(addr => addr.email !== user.email);
    localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));

    // Clear current user session
    localStorage.removeItem('currentUser');

    alert('Account deleted successfully. You will be redirected to the home page.');
    window.location.href = 'index.html';
}

// Modal close when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addressModal');
    if (event.target === modal) {
        closeAddressModal();
    }
}