let cartItems = [];
let currentInvoice = null;
let currentCustomer = null;

function formatCurrency(value) {
    return '৳' + Number(value || 0).toFixed(2);
}

// INITIALIZATION: Wait for all DOM and script.js to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== BILLING PAGE LOAD START ===');
    loadCart();
    setupCheckoutHandler();
    console.log('=== BILLING PAGE READY ===');
});

function loadCart() {
    console.log('📦 LOADING CART');
    
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user) {
        console.error('❌ User not logged in');
        alert('Please sign in to access your cart.');
        window.location.href = 'signin.html';
        return;
    }

    // Get cart from localStorage
    const rawCart = localStorage.getItem('cart');
    console.log('Raw cart data:', rawCart);
    
    try {
        cartItems = (JSON.parse(rawCart || '[]') || []).map(item => {
            const price = Number(item.price || 0);
            const quantity = Number(item.quantity || 1);
            return {
                id: item.id,
                name: item.name || 'Unknown Product',
                price,
                quantity,
                total: Number(item.total || price * quantity)
            };
        });
    } catch (e) {
        console.error('Error parsing cart:', e);
        cartItems = [];
    }

    console.log('✅ Cart items normalized:', cartItems);

    // Persist normalized cart
    localStorage.setItem('cart', JSON.stringify(cartItems));

    renderCart();
    updateCartCount();
    loadUserInfo();
}

function loadUserInfo() {
    const user = getCurrentUser();
    if (!user) {
        console.log('No user for loading user info');
        return;
    }

    console.log('👤 Loading user info for:', user.email);
    
    // Pre-fill user information
    const nameEl = document.getElementById('name');
    const emailEl = document.getElementById('email');
    const phoneEl = document.getElementById('phone');
    const addressEl = document.getElementById('address');

    if (nameEl) nameEl.value = user.name || '';
    if (emailEl) emailEl.value = user.email || '';
    if (phoneEl) phoneEl.value = user.phone || '';
    if (addressEl) addressEl.value = user.address || '';
}

function renderCart() {
    const tbody = document.getElementById('cart-items');
    if (!tbody) {
        console.error('❌ cart-items element not found in DOM');
        return;
    }
    
    console.log('🛒 Rendering cart with', cartItems.length, 'items');
    
    tbody.innerHTML = '';

    if (cartItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 40px; text-align: center; color: #999;">Your cart is empty</td></tr>';
        return;
    }

    cartItems.forEach((item, idx) => {
        const tr = document.createElement('tr');
        const itemPrice = Number(item.price) || 0;
        const itemQty = Number(item.quantity) || 0;
        const itemTotal = Number(item.total) || (itemPrice * itemQty);
        
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>৳${itemPrice.toFixed(2)}</td>
            <td>${itemQty}</td>
            <td>৳${itemTotal.toFixed(2)}</td>
            <td><button onclick="removeFromCart(${item.id})" style="background: #ff6b6b; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer;">Remove</button></td>
        `;
        tbody.appendChild(tr);
    });

    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    cartItems.forEach(item => {
        const itemTotal = Number(item.total) || (Number(item.price) * Number(item.quantity));
        subtotal += itemTotal;
    });

    const tax = subtotal * 0.05;
    const shipping = 50;
    const total = subtotal + tax + shipping;

    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `৳${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `৳${tax.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `৳${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `৳${total.toFixed(2)}`;

    console.log('💰 Totals:', { subtotal, tax, shipping, total });
}

function removeFromCart(cartId) {
    cartItems = cartItems.filter(item => item.id != cartId);
    localStorage.setItem('cart', JSON.stringify(cartItems));
    renderCart();
    updateCartCount();
    console.log('🗑️  Item removed from cart');
}

function updateCartCount() {
    const count = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function setupCheckoutHandler() {
    const form = document.getElementById('checkout-form');
    if (!form) {
        console.error('❌ checkout-form element not found');
        return;
    }

    console.log('✅ Setting up checkout form handler');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Checkout form submitted');

        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        if (!name || !email || !phone || !address) {
            alert('Please fill in all shipping information!');
            return;
        }

        const shippingAddress = {
            name,
            address,
            phone,
            email
        };

        console.log('📦 Processing checkout with address:', shippingAddress);

        try {
            const result = await checkout(shippingAddress);
            console.log('✅ Checkout success:', result);
            showInvoice(result, shippingAddress);
        } catch (error) {
            console.error('❌ Checkout error:', error);
            alert('Checkout failed: ' + error.message);
        }
    });
}

async function checkout(shippingAddress) {
    if (cartItems.length === 0) {
        throw new Error('Cart is empty');
    }

    let subtotal = 0;
    cartItems.forEach(item => {
        subtotal += Number(item.total) || (Number(item.price) * Number(item.quantity));
    });

    const tax = subtotal * 0.05;
    const shipping = 50;
    const total = subtotal + tax + shipping;

    const orderId = 'ORD' + Date.now();

    console.log('🎁 Order created:', { orderId, subtotal, tax, shipping, total });

    return {
        orderId,
        subtotal,
        tax,
        shipping,
        total,
        items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: Number(item.total) || Number(item.price) * Number(item.quantity)
        }))
    };
}

function showInvoice(orderData, customerData) {
    console.log('📄 Displaying invoice...');

    const checkoutPanel = document.querySelector('.checkout-panel');
    const invoiceArea = document.getElementById('invoice-area');

    if (checkoutPanel) checkoutPanel.style.display = 'none';
    if (invoiceArea) {
        invoiceArea.style.display = 'block';
        invoiceArea.classList.add('fullpage');
    }

    document.body.classList.add('invoice-active');
    window.scrollTo(0, 0);

    // Populate invoice
    const invoiceDate = document.getElementById('invoice-date');
    const orderId = document.getElementById('order-id');
    const customerName = document.getElementById('customer-name');
    const customerPhone = document.getElementById('customer-phone');
    const customerEmail = document.getElementById('customer-email');
    const customerAddress = document.getElementById('customer-address');
    const shipCustomerName = document.getElementById('ship-customer-name');
    const shipCustomerPhone = document.getElementById('ship-customer-phone');
    const shipCustomerAddress = document.getElementById('ship-customer-address');

    if (invoiceDate) invoiceDate.textContent = new Date().toLocaleDateString();
    if (orderId) orderId.textContent = orderData.orderId;
    if (customerName) customerName.textContent = customerData.name;
    if (customerPhone) customerPhone.textContent = customerData.phone;
    if (customerEmail) customerEmail.textContent = customerData.email || 'customer@email.com';
    if (customerAddress) customerAddress.textContent = customerData.address;

    if (shipCustomerName) shipCustomerName.textContent = customerData.name;
    if (shipCustomerPhone) shipCustomerPhone.textContent = customerData.phone;
    if (shipCustomerAddress) shipCustomerAddress.textContent = customerData.address;

    const tbody = document.getElementById('invoice-items');
    if (tbody) {
        tbody.innerHTML = '';
        orderData.items.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="item-desc">${item.name}</td>
                <td class="item-qty">${item.quantity}</td>
                <td class="item-rate">৳${Number(item.price).toFixed(2)}</td>
                <td class="item-amount">৳${Number(item.total).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    const subtotalEl = document.getElementById('invoice-subtotal');
    const taxEl = document.getElementById('invoice-tax');
    const shippingEl = document.getElementById('invoice-shipping');
    const totalEl = document.getElementById('invoice-total');

    if (subtotalEl) subtotalEl.textContent = `৳${orderData.subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `৳${orderData.tax.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = `৳${orderData.shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `৳${orderData.total.toFixed(2)}`;

    currentInvoice = orderData;
    currentCustomer = customerData;
    saveOrderToUserHistory(orderData, customerData);
}

function saveOrderToUserHistory(orderData, customerData) {
    const user = getCurrentUser();
    if (!user) return;

    const order = {
        id: orderData.orderId,
        date: new Date().toISOString(),
        items: orderData.items,
        subtotal: Number(orderData.subtotal),
        tax: Number(orderData.tax),
        shipping: Number(orderData.shipping),
        total: Number(orderData.total),
        status: 'Pending',
        customer: {
            email: user.email,
            name: customerData.name,
            phone: customerData.phone,
            address: customerData.address
        }
    };

    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    userOrders.push(order);
    localStorage.setItem('userOrders', JSON.stringify(userOrders));

    const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
    allOrders.push(order);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));

    // Clear the cart after successful order
    localStorage.removeItem('cart');
    cartItems = [];
    updateCartCount();

    console.log('✅ Order saved successfully');
}

function printInvoice() {
    window.print();
}

function downloadInvoice() {
    const jsPDFModule = window.jspdf || window.jsPDF;
    const jsPDF = jsPDFModule && jsPDFModule.jsPDF ? jsPDFModule.jsPDF : jsPDFModule;
    if (typeof jsPDF !== 'function') {
        console.error('jsPDF is not available', window.jspdf, window.jsPDF);
        alert('Unable to download invoice because PDF library is not loaded. Please refresh the page and try again.');
        return;
    }

    const invoiceElement = document.getElementById('invoice-sheet');
    if (invoiceElement && window.html2canvas) {
        html2canvas(invoiceElement, { scale: 2, backgroundColor: '#ffffff' })
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = pageWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                let position = 0;
                let heightLeft = imgHeight;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft > 0) {
                    position -= pageHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save('KnowledgePlant_Invoice_' + (currentInvoice ? currentInvoice.orderId : document.getElementById('order-id').textContent) + '.pdf');
            })
            .catch(error => {
                console.error('html2canvas invoice capture failed:', error);
                alert('Failed to generate PDF from invoice layout. Falling back to text-based download.');
                downloadInvoiceFallback();
            });
        return;
    }

    downloadInvoiceFallback();
}

function downloadInvoiceFallback() {
    const jsPDFModule = window.jspdf || window.jsPDF;
    const jsPDF = jsPDFModule && jsPDFModule.jsPDF ? jsPDFModule.jsPDF : jsPDFModule;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Colors
    const primaryColor = [46, 125, 50]; // Green
    const secondaryColor = [102, 102, 102]; // Gray
    const whiteColor = [255, 255, 255];

    // Get invoice data
    const orderId = currentInvoice ? currentInvoice.orderId : document.getElementById('order-id').textContent;
    const date = document.getElementById('invoice-date').textContent;
    const customerName = currentCustomer ? currentCustomer.name : document.getElementById('customer-name').textContent;
    const customerPhone = currentCustomer ? currentCustomer.phone : document.getElementById('customer-phone').textContent;
    const customerEmail = currentCustomer ? currentCustomer.email : document.getElementById('customer-email').textContent;
    const customerAddress = currentCustomer ? currentCustomer.address : document.getElementById('customer-address').textContent;
    const shipCustomerName = customerName;
    const shipCustomerPhone = customerPhone;
    const shipCustomerAddress = customerAddress;
    const subtotal = currentInvoice ? formatCurrency(currentInvoice.subtotal) : document.getElementById('invoice-subtotal').textContent;
    const tax = currentInvoice ? formatCurrency(currentInvoice.tax) : document.getElementById('invoice-tax').textContent;
    const shipping = currentInvoice ? formatCurrency(currentInvoice.shipping) : document.getElementById('invoice-shipping').textContent;
    const total = currentInvoice ? formatCurrency(currentInvoice.total) : document.getElementById('invoice-total').textContent;

    const items = currentInvoice ? currentInvoice.items : Array.from(document.querySelectorAll('#invoice-items tr')).map(item => {
        const cells = item.querySelectorAll('td');
        return {
            description: cells[0] ? cells[0].textContent.trim() : '',
            quantity: cells[1] ? Number(cells[1].textContent.trim()) : 0,
            price: cells[2] ? Number(cells[2].textContent.replace(/[^0-9.]/g, '')) : 0,
            total: cells[3] ? Number(cells[3].textContent.replace(/[^0-9.]/g, '')) : 0
        };
    });

    let yPos = 20;

    // Header Section
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    // Company Logo/Name
    doc.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('KnowledgePlant', 20, yPos + 5);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Your trusted plant & knowledge store', 20, yPos + 12);

    // Company Info
    doc.setFontSize(9);
    doc.text('Mirpur 12 Cantonment, Dhaka 1216', 20, yPos + 20);
    doc.text('Bangladesh', 20, yPos + 25);
    doc.text('Phone: 016******** | Email: ayesha@cse.edu.bd', 20, yPos + 30);
    doc.text('Website: www.knowledgeplant.com', 20, yPos + 35);

    // Invoice Badge
    doc.setFillColor(255, 255, 255, 0.2);
    doc.roundedRect(140, yPos, 50, 25, 3, 3, 'F');
    doc.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 150, yPos + 8);

    doc.setFillColor(255, 255, 255, 0.3);
    doc.roundedRect(140, yPos + 12, 35, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.text('PAID', 152, yPos + 17);

    // Invoice Details
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255, 0.8);
    doc.text('INVOICE #', 140, yPos + 28);
    doc.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
    doc.setFontSize(12);
    doc.text(orderId, 140, yPos + 33);

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255, 0.8);
    doc.text('DATE', 170, yPos + 28);
    doc.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
    doc.setFontSize(10);
    doc.text(date, 170, yPos + 33);

    yPos += 50;

    // Address Section
    doc.setTextColor(0, 0, 0);

    // Bill To
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(20, yPos, 80, 35, 3, 3, 'F');
    doc.setLineWidth(0.5);
    doc.setDrawColor(76, 175, 80);
    doc.line(20, yPos, 20, yPos + 35);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Bill To', 25, yPos + 8);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text(customerName, 25, yPos + 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('Phone: ' + customerPhone, 25, yPos + 22);
    doc.text('Email: ' + customerEmail, 25, yPos + 27);
    doc.text('Address: ' + customerAddress, 25, yPos + 32);

    // Ship To
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(110, yPos, 80, 35, 3, 3, 'F');
    doc.setLineWidth(0.5);
    doc.setDrawColor(76, 175, 80);
    doc.line(110, yPos, 110, yPos + 35);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Ship To', 115, yPos + 8);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text(shipCustomerName, 115, yPos + 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('Phone: ' + shipCustomerPhone, 115, yPos + 22);
    doc.text('Address: ' + shipCustomerAddress, 115, yPos + 27);
    doc.text('Estimated delivery: 2-3 business days', 115, yPos + 32);

    yPos += 50;

    // Items Table Header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Order Items', 20, yPos);

    yPos += 10;

    // Table Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(20, yPos, 170, 10, 'F');

    doc.setTextColor(whiteColor[0], whiteColor[1], whiteColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 25, yPos + 6);
    doc.text('QTY', 120, yPos + 6);
    doc.text('RATE', 140, yPos + 6);
    doc.text('AMOUNT', 165, yPos + 6);

    yPos += 15;

    // Table Items
    let alternateRow = false;
    items.forEach(item => {
        const description = item.description || '';
        const quantity = item.quantity || '0';
        const rate = item.price ? String(item.price).trim() : '৳0.00';
        const amount = item.amount ? String(item.amount).trim() : formatCurrency(Number(item.quantity || 0) * Number(item.price || 0));

        if (alternateRow) {
            doc.setFillColor(248, 249, 250);
            doc.rect(20, yPos - 5, 170, 10, 'F');
        }

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        const lines = doc.splitTextToSize(description, 80);
        doc.text(lines, 25, yPos);
        const rowHeight = Math.max(lines.length * 4, 10);

        doc.text(quantity.toString(), 125, yPos);
        doc.text(rate.toString(), 145, yPos);
        doc.text(amount.toString(), 170, yPos);

        yPos += rowHeight;
        alternateRow = !alternateRow;
    });

    yPos += 10;

    // Totals Section
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(110, yPos, 80, 45, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);

    doc.text('Subtotal:', 115, yPos + 8);
    doc.text('Tax (5%):', 115, yPos + 16);
    doc.text('Shipping:', 115, yPos + 24);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.text('Grand Total:', 115, yPos + 35);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(subtotal, 175, yPos + 8);
    doc.text(tax, 175, yPos + 16);
    doc.text(shipping, 175, yPos + 24);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(total, 175, yPos + 35);

    yPos += 60;

    // Payment Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Payment Information', 20, yPos);

    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('Bkash, Nagad, Rocket', 25, yPos);
    doc.text('Cash on Delivery', 25, yPos + 5);
    doc.text('All Banking Methods', 25, yPos + 10);

    yPos += 25;

    // Footer
    doc.setFillColor(248, 249, 250);
    doc.rect(0, yPos, 210, 50, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Thank you for your business!', 20, yPos + 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('We appreciate your trust in KnowledgePlant. Your order will be processed and delivered with care.', 20, yPos + 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('Terms & Conditions', 20, yPos + 28);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(102, 102, 102);
    doc.text('• All sales are final. Returns accepted within 7 days for damaged items only.', 25, yPos + 35);
    doc.text('• Plants are guaranteed to arrive in healthy condition.', 25, yPos + 40);
    doc.text('• For any queries, contact us at ayesha@cse.edu.bd or 016********', 25, yPos + 45);

    // Signature
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.text('Authorized Signature', 150, yPos + 35);
    doc.line(140, yPos + 30, 180, yPos + 30);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('KnowledgePlant', 150, yPos + 45);

    // Download the PDF
    doc.save('KnowledgePlant_Invoice_' + orderId + '.pdf');
}
