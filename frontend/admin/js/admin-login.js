/**
 * ADMIN LOGIN CONTROLLER (admin-login.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('adminLoginForm');
  const alertBox = document.getElementById('loginAlert');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');

  // Check URL parameters for access_denied or logout
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('error') === 'access_denied') {
    showAlert('Access denied. Administrator privileges required to access that resource.', 'danger');
  } else if (urlParams.has('logout')) {
    showAlert('You have been securely logged out from the Admin Portal.', 'info');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;
      const rememberMe = document.getElementById('adminRememberMe')?.checked || false;

      if (!email || !password) {
        showAlert('Please enter both your administrator email and password.', 'warning');
        return;
      }

      setLoading(true);
      hideAlert();

      try {
        const response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email, password, rememberMe })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showAlert('Administrator authentication verified. Redirecting to Admin Dashboard...', 'success');
          setTimeout(() => {
            window.location.href = data.redirectUrl || '/admin/dashboard';
          }, 800);
        } else {
          setLoading(false);
          // Highlight requirement 27: if account is not an admin, message is displayed
          showAlert(data.message || 'Invalid administrator credentials.', 'danger');
        }
      } catch (err) {
        setLoading(false);
        showAlert('Unable to connect to the authentication server. Please verify backend is running.', 'danger');
      }
    });
  }

  function showAlert(msg, type = 'danger') {
    if (!alertBox) return;
    alertBox.className = `alert alert-${type} d-flex align-items-center mb-4 fade show`;
    alertBox.innerHTML = `
      <i class="bi bi-${type === 'success' ? 'check-circle-fill' : type === 'info' ? 'info-circle-fill' : 'exclamation-triangle-fill'} me-2"></i>
      <div>${msg}</div>
    `;
    alertBox.classList.remove('d-none');
  }

  function hideAlert() {
    if (alertBox) alertBox.classList.add('d-none');
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (btnSpinner) btnSpinner.classList.toggle('d-none', !isLoading);
    if (btnText) btnText.textContent = isLoading ? 'Authenticating...' : 'Sign In as Administrator';
  }
});
