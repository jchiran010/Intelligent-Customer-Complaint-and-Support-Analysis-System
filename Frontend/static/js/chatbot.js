/* chatbot.js: Dialog box submission triggers and FAQ shortcut hooks */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const displayArea = document.getElementById('chat-messages');
  const shortcuts = document.querySelectorAll('.faq-shortcut');

  function scrollDown() {
    if (displayArea) {
      displayArea.scrollTop = displayArea.scrollHeight;
    }
  }

  function appendBubble(message, sender) {
    if (!displayArea) return;
    const bubble = document.createElement('div');
    bubble.className = `chatbot-bubble ${sender}`;
    bubble.innerHTML = message;
    displayArea.appendChild(bubble);
    scrollDown();
  }

  function sendQuery(text) {
    if (!text) return;
    
    appendBubble(text, 'user');
    if (input) input.value = '';

    // Typing loader
    const loader = document.createElement('div');
    loader.className = 'chatbot-bubble bot text-muted italic';
    loader.id = 'typing-indicator';
    loader.innerHTML = `<span class="spinner-grow spinner-grow-sm"></span> Support Assistant is typing...`;
    displayArea.appendChild(loader);
    scrollDown();

    fetch('/user/chatbot/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
    .then(res => res.json())
    .then(data => {
      const indicator = document.getElementById('typing-indicator');
      if (indicator) indicator.remove();
      
      appendBubble(data.response, 'bot');
    })
    .catch(err => {
      console.error("Error communicating with support bot:", err);
      const indicator = document.getElementById('typing-indicator');
      if (indicator) indicator.remove();
      appendBubble("Service temporary unavailable. Please write your request directly.", 'bot');
    });
  }

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const msg = input.value.trim();
      sendQuery(msg);
    });
  }

  if (shortcuts) {
    shortcuts.forEach(btn => {
      btn.addEventListener('click', function() {
        sendQuery(btn.textContent.trim());
      });
    });
  }

  scrollDown();
});
