/* theme.js: LocalStorage theme checks, toggler icons, and Chart.js integration */

(function() {
  // Apply saved theme immediately before body renders to prevent white flash
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.getElementById('theme-toggle');
  
  if (themeToggle) {
    // Initial icon update
    updateThemeIcon(document.documentElement.getAttribute('data-theme'));
    
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
      
      // Update Chart.js if present
      if (window.Chart) {
        updateChartStyles(newTheme);
      }
      
      // Notify backend of theme preference
      fetch('/user/api_theme_lang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
      }).catch(err => console.error("Error updating theme session on backend:", err));
    });
  }

  function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'bi bi-sun-fill text-warning';
      } else {
        icon.className = 'bi bi-moon-fill text-primary';
      }
    }
  }

  function updateChartStyles(theme) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#cbd5e1' : '#475569';
    const gridColor = isDark ? '#1e2937' : '#e2e8f0';

    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    // Refresh all chart instances
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
});
