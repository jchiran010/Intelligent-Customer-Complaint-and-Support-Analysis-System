/* dashboard.js: Sidebar toggling, bento configurations, and visual loaders */

document.addEventListener('DOMContentLoaded', function() {
  const sidebar = document.getElementById('sidebar');
  const mainWrapper = document.getElementById('main-wrapper');
  const toggleBtn = document.getElementById('sidebar-toggle');

  if (toggleBtn && sidebar && mainWrapper) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      mainWrapper.classList.toggle('expanded');
      
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebar-collapsed', isCollapsed ? 'true' : 'false');
    });

    // Check saved state
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
      sidebar.classList.add('collapsed');
      mainWrapper.classList.add('expanded');
    }
  }

  // Smooth counter animation for KPI indicators
  const counters = document.querySelectorAll('.animate-counter');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target') || 0;
    if (target === 0) return;
    
    let count = 0;
    const increment = target / 40; // divide by steps
    
    const updateCount = () => {
      count += increment;
      if (count < target) {
        counter.innerText = Math.ceil(count);
        setTimeout(updateCount, 15);
      } else {
        counter.innerText = target;
      }
    };
    
    updateCount();
  });
});
