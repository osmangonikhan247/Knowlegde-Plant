# 🔍 Authentication System - Detailed Code Flow

## The Complete Authentication Process (With Code)

---

## 📍 STEP 1: Sign-In Page Display (signin.html)

```html
<!-- User selects account type -->
<div class="user-type-selection">
    <!-- CUSTOMER TAB (Active by default) -->
    <button class="user-type-btn active" data-type="customer" 
            onclick="switchUserType('customer')">
        🛒 Customer
    </button>
    
    <!-- ADMIN TAB -->
    <button class="user-type-btn" data-type="admin" 
            onclick="switchUserType('admin')">
        🛡️ Admin
    </button>
</div>

<!-- Login form (same for both) -->
<form id="signinForm">
    <input type="email" id="email" placeholder="Email">
    <input type="password" id="password" placeholder="Password">
    <button type="submit">Sign In</button>
</form>
```

---

## 📍 STEP 2: JavaScript Variable Setup

```javascript
// This variable TRACKS which tab the user selected
let currentUserType = 'customer';  // Default is customer

// When user clicks a tab button
function switchUserType(type) {
    currentUserType = type;  // Change to 'admin' or 'customer'
    
    // Highlight the selected button
    document.querySelectorAll('.user-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
}

// Example:
// User clicks "Admin" tab
// → currentUserType becomes 'admin'
// → Admin button gets highlighted
```

---

## 📍 STEP 3: Form Submission Handler

```javascript
// When user clicks "Sign In" button
document.getElementById('signinForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Don't reload page
    
    // Get the entered credentials
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // 🎯 HERE'S THE MAGIC: Different paths based on currentUserType
    if (currentUserType === 'admin') {
        // ➡️ Admin clicked the Admin tab
        handleAdminLogin(email, password);
    } else {
        // ➡️ Customer clicked the Customer tab (or nothing selected)
        handleCustomerLogin(email, password);
    }
});

/*
Example 1 - Customer Clicks "Sign In":
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
currentUserType = 'customer'
email = 'john@example.com'
password = 'mypassword'
→ Calls handleCustomerLogin('john@example.com', 'mypassword')

Example 2 - Admin Clicks "Sign In":
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
currentUserType = 'admin'
email = 'admin@knowledgeplant.bd'
password = 'admin123'
→ Calls handleAdminLogin('admin@knowledgeplant.bd', 'admin123')
*/
```

---

## 📍 STEP 4A: Customer Login Path

```javascript
function handleCustomerLogin(email, password) {
    // STEP 4A-1: Get all registered users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // 
    // localStorage['users'] looks like:
    // [
    //   {id: 'cust_1', name: 'John', email: 'john@ex.com', password: 'pwd1'},
    //   {id: 'cust_2', name: 'Jane', email: 'jane@ex.com', password: 'pwd2'},
    //   ...
    // ]
    
    // STEP 4A-2: Search for matching user
    const user = users.find(u => u.email === email && u.password === password);
    //
    // Example:
    // Searching for: email='john@example.com', password='mypassword'
    // 
    // Checks user 1:
    //   'john@example.com' === 'john@example.com' ✓
    //   'mypassword' === 'mypassword' ✓
    //   FOUND! Return this user object
    
    if (user) {
        // STEP 4A-3: User found! Create the session object
        const currentUserData = {
            id: user.id,           // 'cust_123'
            name: user.name,       // 'John Doe'
            email: user.email,     // 'john@example.com'
            phone: user.phone,     // '01700123456'
            joinDate: user.joinDate,  // '2024-01-15T10:30:00'
            isAdmin: false         // ◄─ CUSTOMER IDENTIFIER!
        };
        
        // STEP 4A-4: Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUserData));
        //
        // Now localStorage['currentUser'] contains:
        // {
        //   id: 'cust_123',
        //   name: 'John Doe',
        //   email: 'john@example.com',
        //   phone: '01700123456',
        //   joinDate: '2024-01-15T10:30:00',
        //   isAdmin: false  ◄─ THE KEY DIFFERENCE
        // }
        
        // STEP 4A-5: Show success and redirect
        alert('Sign in successful! Welcome back, ' + user.name);
        window.location.href = 'index.html';  // Go to customer home page
        
    } else {
        // STEP 4A-6: User not found
        alert('Invalid email or password. Please try again.');
    }
}

/*
CUSTOMER LOGIN FLOW SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: john@example.com
Password: mypassword123
↓
Search localStorage['users']
↓
Found matching user? YES
↓
Set isAdmin: FALSE ◄─ CUSTOMER
↓
Save to localStorage['currentUser']
↓
Redirect to index.html
*/
```

---

## 📍 STEP 4B: Admin Login Path

```javascript
function handleAdminLogin(email, password) {
    // STEP 4B-1: Hardcoded admin credentials (NOT from database!)
    const adminCredentials = {
        email: 'admin@knowledgeplant.bd',
        password: 'admin123'
    };
    //
    // ⚠️ NOTE: These are hardcoded in the code!
    // In production, fetch from secure backend database
    
    // STEP 4B-2: Direct comparison (not database lookup)
    if (email === adminCredentials.email && password === adminCredentials.password) {
        //
        // Example:
        // Entered email: 'admin@knowledgeplant.bd'
        // Credential email: 'admin@knowledgeplant.bd'
        // Match? YES ✓
        //
        // Entered password: 'admin123'
        // Credential password: 'admin123'
        // Match? YES ✓
        
        // STEP 4B-3: Credentials correct! Create admin session
        const adminUser = {
            id: 'admin_001',
            name: 'Admin User',
            email: email,
            phone: '01700000000',
            joinDate: new Date().toISOString(),
            isAdmin: true  // ◄─ ADMIN IDENTIFIER!
        };
        
        // STEP 4B-4: Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        localStorage.setItem('adminSession', 'active');  // Extra session marker
        //
        // Now localStorage['currentUser'] contains:
        // {
        //   id: 'admin_001',
        //   name: 'Admin User',
        //   email: 'admin@knowledgeplant.bd',
        //   phone: '01700000000',
        //   joinDate: '2026-04-29T...',
        //   isAdmin: true  ◄─ THE KEY DIFFERENCE
        // }
        
        // STEP 4B-5: Show success and redirect
        alert('Admin login successful!');
        window.location.href = 'admin.html';  // Go to admin panel
        
    } else {
        // STEP 4B-6: Credentials incorrect
        alert('Invalid admin credentials. Demo: admin@knowledgeplant.bd / admin123');
    }
}

/*
ADMIN LOGIN FLOW SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━
Email: admin@knowledgeplant.bd
Password: admin123
↓
Compare with hardcoded credentials
↓
Match? YES
↓
Set isAdmin: TRUE ◄─ ADMIN
↓
Save to localStorage['currentUser']
↓
Redirect to admin.html
*/
```

---

## 📍 STEP 5: Page Detection System

```javascript
// This function is in script.js
// It reads the user object to understand the role

function getCurrentUser() {
    // Get the saved user from localStorage
    const user = localStorage.getItem('currentUser');
    
    // If exists, parse JSON; if not, return null
    return user ? JSON.parse(user) : null;
}

// Example outputs:
// 
// If customer logged in:
// getCurrentUser() returns:
// { id: 'cust_123', name: 'John', ..., isAdmin: false }
//
// If admin logged in:
// getCurrentUser() returns:
// { id: 'admin_001', name: 'Admin', ..., isAdmin: true }
//
// If not logged in:
// getCurrentUser() returns: null
```

---

## 📍 STEP 6: Access Control & Navigation

### In `admin.html`:

```javascript
// This runs when admin.html loads
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAccess();  // Verify access
    loadAdminDashboard();
});

function checkAdminAccess() {
    // Get the current user
    const user = getCurrentUser();
    
    // Check if user exists AND has admin privileges
    if (!user || !user.isAdmin) {
        // ❌ NOT ADMIN! Block access
        alert('Access denied! Admin privileges required.');
        window.location.href = 'index.html';  // Redirect to home
        return;
    }
    
    // ✅ ADMIN! Show name with admin badge
    document.getElementById('adminUserName').textContent = 
        user.name + ' (Admin)';
    
    // Now continue loading admin features
}

/*
EXAMPLE SCENARIOS:
━━━━━━━━━━━━━━━━━

Scenario 1 - Admin accesses admin.html:
localStorage['currentUser'].isAdmin = true
↓
checkAdminAccess() runs
↓
Checks: if (!user || !user.isAdmin)
        if (!true) = FALSE
↓
Condition is FALSE, skip alert
↓
Continue loading admin dashboard ✓

Scenario 2 - Customer tries to access admin.html:
localStorage['currentUser'].isAdmin = false
↓
checkAdminAccess() runs
↓
Checks: if (!user || !user.isAdmin)
        if (!false) = TRUE
↓
Condition is TRUE, show alert
↓
Redirect to index.html ✗

Scenario 3 - Not logged in user accesses admin.html:
localStorage['currentUser'] = null (or doesn't exist)
↓
getCurrentUser() returns null
↓
checkAdminAccess() runs
↓
Checks: if (!user || !user.isAdmin)
        if (!null || undefined) = TRUE
↓
Condition is TRUE, show alert
↓
Redirect to index.html ✗
*/
```

### In `account.html`:

```javascript
function loadUserProfile() {
    const user = getCurrentUser();
    
    // Check 1: User must be logged in
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }
    
    // Check 2: Admin should go to admin panel, not customer account
    if (user.isAdmin) {
        window.location.href = 'admin.html';
        return;
    }
    
    // Check passed! Load customer profile
    // (code for loading profile...)
}

/*
This prevents:
- Non-logged-in users from viewing account
- Admins from viewing customer account
*/
```

---

## 📍 STEP 7: Conditional UI Display

```javascript
// In any page (like index.html)
function updateUserNavigation() {
    const user = getCurrentUser();
    const userLink = document.querySelector('.user-link');
    
    if (!user) {
        // NOT LOGGED IN
        userLink.innerHTML = `<i class="fas fa-user"></i> Sign In`;
        userLink.href = 'signin.html';
    } else if (user.isAdmin) {
        // ADMIN LOGGED IN
        userLink.innerHTML = `<i class="fas fa-shield"></i> ${user.name} (Admin)`;
        // Show admin-only options
        document.getElementById('adminPanel').style.display = 'block';
    } else {
        // CUSTOMER LOGGED IN
        userLink.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
        // Show customer-only options
        document.getElementById('accountPage').style.display = 'block';
        document.getElementById('cartLink').style.display = 'block';
    }
}

/*
This shows:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Not Logged In:
"Sign In" link

Customer Logged In:
"👤 John Doe"
+ Account link
+ Cart visible
+ Wishlist visible

Admin Logged In:
"🛡️ Admin (Admin)"
+ Admin Panel link
+ Dashboard visible
+ Products manager visible
*/
```

---

## 🎯 The Complete Comparison Table

| Aspect | Customer Flow | Admin Flow |
|--------|----------------|-----------|
| **User Tab Selection** | Clicks "Customer" | Clicks "Admin" |
| **currentUserType** | = 'customer' | = 'admin' |
| **Function Called** | handleCustomerLogin() | handleAdminLogin() |
| **Data Lookup** | localStorage['users'] array | Hardcoded object |
| **Email Check** | Searches array | Direct comparison |
| **Password Check** | In array match | Direct comparison |
| **Success: isAdmin** | Set to `false` | Set to `true` |
| **Success: Redirect** | index.html | admin.html |
| **Access Control** | checkAccountAccess() | checkAdminAccess() |
| **Feature Access** | Customer features shown | Admin features shown |

---

## 🔐 How The System Identifies Users

```
THE MASTER KEY: isAdmin Flag
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

currentUser = {
    id: '...',
    name: '...',
    email: '...',
    isAdmin: ??? ◄─ READ THIS
}

isAdmin === true     → ADMIN    → admin.html → Admin features
isAdmin === false    → CUSTOMER → index.html → Customer features
```

---

## 📊 Complete Data Flow Diagram

```
START: User Opens signin.html
│
├─ Tab 1: CUSTOMER selected ──→ currentUserType = 'customer'
│  ├─ Email: john@example.com
│  ├─ Password: mypassword
│  └─ handleCustomerLogin()
│     ├─ Search localStorage['users']
│     ├─ Match found ✓
│     ├─ Set isAdmin = false
│     ├─ Save to localStorage['currentUser']
│     └─ Redirect → index.html
│        ├─ getCurrentUser().isAdmin = false
│        └─ Show customer UI (Account, Cart, Wishlist)
│
├─ Tab 2: ADMIN selected ──→ currentUserType = 'admin'
│  ├─ Email: admin@knowledgeplant.bd
│  ├─ Password: admin123
│  └─ handleAdminLogin()
│     ├─ Compare hardcoded credentials
│     ├─ Match found ✓
│     ├─ Set isAdmin = true
│     ├─ Save to localStorage['currentUser']
│     └─ Redirect → admin.html
│        ├─ checkAdminAccess()
│        ├─ getCurrentUser().isAdmin = true
│        ├─ Access GRANTED ✓
│        └─ Show admin UI (Dashboard, Products, Orders, etc.)
│
END: User browsing as their role
```

---

## 🎓 Key Takeaways

1. **The Tab determines the function** → `currentUserType`
2. **The function differs by source** → Database vs Hardcoded
3. **The isAdmin flag differs** → `true` vs `false`
4. **The page checks the flag** → Allows or blocks access
5. **The UI adapts to the role** → Different features shown

**The system is elegant because it's ONE BOOLEAN that controls EVERYTHING!** 🎯

---

Done! The system differentiates users and admins through:
1. ✅ Different login tabs selected
2. ✅ Different credential sources (database vs hardcoded)
3. ✅ One boolean flag (`isAdmin`)
4. ✅ Access control checks on protected pages
5. ✅ Conditional UI rendering based on role
