/* notifications.js: Long-polling notification badge updater and custom toast alerts */

document.addEventListener('DOMContentLoaded', function() {
  let lastUnreadCount = -1;

  function pollNotificationUpdates() {
    const badge = document.getElementById('notification-badge');
    const dropdownList = document.getElementById('notification-dropdown-list');
    if (!badge) return;

    fetch('/notification/api/unread_count')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const count = data.count;
          badge.textContent = count;
          badge.className = count > 0 ? 'badge bg-danger rounded-pill' : 'd-none';

          if (lastUnreadCount !== -1 && count > lastUnreadCount) {
            showToastAlert("New alert received. Check notifications.");
          }
          lastUnreadCount = count;

          // Hydrate Dropdown Items
          if (dropdownList && data.recent) {
            dropdownList.innerHTML = '';
            if (data.recent.length === 0) {
              dropdownList.innerHTML = `<li><a class="dropdown-item text-center text-muted" href="/notification/">No new notifications</a></li>`;
            } else {
              data.recent.forEach(item => {
                const currentLang = document.documentElement.getAttribute('lang') || 'en';
                const title = currentLang === 'ta' ? item.title_ta : item.title_en;
                dropdownList.innerHTML += `<li><a class="dropdown-item py-2" href="/notification/">
                  <div class="fw-semibold">${title}</div>
                  <small class="text-muted">${item.created_at.substring(11, 16)}</small>
                </a></li>`;
              });
              dropdownList.innerHTML += `<li><hr class="dropdown-divider"></li>`;
              dropdownList.innerHTML += `<li><a class="dropdown-item text-center text-primary py-2" href="/notification/">View All</a></li>`;
            }
          }
        }
      })
      .catch(err => console.error("Error fetching unread notification details:", err));
  }

  function showToastAlert(message, type = "success") {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(container);
    }

    const tId = `toast-${Date.now()}`;
    const bg = type === 'success' ? 'bg-success' : (type === 'danger' ? 'bg-danger' : 'bg-primary');

    const toastHtml = `
      <div id="${tId}" class="toast align-items-center text-white ${bg} border-0" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    container.innerHTML += toastHtml;
    const toastEl = document.getElementById(tId);

    if (window.bootstrap) {
      const bsToast = new bootstrap.Toast(toastEl, { delay: 4500 });
      bsToast.show();
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }
  }

  // Poll immediately and start interval
  if (document.getElementById('notification-badge')) {
    pollNotificationUpdates();
    setInterval(pollNotificationUpdates, 20000);
  }

  // Export helpers globally
  window.showToast = showToastAlert;
});
