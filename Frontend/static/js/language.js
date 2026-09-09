/* language.js: Language toggle sync and reloading */

document.addEventListener('DOMContentLoaded', function() {
  const langToggle = document.getElementById('lang-toggle');

  if (langToggle) {
    langToggle.addEventListener('click', function() {
      const currentLang = langToggle.getAttribute('data-lang') || 'en';
      const newLang = currentLang === 'en' ? 'ta' : 'en';

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
    });
  }
});
