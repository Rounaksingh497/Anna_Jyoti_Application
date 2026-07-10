document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'https://anna-jyoti-application-2.onrender.com/api';
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send-chat');
    const chatHistory = document.getElementById('chat-history');
    const btnMic = document.getElementById('btn-mic');

    if (!btnSend || !chatInput || !chatHistory) return;

    // ==========================================
    // 1. CHAT LOGIC
    // ==========================================
    async function sendMessage(textOverride = null) {
        const message = textOverride || chatInput.value.trim();
        if (!message) return;

        console.log("Sending message:", message); // Debug log
        
        // 1. Render User Message IMMEDIATELY
        appendMessage(message, 'user');
        chatInput.value = ''; 
        
        // 2. Add 'Typing' indicator for bot
        const loadingId = appendMessage('Typing...', 'bot', true);

        try {
            const res = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            
            const data = await res.json();
            
            // Remove typing indicator
            const loadingElem = document.getElementById(loadingId);
            if (loadingElem) loadingElem.remove();
            
            if (res.ok) {
                // Formatting AI response
                const formattedReply = data.reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                appendMessage(formattedReply, 'bot');
            } else {
                appendMessage("Sorry, I'm having trouble connecting to the server.", 'bot');
            }
        } catch (error) {
            console.error("Chat error:", error);
            const loadingElem = document.getElementById(loadingId);
            if (loadingElem) loadingElem.remove();
            appendMessage("Network error. Check your server connection.", 'bot');
        }
    }

    function appendMessage(text, sender, isLoading = false) {
        const msgWrapper = document.createElement('div');
        msgWrapper.className = `chat-msg ${sender}`;
        const id = 'msg-' + Date.now();
        msgWrapper.id = id;
        
        // Structure: Avatar + Bubble
        const avatarHTML = sender === 'bot' ? `<div class="msg-avatar">🤖</div>` : '';
        const contentHTML = isLoading 
            ? `<span style="color: var(--text-muted);">Typing...</span>` 
            : text;

        msgWrapper.innerHTML = `
            ${avatarHTML}
            <div class="msg-bubble">${contentHTML}</div>
        `;
        
        chatHistory.appendChild(msgWrapper);
        chatHistory.scrollTop = chatHistory.scrollHeight; 
        return id;
    }

    // Event Listeners
    btnSend.addEventListener('click', () => sendMessage());
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // ==========================================
    // 2. VOICE RECOGNITION (Web Speech API)
    // ==========================================
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        let isRecording = false;

        recognition.onstart = () => {
            isRecording = true;
            btnMic.style.color = "#ef4444";
            chatInput.placeholder = "Listening...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            sendMessage(); 
        };

        recognition.onend = () => {
            isRecording = false;
            btnMic.style.color = "var(--text-muted)";
            chatInput.placeholder = "Ask me anything...";
        };

        btnMic.addEventListener('click', () => {
            if (isRecording) recognition.stop();
            else recognition.start();
        });
    }
});