/**
 * UNIFIED AUTHENTICATION CONTROLLER (unified-auth.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

document.addEventListener('DOMContentLoaded', () => {
  initUnifiedTheme();

  const customerForm = document.getElementById('unifiedCustomerForm');
  const adminForm = document.getElementById('unifiedAdminForm');
  const registerForm = document.getElementById('unifiedRegisterForm');
  const alertBox = document.getElementById('unifiedAlert');

  if (customerForm) {
    customerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('custEmail').value.trim();
      const password = document.getElementById('custPassword').value;
      handleLogin(email, password, 'USER', 'custSubmitBtn');
    });
  }

  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admEmail').value.trim();
      const password = document.getElementById('admPassword').value;
      handleLogin(email, password, 'ADMIN', 'admSubmitBtn');
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleRegister();
    });

    const regPassInput = document.getElementById('regPassword');
    if (regPassInput) {
      regPassInput.addEventListener('input', updatePasswordStrength);
    }
  }

  function updatePasswordStrength() {
    const val = document.getElementById('regPassword')?.value || '';
    const bar = document.getElementById('regPassStrengthBar');
    const text = document.getElementById('regPassStrengthText');
    if (!bar || !text) return;

    if (val.length === 0) {
      bar.style.width = '0%';
      bar.className = 'progress-bar bg-danger';
      text.textContent = 'Strength: none';
      return;
    }

    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score <= 2) {
      bar.style.width = '33%';
      bar.className = 'progress-bar bg-danger';
      text.textContent = 'Strength: Weak';
      text.className = 'text-danger small';
    } else if (score <= 4) {
      bar.style.width = '66%';
      bar.className = 'progress-bar bg-warning';
      text.textContent = 'Strength: Moderate';
      text.className = 'text-warning small';
    } else {
      bar.style.width = '100%';
      bar.className = 'progress-bar bg-success';
      text.textContent = 'Strength: Strong';
      text.className = 'text-success small';
    }
  }

  async function handleRegister() {
    const name = document.getElementById('regName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim();
    const phone = document.getElementById('regPhone')?.value.trim() || '';
    const department = document.getElementById('regDepartment')?.value || 'Customer';
    const password = document.getElementById('regPassword')?.value;
    const confirmPassword = document.getElementById('regConfirmPassword')?.value;
    const btn = document.getElementById('regSubmitBtn');

    if (!name || !email || !password) {
      showAlert('Please fill in all required fields.', 'danger');
      return;
    }

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long.', 'danger');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Passwords do not match. Please verify your password confirmation.', 'danger');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Creating Account...';
    }
    hideAlert();

    const regPayload = { name, email, password, phone, department };

    try {
      // 1. Try unified auth register endpoint
      let res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(regPayload)
      });

      // 2. Fallback to /api/user/register if needed
      if (!res.ok && res.status === 404) {
        res = await fetch('/api/user/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(regPayload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        // Also save to localStorage for seamless cross-mode persistence
        saveUserToLocalStorage({ name, email, password, role: 'USER', phone, department });

        showAlert(`Account created successfully for ${name}! Logging you in...`, 'success');
        sessionStorage.setItem('active_role', 'USER');
        sessionStorage.setItem('user_name', name);
        sessionStorage.setItem('user_email', email);

        setTimeout(() => {
          window.location.href = '/app.html';
        }, 900);
        return;
      }

      const errData = await res.json().catch(() => ({}));
      if (res.status === 400 || res.status === 409) {
        showAlert(errData.message || 'An account with this email already exists.', 'danger');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-person-check-fill me-1"></i> Register & Create Account';
        }
        return;
      }

      // Offline / Client fallback registration
      handleClientFallbackRegister(regPayload, btn);

    } catch (e) {
      handleClientFallbackRegister(regPayload, btn);
    }
  }

  function handleClientFallbackRegister(userObj, btn) {
    try {
      saveUserToLocalStorage({ ...userObj, role: 'USER' });
      showAlert(`Account created successfully for ${userObj.name}! Logging you in...`, 'success');
      sessionStorage.setItem('active_role', 'USER');
      sessionStorage.setItem('user_name', userObj.name);
      sessionStorage.setItem('user_email', userObj.email);
      setTimeout(() => {
        window.location.href = '/app.html';
      }, 900);
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-person-check-fill me-1"></i> Register & Create Account';
      }
      showAlert('Registration could not be completed. Please try again.', 'danger');
    }
  }

  function saveUserToLocalStorage(user) {
    try {
      const list = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const filtered = list.filter(u => u.email.toLowerCase() !== user.email.toLowerCase());
      filtered.push(user);
      localStorage.setItem('registered_users', JSON.stringify(filtered));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  async function handleLogin(email, password, roleHint, btnId) {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Signing in...';
    }
    hideAlert();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showAlert(`Authenticated successfully as ${data.role}. Launching app...`, 'success');
          sessionStorage.setItem('active_role', data.role);
          sessionStorage.setItem('user_name', data.name);
          sessionStorage.setItem('user_email', data.email || email);
          setTimeout(() => {
            window.location.href = data.redirectUrl || '/app.html';
          }, 600);
          return;
        }
      }

      // If backend returned explicit 401/400 error message
      if (res.status === 401 || res.status === 400) {
        const data = await res.json().catch(() => ({}));
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Sign In';
        }
        showAlert(data.message || 'Invalid credentials. Please verify email and password.', 'danger');
        return;
      }

      // If server returned 404 (e.g. running on Vercel standalone without Java runtime)
      handleClientFallbackAuth(email, password, roleHint, btn);

    } catch (e) {
      // Network failure / Vercel standalone mode
      handleClientFallbackAuth(email, password, roleHint, btn);
    }
  }

  function handleClientFallbackAuth(email, password, roleHint, btn) {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check Demo Admin Accounts
    if (cleanEmail === 'admin@complaintsystem.com' && password === 'Admin@123') {
      sessionStorage.setItem('active_role', 'ADMIN');
      sessionStorage.setItem('user_name', 'System Administrator');
      sessionStorage.setItem('user_email', 'admin@complaintsystem.com');
      showAlert('Authenticated successfully as ADMIN. Launching app...', 'success');
      setTimeout(() => {
        window.location.href = '/app.html';
      }, 600);
      return;
    }

    if (cleanEmail === 'sarah.support@complaintsystem.com' && password === 'Admin@123') {
      sessionStorage.setItem('active_role', 'ADMIN');
      sessionStorage.setItem('user_name', 'Sarah Jenkins (Support Lead)');
      sessionStorage.setItem('user_email', 'sarah.support@complaintsystem.com');
      showAlert('Authenticated successfully as ADMIN (Support Lead). Launching app...', 'success');
      setTimeout(() => {
        window.location.href = '/app.html';
      }, 600);
      return;
    }

    // 2. Check Demo Customer Account
    if (cleanEmail === 'john.doe@example.com' && password === 'User@123') {
      sessionStorage.setItem('active_role', 'USER');
      sessionStorage.setItem('user_name', 'John Doe');
      sessionStorage.setItem('user_email', 'john.doe@example.com');
      showAlert('Authenticated successfully as USER. Launching app...', 'success');
      setTimeout(() => {
        window.location.href = '/app.html';
      }, 600);
      return;
    }

    // 3. Check registered users from localStorage
    try {
      const registered = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const matched = registered.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
      if (matched) {
        sessionStorage.setItem('active_role', matched.role || 'USER');
        sessionStorage.setItem('user_name', matched.name || 'User');
        sessionStorage.setItem('user_email', matched.email);
        showAlert(`Authenticated successfully as ${matched.role || 'USER'}. Launching app...`, 'success');
        setTimeout(() => {
          window.location.href = '/app.html';
        }, 600);
        return;
      }
    } catch (err) {
      console.warn('Storage read error:', err);
    }

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
    showAlert('Invalid credentials. Please verify your email and password.', 'danger');
  }

  function showAlert(msg, type = 'danger') {
    if (!alertBox) return;
    alertBox.className = `alert alert-${type} d-block`;
    alertBox.textContent = msg;
  }

  function hideAlert() {
    if (alertBox) alertBox.className = 'alert alert-danger d-none';
  }
});

function initUnifiedTheme() {
  const saved = localStorage.getItem('app_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  document.documentElement.setAttribute('data-bs-theme', saved);
  const icons = document.querySelectorAll('.theme-toggle-icon');
  icons.forEach(icon => {
    if (saved === 'dark') {
      icon.classList.remove('bi-moon-stars');
      icon.classList.add('bi-sun');
    } else {
      icon.classList.remove('bi-sun');
      icon.classList.add('bi-moon-stars');
    }
  });
}
