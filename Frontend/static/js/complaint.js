/* complaint.js: Debounced NLP classification triggers and Drag & Drop file uploads */

document.addEventListener('DOMContentLoaded', function() {
  const descriptionField = document.getElementById('complaint-description');
  const suggestionsBox = document.getElementById('ai-suggestions-box');
  const catText = document.getElementById('ai-suggested-category');
  const prioText = document.getElementById('ai-suggested-priority');
  const acceptBtn = document.getElementById('accept-suggestions-btn');
  const scannerBadge = document.getElementById('ai-scanner-badge');

  let timer;
  let suggestedCategory = 5;
  let suggestedPriority = 'medium';

  if (descriptionField) {
    descriptionField.addEventListener('input', function() {
      clearTimeout(timer);
      const text = descriptionField.value.trim();

      if (text.length < 15) {
        if (suggestionsBox) suggestionsBox.classList.add('d-none');
        return;
      }

      if (scannerBadge) {
        scannerBadge.classList.remove('d-none');
        scannerBadge.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> AI Analysing...`;
      }

      timer = setTimeout(() => {
        fetch('/complaint/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text })
        })
        .then(res => res.json())
        .then(data => {
          if (scannerBadge) scannerBadge.classList.add('d-none');

          if (suggestionsBox && data.category_id) {
            suggestionsBox.classList.remove('d-none');
            
            // Resolve localized name
            const currentLang = document.documentElement.getAttribute('lang') || 'en';
            const catName = currentLang === 'ta' ? data.category_name_ta : data.category_name_en;
            
            if (catText) catText.textContent = catName;
            
            if (prioText) {
              prioText.textContent = data.priority.toUpperCase();
              prioText.className = 'badge';
              
              if (data.priority === 'critical') prioText.classList.add('bg-danger');
              else if (data.priority === 'high') prioText.classList.add('bg-warning', 'text-dark');
              else if (data.priority === 'medium') prioText.classList.add('bg-primary');
              else prioText.classList.add('bg-secondary');
            }

            suggestedCategory = data.category_id;
            suggestedPriority = data.priority;
          }
        })
        .catch(err => {
          console.error("Error invoking NLP services:", err);
          if (scannerBadge) scannerBadge.classList.add('d-none');
        });
      }, 800);
    });
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      const selectCat = document.getElementById('complaint-category');
      const selectPrio = document.getElementById('complaint-priority');

      if (selectCat) selectCat.value = suggestedCategory;
      if (selectPrio) selectPrio.value = suggestedPriority;

      if (suggestionsBox) suggestionsBox.classList.add('d-none');
      if (window.showToast) {
        window.showToast("Parameters suggested by AI applied.");
      }
    });
  }

  // Drag and drop attachment validators
  const dropBox = document.getElementById('drag-drop-area');
  const uploadInput = document.getElementById('file-attachment');
  const labelText = document.getElementById('file-label-text');

  if (dropBox && uploadInput) {
    // Prevent default drag details
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eName => {
      dropBox.addEventListener(eName, preventD, false);
    });

    function preventD(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eName => {
      dropBox.addEventListener(eName, () => dropBox.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eName => {
      dropBox.addEventListener(eName, () => dropBox.classList.remove('highlight'), false);
    });

    dropBox.addEventListener('drop', e => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        uploadInput.files = files;
        validateFile(files[0]);
      }
    });

    dropBox.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', () => {
      if (uploadInput.files.length > 0) {
        validateFile(uploadInput.files[0]);
      }
    });

    function validateFile(file) {
      // 5MB Limit
      if (file.size > 5 * 1024 * 1024) {
        if (window.showToast) window.showToast("File exceeds 5MB size limit.", "danger");
        uploadInput.value = '';
        if (labelText) labelText.innerHTML = `<span class="text-danger"><i class="bi bi-x-circle-fill"></i> Too large. Try again</span>`;
        return;
      }

      if (labelText) {
        labelText.innerHTML = `<span class="text-success"><i class="bi bi-file-earmark-check-fill"></i> ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>`;
      }
    }
  }
});
