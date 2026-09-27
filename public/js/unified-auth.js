/**
 * UNIFIED AUTHENTICATION CONTROLLER (unified-auth.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

document.addEventListener('DOMContentLoaded', () => {
  initUnifiedTheme();

  const customerForm = document.getElementById('unifiedCustomerForm');
  const adminForm = document.getElementById('unifiedAdminForm');
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
