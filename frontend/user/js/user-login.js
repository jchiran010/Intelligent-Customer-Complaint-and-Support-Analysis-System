/**
 * USER LOGIN CONTROLLER (user-login.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('userLoginForm');
  const alertBox = document.getElementById('loginAlert');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('logout')) {
    showAlert('You have been safely signed out.', 'info');
  } else if (urlParams.get('error') === 'access_denied') {
    showAlert('Please sign in with your customer account.', 'warning');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('userEmail').value.trim();
      const password = document.getElementById('userPassword').value;
      const rememberMe = document.getElementById('userRememberMe')?.checked || false;

      if (!email || !password) {
        showAlert('Please enter your email and password.', 'warning');
        return;
      }

      setLoading(true);
      hideAlert();

      try {
        const response = await fetch('/api/user/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email, password, rememberMe })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showAlert('Welcome back! Loading your dashboard...', 'success');
          setTimeout(() => {
            window.location.href = data.redirectUrl || '/user/dashboard';
          }, 700);
        } else {
          setLoading(false);
          showAlert(data.message || 'Invalid email or password.', 'danger');
        }
      } catch (err) {
        setLoading(false);
        showAlert('Unable to reach authentication service. Please check your connection.', 'danger');
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
    if (btnText) btnText.textContent = isLoading ? 'Signing In...' : 'Sign In';
  }
});
