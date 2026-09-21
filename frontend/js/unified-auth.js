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

      const data = await res.json();

      if (res.ok && data.success) {
        showAlert(`Authenticated successfully as ${data.role}. Launching app...`, 'success');
        sessionStorage.setItem('active_role', data.role);
        sessionStorage.setItem('user_name', data.name);
        setTimeout(() => {
          window.location.href = data.redirectUrl || '/app.html';
        }, 700);
      } else {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = 'Sign In';
        }
        showAlert(data.message || 'Invalid credentials. Please verify email and password.', 'danger');
      }
    } catch (e) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Sign In';
      }
      showAlert('Unable to reach server. Please check backend connection.', 'danger');
    }
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
