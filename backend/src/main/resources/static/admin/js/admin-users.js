/**
 * ADMIN USERS CONTROLLER (admin-users.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
});

async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>';
  }

  try {
    const res = await fetch('/api/admin/users', {
      headers: { 'Accept': 'application/json' }
    });

    if (res.status === 401 || res.status === 403) {
      window.location.href = '/admin/login?error=access_denied';
      return;
    }

    const users = await res.json();
    renderUsersTable(users);
  } catch (err) {
    console.error('Failed to load users:', err);
    showToast('Failed to load users list from database.', 'danger');
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  const userCount = document.getElementById('userCountBadge');
  if (userCount) userCount.textContent = `${users.length} Users`;

  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No users found.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(u => {
    const isAdmin = u.role === 'ROLE_ADMIN';
    const isSuspended = u.status === 'SUSPENDED';

    return `
      <tr>
        <td>#${u.id}</td>
        <td>
          <div class="d-flex align-items-center">
            <div class="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center me-3" style="width: 38px; height: 38px;">
              ${u.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="fw-semibold">${u.name}</div>
              <small class="text-muted">${u.phone || 'No phone'}</small>
            </div>
          </div>
        </td>
        <td>${u.email}</td>
        <td>
          <span class="badge ${isAdmin ? 'bg-indigo text-white' : 'bg-secondary text-white'}" style="${isAdmin ? 'background-color: #4f46e5;' : ''}">
            ${isAdmin ? 'ADMIN' : 'USER'}
          </span>
        </td>
        <td><span class="badge bg-light text-dark border">${u.totalComplaints || 0}</span></td>
        <td>
          <span class="badge ${isSuspended ? 'bg-danger' : 'bg-success'}">
            ${u.status}
          </span>
        </td>
        <td class="text-end">
          ${!isAdmin ? `
            <button class="btn btn-sm ${isSuspended ? 'btn-outline-success' : 'btn-outline-danger'}" 
                    onclick="toggleUserStatus(${u.id}, '${isSuspended ? 'ACTIVE' : 'SUSPENDED'}')">
              <i class="bi bi-${isSuspended ? 'check-circle' : 'slash-circle'} me-1"></i>
              ${isSuspended ? 'Activate' : 'Suspend'}
            </button>
          ` : '<span class="text-muted small">Protected</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleUserStatus(userId, newStatus) {
  if (!confirm(`Are you sure you want to change user status to ${newStatus}?`)) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) {
      showToast(`User status updated to ${newStatus}`, 'success');
      loadUsers();
    } else {
      const err = await res.json();
      showToast(err.message || 'Failed to update user status.', 'danger');
    }
  } catch (e) {
    showToast('Network error while updating user.', 'danger');
  }
}
