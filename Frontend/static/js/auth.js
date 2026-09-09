/* auth.js: Registration input validation and password strength indicators */

document.addEventListener('DOMContentLoaded', function() {
  const passwordInput = document.getElementById('reg-password');
  const strengthFill = document.getElementById('password-strength-fill');
  const strengthLabel = document.getElementById('password-strength-text');

  if (passwordInput && strengthFill && strengthLabel) {
    passwordInput.addEventListener('input', function() {
      const password = passwordInput.value;
      let score = 0;

      if (password.length >= 8) score += 25;
      if (/[A-Z]/.test(password)) score += 25;
      if (/[0-9]/.test(password)) score += 25;
      if (/[^A-Za-z0-9]/.test(password)) score += 25;

      // Update Fill width
      strengthFill.style.width = score + '%';
      
      // Update color and text
      if (score === 0) {
        strengthFill.className = 'password-strength-fill';
        strengthLabel.textContent = 'Strength: Empty';
      } else if (score <= 50) {
        strengthFill.className = 'password-strength-fill weak';
        strengthLabel.textContent = 'Strength: Weak';
      } else if (score <= 75) {
        strengthFill.className = 'password-strength-fill medium';
        strengthLabel.textContent = 'Strength: Medium';
      } else {
        strengthFill.className = 'password-strength-fill strong';
        strengthLabel.textContent = 'Strength: Strong (Secure)';
      }
    });
  }

  // Password Visibility Toggle
  const toggleBtn = document.getElementById('password-toggle');
  const pwdField = document.getElementById('password-input');
  const toggleIcon = document.getElementById('password-toggle-icon');

  if (toggleBtn && pwdField && toggleIcon) {
    toggleBtn.addEventListener('click', function() {
      const type = pwdField.getAttribute('type') === 'password' ? 'text' : 'password';
      pwdField.setAttribute('type', type);
      
      if (type === 'text') {
        toggleIcon.className = 'bi bi-eye';
      } else {
        toggleIcon.className = 'bi bi-eye-slash';
      }
    });
  }

  // Confirm password validator
  const confirmPwd = document.getElementById('reg-confirm-password');
  const submitBtn = document.getElementById('submit-reg-btn');
  const mismatchText = document.getElementById('password-mismatch-feedback');

  if (confirmPwd && passwordInput && submitBtn) {
    confirmPwd.addEventListener('input', function() {
      if (passwordInput.value !== confirmPwd.value) {
        if (mismatchText) mismatchText.classList.remove('d-none');
        submitBtn.disabled = true;
      } else {
        if (mismatchText) mismatchText.classList.add('d-none');
        submitBtn.disabled = false;
      }
    });
  }
});
