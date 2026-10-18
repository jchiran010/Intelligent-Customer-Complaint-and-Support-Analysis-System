/**
 * ADMIN DASHBOARD CONTROLLER (admin-dashboard.js)
 * Intelligent Customer Complaint & Support Analysis System
 */

let statusChartInstance = null;
let sentimentChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const res = await fetch('/api/admin/dashboard', {
      headers: { 'Accept': 'application/json' }
    });

    if (res.status === 401 || res.status === 403) {
      window.location.href = '/admin/login?error=access_denied';
      return;
    }

    const data = await res.json();
    populateMetrics(data);
    renderStatusChart(data.statusDistribution || {});
    renderSentimentChart(data.sentimentDistribution || {});
    populateRecentComplaints(data.recentComplaints || []);
  } catch (err) {
    console.error('Failed to load admin dashboard data:', err);
    showToast('Failed to load dashboard metrics from database.', 'danger');
  }
}

function populateMetrics(data) {
  document.getElementById('totalComplaints').textContent = data.totalComplaints || 0;
  document.getElementById('pendingComplaints').textContent = data.pendingComplaints || 0;
  document.getElementById('inProgressComplaints').textContent = data.inProgressComplaints || 0;
  document.getElementById('resolvedComplaints').textContent = data.resolvedComplaints || 0;
  document.getElementById('closedComplaints').textContent = data.closedComplaints || 0;
  document.getElementById('highPriorityComplaints').textContent = data.highPriorityComplaints || 0;
  document.getElementById('resolutionRate').textContent = (data.resolutionRate || 0) + '%';
  document.getElementById('totalUsers').textContent = data.totalUsers || 0;

  // Set gauge value CSS variable
  const gauge = document.getElementById('resolutionGauge');
  if (gauge) {
    gauge.style.setProperty('--gauge-value', data.resolutionRate || 0);
  }
}

function renderStatusChart(statusDist) {
  const ctx = document.getElementById('statusChart');
  if (!ctx) return;

  if (statusChartInstance) statusChartInstance.destroy();

  const labels = Object.keys(statusDist);
  const counts = Object.values(statusDist);

  statusChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length > 0 ? labels : ['Pending', 'In Progress', 'Resolved', 'Closed'],
      datasets: [{
        data: counts.length > 0 ? counts : [0, 0, 0, 0],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#64748b'],
        borderWidth: 2,
        borderColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#111827' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 15, color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() }
        }
      },
      cutout: '72%'
    }
  });
}

function renderSentimentChart(sentimentDist) {
  const ctx = document.getElementById('sentimentChart');
  if (!ctx) return;

  if (sentimentChartInstance) sentimentChartInstance.destroy();

  const labels = ['Positive', 'Neutral', 'Negative', 'Very Negative'];
  const values = [
    sentimentDist['POSITIVE'] || 0,
    sentimentDist['NEUTRAL'] || 0,
    sentimentDist['NEGATIVE'] || 0,
    sentimentDist['VERY_NEGATIVE'] || 0
  ];

  sentimentChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Complaints',
        data: values,
        backgroundColor: ['#10b981', '#64748b', '#f97316', '#ef4444'],
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
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim() },
          grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() }
        },
        x: {
          ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-light').trim() },
          grid: { display: false }
        }
      }
    }
  });
}

function populateRecentComplaints(complaints) {
  const tbody = document.getElementById('recentComplaintsTable');
  if (!tbody) return;

  if (complaints.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No complaints recorded yet.</td></tr>';
    return;
  }

  tbody.innerHTML = complaints.map(c => {
    const statusClass = c.status.toLowerCase().replace('_', '-');
    const sentimentClass = c.sentiment.toLowerCase().replace('_', '-');
    const priorityClass = c.priority.toLowerCase();

    return `
      <tr>
        <td><a href="/admin/complaint-details.html?id=${c.id}" class="fw-bold text-primary text-decoration-none">${c.complaintNumber}</a></td>
        <td>
          <div class="fw-semibold text-truncate" style="max-width: 220px;" title="${c.title}">${c.title}</div>
          <small class="text-muted">${c.categoryName || 'General'}</small>
        </td>
        <td>
          <div class="fw-medium">${c.userName || 'Customer'}</div>
          <small class="text-muted">${c.userEmail || ''}</small>
        </td>
        <td><span class="badge badge-status badge-${statusClass}">${c.status.replace('_', ' ')}</span></td>
        <td><span class="badge bg-${priorityClass === 'critical' ? 'danger' : priorityClass === 'high' ? 'warning text-dark' : 'secondary'}">${c.priority}</span></td>
        <td><span class="badge badge-sentiment badge-${sentimentClass}">${c.sentiment.replace('_', ' ')}</span></td>
        <td class="text-end">
          <a href="/admin/complaint-details.html?id=${c.id}" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-eye"></i> Details
          </a>
        </td>
      </tr>
    `;
  }).join('');
}
