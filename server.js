const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'Project-main')));

// Database setup
const db = new sqlite3.Database('./ecommerce.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    db.serialize(() => {
        // Products table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT,
            category TEXT,
            rating REAL DEFAULT 0,
            description TEXT
        )`);

        // Cart table (session-based for simplicity)
        db.run(`CREATE TABLE IF NOT EXISTS cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            product_id INTEGER,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (product_id) REFERENCES products (id)
        )`);

        // Orders table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            total REAL NOT NULL,
            tax REAL NOT NULL,
            shipping REAL DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Order items table
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER,
            price REAL,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )`);

        // Insert sample products
        insertSampleProducts();
    });
}

// Insert sample products
function insertSampleProducts() {
    const products = [
        { name: 'Mosambi - Indian Sweet Lime Plant', price: 420, image: 'mango.jpeg', category: 'Plants', rating: 4.5, description: 'Sweet lime plant for home gardening.' },
        { name: 'Pomegranate Plant', price: 500, image: 'lebu.png', category: 'Plants', rating: 4.0, description: 'Healthy pomegranate plant.' },
        { name: 'Dragon Fruit Plant', price: 400, image: 'dragon.jpeg', category: 'Plants', rating: 5.0, description: 'Exotic dragon fruit plant.' },
        { name: 'Gardening Book', price: 420, image: 'book.png', category: 'Books', rating: 3.5, description: 'Guide to gardening.' },
        { name: 'Plant Care Guide', price: 420, image: 'book.png', category: 'Books', rating: 4.0, description: 'Essential plant care tips.' },
        { name: 'Botanical Encyclopedia', price: 420, image: 'book.png', category: 'Books', rating: 4.5, description: 'Comprehensive plant encyclopedia.' },
        { name: 'Rose Plant', price: 200, image: 'golap.jpeg', category: 'Plants', rating: 4.5, description: 'Beautiful rose plant.' },
        { name: 'Tulip Plant', price: 850, image: 'flowers.jpeg', category: 'Plants', rating: 4.0, description: 'Colorful tulip plant.' },
        { name: 'Red Rose Plant', price: 200, image: 'golap.jpeg', category: 'Plants', rating: 4.5, description: 'Red rose plant.' },
        { name: 'Succulent Plant', price: 150, image: 'plant.png', category: 'Plants', rating: 4.0, description: 'Low-maintenance succulent.' },
        { name: 'Orchid Plant', price: 120, image: 'flowers.jpeg', category: 'Plants', rating: 5.0, description: 'Elegant orchid plant.' }
    ];

    products.forEach(product => {
        db.run(`INSERT OR IGNORE INTO products (name, price, image, category, rating, description) VALUES (?, ?, ?, ?, ?, ?)`,
            [product.name, product.price, product.image, product.category, product.rating, product.description]);
    });
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get cart for session
app.get('/api/cart', (req, res) => {
    const sessionId = req.query.sessionId || 'default';
    db.all(`
        SELECT c.id, c.quantity, p.name, p.price, p.image, (c.quantity * p.price) as total
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.session_id = ?
    `, [sessionId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Add to cart
app.post('/api/cart/add', (req, res) => {
    const { productId, quantity, sessionId } = req.body;
    const sid = sessionId || 'default';

    // Check if item already in cart
    db.get('SELECT id, quantity FROM cart WHERE session_id = ? AND product_id = ?', [sid, productId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            // Update quantity
            db.run('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, row.id], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: 'Cart updated', cartId: row.id });
            });
        } else {
            // Insert new
            db.run('INSERT INTO cart (session_id, product_id, quantity) VALUES (?, ?, ?)', [sid, productId, quantity], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: 'Added to cart', cartId: this.lastID });
            });
        }
    });
});

// Update cart item
app.put('/api/cart/:id', (req, res) => {
    const { quantity } = req.body;
    db.run('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Cart updated' });
    });
});

// Remove from cart
app.delete('/api/cart/:id', (req, res) => {
    db.run('DELETE FROM cart WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Removed from cart' });
    });
});

// Checkout
app.post('/api/checkout', (req, res) => {
    const { sessionId, shippingAddress } = req.body;
    const sid = sessionId || 'default';

    // Get cart items
    db.all(`
        SELECT c.product_id, c.quantity, p.price
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.session_id = ?
    `, [sid], (err, items) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (items.length === 0) {
            res.status(400).json({ error: 'Cart is empty' });
            return;
        }

        // Calculate totals
        let subtotal = 0;
        items.forEach(item => {
            subtotal += item.quantity * item.price;
        });
        const tax = subtotal * 0.05; // 5% tax
        const shipping = 50; // Fixed shipping
        const total = subtotal + tax + shipping;

        // Create order
        db.run('INSERT INTO orders (session_id, total, tax, shipping) VALUES (?, ?, ?, ?)', [sid, total, tax, shipping], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            const orderId = this.lastID;

            // Insert order items
            const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
            items.forEach(item => {
                stmt.run(orderId, item.product_id, item.quantity, item.price);
            });
            stmt.finalize();

            // Clear cart
            db.run('DELETE FROM cart WHERE session_id = ?', [sid]);

            res.json({ orderId, total, tax, shipping, subtotal });
        });
    });
});

// Get invoice
app.get('/api/invoice/:orderId', (req, res) => {
    const orderId = req.params.orderId;

    db.get(`
        SELECT o.*, GROUP_CONCAT(oi.product_id || ':' || oi.quantity || ':' || oi.price, ';') as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.id = ?
        GROUP BY o.id
    `, [orderId], (err, order) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        // Parse items
        const items = order.items ? order.items.split(';').map(item => {
            const [productId, quantity, price] = item.split(':');
            return { productId: parseInt(productId), quantity: parseInt(quantity), price: parseFloat(price) };
        }) : [];

        res.json({
            orderId: order.id,
            total: order.total,
            tax: order.tax,
            shipping: order.shipping,
            subtotal: order.total - order.tax - order.shipping,
            items,
            createdAt: order.created_at
        });
    });
});

// Generate PDF invoice
app.get('/api/invoice/:orderId/pdf', (req, res) => {
    const orderId = req.params.orderId;

    // For simplicity, just return JSON. In real app, generate PDF
    res.redirect(`/api/invoice/${orderId}`);
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'Project-main', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});