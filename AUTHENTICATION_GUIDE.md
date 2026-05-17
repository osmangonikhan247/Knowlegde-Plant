# 🔐 Authentication System - User vs Admin

## How the System Differentiates Users and Admins

The KnowledgePlant system uses a **role-based authentication** approach with the key differentiator being the `isAdmin` property in the user object.

---

## 📊 System Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│         User Opens signin.html                       │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │                         │
        ▼                         ▼
   ┌─CUSTOMER──┐            ┌──ADMIN───┐
   │   Tab     │            │   Tab    │
   └─────┬─────┘            └────┬─────┘
         │                       │
         ▼                       ▼
   ┌──────────────────┐   ┌──────────────────┐
   │ Checks in:       │   │ Checks:          │
   │ localStorage     │   │ Hardcoded        │
   │ 'users' array    │   │ admin credentials│
   │                  │   │                  │
   │ Email matches?   │   │ Email = admin@   │
   │ Password match?  │   │ knowledgeplant   │
   └────────┬─────────┘   │ .bd?             │
            │             │ Password =       │
            │             │ admin123?        │
            │             └────────┬─────────┘
            │                      │
            ▼                      ▼
         ✅ YES                  ✅ YES
            │                      │
            ▼                      ▼
   ┌─────────────────┐    ┌──────────────────┐
   │ Save isAdmin:   │    │ Save isAdmin:    │
   │ FALSE           │    │ TRUE             │
   │                 │    │                  │
   │ Redirect to:    │    │ Redirect to:     │
   │ index.html      │    │ admin.html       │
   └─────────────────┘    └──────────────────┘
```

---

## 🔑 Key Difference: The `isAdmin` Flag

### Customer User Object:
```javascript
{
    id: 'cust_12345',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '01700000000',
    joinDate: '2024-01-15T10:30:00',
    isAdmin: false  // ⬅️ CUSTOMER FLAG
}
```

### Admin User Object:
```javascript
{
    id: 'admin_001',
    name: 'Admin User',
    email: 'admin@knowledgeplant.bd',
    phone: '01700000000',
    joinDate: '2024-01-01T10:30:00',
    isAdmin: true   // ⬅️ ADMIN FLAG
}
```

---

## 🔄 Authentication Process

### Step 1️⃣: User Selects Account Type

```html
<div class="user-type-selection">
    <button class="user-type-btn active" data-type="customer">
        🛒 Customer
    </button>
    <button class="user-type-btn" data-type="admin">
        🛡️ Admin
    </button>
</div>
```

When clicked, sets: `currentUserType = 'customer'` or `currentUserType = 'admin'`

---

### Step 2️⃣: Form Submission

```javascript
signinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // DIFFERENTIATION HAPPENS HERE
    if (currentUserType === 'admin') {
        handleAdminLogin(email, password);      // ➡️ Admin path
    } else {
        handleCustomerLogin(email, password);   // ➡️ Customer path
    }
});
```

---

### Step 3️⃣: Customer Login (`handleCustomerLogin`)

```javascript
function handleCustomerLogin(email, password) {
    // Get all registered users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Search for matching user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store user in localStorage with isAdmin: false
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            joinDate: user.joinDate,
            isAdmin: false   // ⬅️ MARKED AS REGULAR USER
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Redirect to customer dashboard
        window.location.href = 'index.html';
    } else {
        alert('Invalid email or password');
    }
}
```

**Flow:**
1. Looks up user in `localStorage['users']` array
2. Verifies email AND password match
3. Sets `isAdmin: false`
4. Redirects to **index.html** (customer home page)

---

### Step 4️⃣: Admin Login (`handleAdminLogin`)

```javascript
function handleAdminLogin(email, password) {
    // Hardcoded admin credentials (in production, fetch from secure database)
    const adminCredentials = {
        email: 'admin@knowledgeplant.bd',
        password: 'admin123'
    };
    
    if (email === adminCredentials.email && password === adminCredentials.password) {
        // Create admin user object
        const adminUser = {
            id: 'admin_001',
            name: 'Admin User',
            email: email,
            phone: '01700000000',
            joinDate: new Date().toISOString(),
            isAdmin: true   // ⬅️ MARKED AS ADMIN
        };
        
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        localStorage.setItem('adminSession', 'active');
        
        // Redirect to admin dashboard
        window.location.href = 'admin.html';
    } else {
        alert('Invalid admin credentials');
    }
}
```

**Flow:**
1. Compares against hardcoded admin credentials
2. Sets `isAdmin: true`
3. Sets admin session flag
4. Redirects to **admin.html** (admin panel)

---

## 🛡️ How the System Uses `isAdmin`

### In `script.js` - `getCurrentUser()`:
```javascript
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}
```

### In `admin.html` - Access Control:
```javascript
function checkAdminAccess() {
    const user = getCurrentUser();
    
    // Check if isAdmin is TRUE
    if (!user || !user.isAdmin) {
        alert('Access denied! Admin privileges required.');
        window.location.href = 'index.html';  // Redirect non-admins
        return;
    }
    
    document.getElementById('adminUserName').textContent = user.name + ' (Admin)';
}
```

**If user tries to access `admin.html`:**
- ✅ `isAdmin: true` → Allow access, show admin panel
- ❌ `isAdmin: false` → Block access, redirect to home page

---

## 📦 Data Storage Locations

### localStorage Keys:

| Key | What's Stored | For Whom |
|-----|---------------|----------|
| `currentUser` | Current logged-in user's data (with `isAdmin` flag) | All users |
| `adminSession` | Session token | Admins only |
| `users` | All registered customers | System |
| `allUsers` | All customers (admin view) | Admin access |
| `cart` | Shopping cart items | Customers |
| `userOrders` | Customer's orders | Customers |
| `allOrders` | All orders in system | Admin view |

---

## 🚀 How Pages Detect User Type

### In `index.html` - Show/Hide Based on Role:
```javascript
function updateUserNavigation() {
    const user = getCurrentUser();
    
    if (user) {
        if (user.isAdmin) {
            // Show admin link
            signinLink.innerHTML = `<i class="fas fa-shield"></i> ${user.name} (Admin)`;
            // Hide customer options
        } else {
            // Show customer profile
            signinLink.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
            // Show shopping cart, account link, etc.
        }
    }
}
```

### In `account.html` - Require Customer Role:
```javascript
function loadUserProfile() {
    const user = getCurrentUser();
    
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }
    
    if (user.isAdmin) {
        // Admin shouldn't be here
        window.location.href = 'admin.html';
        return;
    }
    
    // Load customer profile
}
```

---

## 🔐 Security Comparison

### Customer Authentication:
- ✅ Email exists in `users` array
- ✅ Password matches
- ⚠️ Basic (client-side only for demo)
- 📊 Multiple users can register

### Admin Authentication:
- ✅ Email exactly matches: `admin@knowledgeplant.bd`
- ✅ Password exactly matches: `admin123`
- ⚠️ Hardcoded (NOT SECURE - demo only!)
- 🔒 Single admin account (in demo)

---

## 📝 Complete Authentication Timeline

### Customer Sign-In Example:

```
1. User clicks "Customer" tab
   → currentUserType = 'customer'

2. Enters email: john@example.com
   Enters password: password123

3. Clicks "Sign In"
   → Checks localStorage['users'] array

4. Found user with matching email & password
   → Creates user object with isAdmin: false

5. Stores in localStorage['currentUser']

6. Browser redirects to index.html

7. Page loads → getCurrentUser() returns:
   {
     id: 'cust_123',
     name: 'John',
     email: 'john@example.com',
     isAdmin: false
   }

8. Navigation shows: "👤 John"
9. "Account" link available
10. "Admin" link hidden
```

### Admin Sign-In Example:

```
1. User clicks "Admin" tab
   → currentUserType = 'admin'

2. Enters email: admin@knowledgeplant.bd
   Enters password: admin123

3. Clicks "Sign In"
   → Checks hardcoded credentials

4. Credentials match exactly
   → Creates admin object with isAdmin: true

5. Stores in localStorage['currentUser']
6. Sets localStorage['adminSession'] = 'active'

7. Browser redirects to admin.html

8. admin.html checkAdminAccess() runs
   → Checks user.isAdmin === true
   → Access GRANTED ✅

9. Navigation shows: "🛡️ Admin User (Admin)"
10. Dashboard, Products, Orders visible
11. Customer pages hidden
```

---

## 🔍 How to Check Current User Role in Any Page

```javascript
// Get current user
const user = getCurrentUser();

// Check if admin
if (user && user.isAdmin) {
    console.log('This is an admin');
    // Show admin features
} else if (user) {
    console.log('This is a regular customer');
    // Show customer features
} else {
    console.log('Not logged in');
    // Show login page
}
```

---

## 🎯 Key Takeaway

| Aspect | How System Differentiates |
|--------|--------------------------|
| **Selection Method** | User clicks "Customer" or "Admin" tab |
| **Verification** | Different credential sources (localStorage vs hardcoded) |
| **Identifier** | `isAdmin: true/false` flag in user object |
| **Storage** | LocalStorage key: `currentUser` contains the user object |
| **Access Control** | Pages check `user.isAdmin` before showing admin features |
| **Redirection** | Customers → index.html, Admins → admin.html |
| **Session** | Both stored in localStorage, cleared on logout |

---

## 🚨 Important Notes

⚠️ **Demo Security Issues (Fix Before Production):**
1. ❌ Hardcoded admin password visible in code
2. ❌ No encryption for stored passwords
3. ❌ Client-side only authentication (no backend)
4. ❌ No HTTPS requirement
5. ❌ LocalStorage can be accessed by JavaScript

✅ **Production Recommendations:**
1. Use backend server for authentication
2. Hash passwords with bcrypt/argon2
3. Implement JWT tokens
4. Use HTTPS only
5. Store sessions server-side
6. Add role-based access control (RBAC)
7. Log authentication attempts
8. Implement 2FA for admins

---

Does this explain the authentication system clearly? Want me to show you how to test it or modify the security?
