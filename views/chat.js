const messages = [
    { type: 'bot', content: 'Hello! I can help you with questions about the Indian Constitution. You can ask about:\n- Fundamental Rights\n- Directive Principles\n- Constitutional Amendments\n- Government Structure\n- Election System\n- Judiciary System' }
];

const constitutionKB = {
    // Fundamental Rights
    'right to equality': 'Articles 14-18 guarantee Right to Equality...',
    'right to freedom': 'Articles 19-22 protect Right to Freedom...',
    // (Add more knowledge base entries as needed)
};

const messagesDiv = document.getElementById('messages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const saveBtn = document.getElementById('saveBtn');

// Scroll to bottom
const scrollToBottom = () => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

// Render chat messages
const renderMessages = () => {
    messagesDiv.innerHTML = '';
    messages.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message', msg.type === 'user' ? 'user' : 'bot');
        messageEl.textContent = msg.content;
        messagesDiv.appendChild(messageEl);
    });
    scrollToBottom();
};

// Generate a response from the bot
const generateResponse = (query) => {
    const queryLower = query.toLowerCase();
    let response = "Sorry, I don't have information about that.";
    
    for (const [key, value] of Object.entries(constitutionKB)) {
        if (queryLower.includes(key)) {
            response = value;
            break;
        }
    }
    
    return response;
};

// Handle form submission
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    messages.push({ type: 'user', content: userMessage });
    renderMessages();

    setTimeout(() => {
        const botResponse = generateResponse(userMessage);
        messages.push({ type: 'bot', content: botResponse });
        renderMessages();
    }, 1000);
    
    userInput.value = '';
});

// Save the chat
saveBtn.addEventListener('click', () => {
    const chatText = messages.map(msg => `${msg.type === 'user' ? 'You' : 'Bot'}: ${msg.content}`).join('\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat.txt';
    link.click();
});
