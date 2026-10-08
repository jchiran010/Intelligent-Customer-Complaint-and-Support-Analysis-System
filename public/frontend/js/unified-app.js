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
        <a class="sidebar-link" onclick="showView('admin-kanban')">
          <i class="bi bi-kanban"></i> Kanban Pipeline
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
        <a class="sidebar-link" onclick="showView('user-tickets')">
          <i class="bi bi-ticket-perforated"></i> Ticket Generator Hub
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
  if (viewName === 'admin-kanban') loadAdminKanban();
  if (viewName === 'admin-users') loadAdminUsers();
  if (viewName === 'admin-categories') loadAdminCategories();
  if (viewName === 'admin-analytics') loadAdminAnalytics();
  if (viewName === 'user-dashboard') loadUserDashboard();
  if (viewName === 'user-tickets') loadUserTicketsHub();
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
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No complaints found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(c => `
    <tr>
      <td>
        <input type="checkbox" class="complaint-row-check form-check-input" value="${c.id}" onchange="handleRowSelect()">
      </td>
      <td class="fw-bold text-primary font-monospace">${c.complaintNumber}<br><small class="text-muted fw-normal">${c.ticketNumber ? '#' + c.ticketNumber : ''}</small></td>
      <td>
        <div class="fw-semibold text-truncate" style="max-width: 240px;">${c.title}</div>
        <small class="text-muted">${c.categoryName || 'General'}</small>
      </td>
      <td>${c.userName || 'Customer'}<br><small class="text-muted">${c.userEmail || ''}</small></td>
      <td><span class="badge badge-status badge-${(c.status || 'PENDING').toLowerCase().replace('_', '-')}">${(c.status || 'PENDING').replace('_', ' ')}</span></td>
      <td><span class="badge bg-${(c.priority || 'MEDIUM').toLowerCase() === 'critical' ? 'danger' : 'secondary'}">${c.priority || 'MEDIUM'}</span></td>
      <td><span class="badge badge-sentiment badge-${(c.sentimentLabel || c.sentiment || 'NEUTRAL').toLowerCase().replace('_', '-')}">${(c.sentimentLabel || c.sentiment || 'NEUTRAL').replace('_', ' ')}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="viewComplaintDetails(${c.id})" title="Live Conversation & Details">
          <i class="bi bi-chat-dots"></i>
        </button>
        <button class="btn btn-sm btn-outline-secondary" onclick="openStatusUpdateModal(${c.id}, '${c.status}')" title="Change Status">
          <i class="bi bi-pencil"></i>
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

  // Render the Dedicated Dashboard Ticket Generation Box
  renderUserTicketGenerationBox(data.recentComplaints && data.recentComplaints.length ? data.recentComplaints[0] : null);

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

// ==========================================
// AUTO TICKET GENERATION UTILITIES & HUB
// ==========================================

function getTicketPrefixForCategory(cat) {
  const str = String(cat || '').toLowerCase();
  if (str.includes('bill') || str === '1') return 'BILL';
  if (str.includes('tech') || str === '2' || str.includes('bug')) return 'TECH';
  if (str.includes('prod') || str.includes('deliv') || str === '3') return 'PROD';
  if (str.includes('cust') || str.includes('gen') || str === '4') return 'GEN';
  if (str.includes('sec') || str.includes('acc') || str === '5') return 'SEC';
  if (str.includes('net') || str.includes('it') || str === '6') return 'NET';
  return 'GEN';
}

function getSlaForCategory(cat) {
  const p = getTicketPrefixForCategory(cat);
  if (p === 'SEC') return '6 Hours';
  if (p === 'NET') return '8 Hours';
  if (p === 'TECH') return '12 Hours';
  if (p === 'BILL') return '24 Hours';
  if (p === 'PROD') return '48 Hours';
  return '24 Hours';
}

function generateTicketCode(cat) {
  const prefix = getTicketPrefixForCategory(cat);
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TCK-${prefix}-${year}-${rand}`;
}

function renderUserTicketGenerationBox(latest) {
  const codeEl = document.getElementById('dashTicketCode');
  const catEl = document.getElementById('dashTicketCategory');
  const prioEl = document.getElementById('dashTicketPriority');
  const statEl = document.getElementById('dashTicketStatus');
  const subjEl = document.getElementById('dashTicketSubject');
  const dateEl = document.getElementById('dashTicketDate');
  const slaEl = document.getElementById('dashTicketSla');

  if (!latest) {
    const all = LocalComplaintStore.getComplaints();
    const userAll = all.filter(c => !currentUser?.email || c.userEmail === currentUser?.email || c.userEmail === 'john.doe@example.com');
    latest = userAll && userAll.length ? userAll[0] : (all && all.length ? all[0] : null);
  }

  if (latest) {
    const tCode = latest.ticketNumber ? (latest.ticketNumber.startsWith('TCK') ? latest.ticketNumber : '#' + latest.ticketNumber) : generateTicketCode(latest.categoryName || 'General');
    if (codeEl) codeEl.textContent = tCode;
    if (catEl) catEl.textContent = latest.categoryName || 'General Support';
    if (prioEl) {
      prioEl.textContent = latest.priority || 'MEDIUM';
      prioEl.className = `badge bg-${(latest.priority || 'MEDIUM').toLowerCase() === 'critical' || (latest.priority || 'MEDIUM').toLowerCase() === 'high' ? 'danger' : 'secondary'}`;
    }
    if (statEl) {
      statEl.textContent = (latest.status || 'PENDING').replace('_', ' ');
      statEl.className = `badge badge-status badge-${(latest.status || 'PENDING').toLowerCase().replace('_', '-')}`;
    }
    if (subjEl) subjEl.textContent = latest.title || 'Support Complaint';
    if (dateEl) {
      const d = latest.createdAt ? new Date(latest.createdAt) : new Date();
      dateEl.textContent = d.toLocaleDateString() + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (slaEl) slaEl.textContent = getSlaForCategory(latest.categoryId || latest.categoryName);

    window.latestDashComplaintId = latest.id;
    window.latestDashTicketCode = tCode;
  } else {
    if (codeEl) codeEl.textContent = 'TCK-TECH-2026-AUTO';
    if (catEl) catEl.textContent = 'Select Category Below';
    if (subjEl) subjEl.textContent = 'No complaints filed yet. Select complaint type below to auto-generate tracking ticket!';
    if (dateEl) dateEl.textContent = 'Auto-ready';
    if (slaEl) slaEl.textContent = 'Standard SLA';
  }

  const catSelect = document.getElementById('dashCategorySelect');
  if (catSelect) {
    updateDashTicketPreview(catSelect.value);
  }
}

function updateDashTicketPreview(val) {
  const prefix = getTicketPrefixForCategory(val);
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const code = `TCK-${prefix}-${year}-${rand}`;
  const codeEl = document.getElementById('dashPreviewCode');
  const slaEl = document.getElementById('dashPreviewSlaText');
  if (codeEl) codeEl.textContent = code;
  if (slaEl) slaEl.textContent = getSlaForCategory(val) + ' Target';
  window.lastGeneratedDashTicket = code;
}

function quickFileWithSelectedType() {
  const catSelect = document.getElementById('dashCategorySelect');
  const val = catSelect ? catSelect.value : '2';
  showView('user-submit');
  const formCat = document.getElementById('usrSubmitCategory');
  if (formCat) {
    formCat.value = val;
    formCat.dispatchEvent(new Event('change'));
  }
  const title = document.getElementById('usrSubmitTitle');
  if (title) title.focus();
}

function copyDashTicket() {
  const code = document.getElementById('dashTicketCode')?.textContent || window.latestDashTicketCode;
  if (code) {
    navigator.clipboard.writeText(code.replace(/^#/, ''));
    showToast(`Ticket Reference ${code} copied to clipboard!`, 'success');
  }
}

function trackDashTicket() {
  if (window.latestDashComplaintId) {
    viewComplaintDetails(window.latestDashComplaintId);
  } else {
    showView('user-complaints');
  }
}

function copyCurrentTrackerTicket() {
  const code = document.getElementById('trackTicketNumber')?.textContent || window.currentTrackedTicketCode;
  if (code) {
    navigator.clipboard.writeText(code.replace(/^#/, ''));
    showToast(`Ticket reference ${code} copied to clipboard!`, 'success');
  }
}

function copyModalTicketCode() {
  const code = document.getElementById('modalTicketCode')?.textContent;
  if (code) {
    navigator.clipboard.writeText(code.replace(/^#/, ''));
    showToast(`Ticket reference ${code} copied to clipboard!`, 'success');
  }
}

function loadUserTicketsHub() {
  const tbody = document.getElementById('hubTicketsTableBody');
  if (!tbody) return;

  const complaints = LocalComplaintStore.getComplaints();
  const userComplaints = complaints.filter(c => !currentUser?.email || c.userEmail === currentUser?.email || c.userEmail === 'john.doe@example.com');

  if (!userComplaints.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No tickets generated yet. Select a complaint type above to file and auto-generate!</td></tr>';
    return;
  }

  tbody.innerHTML = userComplaints.map(c => {
    const tCode = c.ticketNumber ? (c.ticketNumber.startsWith('TCK') ? c.ticketNumber : '#' + c.ticketNumber) : generateTicketCode(c.categoryName);
    return `
      <tr>
        <td>
          <span class="ticket-code-badge">${tCode}</span>
        </td>
        <td>
          <span class="badge bg-primary-subtle text-primary">${c.categoryName || 'General Support'}</span>
        </td>
        <td>
          <div class="fw-semibold text-truncate" style="max-width: 200px;">${c.title}</div>
          <small class="text-muted">${c.complaintNumber}</small>
        </td>
        <td>
          <span class="badge badge-status badge-${(c.status || 'PENDING').toLowerCase().replace('_', '-')}">${(c.status || 'PENDING').replace('_', ' ')}</span>
        </td>
        <td>
          <span class="badge bg-${(c.priority || 'MEDIUM').toLowerCase() === 'critical' ? 'danger' : 'secondary'}">${c.priority || 'MEDIUM'}</span>
        </td>
        <td><small class="text-muted">${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Today'}</small></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary" onclick="viewComplaintDetails(${c.id})">
            <i class="bi bi-binoculars"></i> Track
          </button>
        </td>
      </tr>
    `;
  }).join('');

  updateHubTicketCode(document.getElementById('hubCategorySelect')?.value || '2');
}

function updateHubTicketCode(val) {
  const code = generateTicketCode(val);
  const codeEl = document.getElementById('hubGeneratedCode');
  const slaEl = document.getElementById('hubSlaTarget');
  if (codeEl) codeEl.textContent = code;
  if (slaEl) slaEl.textContent = getSlaForCategory(val);
  window.lastHubGeneratedCode = code;
}

function copyHubGeneratedCode() {
  const code = window.lastHubGeneratedCode || document.getElementById('hubGeneratedCode')?.textContent;
  if (code) {
    navigator.clipboard.writeText(code);
    showToast(`Generated ticket code ${code} copied!`, 'success');
  }
}

function fileWithHubCode() {
  const val = document.getElementById('hubCategorySelect')?.value || '2';
  showView('user-submit');
  const formCat = document.getElementById('usrSubmitCategory');
  if (formCat) {
    formCat.value = val;
    formCat.dispatchEvent(new Event('change'));
  }
  const title = document.getElementById('usrSubmitTitle');
  if (title) title.focus();
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

  if (catSelect) {
    catSelect.onchange = () => {
      const val = catSelect.value;
      const previewCode = document.getElementById('submitPreviewTicketCode');
      const previewBadge = document.getElementById('submitPreviewCategoryBadge');
      const previewSla = document.getElementById('submitPreviewSlaText');
      if (val) {
        const generated = generateTicketCode(val);
        if (previewCode) previewCode.textContent = generated;
        const opt = catSelect.options[catSelect.selectedIndex];
        if (previewBadge) previewBadge.textContent = opt ? opt.text : 'Selected Category';
        if (previewSla) previewSla.innerHTML = `<i class="bi bi-stopwatch text-warning me-1"></i> SLA Target: ${getSlaForCategory(val)}`;
        window.currentSubmitTicketCode = generated;
      }
    };
    // Initialize preview if value is present
    if (catSelect.value) catSelect.dispatchEvent(new Event('change'));
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

  const catNames = { 1: 'Billing & Payments', 2: 'Technical & Bug Reports', 3: 'Product & Delivery', 4: 'Customer Service & General', 5: 'Account & Security', 6: 'Network & IT Support' };
  const num = Math.floor(1000 + Math.random() * 9000);
  const isUrgent = description.toLowerCase().includes('charge') || description.toLowerCase().includes('crash') || description.toLowerCase().includes('refund');
  const assignedTicketNumber = window.currentSubmitTicketCode || generateTicketCode(categoryId || catNames[categoryId]);

  let createdId = Date.now();
  let createdObj = null;

  try {
    const res = await fetch('/api/user/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, categoryId, description, priority })
    });

    if (res.ok) {
      const saved = await res.json();
      createdId = saved.id;
      createdObj = saved;
    }
  } catch (err) {
    console.warn('API error, using local fallback:', err);
  }

  if (!createdObj) {
    createdObj = {
      id: createdId,
      complaintNumber: `CMP-2026-${num}`,
      ticketNumber: assignedTicketNumber,
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
    LocalComplaintStore.addComplaint(createdObj);
  }

  // Update Ticket Generation Success Modal
  const modalTicketEl = document.getElementById('modalTicketCode');
  const modalCatEl = document.getElementById('modalTicketCategory');
  const modalPrioEl = document.getElementById('modalTicketPriority');
  const modalBtn = document.getElementById('modalBtnTrackTicket');

  if (modalTicketEl) modalTicketEl.textContent = createdObj.ticketNumber || assignedTicketNumber;
  if (modalCatEl) modalCatEl.textContent = createdObj.categoryName || catNames[categoryId] || 'General';
  if (modalPrioEl) modalPrioEl.textContent = createdObj.priority || 'MEDIUM';
  if (modalBtn) modalBtn.onclick = () => viewComplaintDetails(createdObj.id);

  // Update Dashboard Ticket Box
  renderUserTicketGenerationBox(createdObj);

  // Reset form
  document.getElementById('userComplaintForm').reset();
  document.getElementById('usrSentimentPreview')?.classList.add('d-none');

  showToast(`Complaint lodged! Auto-generated ticket #${createdObj.ticketNumber || assignedTicketNumber}`, 'success');

  // Trigger high-visibility modal
  const modalEl = document.getElementById('ticketGeneratedModal');
  if (modalEl) {
    const m = bootstrap.Modal.getOrCreateInstance(modalEl);
    m.show();
  } else {
    viewComplaintDetails(createdObj.id);
  }
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

  const ticketFormatted = c.ticketNumber ? (c.ticketNumber.startsWith('#') || c.ticketNumber.startsWith('TCK') ? c.ticketNumber : '#' + c.ticketNumber) : generateTicketCode(c.categoryName || 'General');

  document.getElementById('trackComplaintNumber').textContent = c.complaintNumber;
  const trackTicketEl = document.getElementById('trackTicketNumber');
  if (trackTicketEl) trackTicketEl.textContent = ticketFormatted.startsWith('#') ? ticketFormatted : '#' + ticketFormatted;
  const sideRef = document.getElementById('trackTicketSidebarRef');
  if (sideRef) sideRef.textContent = ticketFormatted.startsWith('#') ? ticketFormatted : '#' + ticketFormatted;
  window.currentTrackedTicketCode = ticketFormatted;

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

  window.currentActiveTrackedComplaint = c;

  // Live SLA Countdown and Sidebar Updates
  const slaBadgeEl = document.getElementById('trackSlaCountdownBadge');
  if (slaBadgeEl) slaBadgeEl.innerHTML = calculateSlaBadge(c);
  const slaStatusEl = document.getElementById('trackSlaStatusBadge');
  if (slaStatusEl) slaStatusEl.innerHTML = (c.status === 'RESOLVED' || c.status === 'CLOSED') ? '<i class="bi bi-check-circle-fill me-1"></i> SLA Fulfilled' : '<i class="bi bi-shield-check me-1"></i> SLA Active & Monitored';
  const assignEl = document.getElementById('trackSidebarAssigned');
  if (assignEl) assignEl.textContent = c.assignedToName || 'Triage Desk';
  const langEl = document.getElementById('currentTranslationLang');
  if (langEl) langEl.textContent = 'Original (EN)';

  // Admin Tools (Macro & Internal Note switch)
  const macroBox = document.getElementById('adminMacroBox');
  if (macroBox) macroBox.classList.toggle('d-none', currentRole !== 'ADMIN');
  const noteBox = document.getElementById('adminInternalNoteBox');
  if (noteBox) noteBox.classList.toggle('d-none', currentRole !== 'ADMIN');

  // Load Live Conversation Stream and Audit Trail
  renderTicketChat(c.id);
  renderTicketAuditTimeline(c);

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

// ==========================================================================
// AUDIO SYNTHESIZER (WEB AUDIO API)
// ==========================================================================
function playChimeSound(type = 'chime') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success' || type === 'chime') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'escalate') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (_) {}
}

// ==========================================================================
// LIVE SLA COUNTDOWN CALCULATIONS & PERIODIC TICKER
// ==========================================================================
function calculateSlaBadge(c) {
  if (!c) return '';
  if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
    return `<span class="sla-badge sla-badge-good"><i class="bi bi-check2-circle"></i> Fulfilled</span>`;
  }
  const createdTime = new Date(c.createdAt || Date.now()).getTime();
  const slaHrs = Number(c.slaHours) || 24;
  const deadline = createdTime + (slaHrs * 3600 * 1000);
  const diffMs = deadline - Date.now();

  if (diffMs > 12 * 3600 * 1000) {
    const hrs = Math.floor(diffMs / (3600 * 1000));
    const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    return `<span class="sla-badge sla-badge-good"><i class="bi bi-stopwatch"></i> ${hrs}h ${mins}m left</span>`;
  } else if (diffMs > 0) {
    const hrs = Math.floor(diffMs / (3600 * 1000));
    const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    return `<span class="sla-badge sla-badge-warning"><i class="bi bi-exclamation-triangle"></i> ${hrs}h ${mins}m left</span>`;
  } else {
    const breachedMs = Math.abs(diffMs);
    const hrs = Math.floor(breachedMs / (3600 * 1000));
    const mins = Math.floor((breachedMs % (3600 * 1000)) / (60 * 1000));
    return `<span class="sla-badge sla-badge-breached"><i class="bi bi-alarm-fill"></i> Breach (-${hrs}h ${mins}m)</span>`;
  }
}

function refreshSlaClocks() {
  if (window.currentActiveTrackedComplaint) {
    const el = document.getElementById('trackSlaCountdownBadge');
    if (el) el.innerHTML = calculateSlaBadge(window.currentActiveTrackedComplaint);
  }
  const kanbanView = document.getElementById('view-admin-kanban');
  if (kanbanView && !kanbanView.classList.contains('d-none')) {
    loadAdminKanban();
  }
}
setInterval(refreshSlaClocks, 60000);

// ==========================================================================
// INTERACTIVE KANBAN BOARD
// ==========================================================================
function loadAdminKanban() {
  const complaints = LocalComplaintStore.getComplaints();
  renderKanbanBoard(complaints);
}

function renderKanbanBoard(complaints) {
  const colPending = document.getElementById('kanbanCardsPending');
  const colInProgress = document.getElementById('kanbanCardsInProgress');
  const colResolved = document.getElementById('kanbanCardsResolved');

  if (!colPending || !colInProgress || !colResolved) return;

  const pendingList = complaints.filter(c => c.status === 'PENDING');
  const progressList = complaints.filter(c => c.status === 'IN_PROGRESS');
  const resolvedList = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED');

  document.getElementById('kanbanCountPending').textContent = pendingList.length;
  document.getElementById('kanbanCountInProgress').textContent = progressList.length;
  document.getElementById('kanbanCountResolved').textContent = resolvedList.length;

  const renderCard = (c) => `
    <div class="kanban-card" draggable="true" ondragstart="kanbanDragStart(event, ${c.id})">
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span class="badge bg-primary-subtle text-primary font-monospace fw-bold" style="font-size: 0.72rem;">${c.ticketNumber ? '#' + c.ticketNumber : c.complaintNumber}</span>
        <span class="badge bg-${(c.priority || 'MEDIUM').toLowerCase() === 'critical' ? 'danger' : (c.priority || 'MEDIUM').toLowerCase() === 'high' ? 'warning text-dark' : 'secondary'}" style="font-size: 0.68rem;">${c.priority || 'MEDIUM'}</span>
      </div>
      <h6 class="fw-bold mb-1 text-truncate" style="font-size: 0.88rem;" title="${c.title}">${c.title}</h6>
      <div class="small text-muted mb-2" style="font-size: 0.75rem;">
        <i class="bi bi-person me-1"></i>${c.userName || 'Customer'} &bull; <span class="text-primary">${c.categoryName || 'General'}</span>
      </div>
      <div class="d-flex justify-content-between align-items-center pt-2 border-top">
        ${calculateSlaBadge(c)}
        <button class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size: 0.75rem;" onclick="viewComplaintDetails(${c.id})">
          <i class="bi bi-chat-dots me-1"></i> Chat
        </button>
      </div>
    </div>
  `;

  colPending.innerHTML = pendingList.length ? pendingList.map(renderCard).join('') : '<div class="text-center py-4 text-muted small">No pending tickets</div>';
  colInProgress.innerHTML = progressList.length ? progressList.map(renderCard).join('') : '<div class="text-center py-4 text-muted small">No active investigations</div>';
  colResolved.innerHTML = resolvedList.length ? resolvedList.map(renderCard).join('') : '<div class="text-center py-4 text-muted small">No closed tickets</div>';
}

function kanbanDragStart(e, complaintId) {
  e.dataTransfer.setData('text/plain', String(complaintId));
  e.currentTarget.classList.add('is-dragging');
  setTimeout(() => e.target.classList.remove('is-dragging'), 800);
}

function kanbanDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function kanbanDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function kanbanDrop(e, newStatus) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const complaintId = e.dataTransfer.getData('text/plain');
  if (!complaintId) return;

  updateComplaintStatusDirect(Number(complaintId), newStatus);
}

async function updateComplaintStatusDirect(complaintId, newStatus) {
  LocalComplaintStore.updateStatus(complaintId, newStatus, `Pipeline drag updated to ${newStatus}`);

  try {
    await fetch(`/api/admin/complaints/${complaintId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, resolutionNotes: `Triage stage updated via Kanban Pipeline to ${newStatus}` })
    });
  } catch (_) {}

  playChimeSound('success');
  showToast(`Ticket status transitioned to ${newStatus}!`, 'success');
  loadAdminKanban();
  loadAdminComplaints();
}

// ==========================================================================
// LIVE CHAT & CONVERSATION STREAM (PER TICKET ID)
// ==========================================================================
function getTicketChatKey(complaintId) {
  return `ticket_chat_${complaintId}`;
}

function renderTicketChat(complaintId) {
  const stream = document.getElementById('ticketChatStream');
  if (!stream) return;

  let messages = [];
  try {
    const raw = localStorage.getItem(getTicketChatKey(complaintId));
    if (raw) messages = JSON.parse(raw);
  } catch (_) {}

  if (!messages || !messages.length) {
    const c = LocalComplaintStore.getComplaints().find(x => x.id === Number(complaintId)) || window.currentActiveTrackedComplaint;
    messages = [
      {
        id: 'msg-1',
        sender: c?.userName || 'Customer',
        role: 'USER',
        text: c?.description || 'I need support resolving this issue.',
        time: new Date(Date.now() - 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'msg-2',
        sender: 'AI Auto-Triage Agent',
        role: 'SYSTEM',
        text: `Ticket classified under ${c?.categoryName || 'General'} with SLA target ${c?.slaHours || 24} hours. Routing to responsible support team.`,
        time: new Date(Date.now() - 3500 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'msg-3',
        sender: c?.assignedToName || 'Support Specialist',
        role: 'AGENT',
        text: 'Hello, our team has picked up your ticket and is actively looking into the details.',
        time: new Date(Date.now() - 1800 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    localStorage.setItem(getTicketChatKey(complaintId), JSON.stringify(messages));
  }

  stream.innerHTML = messages.map(m => {
    if (m.role === 'INTERNAL_NOTE' && currentRole !== 'ADMIN') return '';

    if (m.role === 'INTERNAL_NOTE') {
      return `
        <div class="chat-bubble chat-bubble-internal">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="badge bg-warning text-dark"><i class="bi bi-lock-fill me-1"></i> Staff Internal Note</span>
            <small class="text-muted" style="font-size: 0.72rem;">${m.time}</small>
          </div>
          <div class="fw-semibold small">${m.sender}:</div>
          <div>${m.text}</div>
        </div>
      `;
    } else if (m.role === 'USER') {
      return `
        <div class="chat-bubble chat-bubble-user">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="fw-bold small">${m.sender}</span>
            <small style="opacity: 0.85; font-size: 0.75rem;">${m.time}</small>
          </div>
          <div>${m.text}</div>
        </div>
      `;
    } else {
      return `
        <div class="chat-bubble chat-bubble-agent">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="fw-bold small text-primary"><i class="bi bi-patch-check-fill me-1"></i> ${m.sender}</span>
            <small class="text-muted" style="font-size: 0.75rem;">${m.time}</small>
          </div>
          <div>${m.text}</div>
        </div>
      `;
    }
  }).join('');

  stream.scrollTop = stream.scrollHeight;
}

function sendTicketChatMessage() {
  const c = window.currentActiveTrackedComplaint;
  if (!c) return;

  const input = document.getElementById('ticketChatMessageInput');
  const text = input ? input.value.trim() : '';
  if (!text) return;

  const isInternal = document.getElementById('chatInternalNoteCheck')?.checked && currentRole === 'ADMIN';

  let messages = [];
  try {
    const raw = localStorage.getItem(getTicketChatKey(c.id));
    if (raw) messages = JSON.parse(raw);
  } catch (_) {}

  const newMessage = {
    id: 'msg-' + Date.now(),
    sender: currentUser?.fullName || (currentRole === 'ADMIN' ? 'Support Specialist' : 'Customer'),
    role: isInternal ? 'INTERNAL_NOTE' : (currentRole === 'ADMIN' ? 'AGENT' : 'USER'),
    text: text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  messages.push(newMessage);
  localStorage.setItem(getTicketChatKey(c.id), JSON.stringify(messages));

  input.value = '';
  if (document.getElementById('chatInternalNoteCheck')) document.getElementById('chatInternalNoteCheck').checked = false;

  playChimeSound('success');
  renderTicketChat(c.id);
  showToast(isInternal ? 'Internal staff note logged' : 'Message posted to live thread', 'success');
}

function applyAdminMacro(macroId) {
  const input = document.getElementById('ticketChatMessageInput');
  if (!input) return;

  const templates = {
    '1': 'Hello, could you please provide your bank transaction reference ID, exact deduction timestamp, and the last 4 digits of the card used?',
    '2': 'Our engineering team has deployed a hotfix addressing this error. Kindly clear your application cache and retry the checkout process.',
    '3': 'We sincerely apologize for the damaged outer packaging. A replacement package with express tracking has been dispatched to your address.',
    '4': 'We have authorized a full refund to your original payment method. The credit should reflect in your account within 3-5 business days.'
  };

  if (templates[macroId]) {
    input.value = templates[macroId];
    input.focus();
  }
}

// ==========================================================================
// TICKET LIFECYCLE AUDIT TRAIL
// ==========================================================================
function renderTicketAuditTimeline(c) {
  const container = document.getElementById('ticketAuditTimeline');
  if (!container || !c) return;

  const events = [
    {
      title: 'Ticket Generated & Auto-Triaged',
      desc: `Allocated reference ${c.ticketNumber || c.complaintNumber} with initial priority ${c.priority || 'MEDIUM'}.`,
      time: new Date(c.createdAt || Date.now()).toLocaleString(),
      icon: 'bi-patch-check-fill',
      bg: 'bg-primary'
    },
    {
      title: 'NLP Sentiment Classification',
      desc: `Sentiment scored at ${c.sentimentScore !== undefined ? c.sentimentScore : '-0.70'} (${c.sentimentLabel || 'NEGATIVE'}). Priority escalated based on urgency analysis.`,
      time: new Date(new Date(c.createdAt || Date.now()).getTime() + 120000).toLocaleString(),
      icon: 'bi-cpu-fill',
      bg: 'bg-info'
    },
    {
      title: 'Routed to Support Personnel',
      desc: `Ticket assigned to ${c.assignedToName || 'Triage Specialist'} under SLA target of ${c.slaHours || 24} hours.`,
      time: new Date(new Date(c.createdAt || Date.now()).getTime() + 300000).toLocaleString(),
      icon: 'bi-person-check-fill',
      bg: 'bg-success'
    }
  ];

  if (c.status === 'IN_PROGRESS') {
    events.push({
      title: 'Under Active Investigation',
      desc: 'Technical specialist is diagnosing logs and preparing resolution.',
      time: new Date(new Date(c.createdAt || Date.now()).getTime() + 1800000).toLocaleString(),
      icon: 'bi-gear-fill',
      bg: 'bg-warning'
    });
  } else if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
    events.push({
      title: 'Issue Resolved & Validated',
      desc: c.resolutionNotes || 'Official resolution completed within SLA compliance window.',
      time: new Date(new Date(c.createdAt || Date.now()).getTime() + 3600000).toLocaleString(),
      icon: 'bi-check-circle-fill',
      bg: 'bg-success'
    });
  }

  container.innerHTML = events.map(e => `
    <div class="audit-timeline-item">
      <div class="audit-timeline-dot ${e.bg}">
        <i class="bi ${e.icon}"></i>
      </div>
      <div class="fw-bold small">${e.title}</div>
      <p class="text-muted small mb-0">${e.desc}</p>
      <small class="text-muted" style="font-size: 0.72rem;">${e.time}</small>
    </div>
  `).join('');
}

// ==========================================================================
// VOICE DICTATION (WEB SPEECH API)
// ==========================================================================
let speechRecognizer = null;
let isRecordingVoice = false;

function toggleVoiceDictation() {
  const badge = document.getElementById('voiceStatusBadge');
  const btn = document.getElementById('btnVoiceDictation');
  const textarea = document.getElementById('usrSubmitDesc');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast('Web Speech recognition is not supported in this browser. Please type description.', 'warning');
    return;
  }

  if (isRecordingVoice) {
    if (speechRecognizer) speechRecognizer.stop();
    isRecordingVoice = false;
    if (badge) badge.classList.add('d-none');
    if (btn) btn.innerHTML = '<i class="bi bi-mic-fill me-1"></i> Voice Dictate';
    playChimeSound('chime');
    showToast('Voice dictation stopped', 'info');
    return;
  }

  speechRecognizer = new SpeechRecognition();
  speechRecognizer.continuous = true;
  speechRecognizer.interimResults = false;
  speechRecognizer.lang = 'en-US';

  speechRecognizer.onstart = () => {
    isRecordingVoice = true;
    if (badge) badge.classList.remove('d-none');
    if (btn) btn.innerHTML = '<i class="bi bi-stop-circle-fill me-1 text-danger"></i> Stop Dictation';
    playChimeSound('success');
    showToast('Listening... Speak your complaint clearly', 'info');
  };

  speechRecognizer.onresult = (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    if (textarea) {
      textarea.value = (textarea.value ? textarea.value.trim() + ' ' : '') + transcript;
    }
  };

  speechRecognizer.onerror = (e) => {
    console.warn('Speech error:', e);
    isRecordingVoice = false;
    if (badge) badge.classList.add('d-none');
    if (btn) btn.innerHTML = '<i class="bi bi-mic-fill me-1"></i> Voice Dictate';
    showToast('Voice input stopped or microphone permission was denied.', 'warning');
  };

  speechRecognizer.onend = () => {
    isRecordingVoice = false;
    if (badge) badge.classList.add('d-none');
    if (btn) btn.innerHTML = '<i class="bi bi-mic-fill me-1"></i> Voice Dictate';
  };

  speechRecognizer.start();
}

// ==========================================================================
// KNOWLEDGE BASE DEFLECTION
// ==========================================================================
const KB_ARTICLES = [
  {
    keywords: ['duplicate', 'double', 'charge', 'charged', 'refund', 'debit'],
    title: 'Instant Refund Policy for Duplicate Billing',
    solution: 'If you were debited twice for a transaction, our automated payment gateway reconciles duplicate deductions every 6 hours. You can request an instant bank reversal slip by providing the transaction reference code.'
  },
  {
    keywords: ['crash', 'crashes', 'android', 'freeze', 'app'],
    title: 'Resolving Application Crashes on Mobile Devices',
    solution: 'Please ensure you are on application build v4.2.1 or above. Go to Settings > Apps > SupportDesk > Clear Cache. 90% of checkout freeze issues resolve after clearing local app storage cache.'
  },
  {
    keywords: ['package', 'damaged', 'torn', 'adapter', 'delivery', 'box'],
    title: 'Damaged or Missing Item Replacement Guarantee',
    solution: 'Items delivered with packaging damage or missing parts qualify for no-questions-asked replacement within 7 days. Snap a photo of the outer box label to attach to this ticket for priority dispatch.'
  },
  {
    keywords: ['login', 'password', 'otp', 'reset', 'auth'],
    title: 'Account Access & Password Recovery',
    solution: 'To reset your login credentials, visit the Forgot Password link on the login screen. Ensure verification emails are not filtered to Spam or Junk folders.'
  }
];

function handleKbSuggestions(val) {
  const card = document.getElementById('kbSuggestionsCard');
  const snippet = document.getElementById('kbContentSnippet');
  if (!card || !snippet) return;

  const query = (val || '').toLowerCase().trim();
  if (query.length < 3) {
    card.classList.add('d-none');
    return;
  }

  const match = KB_ARTICLES.find(a => a.keywords.some(k => query.includes(k)));
  if (match) {
    snippet.innerHTML = `<strong>${match.title}:</strong> ${match.solution}`;
    card.classList.remove('d-none');
  } else {
    card.classList.add('d-none');
  }
}

function resolveViaKnowledgeBase() {
  playChimeSound('success');
  showToast('Great! We are glad the solution helped. Ticket avoided!', 'success');
  dismissKbSuggestions();
  const form = document.getElementById('userComplaintForm');
  if (form) form.reset();
  showView('user-dashboard');
}

function dismissKbSuggestions() {
  const card = document.getElementById('kbSuggestionsCard');
  if (card) card.classList.add('d-none');
}

// ==========================================================================
// FILE ATTACHMENTS & LIGHTBOX
// ==========================================================================
let uploadedAttachments = [];

function handleFileSelect(files) {
  if (!files || !files.length) return;
  const grid = document.getElementById('submitAttachmentPreviews');
  if (!grid) return;

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      uploadedAttachments.push({ name: file.name, url: dataUrl });
      renderAttachmentPreviews();
    };
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      uploadedAttachments.push({ name: file.name, url: 'https://cdn-icons-png.flaticon.com/512/337/337946.png' });
      renderAttachmentPreviews();
    }
  });
}

function renderAttachmentPreviews() {
  const grid = document.getElementById('submitAttachmentPreviews');
  if (!grid) return;

  grid.innerHTML = uploadedAttachments.map((att, idx) => `
    <div class="attachment-thumb-wrap">
      <img src="${att.url}" class="attachment-thumb" alt="${att.name}" onclick="openLightbox('${att.url}')" title="Click to preview">
      <button type="button" class="attachment-remove-btn" onclick="removeAttachment(${idx})">&times;</button>
    </div>
  `).join('');
}

function removeAttachment(idx) {
  uploadedAttachments.splice(idx, 1);
  renderAttachmentPreviews();
}

function openLightbox(src) {
  const img = document.getElementById('lightboxImg');
  if (img) img.src = src;
  const modal = new bootstrap.Modal(document.getElementById('imageLightboxModal'));
  modal.show();
}

// ==========================================================================
// MULTI-LANGUAGE AUTO-TRANSLATION TOGGLE
// ==========================================================================
const TRANSLATIONS = {
  es: {
    title: '[ES] Débito duplicado en la factura de suscripción mensual #9821',
    desc: 'Se me cobró dos veces el 15 de septiembre por la factura de suscripción mensual. Solicito el reembolso inmediato de la deducción duplicada.',
    tag: 'Español (ES)'
  },
  hi: {
    title: '[HI] मासिक सदस्यता बिल #9821 पर दो बार काटा गया भुगतान',
    desc: 'मुझसे 15 सितंबर को सदस्यता इनवॉइस के लिए दो बार शुल्क लिया गया था। कृपया तुरंत डुप्लिकेट राशि वापस करें।',
    tag: 'Hindi (HI)'
  },
  fr: {
    title: '[FR] Débit en double sur la facture d\'abonnement mensuelle #9821',
    desc: 'J\'ai été débité deux fois le 15 septembre pour ma facture d\'abonnement. Veuillez rembourser immédiatement le prélèvement en double.',
    tag: 'Français (FR)'
  },
  de: {
    title: '[DE] Doppelabbuchung auf monatlicher Abonnementrechnung #9821',
    desc: 'Mir wurde am 15. September zweimal der Rechnungsbetrag abgebucht. Bitte erstatten Sie den doppelten Abzug umgehend.',
    tag: 'Deutsch (DE)'
  }
};

function translateCurrentTicket(lang) {
  const c = window.currentActiveTrackedComplaint;
  if (!c) return;

  const titleEl = document.getElementById('trackTitle');
  const descEl = document.getElementById('trackDesc');
  const badgeEl = document.getElementById('currentTranslationLang');

  if (lang === 'en') {
    if (titleEl) titleEl.textContent = c.title;
    if (descEl) descEl.textContent = c.description;
    if (badgeEl) badgeEl.textContent = 'Original (EN)';
    showToast('Restored original English view', 'info');
    return;
  }

  const trans = TRANSLATIONS[lang];
  if (trans) {
    if (titleEl) titleEl.textContent = trans.title;
    if (descEl) descEl.textContent = trans.desc;
    if (badgeEl) badgeEl.textContent = trans.tag;
    playChimeSound('chime');
    showToast(`AI translated ticket into ${trans.tag}`, 'success');
  }
}

// ==========================================================================
// CUSTOMER URGENCY ESCALATION
// ==========================================================================
function escalateCurrentTicket() {
  const c = window.currentActiveTrackedComplaint;
  if (!c) return;

  c.priority = 'CRITICAL';
  LocalComplaintStore.updateStatus(c.id, c.status, 'Customer emergency escalation requested');

  const prioEl = document.getElementById('trackPriority');
  if (prioEl) {
    prioEl.className = 'badge bg-danger';
    prioEl.textContent = 'CRITICAL';
  }

  playChimeSound('escalate');
  showToast('Priority escalated to CRITICAL! Management alerted.', 'danger');
  renderTicketAuditTimeline(c);
}

// ==========================================================================
// PRINT OFFICIAL TICKET SLIP & EXECUTIVE REPORT
// ==========================================================================
function printOfficialTicketSlip() {
  const c = window.currentActiveTrackedComplaint;
  if (!c) return;

  document.getElementById('printSlipTicketCode').textContent = c.ticketNumber ? (c.ticketNumber.startsWith('#') ? c.ticketNumber : '#' + c.ticketNumber) : c.complaintNumber;
  document.getElementById('printSlipDate').textContent = 'Issued: ' + new Date().toLocaleDateString();
  document.getElementById('printSlipCmpId').textContent = c.complaintNumber;
  document.getElementById('printSlipPriority').textContent = c.priority || 'MEDIUM';
  document.getElementById('printSlipCustomer').textContent = c.userName || 'Customer';
  document.getElementById('printSlipCategory').textContent = c.categoryName || 'General';
  document.getElementById('printSlipAssigned').textContent = c.assignedToName || 'Triage Desk';
  document.getElementById('printSlipStatus').textContent = (c.status || 'PENDING').replace('_', ' ');
  document.getElementById('printSlipSubject').textContent = c.title;
  document.getElementById('printSlipDesc').textContent = c.description;
  document.getElementById('printSlipResolution').textContent = c.resolutionNotes || 'Currently active and monitored within SLA turnaround target.';

  window.print();
}

function printExecutiveReport() {
  window.print();
}

// ==========================================================================
// BULK ACTIONS TOOLBAR
// ==========================================================================
function toggleSelectAllComplaints(checked) {
  const checkboxes = document.querySelectorAll('.complaint-row-check');
  checkboxes.forEach(cb => cb.checked = checked);
  handleRowSelect();
}

function handleRowSelect() {
  const checkboxes = document.querySelectorAll('.complaint-row-check:checked');
  const count = checkboxes.length;
  const countEl = document.getElementById('selectedCount');
  if (countEl) countEl.textContent = count;

  const bar = document.getElementById('bulkActionBar');
  if (bar) {
    if (count > 0) {
      bar.classList.add('visible');
    } else {
      bar.classList.remove('visible');
    }
  }
}

function clearSelectedComplaints() {
  const selectAll = document.getElementById('selectAllComplaints');
  if (selectAll) selectAll.checked = false;
  toggleSelectAllComplaints(false);
}

function bulkSetStatus(status) {
  const selected = Array.from(document.querySelectorAll('.complaint-row-check:checked')).map(cb => Number(cb.value));
  if (!selected.length) return;

  selected.forEach(id => {
    LocalComplaintStore.updateStatus(id, status, `Bulk updated to ${status}`);
  });

  playChimeSound('success');
  showToast(`${selected.length} complaints transitioned to ${status}!`, 'success');
  clearSelectedComplaints();
  loadAdminComplaints();
}

function bulkSetPriority(priority) {
  const selected = Array.from(document.querySelectorAll('.complaint-row-check:checked')).map(cb => Number(cb.value));
  if (!selected.length) return;

  const complaints = LocalComplaintStore.getComplaints();
  selected.forEach(id => {
    const item = complaints.find(c => c.id === id);
    if (item) item.priority = priority;
  });
  localStorage.setItem('app_complaints', JSON.stringify(complaints));

  playChimeSound('escalate');
  showToast(`${selected.length} complaints escalated to ${priority}!`, 'warning');
  clearSelectedComplaints();
  loadAdminComplaints();
}

// ==========================================================================
// AUTO-ASSIGNMENT SIMULATION
// ==========================================================================
function simulateAutoAssignAll() {
  const complaints = LocalComplaintStore.getComplaints();
  let count = 0;

  complaints.forEach(c => {
    const cat = (c.categoryName || '').toLowerCase();
    let desk = 'Customer Success (Alex Chen)';
    if (cat.includes('bill') || cat.includes('pay')) desk = 'Finance Desk (Sarah Connor)';
    else if (cat.includes('tech') || cat.includes('bug')) desk = 'Engineering Support (David Miller)';
    else if (cat.includes('prod') || cat.includes('deliv')) desk = 'Logistics Desk (Emily Watson)';

    if (c.assignedToName !== desk) {
      c.assignedToName = desk;
      count++;
    }
  });

  localStorage.setItem('app_complaints', JSON.stringify(complaints));
  playChimeSound('success');
  showToast(`Smart AI successfully auto-assigned ${count || complaints.length} tickets across specialized support desks!`, 'success');

  loadAdminComplaints();
  loadAdminKanban();
}

// ==========================================================================
// 2FA / OTP VERIFICATION SIMULATION
// ==========================================================================
let pendingTwoFactorAction = null;

function promptTwoFactorAction(action) {
  pendingTwoFactorAction = action;
  const modal = new bootstrap.Modal(document.getElementById('twoFactorModal'));
  modal.show();
}

function focusNextOtp(current, nextIdx) {
  if (current.value.length >= 1 && nextIdx <= 6) {
    const inputs = document.querySelectorAll('.otp-digit');
    if (inputs[nextIdx]) inputs[nextIdx].focus();
  }
}

function verifyTwoFactorCode() {
  const digits = Array.from(document.querySelectorAll('.otp-digit')).map(i => i.value).join('');
  if (digits === '123456' || digits.length === 6) {
    playChimeSound('success');
    showToast('2FA Security Identity Verified!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('twoFactorModal')).hide();
    if (pendingTwoFactorAction === 'EXPORT_ALL') {
      exportCsvReport();
    }
  } else {
    showToast('Invalid verification code. Please enter demo code 123456.', 'danger');
  }
}

