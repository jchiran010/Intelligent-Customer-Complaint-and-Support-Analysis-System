/* language.js: Language toggle sync and dynamic interface reloading */

// Global function to update application language
window.setAppLanguage = function(newLang) {
  if (newLang !== 'en' && newLang !== 'ta') return;

  fetch('/user/api/theme_lang', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang: newLang })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      window.location.reload();
    }
  })
  .catch(err => console.error("Error updating language setting on backend:", err));
};

document.addEventListener('DOMContentLoaded', function() {
  const langToggle = document.getElementById('lang-toggle');

  if (langToggle) {
    langToggle.addEventListener('click', function() {
      const currentLang = langToggle.getAttribute('data-lang') || 'en';
      const newLang = currentLang === 'en' ? 'ta' : 'en';
      window.setAppLanguage(newLang);
    });
  }

  // Handle on-page language select elements (e.g., Profile Settings)
  const langSelects = document.querySelectorAll('select[name="language"], #profile-language-select');
  langSelects.forEach(select => {
    select.addEventListener('change', function() {
      window.setAppLanguage(this.value);
    });
  });

  // Handle on-page language radio buttons (e.g., Settings Page)
  const langRadios = document.querySelectorAll('input[name="language"]');
  langRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      // Highlight parent option card
      langRadios.forEach(r => {
        const card = r.closest('.theme-option-card');
        if (card) {
          if (r.checked) {
            card.classList.add('active');
          } else {
            card.classList.remove('active');
          }
        }
      });
      window.setAppLanguage(this.value);
    });
  });
});

