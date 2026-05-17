# 🔑 Quick Authentication Reference

## Side-by-Side Comparison

### CUSTOMER SIGN-IN
```
┌─────────────────────────────────┐
│   SignIn Page - CUSTOMER Tab    │
├─────────────────────────────────┤
│ Email: john@example.com         │
│ Password: mypassword123         │
│ [Sign In Button]                │
└────────────┬────────────────────┘
             │
             ▼
      ╔═══════════════════╗
      ║ Verify Against:   ║
      ║ localStorage      ║
      ║ 'users' array     ║
      ╚═════════┬═════════╝
                │
        ┌───────▼────────┐
        │ User Found?    │
        └───────┬────────┘
                │
                ▼
    ┌───────────────────────────┐
    │ Create User Object:       │
    │ {                         │
    │   id: 'cust_123',        │
    │   name: 'John Doe',      │
    │   email: 'john@ex.com',  │
    │   isAdmin: false  ◄─ KEY │
    │ }                         │
    └───────────┬───────────────┘
                │
                ▼
        ┌──────────────────────┐
        │ Save to localStorage │
        │ key: 'currentUser'   │
        └──────────┬───────────┘
                   │
                   ▼
            [Redirect to index.html]
            ↓
    Show customer dashboard
    Cart ✓
    Account ✓
    Wishlist ✓
```

### ADMIN SIGN-IN
```
┌─────────────────────────────────┐
│    SignIn Page - ADMIN Tab      │
├─────────────────────────────────┤
│ Email: admin@knowledgeplant.bd  │
│ Password: admin123              │
│ [Sign In Button]                │
└────────────┬────────────────────┘
             │
             ▼
      ╔═══════════════════════╗
      ║ Verify Against:       ║
      ║ Hardcoded Credentials │
      ║ (NOT user database)   ║
      ╚═════════┬═════════════╝
                │
        ┌───────▼────────┐
        │ Credentials    │
        │ Match Exactly? │
        └───────┬────────┘
                │
                ▼
    ┌───────────────────────────┐
    │ Create Admin Object:      │
    │ {                         │
    │   id: 'admin_001',       │
    │   name: 'Admin User',    │
    │   email: 'admin@k.bd',   │
    │   isAdmin: true  ◄─ KEY  │
    │ }                         │
    └───────────┬───────────────┘
                │
                ▼
        ┌──────────────────────┐
        │ Save to localStorage │
        │ key: 'currentUser'   │
        │ + 'adminSession'     │
        └──────────┬───────────┘
                   │
                   ▼
            [Redirect to admin.html]
            ↓
    checkAdminAccess() runs
    → Checks if isAdmin === true
    → Access ALLOWED ✓
    ↓
    Show admin dashboard
    Dashboard ✓
    Products ✓
    Orders ✓
    Users ✓
    Analytics ✓
```

---

## 📋 Comparison Table

| Feature | Customer | Admin |
|---------|----------|-------|
| **Tab Selection** | "Customer" | "Admin" |
| **Credentials From** | Users stored in app | Hardcoded in code |
| **Email Format** | Any email | `admin@knowledgeplant.bd` |
| **Password Source** | User creates | Fixed: `admin123` |
| **Database Lookup** | `localStorage['users']` | Compare direct values |
| **isAdmin Flag** | `false` | `true` |
| **Session Storage** | `currentUser` | `currentUser` + `adminSession` |
| **Redirect Page** | `index.html` | `admin.html` |
| **Features Access** | Shopping, Cart, Account | Products, Orders, Users, Analytics |
| **Account Needed** | Yes (sign up first) | No (direct login) |
| **Multiple Users** | Yes | No (single admin) |

---

## 💻 Code Example: How to Check User Type

### In Any JavaScript File:

```javascript
// Example 1: Check if current user is admin
const user = getCurrentUser();

if (user && user.isAdmin) {
    console.log('✅ This is an ADMIN');
    // Show admin panel button
    document.getElementById('adminPanel').style.display = 'block';
} else if (user) {
    console.log('👤 This is a CUSTOMER');
    // Show account page button
    document.getElementById('accountPage').style.display = 'block';
} else {
    console.log('🔓 Not logged in');
    // Redirect to sign in
    window.location.href = 'signin.html';
}
```

### Example 2: Protect Admin Page

```javascript
// This runs when admin.html loads
document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    
    // Deny access if NOT admin
    if (!user || !user.isAdmin) {
        alert('❌ Access Denied! Admin only.');
        window.location.href = 'index.html';
        return;
    }
    
    // Allow access
    console.log('✅ Admin access granted to:', user.name);
    loadAdminDashboard();
});
```

### Example 3: Conditional UI Elements

```javascript
// Show different buttons based on role
const user = getCurrentUser();

if (user?.isAdmin) {
    // Admin sees this
    document.getElementById('editProductBtn').style.display = 'block';
    document.getElementById('manageOrdersBtn').style.display = 'block';
    document.getElementById('viewAnalyticsBtn').style.display = 'block';
} else if (user) {
    // Customer sees this
    document.getElementById('myAccountBtn').style.display = 'block';
    document.getElementById('myOrdersBtn').style.display = 'block';
    document.getElementById('myWishlistBtn').style.display = 'block';
}
```

---

## 🔄 Complete Data Flow

### When Customer Signs In:

```
1. signin.html loads
   ↓
2. User selects "Customer" tab
   currentUserType = 'customer'
   ↓
3. Enters email & password
   ↓
4. handleCustomerLogin() runs
   ↓
5. Searches localStorage['users'] array
   ↓
6. IF found AND password matches:
   ↓
   a. Create user object with isAdmin: false
   b. Store in localStorage['currentUser']
   c. Redirect to index.html
   ↓
7. index.html loads
   ↓
8. updateUserNavigation() checks getCurrentUser()
   ↓
9. Sees isAdmin = false
   ↓
10. Shows customer features (Account, Cart, Wishlist)
    Hides admin features (Admin Panel)
    ↓
11. User can access account.html ✓
    User CANNOT access admin.html ✗
```

### When Admin Signs In:

```
1. signin.html loads
   ↓
2. User selects "Admin" tab
   currentUserType = 'admin'
   ↓
3. Enters email & password
   ↓
4. handleAdminLogin() runs
   ↓
5. Compares with hardcoded credentials
   ↓
6. IF matches exactly:
   ↓
   a. Create admin object with isAdmin: true
   b. Store in localStorage['currentUser']
   c. Store in localStorage['adminSession'] = 'active'
   d. Redirect to admin.html
   ↓
7. admin.html loads
   ↓
8. checkAdminAccess() runs
   ↓
9. Checks if isAdmin === true
   ↓
10. Access GRANTED ✓
    ↓
11. Shows admin dashboard
    Can access: Products, Orders, Users, Analytics
    ↓
12. If user tries to visit index.html manually:
    getCurrentUser() returns isAdmin: true
    Different navigation shown
```

---

## 🔐 localStorage Content Examples

### After Customer Login:

```javascript
// localStorage['currentUser']
{
  "id": "cust_1234567890",
  "name": "Aysha Siddika",
  "email": "aysha@example.com",
  "phone": "01700123456",
  "joinDate": "2024-01-15T10:30:00Z",
  "isAdmin": false  // ◄── CUSTOMER INDICATOR
}

// localStorage['users']
[
  {
    "id": "cust_1234567890",
    "name": "Aysha Siddika",
    "email": "aysha@example.com",
    "phone": "01700123456",
    "password": "mypassword123",
    "joinDate": "2024-01-15T10:30:00Z"
  },
  ...more users
]
```

### After Admin Login:

```javascript
// localStorage['currentUser']
{
  "id": "admin_001",
  "name": "Admin User",
  "email": "admin@knowledgeplant.bd",
  "phone": "01700000000",
  "joinDate": "2024-01-01T00:00:00Z",
  "isAdmin": true  // ◄── ADMIN INDICATOR
}

// localStorage['adminSession']
"active"
```

---

## 🎯 Key Differences Summary

### The MAGIC happens in `isAdmin` flag:

```javascript
// When Page Loads
const user = getCurrentUser();

// READ THIS FLAG TO KNOW THE ROLE
if (user.isAdmin === true) {
    // 🛡️ ADMIN - Show admin features
} else if (user.isAdmin === false) {
    // 👤 CUSTOMER - Show customer features
}
```

### Think of it like:
- **Customer** = Regular visitor with shopping privileges
- **Admin** = Store manager with full control

**The `isAdmin` flag is the "ID badge"** that tells the system what permissions the user has! 🎫

---

## 🚀 Testing the System

### Test 1: Customer Sign-In
1. Go to `signin.html`
2. Click "Customer" tab
3. Sign up on `signup.html` first
4. Sign in with your credentials
5. Should go to `index.html`
6. Click your name → goes to `account.html` ✓
7. Try to access `admin.html` directly → gets redirected ✗

### Test 2: Admin Sign-In
1. Go to `signin.html`
2. Click "Admin" tab
3. Email: `admin@knowledgeplant.bd`
4. Password: `admin123`
5. Should go to `admin.html`
6. Try to access `account.html` → shows different view ✓

### Test 3: Check console
```javascript
// Open browser console (F12)
// Type:
getCurrentUser()

// Output for customer:
{ ..., isAdmin: false }

// Output for admin:
{ ..., isAdmin: true }
```

---

## 📚 Files That Use `isAdmin`:

| File | How It's Used |
|------|---------------|
| `signin.html` | Sets `isAdmin` based on login type |
| `script.js` | `getCurrentUser()` retrieves the flag |
| `admin.html` | `checkAdminAccess()` verifies `isAdmin === true` |
| `account.html` | Loads only for customers (`isAdmin: false`) |
| `index.html` | Shows different UI based on flag |
| All pages | `updateUserNavigation()` checks the flag |

---

**Bottom Line:** The system is super simple - just one boolean flag (`isAdmin: true/false`) determines everything! 🎯
