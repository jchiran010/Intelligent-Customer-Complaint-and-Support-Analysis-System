/**
 * ADMIN COMMON JAVASCRIPT (admin-common.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('admin_theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.documentElement.setAttribute('data-bs-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  document.documentElement.setAttribute('data-bs-theme', next);
  localStorage.setItem('admin_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const icons = document.querySelectorAll('.theme-toggle-icon');
  icons.forEach(icon => {
    if (theme === 'dark') {
      icon.classList.remove('bi-moon-stars');
      icon.classList.add('bi-sun');
    } else {
      icon.classList.remove('bi-sun');
      icon.classList.add('bi-moon-stars');
    }
  });
}

// Mobile Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', toggleSidebar);
  }
  sidebar.classList.toggle('show');
  backdrop.classList.toggle('show');
}

// Toast Notifications
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '1090';
    document.body.appendChild(toastContainer);
  }

  const toastId = 'toast-' + Date.now();
  const bgClass = type === 'success' ? 'bg-success text-white' :
                  type === 'danger' ? 'bg-danger text-white' :
                  type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';

  const html = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  toastContainer.insertAdjacentHTML('beforeend', html);
  const elem = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(elem, { delay: 4000 });
  bsToast.show();
  elem.addEventListener('hidden.bs.toast', () => elem.remove());
}

// Admin Logout
async function handleAdminLogout() {
  try {
    const res = await fetch('/api/admin/logout', { method: 'POST' });
    const data = await res.json();
    window.location.href = data.redirectUrl || '/admin/login';
  } catch (err) {
    window.location.href = '/admin/login';
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  const menuBtn = document.getElementById('menuToggleBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', toggleSidebar);
  }

  const logoutBtns = document.querySelectorAll('.btn-admin-logout');
  logoutBtns.forEach(b => b.addEventListener('click', (e) => {
    e.preventDefault();
    handleAdminLogout();
  }));
});
