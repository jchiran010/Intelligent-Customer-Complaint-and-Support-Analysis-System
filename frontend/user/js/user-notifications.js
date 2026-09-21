/**
 * USER NOTIFICATIONS CONTROLLER (user-notifications.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

document.addEventListener('DOMContentLoaded', () => {
  loadNotifications();

  const markAllBtn = document.getElementById('btnMarkAllRead');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', markAllAsRead);
  }
});

async function loadNotifications() {
  const container = document.getElementById('notificationsList');
  if (!container) return;

  container.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

  try {
    const res = await fetch('/api/notifications', {
      headers: { 'Accept': 'application/json' }
    });

    if (res.status === 401 || res.status === 403) {
      window.location.href = '/user/login?error=access_denied';
      return;
    }

    const notifications = await res.json();
    renderNotifications(notifications);
  } catch (err) {
    console.error('Failed to load notifications:', err);
    showToast('Failed to load notifications.', 'danger');
  }
}

function renderNotifications(notifs) {
  const container = document.getElementById('notificationsList');
  if (!container) return;

  if (notifs.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 text-muted">
        <i class="bi bi-bell-slash fs-1 d-block mb-3"></i>
        <h6>No Notifications</h6>
        <p class="small">You're all caught up! Important updates about your complaints will show here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notifs.map(n => {
    const iconClass = n.type === 'SUCCESS' ? 'bi-check-circle-fill text-success' :
                      n.type === 'ALERT' ? 'bi-exclamation-octagon-fill text-danger' :
                      n.type === 'WARNING' ? 'bi-exclamation-triangle-fill text-warning' :
                      'bi-info-circle-fill text-primary';

    return `
      <div class="card mb-3 border ${n.isRead ? 'bg-surface' : 'bg-surface-alt border-primary'} shadow-sm">
        <div class="card-body d-flex align-items-start gap-3">
          <i class="bi ${iconClass} fs-3 mt-1"></i>
          <div class="flex-grow-1">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <h6 class="mb-0 fw-bold">${n.title}</h6>
              <small class="text-muted">${new Date(n.createdAt).toLocaleDateString()} ${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
            </div>
            <p class="mb-2 text-muted small">${n.message}</p>
            <div class="d-flex align-items-center gap-2">
              ${n.targetUrl ? `<a href="${n.targetUrl}" class="btn btn-sm btn-outline-primary py-0">View Details</a>` : ''}
              ${!n.isRead ? `<button class="btn btn-sm btn-link text-muted py-0" onclick="markOneAsRead(${n.id})">Mark as read</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function markOneAsRead(id) {
  try {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    if (res.ok) {
      loadNotifications();
      updateNotificationBadge();
    }
  } catch (e) {
    showToast('Failed to update notification.', 'danger');
  }
}

async function markAllAsRead() {
  try {
    const res = await fetch('/api/notifications/read-all', { method: 'PUT' });
    if (res.ok) {
      showToast('All notifications marked as read.', 'success');
      loadNotifications();
      updateNotificationBadge();
    }
  } catch (e) {
    showToast('Failed to mark all as read.', 'danger');
  }
}
