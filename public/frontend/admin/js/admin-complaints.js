/**
 * ADMIN COMPLAINTS CONTROLLER (admin-complaints.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

document.addEventListener('DOMContentLoaded', () => {
  loadComplaints();

  const filterForm = document.getElementById('complaintFilterForm');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loadComplaints();
    });
  }

  const resetBtn = document.getElementById('btnResetFilters');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      document.getElementById('filterStatus').value = '';
      document.getElementById('filterPriority').value = '';
      document.getElementById('filterSearch').value = '';
      loadComplaints();
    });
  }
});

async function loadComplaints() {
  const status = document.getElementById('filterStatus')?.value || '';
  const priority = document.getElementById('filterPriority')?.value || '';
  const search = document.getElementById('filterSearch')?.value || '';

  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (search) params.append('search', search);

  const tbody = document.getElementById('complaintsTableBody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>';
  }

  try {
    const res = await fetch(`/api/admin/complaints?${params.toString()}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.status === 401 || res.status === 403) {
      window.location.href = '/admin/login?error=access_denied';
      return;
    }

    const data = await res.json();
    renderComplaintsTable(data);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    showToast('Failed to load complaints from database.', 'danger');
  }
}

function renderComplaintsTable(complaints) {
  const tbody = document.getElementById('complaintsTableBody');
  const countBadge = document.getElementById('complaintsCountBadge');
  if (countBadge) countBadge.textContent = `${complaints.length} Complaints`;

  if (!tbody) return;

  if (complaints.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No complaints match your criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = complaints.map(c => {
    const statusClass = c.status.toLowerCase().replace('_', '-');
    const sentimentClass = c.sentiment.toLowerCase().replace('_', '-');
    const priorityClass = c.priority.toLowerCase();

    return `
      <tr>
        <td>
          <a href="/admin/complaint-details.html?id=${c.id}" class="fw-bold text-primary text-decoration-none">${c.complaintNumber}</a>
          <br><small class="text-muted">${c.ticketNumber ? '#' + c.ticketNumber : ''}</small>
        </td>
        <td>
          <div class="fw-semibold text-truncate" style="max-width: 250px;" title="${c.title}">${c.title}</div>
          <small class="text-muted"><i class="bi bi-tag me-1"></i>${c.categoryName || 'General'}</small>
        </td>
        <td>
          <div class="fw-medium">${c.userName || 'Customer'}</div>
          <small class="text-muted">${c.userEmail || ''}</small>
        </td>
        <td><span class="badge badge-status badge-${statusClass}">${c.status.replace('_', ' ')}</span></td>
        <td><span class="badge bg-${priorityClass === 'critical' ? 'danger' : priorityClass === 'high' ? 'warning text-dark' : 'secondary'}">${c.priority}</span></td>
        <td><span class="badge badge-sentiment badge-${sentimentClass}">${c.sentiment.replace('_', ' ')}</span></td>
        <td>
          <small class="fw-medium">${c.assignedAdminName || '<span class="text-muted fst-italic">Unassigned</span>'}</small>
        </td>
        <td class="text-end">
          <div class="btn-group">
            <a href="/admin/complaint-details.html?id=${c.id}" class="btn btn-sm btn-outline-primary" title="View Details">
              <i class="bi bi-eye"></i>
            </a>
            <button class="btn btn-sm btn-outline-secondary" onclick="openStatusModal(${c.id}, '${c.status}')" title="Update Status">
              <i class="bi bi-pencil-square"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

let activeComplaintId = null;

function openStatusModal(id, currentStatus) {
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

  try {
    const res = await fetch(`/api/admin/complaints/${activeComplaintId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ status, resolutionNotes })
    });

    if (res.ok) {
      showToast('Complaint status updated successfully.', 'success');
      bootstrap.Modal.getInstance(document.getElementById('statusUpdateModal')).hide();
      loadComplaints();
    } else {
      const err = await res.json();
      showToast(err.message || 'Failed to update status.', 'danger');
    }
  } catch (e) {
    showToast('Network error while updating status.', 'danger');
  }
}
