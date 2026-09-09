/* theme.js: LocalStorage theme checks, toggler icons, and Chart.js integration */

(function() {
  // Sync theme immediately on load
  const serverTheme = document.documentElement.getAttribute('data-theme');
  const savedTheme = localStorage.getItem('theme');
  
  if (serverTheme) {
    localStorage.setItem('theme', serverTheme);
  } else if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
})();

// Global function to set and synchronize theme across DOM, localStorage, and backend
window.setAppTheme = function(newTheme) {
  if (newTheme !== 'light' && newTheme !== 'dark') return;
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update header toggle icon
  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    if (newTheme === 'dark') {
      icon.className = 'bi bi-sun-fill text-warning';
    } else {
      icon.className = 'bi bi-moon-fill text-primary';
    }
  }

  // Update Chart.js if active
  if (window.Chart && typeof updateChartStyles === 'function') {
    updateChartStyles(newTheme);
  }

  // Notify backend of theme preference
  fetch('/user/api/theme_lang', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ theme: newTheme })
  }).catch(err => console.error("Error updating theme on backend:", err));
};

function updateChartStyles(theme) {
  if (!window.Chart || !Chart.instances) return;
  const isDark = theme === 'dark';
  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? '#1e2937' : '#e2e8f0';

  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = gridColor;

  Object.keys(Chart.instances).forEach(key => {
    const chartInstance = Chart.instances[key];
    if (chartInstance.options.scales) {
      if (chartInstance.options.scales.x) {
        chartInstance.options.scales.x.grid.color = gridColor;
        chartInstance.options.scales.x.ticks.color = textColor;
      }
      if (chartInstance.options.scales.y) {
        chartInstance.options.scales.y.grid.color = gridColor;
        chartInstance.options.scales.y.ticks.color = textColor;
      }
    }
    chartInstance.update();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Sync icon state on DOM ready
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const icon = document.querySelector('#theme-toggle i');
  if (icon) {
    if (currentTheme === 'dark') {
      icon.className = 'bi bi-sun-fill text-warning';
    } else {
      icon.className = 'bi bi-moon-fill text-primary';
    }
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const targetTheme = activeTheme === 'dark' ? 'light' : 'dark';
      window.setAppTheme(targetTheme);
    });
  }
});
