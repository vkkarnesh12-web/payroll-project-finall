// Authentication Logic

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // If user is logged in and on login/signup page, redirect to dashboard
    if (currentUser && (currentPage === 'login.html' || currentPage === 'signup.html')) {
        window.location.href = 'index.html';
    }
    
    // If user is not logged in and on dashboard, redirect to login
    if (!currentUser && currentPage === 'index.html') {
        window.location.href = 'login.html';
    }
    
    initializeAuthForms();
});

function initializeAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
        
        // Password strength indicator
        const passwordInput = document.getElementById('signupPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', checkPasswordStrength);
        }
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorDiv = document.getElementById('loginError');
    const successDiv = document.getElementById('loginSuccess');
    
    // Reset messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Validate inputs
    if (!email || !password) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError(errorDiv, 'Please enter a valid email address');
        return;
    }
    
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem('payrollUsers') || '[]');
    
    // Add demo user if no users exist
    if (users.length === 0) {
        users.push({
            id: 1,
            email: 'admin@payroll.com',
            password: hashPassword('admin123'),
            firstName: 'Admin',
            lastName: 'User',
            company: 'Demo Company',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('payrollUsers', JSON.stringify(users));
    }
    
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === hashPassword(password));
    
    if (!user) {
        showError(errorDiv, 'Invalid email or password');
        return;
    }
    
    // Login successful
    const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
    }
    
    showSuccess(successDiv, 'Login successful! Redirecting...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Handle Signup
function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const company = document.getElementById('signupCompany').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    const errorDiv = document.getElementById('signupError');
    const successDiv = document.getElementById('signupSuccess');
    
    // Reset messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Validation
    if (!firstName || !lastName || !email || !company || !password || !confirmPassword) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError(errorDiv, 'Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError(errorDiv, 'Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showError(errorDiv, 'Passwords do not match');
        return;
    }
    
    if (!agreeTerms) {
        showError(errorDiv, 'Please agree to the Terms and Conditions');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('payrollUsers') || '[]');
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showError(errorDiv, 'This email is already registered. Please login instead.');
        return;
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        firstName: firstName,
        lastName: lastName,
        email: email,
        company: company,
        password: hashPassword(password),
        createdAt: new Date().toISOString()
    };
    
    // Add user and save
    users.push(newUser);
    localStorage.setItem('payrollUsers', JSON.stringify(users));
    
    // Create empty employee data for this user
    const employeesKey = `employees_${newUser.id}`;
    localStorage.setItem(employeesKey, JSON.stringify([]));
    
    showSuccess(successDiv, 'Account created successfully! Redirecting to login...');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// Password Strength Checker
function checkPasswordStrength() {
    const password = document.getElementById('signupPassword').value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (!password) {
        strengthDiv.textContent = '';
        return;
    }
    
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };
    
    for (let check in checks) {
        if (checks[check]) strength++;
    }
    
    let strengthText = '';
    let strengthColor = '';
    
    if (strength === 1) {
        strengthText = 'Weak password';
        strengthColor = '#e74c3c';
    } else if (strength === 2) {
        strengthText = 'Fair password';
        strengthColor = '#f39c12';
    } else if (strength === 3 || strength === 4) {
        strengthText = 'Good password';
        strengthColor = '#f1c40f';
    } else if (strength === 5) {
        strengthText = 'Strong password';
        strengthColor = '#27ae60';
    }
    
    strengthDiv.textContent = strengthText;
    strengthDiv.style.color = strengthColor;
}

// Utility Functions

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function hashPassword(password) {
    // Simple hash function (for demo purposes only - use proper hashing in production)
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return 'hash_' + Math.abs(hash).toString(16);
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showSuccess(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Auto-fill email if "Remember me" was checked
document.addEventListener('DOMContentLoaded', function() {
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) {
        const rememberedEmail = localStorage.getItem('rememberEmail');
        if (rememberedEmail) {
            loginEmail.value = rememberedEmail;
        }
    }
});
