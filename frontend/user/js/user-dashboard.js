/**
 * USER DASHBOARD CONTROLLER (user-dashboard.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

document.addEventListener('DOMContentLoaded', () => {
  loadUserDashboard();
});

async function loadUserDashboard() {
  try {
    const res = await fetch('/api/user/dashboard', {
      headers: { 'Accept': 'application/json' }
    });

    if (res.status === 401 || res.status === 403) {
      window.location.href = '/user/login?error=access_denied';
      return;
    }

    const data = await res.json();
    populateUserMetrics(data);
    populateUserRecentComplaints(data.recentComplaints || []);
  } catch (err) {
    console.error('Failed to load user dashboard:', err);
    showToast('Failed to load your complaints overview.', 'danger');
  }
}

function populateUserMetrics(data) {
  const nameElems = document.querySelectorAll('.user-name-display');
  nameElems.forEach(el => el.textContent = data.userName || 'Valued Customer');

  document.getElementById('userTotalComplaints').textContent = data.totalComplaints || 0;
  document.getElementById('userPendingComplaints').textContent = data.pendingComplaints || 0;
  document.getElementById('userInProgressComplaints').textContent = data.inProgressComplaints || 0;
  document.getElementById('userResolvedComplaints').textContent = data.resolvedComplaints || 0;

  if (data.unreadNotificationsCount > 0) {
    const notifCount = document.getElementById('dashboardNotifAlert');
    if (notifCount) {
      notifCount.innerHTML = `You have <strong>${data.unreadNotificationsCount}</strong> unread notification(s). <a href="/user/notifications.html" class="alert-link">View notifications</a>`;
      notifCount.classList.remove('d-none');
    }
  }
}

function populateUserRecentComplaints(complaints) {
  const tbody = document.getElementById('userRecentComplaintsTable');
  if (!tbody) return;

  if (complaints.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-5">
          <div class="text-muted mb-3"><i class="bi bi-inbox" style="font-size: 2.5rem;"></i></div>
          <h6>No Complaints Filed Yet</h6>
          <p class="text-muted small">Need help? Submit your first support complaint easily.</p>
          <a href="/user/submit-complaint.html" class="btn btn-sm btn-primary">
            <i class="bi bi-plus-circle me-1"></i> Submit Complaint
          </a>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = complaints.map(c => {
    const statusClass = c.status.toLowerCase().replace('_', '-');
    const priorityClass = c.priority.toLowerCase();

    return `
      <tr>
        <td>
          <a href="/user/complaint-details.html?id=${c.id}" class="fw-bold text-primary text-decoration-none">
            ${c.complaintNumber}
          </a>
        </td>
        <td>
          <div class="fw-semibold text-truncate" style="max-width: 250px;">${c.title}</div>
          <small class="text-muted">${c.categoryName || 'General'}</small>
        </td>
        <td><span class="badge badge-status badge-${statusClass}">${c.status.replace('_', ' ')}</span></td>
        <td><span class="badge bg-${priorityClass === 'critical' ? 'danger' : priorityClass === 'high' ? 'warning text-dark' : 'secondary'}">${c.priority}</span></td>
        <td class="text-end">
          <a href="/user/complaint-details.html?id=${c.id}" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-eye"></i> Track
          </a>
        </td>
      </tr>
    `;
  }).join('');
}
