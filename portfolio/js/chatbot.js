/* ============================================
   CHATBOT.JS - Interactive Chatbot Widget
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    initChatbot();
});

function initChatbot() {
    const toggle = document.querySelector('.chatbot-toggle');
    const window = document.querySelector('.chatbot-window');
    const closeBtn = document.querySelector('.chatbot-close');
    const input = document.querySelector('.chatbot-input input');
    const sendBtn = document.querySelector('.chatbot-send');
    const messagesContainer = document.querySelector('.chatbot-messages');
    const quickReplies = document.querySelectorAll('.quick-reply-btn');

    if (!toggle || !window) return;

    // Toggle chatbot window
    toggle.addEventListener('click', function () {
        this.classList.toggle('active');
        window.classList.toggle('active');

        // Change icon
        const icon = this.querySelector('i');
        if (window.classList.contains('active')) {
            icon.className = 'fas fa-times';
            // Remove notification badge
            const badge = this.querySelector('.badge');
            if (badge) badge.remove();
            // Focus input
            setTimeout(() => input?.focus(), 300);
        } else {
            icon.className = 'fas fa-comment-dots';
        }
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            toggle.classList.remove('active');
            window.classList.remove('active');
            toggle.querySelector('i').className = 'fas fa-comment-dots';
        });
    }

    // Send message
    function sendMessage() {
        const message = input?.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        showTypingIndicator();

        // Simulate bot response (replace with actual API call)
        setTimeout(() => {
            hideTypingIndicator();
            const response = getBotResponse(message);
            addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    if (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Quick replies
    quickReplies.forEach(btn => {
        btn.addEventListener('click', function () {
            const message = this.textContent.trim();
            input.value = message;
            sendMessage();
        });
    });

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;

        const avatarIcon = sender === 'bot' ? '🤖' : '👤';

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatarIcon}</div>
            <div class="message-content">${text}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot typing';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        const typing = messagesContainer.querySelector('.typing');
        if (typing) typing.remove();
    }

    // Simple bot responses (replace with AI/API integration)
    function getBotResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Greetings
        if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam') || lowerMessage.includes('hey')) {
            return 'Merhaba! 👋 Ben Baran\'ın asistanıyım. Size nasıl yardımcı olabilirim?';
        }

        // About
        if (lowerMessage.includes('kim') || lowerMessage.includes('baran') || lowerMessage.includes('hakkında')) {
            return 'Baran, 5+ yıllık deneyime sahip bir Full-Stack Developer. Web, mobil ve SaaS projeleri geliştiriyor. Daha fazla bilgi için Hakkımda sayfasını ziyaret edebilirsiniz! 🚀';
        }

        // Skills
        if (lowerMessage.includes('teknoloji') || lowerMessage.includes('beceri') || lowerMessage.includes('yetenek') || lowerMessage.includes('skill')) {
            return 'Baran\'ın uzmanlık alanları: React, Vue.js, Node.js, Flutter, Python, PostgreSQL, MongoDB, AWS ve Docker. Modern web teknolojilerinin hepsinde deneyimli! 💻';
        }

        // Contact
        if (lowerMessage.includes('iletişim') || lowerMessage.includes('mail') || lowerMessage.includes('ulaş')) {
            return 'Baran\'a ulaşmak için İletişim sayfasını kullanabilir veya hello@barandasdemir.com adresine mail gönderebilirsiniz. Genellikle 24 saat içinde dönüş yapar! 📧';
        }

        // Projects
        if (lowerMessage.includes('proje') || lowerMessage.includes('çalışma') || lowerMessage.includes('portfolio')) {
            return 'Baran\'ın e-ticaret platformları, mobil uygulamalar ve SaaS projeleri gibi birçok çalışması var. Detaylar için Projeler sayfasına göz atın! 🎨';
        }

        // Hire
        if (lowerMessage.includes('iş') || lowerMessage.includes('freelance') || lowerMessage.includes('müsait') || lowerMessage.includes('hire')) {
            return 'Evet! Baran şu anda yeni projeler için müsait. Freelance veya tam zamanlı iş tekliflerinizi İletişim sayfasından iletebilirsiniz. ✅';
        }

        // Default response
        const defaults = [
            'İlginç bir soru! Bu konuda daha fazla bilgi için İletişim sayfasından Baran\'a ulaşabilirsiniz. 🤔',
            'Hmm, bu konuda kesin bilgim yok. Baran\'a direkt sormanızı öneririm! 📨',
            'Anladım! Daha detaylı bilgi için web sitesindeki ilgili sayfaları inceleyebilirsiniz. 📚'
        ];
        return defaults[Math.floor(Math.random() * defaults.length)];
    }
}
