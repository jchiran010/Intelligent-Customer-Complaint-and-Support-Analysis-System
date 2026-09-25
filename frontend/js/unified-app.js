/**
 * UNIFIED APPLICATION CONTROLLER (unified-app.js)
 * Intelligent Customer Complaint & Support Analysis System
 * Single-Page Unified Application Shell for both User and Admin
 */

let currentUser = null;
let currentRole = 'USER';
let statusChartInstance = null;
let sentimentChartInstance = null;

// ==========================================
// RESILIENT CLIENT DATA STORE (FOR VERCEL / STANDALONE)
// ==========================================
const LocalComplaintStore = {
  getInitialComplaints() {
    return [
      {
        id: 1048,
        complaintNumber: 'CMP-2026-1048',
        ticketNumber: 'TKT-8821',
        title: 'Duplicate Debit on Monthly Subscription Invoice #9821',
        description: 'I was charged twice on September 15 for my monthly subscription invoice #9821. Kindly refund the duplicate $199 deduction immediately as this has affected our company petty cash.',
        categoryName: 'Billing & Payments',
        categoryId: 1,
        status: 'PENDING',
        priority: 'CRITICAL',
        sentimentScore: -0.92,
        sentimentLabel: 'VERY_NEGATIVE',
        assignedToName: 'Finance Desk',
        slaHours: 12,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        userEmail: 'john.doe@example.com',
        userName: 'John Doe'
      },
      {
        id: 1047,
        complaintNumber: 'CMP-2026-1047',
        ticketNumber: 'TKT-8820',
        title: 'Application Crashes Immediately on Proceed to Checkout',
        description: 'Whenever I click Proceed to Payment on the Android app (version 4.2), the application crashes to the home screen without any error code. I have tried clearing cache.',
        categoryName: 'Technical & Bug Reports',
        categoryId: 2,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        sentimentScore: -0.68,
        sentimentLabel: 'NEGATIVE',
        assignedToName: 'Engineering Support',
        slaHours: 24,
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        userEmail: 'sarah.j@example.com',
        userName: 'Sarah Jenkins'
      },
      {
        id: 1046,
        complaintNumber: 'CMP-2026-1046',
        ticketNumber: 'TKT-8819',
        title: 'Package delivered with torn outer packaging and missing power adapter',
        description: 'Order #ORD-7741 was delivered today. The outer packaging was completely ripped open and the power adapter was missing from the box.',
        categoryName: 'Product & Delivery',
        categoryId: 3,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        sentimentScore: -0.62,
        sentimentLabel: 'NEGATIVE',
        assignedToName: 'Logistics Desk',
        slaHours: 24,
        createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
        userEmail: 'john.doe@example.com',
        userName: 'John Doe'
      },
      {
        id: 1045,
        complaintNumber: 'CMP-2026-1045',
        ticketNumber: 'TKT-8818',
        title: 'Corporate Team Tier Renewal Discount Confirmation',
        description: 'Our contract renewal is coming up next month and we wanted to confirm if the 20% team tier discount is still active on our profile.',
        categoryName: 'Customer Service & General',
        categoryId: 4,
        status: 'RESOLVED',
        priority: 'LOW',
        sentimentScore: 0.75,
        sentimentLabel: 'POSITIVE',
        assignedToName: 'Accounts & Customer Success',
        slaHours: 48,
        createdAt: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
        userEmail: 'm.chen@example.com',
        userName: 'Michael Chen'
      },
      {
        id: 1044,
        complaintNumber: 'CMP-2026-1044',
        ticketNumber: 'TKT-8817',
        title: 'Request to update corporate GST and billing tax entity details',
        description: 'Kindly update our company invoice tax registration number from GSTIN-old to the updated state code on our profile.',
        categoryName: 'Billing & Payments',
        categoryId: 1,
        status: 'RESOLVED',
        priority: 'MEDIUM',
        sentimentScore: 0.00,
        sentimentLabel: 'NEUTRAL',
        assignedToName: 'Finance Desk',
        slaHours: 36,
        createdAt: new Date(Date.now() - 74 * 3600 * 1000).toISOString(),
        userEmail: 'john.doe@example.com',
        userName: 'John Doe'
      }
    ];
  },

  getComplaints() {
    const raw = localStorage.getItem('app_complaints');
    if (!raw) {
      const initial = this.getInitialComplaints();
      localStorage.setItem('app_complaints', JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return this.getInitialComplaints();
    }
  },

  addComplaint(c) {
    const list = this.getComplaints();
    list.unshift(c);
    localStorage.setItem('app_complaints', JSON.stringify(list));
    return c;
  },

  updateStatus(id, newStatus) {
    const list = this.getComplaints();
    const item = list.find(x => x.id === Number(id));
    if (item) {
      item.status = newStatus;
      localStorage.setItem('app_complaints', JSON.stringify(list));
      return item;
    }
    return null;
  },

  assignTicket(id, staffName) {
    const list = this.getComplaints();
    const item = list.find(x => x.id === Number(id));
    if (item) {
      item.assignedToName = staffName;
      localStorage.setItem('app_complaints', JSON.stringify(list));
      return item;
    }
    return null;
  },

  getAdminDashboard() {
    const complaints = this.getComplaints();
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'PENDING').length;
    const inProgress = complaints.filter(c => c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const high = complaints.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH').length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const statusDist = {
      'PENDING': pending,
      'IN PROGRESS': inProgress,
      'RESOLVED': resolved,
      'CLOSED': complaints.filter(c => c.status === 'CLOSED').length
    };

    const sentimentDist = {
      'POSITIVE': complaints.filter(c => c.sentimentLabel === 'POSITIVE').length,
      'NEUTRAL': complaints.filter(c => c.sentimentLabel === 'NEUTRAL').length,
      'NEGATIVE': complaints.filter(c => c.sentimentLabel === 'NEGATIVE').length,
      'VERY_NEGATIVE': complaints.filter(c => c.sentimentLabel === 'VERY_NEGATIVE').length
    };

    return {
      totalComplaints: total,
      pendingComplaints: pending,
      inProgressComplaints: inProgress,
      resolvedComplaints: resolved,
      highPriorityComplaints: high,
      resolutionRate: rate,
      totalUsers: 142,
      statusDistribution: statusDist,
      sentimentDistribution: sentimentDist,
      recentComplaints: complaints.slice(0, 5)
    };
  },

  getUserDashboard(email) {
    const all = this.getComplaints();
    const userComplaints = all.filter(c => !email || c.userEmail === email || c.userEmail === 'john.doe@example.com');
    const total = userComplaints.length;
    const pending = userComplaints.filter(c => c.status === 'PENDING').length;
    const inProgress = userComplaints.filter(c => c.status === 'IN_PROGRESS').length;
    const resolved = userComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

    return {
      totalComplaints: total,
      pendingComplaints: pending,
      inProgressComplaints: inProgress,
      resolvedComplaints: resolved,
      recentComplaints: userComplaints.slice(0, 5)
    };
  },

  getUsers() {
    return [
      { id: 1, name: 'System Administrator', email: 'admin@complaintsystem.com', role: 'ROLE_ADMIN', status: 'ACTIVE', complaintCount: 0, createdAt: '2026-01-10' },
      { id: 2, name: 'John Doe', email: 'john.doe@example.com', role: 'ROLE_USER', status: 'ACTIVE', complaintCount: 3, createdAt: '2026-02-14' },
      { id: 3, name: 'Sarah Jenkins', email: 'sarah.j@example.com', role: 'ROLE_USER', status: 'ACTIVE', complaintCount: 1, createdAt: '2026-03-01' },
      { id: 4, name: 'Michael Chen', email: 'm.chen@example.com', role: 'ROLE_USER', status: 'ACTIVE', complaintCount: 1, createdAt: '2026-03-15' },
      { id: 5, name: 'Support Specialist L1', email: 'support1@complaintsystem.com', role: 'ROLE_STAFF', status: 'ACTIVE', complaintCount: 0, createdAt: '2026-01-15' }
    ];
  },

  getCategories() {
    return [
      { id: 1, name: 'Billing & Payments', description: 'Invoices, refunds, debit inquiries, and corporate tax billing', slaHours: 12, complaintCount: 2, isActive: true },
      { id: 2, name: 'Technical & Bug Reports', description: 'Application crashes, checkout errors, portal login issues', slaHours: 24, complaintCount: 1, isActive: true },
      { id: 3, name: 'Product & Delivery', description: 'Damaged packages, missing accessories, transit tracking', slaHours: 24, complaintCount: 1, isActive: true },
      { id: 4, name: 'Customer Service & General', description: 'Contract renewals, policy inquiries, account feedback', slaHours: 48, complaintCount: 1, isActive: true }
    ];
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  await checkAuthAndInitialize();
  setupGlobalListeners();
});

// 1. Authentication & Role Initialization
async function checkAuthAndInitialize() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      currentUser = await res.json();
      currentRole = currentUser.role || 'USER';
    } else {
      initClientFallbackUser();
    }
  } catch (err) {
    initClientFallbackUser();
  }

  function initClientFallbackUser() {
    const storedRole = sessionStorage.getItem('active_role') || 'ADMIN';
    const storedName = sessionStorage.getItem('user_name') || (storedRole === 'ADMIN' ? 'System Administrator' : 'John Doe');
    const storedEmail = sessionStorage.getItem('user_email') || (storedRole === 'ADMIN' ? 'admin@complaintsystem.com' : 'john.doe@example.com');
    currentUser = {
      id: storedRole === 'ADMIN' ? 1 : 2,
      name: storedName,
      email: storedEmail,
      role: storedRole
    };
    currentRole = storedRole;
  }

  document.body.setAttribute('data-active-role', currentRole);
  document.getElementById('userDisplayName').textContent = currentUser.name || 'User';
  document.getElementById('userDisplayEmail').textContent = currentUser.email || '';
  document.getElementById('roleBadgeDisplay').textContent = currentRole;
  document.getElementById('userAvatarLetter').textContent = (currentUser.name || 'U').charAt(0).toUpperCase();

  renderNavigationForRole(currentRole);
  renderBottomNavForRole(currentRole);

  // Restore desktop sidebar collapsed state if previously set
  if (window.innerWidth >= 992 && localStorage.getItem('sidebar_collapsed') === 'true') {
    document.body.classList.add('sidebar-collapsed');
  }

  // Initial View
  if (currentRole === 'ADMIN') {
    showView('admin-dashboard');
  } else {
    showView('user-dashboard');
  }
}

// 2. Navigation rendering based on role
function renderNavigationForRole(role) {
  const menu = document.getElementById('unifiedSidebarMenu');
  const roleTitle = document.getElementById('portalTitleDisplay');

  if (role === 'ADMIN') {
    roleTitle.textContent = 'ADMIN PORTAL';
    roleTitle.className = 'badge bg-indigo text-white px-2 py-1';
    roleTitle.style.backgroundColor = '#4f46e5';

    menu.innerHTML = `
      <li class="sidebar-heading">Management & Triage</li>
      <li class="sidebar-item">
        <a class="sidebar-link active" onclick="showView('admin-dashboard')">
          <i class="bi bi-grid-1x2"></i> Executive Dashboard
        </a>
      </li>
      <li class="sidebar-item">
        <a class="sidebar-link" onclick="showView('admin-complaints')">
          <i class="bi bi-inbox-fill"></i> All Complaints
        </a>
      </li>
      <li class="sidebar-item">
        <a class="sidebar-link" onclick="showView('admin-users')">
          <i class="bi bi-people"></i> Users & Staff
        </a>
      </li>
      <li class="sidebar-item">
        <a class="sidebar-link" onclick="showView('admin-categories')">
          <i class="bi bi-tags"></i> Categories & SLA
        </a>
      </li>

      <li class="sidebar-heading mt-3">Intelligence</li>
      <li class="sidebar-item">
        <a class="sidebar-link" onclick="showView('admin-analytics')">
          <i class="bi bi-graph-up-arrow"></i> Deep Analytics
        </a>
      </li>
      <li class="sidebar-item">
        <a class="sidebar-link" onclick="showView('admin-reports')">
          <i class="bi bi-file-earmark-bar-graph"></i> Export Reports
        </a>
      </li>

      <li class="sidebar-heading mt-3">Preview</li>
      <li class="sidebar-item">
        <a class="sidebar-link text-info" onclick="showView('user-dashboard')">
          <i class="bi bi-eye"></i> View Customer View
        </a>
      </li>
    `;
  } else {
    roleTitle.textContent = 'CUSTOMER PORTAL';
    roleTitle.className = 'badge bg-teal text-white px-2 py-1';
    roleTitle.style.backgroundColor = '#0d9488';

    menu.innerHTML = `
      <li class="sidebar-heading">Support Desk</li>
      <li class="sidebar-item">
        <a class="sidebar-link active" onclick="showView('user-dashboard')">
          <i class="bi bi-grid-1x2"></i> My Dashboard
        </a>
      </li>
      <li class="sidebar-item">
        <a class="sidebar-link" onclick="showView('user-submit')">
          <i class="bi bi-plus-circle-dotted"></i> File Complaint
        </a>
      </li>
      <li class="sidebar-item">
        <a class="sidebar-link" onclick="showView('user-complaints')">
          <i class="bi bi-card-checklist"></i> My Complaints
        </a>
      </li>
      <li class="sidebar-item">
        <a class="sidebar-link" onclick="showView('user-notifications')">
          <i class="bi bi-bell"></i> Notifications
        </a>
      </li>
      <li class="sidebar-item">
        <a class="sidebar-link" onclick="showView('user-feedback')">
          <i class="bi bi-star"></i> Feedback Reviews
        </a>
      </li>
      <li class="sidebar-item">
        <a class="sidebar-link" onclick="showView('user-profile')">
          <i class="bi bi-person"></i> My Profile
        </a>
      </li>
    `;
  }
}

// 3. Bottom Mobile Navigation rendering based on role
function renderBottomNavForRole(role) {
  const nav = document.getElementById('mobileBottomNav');
  if (role === 'ADMIN') {
    nav.innerHTML = `
      <div class="bottom-nav-item active" onclick="showView('admin-dashboard')">
        <i class="bi bi-grid-1x2-fill"></i>
        <span>Dashboard</span>
      </div>
      <div class="bottom-nav-item" onclick="showView('admin-complaints')">
        <i class="bi bi-inbox-fill"></i>
        <span>Complaints</span>
      </div>
      <div class="bottom-nav-item" onclick="showView('admin-analytics')">
        <i class="bi bi-graph-up"></i>
        <span>Analytics</span>
      </div>
      <div class="bottom-nav-item" onclick="showView('admin-users')">
        <i class="bi bi-people"></i>
        <span>Users</span>
      </div>
    `;
  } else {
    nav.innerHTML = `
      <div class="bottom-nav-item active" onclick="showView('user-dashboard')">
        <i class="bi bi-house-door-fill"></i>
        <span>Home</span>
      </div>
      <div class="bottom-nav-item" onclick="showView('user-complaints')">
        <i class="bi bi-card-checklist"></i>
        <span>Tickets</span>
      </div>
      <div class="bottom-nav-item" onclick="showView('user-submit')">
        <i class="bi bi-plus-circle"></i>
        <span>File</span>
      </div>
      <div class="bottom-nav-item" onclick="showView('user-profile')">
        <i class="bi bi-person"></i>
        <span>Profile</span>
      </div>
    `;
  }
}

// 4. Single-Page View Switcher
function showView(viewName) {
  // Hide all view panels
  const panels = document.querySelectorAll('.app-view-panel');
  panels.forEach(p => p.classList.add('d-none'));

  // Highlight active sidebar link
  const links = document.querySelectorAll('.sidebar-link');
  links.forEach(l => l.classList.remove('active'));

  // Highlight active bottom nav item
  const bottomItems = document.querySelectorAll('.bottom-nav-item');
  bottomItems.forEach(b => b.classList.remove('active'));

  const target = document.getElementById('view-' + viewName);
  if (target) {
    target.classList.remove('d-none');
    target.classList.remove('animate-fade-in-up');
    void target.offsetWidth; // Force reflow to re-trigger CSS animation
    target.classList.add('animate-fade-in-up');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Close mobile sidebar if open
  const sidebar = document.querySelector('.unified-sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('show');
  if (backdrop) backdrop.classList.remove('show');

  // Trigger data loaders for specific views
  if (viewName === 'admin-dashboard') loadAdminDashboard();
  if (viewName === 'admin-complaints') loadAdminComplaints();
  if (viewName === 'admin-users') loadAdminUsers();
  if (viewName === 'admin-categories') loadAdminCategories();
  if (viewName === 'admin-analytics') loadAdminAnalytics();
  if (viewName === 'user-dashboard') loadUserDashboard();
  if (viewName === 'user-complaints') loadUserComplaints();
  if (viewName === 'user-submit') initUserSubmitForm();
  if (viewName === 'user-notifications') loadUserNotifications();
  if (viewName === 'user-feedback') loadUserFeedbacks();
  if (viewName === 'user-profile') loadUserProfile();
}

// Counter animation helper
function animateCounter(elementId, targetValue, duration = 700, suffix = '') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const target = parseFloat(targetValue) || 0;
  const isFloat = String(targetValue).includes('.');
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * ease;
    el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = (isFloat ? target.toFixed(1) : target) + suffix;
    }
  }

  requestAnimationFrame(update);
}

// ==========================================
// ADMIN LOADERS & ACTIONS
// ==========================================

async function loadAdminDashboard() {
  let data = null;
  try {
    const res = await fetch('/api/admin/dashboard');
    if (res.ok) {
      data = await res.json();
    }
  } catch (e) {
    console.warn('API fetch error, using local fallback:', e);
  }

  if (!data) {
    data = LocalComplaintStore.getAdminDashboard();
  }

  animateCounter('admTotalComplaints', data.totalComplaints || 0);
  animateCounter('admPendingComplaints', data.pendingComplaints || 0);
  animateCounter('admInProgressComplaints', data.inProgressComplaints || 0);
  animateCounter('admResolvedComplaints', data.resolvedComplaints || 0);
  animateCounter('admHighPriorityComplaints', data.highPriorityComplaints || 0);
  animateCounter('admResolutionRate', data.resolutionRate || 0, 700, '%');
  animateCounter('admTotalUsers', data.totalUsers || 0);

  renderStatusChart(data.statusDistribution || {});
  renderSentimentChart(data.sentimentDistribution || {});
  renderAdminRecentTable(data.recentComplaints || []);
}

let lastStatusDist = null;
let lastSentimentDist = null;

function renderStatusChart(statusDist) {
  const ctx = document.getElementById('admStatusChart');
  if (!ctx) return;
  if (statusDist) lastStatusDist = statusDist;
  const dist = lastStatusDist || {};

  if (statusChartInstance) statusChartInstance.destroy();

  const labels = Object.keys(dist);
  const values = Object.values(dist);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const borderColor = isDark ? '#111827' : '#ffffff';

  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['Pending', 'In Progress', 'Resolved', 'Closed'],
      datasets: [{
        data: values.length ? values : [0, 0, 0, 0],
        backgroundColor: ['#f59e0b', '#38bdf8', '#10b981', '#94a3b8'],
        borderColor: borderColor,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            color: textColor,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
          }
        }
      },
      cutout: '70%'
    }
  });
}

function renderSentimentChart(sentimentDist) {
  const ctx = document.getElementById('admSentimentChart');
  if (!ctx) return;
  if (sentimentDist) lastSentimentDist = sentimentDist;
  const dist = lastSentimentDist || {};

  if (sentimentChartInstance) sentimentChartInstance.destroy();

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  sentimentChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Positive', 'Neutral', 'Negative', 'Very Negative'],
      datasets: [{
        label: 'Complaints',
        data: [
          dist['POSITIVE'] || 0,
          dist['NEUTRAL'] || 0,
          dist['NEGATIVE'] || 0,
          dist['VERY_NEGATIVE'] || 0
        ],
        backgroundColor: ['#10b981', '#94a3b8', '#f97316', '#ef4444'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: { family: "'Plus Jakarta Sans', sans-serif" }
          },
          grid: { color: gridColor }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: textColor,
            font: { family: "'Plus Jakarta Sans', sans-serif" }
          },
          grid: { color: gridColor }
        }
      }
    }
  });
}

function renderAdminRecentTable(complaints) {
  const tbody = document.getElementById('admRecentComplaintsTable');
  if (!tbody) return;

  if (!complaints.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No complaints recorded yet.</td></tr>';
    return;
  }

  tbody.innerHTML = complaints.map(c => `
    <tr>
      <td class="fw-bold text-primary">${c.complaintNumber}</td>
      <td>
        <div class="fw-semibold text-truncate" style="max-width: 220px;">${c.title}</div>
        <small class="text-muted">${c.categoryName || 'General'}</small>
      </td>
      <td><small class="fw-medium">${c.userName || 'Customer'}</small></td>
      <td><span class="badge badge-status badge-${c.status.toLowerCase().replace('_', '-')}">${c.status.replace('_', ' ')}</span></td>
      <td><span class="badge bg-${c.priority.toLowerCase() === 'critical' ? 'danger' : 'secondary'}">${c.priority}</span></td>
      <td><span class="badge badge-sentiment badge-${c.sentiment.toLowerCase().replace('_', '-')}">${c.sentiment.replace('_', ' ')}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary" onclick="openStatusUpdateModal(${c.id}, '${c.status}')">
          Update
        </button>
      </td>
    </tr>
  `).join('');
}

async function loadAdminComplaints() {
  const status = document.getElementById('admFilterStatus')?.value || '';
  const search = document.getElementById('admFilterSearch')?.value || '';

  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const tbody = document.getElementById('admAllComplaintsTable');
  if (!tbody) return;

  let data = null;
  try {
    const res = await fetch(`/api/admin/complaints?${params.toString()}`);
    if (res.ok) {
      data = await res.json();
    }
  } catch (e) {
    console.warn('Backend complaints fetch failed, using local store:', e);
  }

  if (!data) {
    let list = LocalComplaintStore.getComplaints();
    if (status) list = list.filter(c => c.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => (c.title + c.complaintNumber + (c.userName || '')).toLowerCase().includes(q));
    }
    data = list;
  }

  if (!data || !data.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No complaints found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(c => `
    <tr>
      <td class="fw-bold text-primary">${c.complaintNumber}<br><small class="text-muted">${c.ticketNumber ? '#' + c.ticketNumber : ''}</small></td>
      <td>
        <div class="fw-semibold text-truncate" style="max-width: 240px;">${c.title}</div>
        <small class="text-muted">${c.categoryName || 'General'}</small>
      </td>
      <td>${c.userName || 'Customer'}<br><small class="text-muted">${c.userEmail || ''}</small></td>
      <td><span class="badge badge-status badge-${(c.status || 'PENDING').toLowerCase().replace('_', '-')}">${(c.status || 'PENDING').replace('_', ' ')}</span></td>
      <td><span class="badge bg-${(c.priority || 'MEDIUM').toLowerCase() === 'critical' ? 'danger' : 'secondary'}">${c.priority || 'MEDIUM'}</span></td>
      <td><span class="badge badge-sentiment badge-${(c.sentimentLabel || c.sentiment || 'NEUTRAL').toLowerCase().replace('_', '-')}">${(c.sentimentLabel || c.sentiment || 'NEUTRAL').replace('_', ' ')}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary" onclick="openStatusUpdateModal(${c.id}, '${c.status}')">
          Update Status
        </button>
      </td>
    </tr>
  `).join('');
}

let activeComplaintId = null;
function openStatusUpdateModal(id, currentStatus) {
  activeComplaintId = id;
  const select = document.getElementById('modalStatusSelect');
  if (select) select.value = currentStatus;
  const modal = new bootstrap.Modal(document.getElementById('statusUpdateModal'));
  modal.show();
}

async function saveStatusUpdate() {
  if (!activeComplaintId) return;
  const status = document.getElementById('modalStatusSelect').value;
  const resolutionNotes = document.getElementById('modalResolutionNotes').value.trim();

  let updated = false;
  try {
    const res = await fetch(`/api/admin/complaints/${activeComplaintId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolutionNotes })
    });
    if (res.ok) {
      updated = true;
    }
  } catch (e) {
    console.warn('Backend update failed, using local store:', e);
  }

  if (!updated) {
    LocalComplaintStore.updateStatus(activeComplaintId, status);
  }

  showToast('Status updated successfully', 'success');
  bootstrap.Modal.getInstance(document.getElementById('statusUpdateModal')).hide();
  loadAdminDashboard();
  loadAdminComplaints();
}

async function loadAdminUsers() {
  const tbody = document.getElementById('admUsersTableBody');
  if (!tbody) return;

  let users = null;
  try {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      users = await res.json();
    }
  } catch (e) {
    console.warn('Using local users store:', e);
  }

  if (!users || !users.length) {
    users = LocalComplaintStore.getUsers();
  }

  tbody.innerHTML = users.map(u => `
    <tr>
      <td>#${u.id}</td>
      <td class="fw-semibold">${u.name}</td>
      <td>${u.email}</td>
      <td><span class="badge ${u.role === 'ROLE_ADMIN' ? 'bg-primary' : 'bg-secondary'}">${u.role.replace('ROLE_', '')}</span></td>
      <td><span class="badge bg-light text-dark border">${u.totalComplaints || u.complaintCount || 0}</span></td>
      <td><span class="badge ${u.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}">${u.status || 'ACTIVE'}</span></td>
      <td class="text-end">
        ${u.role !== 'ROLE_ADMIN' ? `
          <button class="btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}" onclick="toggleUserStatus(${u.id}, '${u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'}')">
            ${u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
          </button>
        ` : '<span class="small text-muted">Protected</span>'}
      </td>
    </tr>
  `).join('');
}

async function toggleUserStatus(id, status) {
  try {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast(`User status set to ${status}`, 'success');
      loadAdminUsers();
    }
  } catch (e) {
    showToast('Network error', 'danger');
  }
}

async function loadAdminCategories() {
  const tbody = document.getElementById('admCategoriesTableBody');
  if (!tbody) return;

  let cats = null;
  try {
    const res = await fetch('/api/admin/categories');
    if (res.ok) {
      cats = await res.json();
    }
  } catch (e) {
    console.warn('Using local categories store:', e);
  }

  if (!cats || !cats.length) {
    cats = LocalComplaintStore.getCategories();
  }

  tbody.innerHTML = cats.map(c => `
    <tr>
      <td class="fw-bold"><i class="bi ${c.icon || 'bi-folder'} text-primary me-2"></i>${c.name}</td>
      <td class="text-muted small">${c.description || '-'}</td>
      <td><span class="badge bg-primary-subtle text-primary fw-bold">${c.slaHours} Hours</span></td>
      <td><span class="badge bg-light text-dark border">${c.complaintCount}</span></td>
      <td><span class="badge ${c.isActive ? 'bg-success' : 'bg-secondary'}">${c.isActive ? 'Active' : 'Inactive'}</span></td>
    </tr>
  `).join('');
}

async function loadAdminAnalytics() {
  let data = null;
  try {
    const res = await fetch('/api/admin/analytics');
    if (res.ok) {
      data = await res.json();
    }
  } catch (e) {
    console.warn('Analytics API error, using local fallback:', e);
  }

  if (!data) {
    data = {
      slaCompliancePercentage: 94.8,
      avgResolutionHours: 16.5,
      customerSatisfactionScore: 91.2
    };
  }

  animateCounter('admSlaRate', data.slaCompliancePercentage || 94.8, 700, '%');
  animateCounter('admAvgHours', data.avgResolutionHours || 16.5, 700, 'h');
  animateCounter('admCsatScore', data.customerSatisfactionScore || 91.2, 700, '%');
}

function exportCsvReport() {
  window.location.href = '/api/admin/reports/export/csv';
}

// ==========================================
// USER LOADERS & ACTIONS
// ==========================================

async function loadUserDashboard() {
  let data = null;
  try {
    const res = await fetch('/api/user/dashboard');
    if (res.ok) {
      data = await res.json();
    }
  } catch (e) {
    console.warn('User dashboard API error, using local fallback:', e);
  }

  if (!data) {
    data = LocalComplaintStore.getUserDashboard(currentUser?.email);
  }

  animateCounter('usrTotalComplaints', data.totalComplaints || 0);
  animateCounter('usrPendingComplaints', data.pendingComplaints || 0);
  animateCounter('usrInProgressComplaints', data.inProgressComplaints || 0);
  animateCounter('usrResolvedComplaints', data.resolvedComplaints || 0);

  const tbody = document.getElementById('usrRecentComplaintsTable');
  if (!tbody) return;

  if (!data.recentComplaints || !data.recentComplaints.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No complaints filed yet. Click "File Complaint" to get started!</td></tr>';
    return;
  }

  tbody.innerHTML = data.recentComplaints.map(c => `
    <tr>
      <td class="fw-bold text-primary">${c.complaintNumber}</td>
      <td>
        <div class="fw-semibold text-truncate" style="max-width: 220px;">${c.title}</div>
        <small class="text-muted">${c.categoryName || 'General'}</small>
      </td>
      <td><span class="badge badge-status badge-${(c.status || 'PENDING').toLowerCase().replace('_', '-')}">${(c.status || 'PENDING').replace('_', ' ')}</span></td>
      <td><span class="badge bg-${(c.priority || 'MEDIUM').toLowerCase() === 'critical' ? 'danger' : 'secondary'}">${c.priority || 'MEDIUM'}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary" onclick="viewComplaintDetails(${c.id})">
          Track Ticket
        </button>
      </td>
    </tr>
  `).join('');
}

async function loadUserComplaints() {
  const tbody = document.getElementById('usrAllComplaintsTable');
  if (!tbody) return;

  let data = null;
  try {
    const res = await fetch('/api/user/complaints');
    if (res.ok) {
      data = await res.json();
    }
  } catch (e) {
    console.warn('User complaints API error, using local fallback:', e);
  }

  if (!data || !data.length) {
    data = LocalComplaintStore.getUserDashboard(currentUser?.email).recentComplaints || LocalComplaintStore.getComplaints();
  }

  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No complaints found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(c => `
    <tr>
      <td class="fw-bold text-primary">${c.complaintNumber}<br><small class="text-muted">${c.ticketNumber ? '#' + c.ticketNumber : ''}</small></td>
      <td>
        <div class="fw-semibold">${c.title}</div>
        <small class="text-muted">${c.categoryName || 'General'}</small>
      </td>
      <td><span class="badge badge-status badge-${(c.status || 'PENDING').toLowerCase().replace('_', '-')}">${(c.status || 'PENDING').replace('_', ' ')}</span></td>
      <td><span class="badge bg-${(c.priority || 'MEDIUM').toLowerCase() === 'critical' ? 'danger' : 'secondary'}">${c.priority || 'MEDIUM'}</span></td>
      <td><small class="text-muted">${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Today'}</small></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary" onclick="viewComplaintDetails(${c.id})">
          Track
        </button>
      </td>
    </tr>
  `).join('');
}

async function initUserSubmitForm() {
  const catSelect = document.getElementById('usrSubmitCategory');
  if (catSelect && catSelect.children.length <= 1) {
    let cats = null;
    try {
      const res = await fetch('/api/categories/public');
      if (res.ok) {
        cats = await res.json();
      }
    } catch (e) {
      console.warn('Categories public fetch error:', e);
    }
    if (!cats || !cats.length) {
      cats = LocalComplaintStore.getCategories();
    }
    catSelect.innerHTML = '<option value="">-- Select Category --</option>' +
      cats.map(c => `<option value="${c.id}">${c.name} (${c.slaHours}h SLA)</option>`).join('');
  }

  // Real-time NLP sentiment preview
  const descInput = document.getElementById('usrSubmitDesc');
  const previewBox = document.getElementById('usrSentimentPreview');
  if (descInput && previewBox) {
    descInput.addEventListener('input', () => {
      const val = descInput.value.toLowerCase();
      if (val.length < 15) {
        previewBox.classList.add('d-none');
        return;
      }
      previewBox.classList.remove('d-none');
      const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'stolen', 'fraud', 'unauthorized'];
      const isUrgent = urgentWords.some(w => val.includes(w));
      if (isUrgent) {
        previewBox.className = 'alert alert-danger py-2 small mb-3';
        previewBox.innerHTML = '<i class="bi bi-shield-exclamation me-1"></i> <strong>Urgent Indicator Detected:</strong> Our intelligent analyzer will automatically escalate this complaint priority for faster resolution.';
      } else {
        previewBox.className = 'alert alert-info py-2 small mb-3';
        previewBox.innerHTML = '<i class="bi bi-magic me-1"></i> <strong>Intelligent SLA Routing:</strong> Complaint will be dispatched to the specialized team based on category and sentiment.';
      }
    });
  }
}

async function handleUserSubmitComplaint(e) {
  e.preventDefault();
  const title = document.getElementById('usrSubmitTitle').value.trim();
  const categoryId = document.getElementById('usrSubmitCategory').value;
  const description = document.getElementById('usrSubmitDesc').value.trim();
  const priority = document.getElementById('usrSubmitPriority').value;

  if (!title || !categoryId || !description) {
    showToast('Please fill out all required fields.', 'warning');
    return;
  }

  try {
    const res = await fetch('/api/user/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, categoryId, description, priority })
    });

    if (res.ok) {
      const saved = await res.json();
      showToast('Complaint successfully lodged! Ticket created.', 'success');
      document.getElementById('userComplaintForm').reset();
      document.getElementById('usrSentimentPreview')?.classList.add('d-none');
      viewComplaintDetails(saved.id);
      return;
    }
  } catch (err) {
    console.warn('API error, using local fallback:', err);
  }

  // Client Fallback for Vercel / Offline
  const catNames = { 1: 'Billing & Payments', 2: 'Technical & Bug Reports', 3: 'Product & Delivery', 4: 'Customer Service & General' };
  const num = Math.floor(1000 + Math.random() * 9000);
  const isUrgent = description.toLowerCase().includes('charge') || description.toLowerCase().includes('crash') || description.toLowerCase().includes('refund');
  const newComplaint = {
    id: Date.now(),
    complaintNumber: `CMP-2026-${num}`,
    ticketNumber: `TKT-${num}`,
    title,
    categoryId: Number(categoryId),
    categoryName: catNames[categoryId] || 'General Support',
    description,
    priority: priority || (isUrgent ? 'HIGH' : 'MEDIUM'),
    status: 'PENDING',
    sentimentScore: isUrgent ? -0.85 : 0.15,
    sentimentLabel: isUrgent ? 'VERY_NEGATIVE' : 'NEUTRAL',
    assignedToName: 'Auto Triage Queue',
    createdAt: new Date().toISOString(),
    userEmail: currentUser?.email || 'john.doe@example.com',
    userName: currentUser?.name || 'John Doe'
  };

  LocalComplaintStore.addComplaint(newComplaint);
  showToast('Complaint successfully lodged! Ticket created.', 'success');
  document.getElementById('userComplaintForm').reset();
  document.getElementById('usrSentimentPreview')?.classList.add('d-none');
  viewComplaintDetails(newComplaint.id);
}

async function viewComplaintDetails(id) {
  let c = null;
  try {
    const res = await fetch(currentRole === 'ADMIN' ? `/api/admin/complaints/${id}` : `/api/user/complaints/${id}`);
    if (res.ok) {
      c = await res.json();
    }
  } catch (e) {
    console.warn('API details error:', e);
  }

  if (!c) {
    c = LocalComplaintStore.getComplaints().find(x => x.id === Number(id));
  }

  if (!c) {
    showToast('Unable to view complaint details.', 'danger');
    return;
  }

  document.getElementById('trackComplaintNumber').textContent = c.complaintNumber;
  document.getElementById('trackTicketNumber').textContent = c.ticketNumber ? '#' + c.ticketNumber : 'Generating...';
  document.getElementById('trackTitle').textContent = c.title;
  document.getElementById('trackCategory').textContent = c.categoryName || 'General';
  document.getElementById('trackDesc').textContent = c.description;
  document.getElementById('trackCreatedAt').textContent = new Date(c.createdAt).toLocaleString();

  const statusEl = document.getElementById('trackStatus');
  statusEl.className = `badge badge-status badge-${(c.status || 'PENDING').toLowerCase().replace('_', '-')}`;
  statusEl.textContent = (c.status || 'PENDING').replace('_', ' ');

  const prioEl = document.getElementById('trackPriority');
  prioEl.className = `badge bg-${(c.priority || 'MEDIUM').toLowerCase() === 'critical' ? 'danger' : 'secondary'}`;
  prioEl.textContent = c.priority || 'MEDIUM';

  if (c.resolutionNotes) {
    document.getElementById('trackResolutionBox').classList.remove('d-none');
    document.getElementById('trackResolutionNotes').textContent = c.resolutionNotes;
  } else {
    document.getElementById('trackResolutionBox').classList.add('d-none');
  }

  // Feedback modal setup if resolved
  const feedbackBtn = document.getElementById('btnTrackFeedback');
  if (feedbackBtn) {
    if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
      feedbackBtn.classList.remove('d-none');
      feedbackBtn.setAttribute('data-complaint-id', c.id);
    } else {
      feedbackBtn.classList.add('d-none');
    }
  }

  showView('ticket-tracker');
}

async function loadUserNotifications() {
  const container = document.getElementById('usrNotificationsList');
  if (!container) return;

  try {
    const res = await fetch('/api/notifications');
    const notifs = await res.json();
    if (!notifs.length) {
      container.innerHTML = '<div class="bento-card text-center py-5 text-muted"><i class="bi bi-bell-slash fs-1 mb-2 d-block"></i>No notifications yet.</div>';
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="bento-card mb-3 d-flex align-items-start gap-3">
        <i class="bi ${n.type === 'SUCCESS' ? 'bi-check-circle-fill text-success' : 'bi-info-circle-fill text-primary'} fs-3"></i>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between mb-1">
            <h6 class="fw-bold mb-0">${n.title}</h6>
            <small class="text-muted">${new Date(n.createdAt).toLocaleDateString()}</small>
          </div>
          <p class="text-muted small mb-0">${n.message}</p>
        </div>
      </div>
    `).join('');
  } catch (e) {
    showToast('Failed to load notifications', 'danger');
  }
}

async function loadUserFeedbacks() {
  const container = document.getElementById('usrFeedbacksList');
  if (!container) return;
  try {
    const res = await fetch(currentRole === 'ADMIN' ? '/api/feedback/all' : '/api/feedback/my-feedback');
    const list = await res.json();
    if (!list.length) {
      container.innerHTML = '<div class="bento-card text-center py-5 text-muted"><i class="bi bi-star fs-1 mb-2 d-block text-warning"></i>No feedback reviews recorded yet.</div>';
      return;
    }
    container.innerHTML = list.map(f => {
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        stars += `<i class="bi bi-star${i <= f.rating ? '-fill text-warning' : ' text-muted'}"></i>`;
      }
      return `
        <div class="bento-card mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <strong class="text-primary">${f.complaintNumber}</strong>
            <div class="fs-6">${stars}</div>
          </div>
          <p class="mb-1 text-muted small">${f.comments || 'No comments'}</p>
          <small class="text-muted fst-italic">Submitted by ${f.userName || 'Customer'} on ${new Date(f.createdAt).toLocaleDateString()}</small>
        </div>
      `;
    }).join('');
  } catch (e) {
    showToast('Failed to load feedback', 'danger');
  }
}

async function loadUserProfile() {
  try {
    const res = await fetch('/api/user/profile');
    if (res.ok) {
      const u = await res.json();
      document.getElementById('profName').value = u.name || '';
      document.getElementById('profEmail').value = u.email || '';
      document.getElementById('profPhone').value = u.phone || '';
      document.getElementById('profDept').value = u.department || '';
    }
  } catch (e) {
    console.error(e);
  }
}

async function saveUserProfile(e) {
  e.preventDefault();
  const name = document.getElementById('profName').value.trim();
  const phone = document.getElementById('profPhone').value.trim();
  const department = document.getElementById('profDept').value.trim();

  try {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, department })
    });
    if (res.ok) {
      showToast('Profile updated successfully', 'success');
      document.getElementById('userDisplayName').textContent = name;
    } else {
      showToast('Failed to update profile', 'danger');
    }
  } catch (e) {
    showToast('Network error', 'danger');
  }
}

// 5. Global Helpers & Event Handlers
function setupGlobalListeners() {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const menuBtn = document.getElementById('menuToggleBtn');
  if (menuBtn) menuBtn.addEventListener('click', toggleSidebar);

  const closeBtn = document.getElementById('sidebarCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);

  const logoutBtns = document.querySelectorAll('.btn-unified-logout');
  logoutBtns.forEach(b => b.addEventListener('click', handleLogout));

  const userForm = document.getElementById('userComplaintForm');
  if (userForm) userForm.addEventListener('submit', handleUserSubmitComplaint);

  const profileForm = document.getElementById('profileEditForm');
  if (profileForm) profileForm.addEventListener('submit', saveUserProfile);
}

function initTheme() {
  const saved = localStorage.getItem('app_theme') || 'light';
  applyTheme(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('app_theme', next);

  // Refresh charts with updated theme colors if active
  if (lastStatusDist) renderStatusChart(lastStatusDist);
  if (lastSentimentDist) renderSentimentChart(lastSentimentDist);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-bs-theme', theme);
  updateThemeIcons(theme);
}

function updateThemeIcons(theme) {
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

function toggleSidebar() {
  const isMobile = window.innerWidth < 992;
  const sidebar = document.querySelector('.unified-sidebar');
  let backdrop = document.querySelector('.sidebar-backdrop');

  if (isMobile) {
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', toggleSidebar);
    }
    sidebar.classList.toggle('show');
    backdrop.classList.toggle('show');
  } else {
    // Desktop slide / collapse
    document.body.classList.toggle('sidebar-collapsed');
    const isCollapsed = document.body.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }
}

async function handleLogout(e) {
  if (e) e.preventDefault();
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {}
  window.location.href = '/login.html';
}

function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '1090';
    document.body.appendChild(toastContainer);
  }
  const id = 'toast-' + Date.now();
  const bgClass = type === 'success' ? 'bg-success text-white' :
                  type === 'danger' ? 'bg-danger text-white' :
                  type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';

  toastContainer.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center ${bgClass} border-0 shadow" role="alert">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `);
  const el = document.getElementById(id);
  const bsToast = new bootstrap.Toast(el, { delay: 3500 });
  bsToast.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}
