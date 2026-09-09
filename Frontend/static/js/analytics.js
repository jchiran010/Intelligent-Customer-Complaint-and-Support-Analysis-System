/* analytics.js: Chart.js layout configurations and custom rendering helpers */

window.createTrendChart = function(ctx, labels, data, isDark) {
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? '#1e2937' : '#e2e8f0';

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Complaints',
        data: data,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#2563eb'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1, precision: 0 }, min: 0 }
      }
    }
  });
};

window.createCategoryChart = function(ctx, labels, data, isDark) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'],
        borderWidth: isDark ? 2 : 1,
        borderColor: isDark ? '#0f172a' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });
};

window.createPriorityChart = function(ctx, labels, data, isDark) {
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? '#1e2937' : '#e2e8f0';

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#ef4444', '#f59e0b', '#2563eb', '#64748b'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1, precision: 0 }, min: 0 }
      }
    }
  });
};

window.createCsatChart = function(ctx, labels, data, isDark) {
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? '#1e2937' : '#e2e8f0';

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: '#fbbf24',
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1, precision: 0 }, min: 0 }
      }
    }
  });
};
