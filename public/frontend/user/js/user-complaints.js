/**
 * USER COMPLAINTS CONTROLLER (user-complaints.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

document.addEventListener('DOMContentLoaded', () => {
  // If on Submit Complaint page
  const complaintForm = document.getElementById('submitComplaintForm');
  if (complaintForm) {
    initSubmitComplaintPage();
  }

  // If on My Complaints page
  const myComplaintsTable = document.getElementById('myComplaintsTableBody');
  if (myComplaintsTable) {
    loadMyComplaints();
    
    const filterStatus = document.getElementById('filterMyStatus');
    if (filterStatus) filterStatus.addEventListener('change', loadMyComplaints);

    const searchInput = document.getElementById('searchMyComplaints');
    if (searchInput) searchInput.addEventListener('input', debounce(loadMyComplaints, 400));
  }

  // If on Complaint Details page
  const detailsContainer = document.getElementById('complaintDetailsCard');
  if (detailsContainer) {
    loadComplaintDetails();
  }
});

// Debounce helper
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// 1. Submit Complaint Page Logic
async function initSubmitComplaintPage() {
  const categorySelect = document.getElementById('complaintCategory');
  const descInput = document.getElementById('complaintDescription');
  const titleInput = document.getElementById('complaintTitle');
  const liveBox = document.getElementById('liveSentimentFeedback');

  // Load public categories
  try {
    const res = await fetch('/api/categories/public');
    if (res.ok) {
      const categories = await res.json();
      categorySelect.innerHTML = '<option value="">-- Select Complaint Category --</option>' +
        categories.map(c => `<option value="${c.id}">${c.name} (SLA: ${c.slaHours} hrs)</option>`).join('');
    }
  } catch (err) {
    console.error('Failed to load categories:', err);
  }

  // Real-time sentiment preview indicator
  if (descInput && liveBox) {
    descInput.addEventListener('input', () => {
      const text = ((titleInput ? titleInput.value : '') + ' ' + descInput.value).toLowerCase();
      if (text.trim().length < 15) {
        liveBox.classList.add('d-none');
        return;
      }

      liveBox.classList.remove('d-none');

      const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'stolen', 'fraud', 'double debited', 'unauthorized'];
      const hasUrgent = urgentWords.some(w => text.includes(w));

      if (hasUrgent) {
        liveBox.className = 'sentiment-live-box alert-danger border-danger';
        liveBox.innerHTML = '<i class="bi bi-shield-exclamation text-danger fs-5"></i> <div><strong>Urgent Issue Detected:</strong> Our intelligent analysis system will auto-escalate this ticket to High/Critical priority for faster SLA resolution.</div>';
      } else {
        liveBox.className = 'sentiment-live-box alert-info border-info';
        liveBox.innerHTML = '<i class="bi bi-magic text-info fs-5"></i> <div><strong>Intelligent Support:</strong> Your complaint details are analyzed to assign the best response team and monitor resolution time.</div>';
      }
    });
  }

  // Form submission
  const form = document.getElementById('submitComplaintForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const categoryId = categorySelect.value;
    const description = descInput.value.trim();
    const priority = document.getElementById('complaintPriority')?.value || '';

    if (!title || !categoryId || !description) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    const submitBtn = document.getElementById('btnSubmitComplaint');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Submitting Complaint...';

    try {
      const res = await fetch('/api/user/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ title, categoryId, description, priority })
      });

      if (res.ok) {
        const saved = await res.json();
        showToast('Complaint successfully lodged! Ticket created.', 'success');
        setTimeout(() => {
          window.location.href = `/user/complaint-details.html?id=${saved.id}`;
        }, 1000);
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bi bi-send me-2"></i> Submit Complaint';
        const err = await res.json();
        showToast(err.message || 'Failed to submit complaint.', 'danger');
      }
    } catch (e) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-send me-2"></i> Submit Complaint';
      showToast('Network error while submitting complaint.', 'danger');
    }
  });
}

// 2. My Complaints Page Logic
async function loadMyComplaints() {
  const status = document.getElementById('filterMyStatus')?.value || '';
  const search = document.getElementById('searchMyComplaints')?.value || '';

  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);

  const tbody = document.getElementById('myComplaintsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>';

  try {
    const res = await fetch(`/api/user/complaints?${params.toString()}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.status === 401 || res.status === 403) {
      window.location.href = '/user/login?error=access_denied';
      return;
    }

    const complaints = await res.json();
    renderMyComplaints(complaints);
  } catch (err) {
    console.error('Error loading my complaints:', err);
    showToast('Failed to load your complaints.', 'danger');
  }
}

function renderMyComplaints(complaints) {
  const tbody = document.getElementById('myComplaintsTableBody');
  const countBadge = document.getElementById('myComplaintsCountBadge');
  if (countBadge) countBadge.textContent = `${complaints.length} Complaints`;

  if (!tbody) return;

  if (complaints.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted">No complaints found matching your search.</td></tr>';
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
          <br><small class="text-muted">${c.ticketNumber ? '#' + c.ticketNumber : ''}</small>
        </td>
        <td>
          <div class="fw-semibold text-truncate" style="max-width: 260px;">${c.title}</div>
          <small class="text-muted"><i class="bi bi-tag me-1"></i>${c.categoryName || 'General'}</small>
        </td>
        <td><span class="badge badge-status badge-${statusClass}">${c.status.replace('_', ' ')}</span></td>
        <td><span class="badge bg-${priorityClass === 'critical' ? 'danger' : priorityClass === 'high' ? 'warning text-dark' : 'secondary'}">${c.priority}</span></td>
        <td><small class="text-muted">${new Date(c.createdAt).toLocaleDateString()}</small></td>
        <td class="text-end">
          <a href="/user/complaint-details.html?id=${c.id}" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-eye"></i> View Ticket
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

// 3. Complaint Details Page Logic
async function loadComplaintDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (!id) {
    window.location.href = '/user/my-complaints.html';
    return;
  }

  try {
    const res = await fetch(`/api/user/complaints/${id}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.status === 401 || res.status === 403) {
      showToast('Access denied: You do not own this complaint.', 'danger');
      setTimeout(() => { window.location.href = '/user/my-complaints.html'; }, 1200);
      return;
    }

    if (!res.ok) {
      showToast('Complaint not found.', 'danger');
      return;
    }

    const c = await res.json();
    populateDetailsView(c);
  } catch (err) {
    showToast('Failed to load complaint details.', 'danger');
  }
}

function populateDetailsView(c) {
  document.getElementById('detailComplaintNumber').textContent = c.complaintNumber;
  document.getElementById('detailTicketNumber').textContent = c.ticketNumber || 'Generating...';
  document.getElementById('detailTitle').textContent = c.title;
  document.getElementById('detailCategory').textContent = c.categoryName;
  document.getElementById('detailDescription').textContent = c.description;
  document.getElementById('detailCreatedAt').textContent = new Date(c.createdAt).toLocaleString();

  const statusEl = document.getElementById('detailStatus');
  const statusClass = c.status.toLowerCase().replace('_', '-');
  statusEl.className = `badge badge-status badge-${statusClass}`;
  statusEl.textContent = c.status.replace('_', ' ');

  const priorityEl = document.getElementById('detailPriority');
  const pClass = c.priority.toLowerCase();
  priorityEl.className = `badge bg-${pClass === 'critical' ? 'danger' : pClass === 'high' ? 'warning text-dark' : 'secondary'}`;
  priorityEl.textContent = c.priority;

  if (c.resolutionNotes) {
    document.getElementById('detailResolutionSection').classList.remove('d-none');
    document.getElementById('detailResolutionNotes').textContent = c.resolutionNotes;
  }

  // Update Timeline steps
  const stepPending = document.getElementById('stepPending');
  const stepInProgress = document.getElementById('stepInProgress');
  const stepResolved = document.getElementById('stepResolved');

  if (stepPending) stepPending.querySelector('.timeline-marker').classList.add('done');

  if (c.status === 'IN_PROGRESS' || c.status === 'RESOLVED' || c.status === 'CLOSED') {
    if (stepInProgress) stepInProgress.querySelector('.timeline-marker').classList.add('done');
  }

  if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
    if (stepResolved) stepResolved.querySelector('.timeline-marker').classList.add('done');
    const feedbackBtn = document.getElementById('btnOpenFeedback');
    if (feedbackBtn) feedbackBtn.classList.remove('d-none');
  }
}
