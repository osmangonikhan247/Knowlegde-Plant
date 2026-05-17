CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT,
            category TEXT,
            rating REAL DEFAULT 0,
            description TEXT
        )

CREATE TABLE sqlite_sequence(name,seq)

CREATE TABLE cart (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            product_id INTEGER,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (product_id) REFERENCES products (id)
        )

CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            total REAL NOT NULL,
            tax REAL NOT NULL,
            shipping REAL DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )

CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER,
            price REAL,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )