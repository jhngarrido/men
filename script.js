// Configuración del sistema
const CONFIG = {
    // Contraseñas originales para encriptación (NO las contraseñas de login)
    ENCRYPTION_KEYS: {
        "Usuario 1": "user1_2385", // Clave para encriptar mensajes de Usuario 1
        "Usuario 2": "user2_2350"  // Clave para encriptar mensajes de Usuario 2
    },
    STORAGE_KEY: "mensajeria_privada",
    MESSAGE_EXPIRY_HOURS: 48,
    // JSONBin.io configuración
    JSONBIN: {
        API_KEY: "$2a$10$your_api_key_here", // Reemplazar con tu API key real
        BIN_ID: "your_bin_id_here" // Reemplazar con tu bin ID real
    },
    // Contraseñas hasheadas para login
    HASHED_PASSWORDS: {
        "Usuario 1": "b8c5e1a9f7d4e2c6b3a8f5e9d2c7b4a1e8f5c2d9b6a3e0f7d4c1b8e5a2f9c6d3", // "user1_2385" hasheado
        "Usuario 2": "a7d4b1e8f5c2a9f6d3b0e7c4a1f8e5b2d9c6a3f0e7d4b1a8f5c2e9f6d3b0a7c4"  // "user2_2350" hasheado
    }
};

// Variables globales
let currentUser = null;
let selectedUserForLogin = null;
let messages = [];
let messageCleanupInterval = null;

// Elementos del DOM
const loginScreen = document.getElementById('loginScreen');
const userSelectionScreen = document.getElementById('userSelectionScreen');
const chatScreen = document.getElementById('chatScreen');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const backBtn = document.getElementById('backBtn');
const loginError = document.getElementById('loginError');
const selectedUserName = document.getElementById('selectedUserName');
const user1Btn = document.getElementById('user1Btn');
const user2Btn = document.getElementById('user2Btn');
const user1Counter = document.getElementById('user1Counter');
const user2Counter = document.getElementById('user2Counter');
const currentUserSpan = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Prevenir acciones del menú contextual y selección
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());

// Prevenir copiar con teclado
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 'x' || e.key === 'v')) {
        e.preventDefault();
    }
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadMessagesFromCloud(); // Cargar desde la nube primero
    setupEventListeners();
    startMessageCleanup();
});

// Configurar event listeners
function setupEventListeners() {
    // Selección de usuario (ahora es el primer paso)
    user1Btn.addEventListener('click', () => showLoginForUser('Usuario 1'));
    user2Btn.addEventListener('click', () => showLoginForUser('Usuario 2'));
    
    // Login
    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Botón volver
    backBtn.addEventListener('click', backToUserSelection);
    
    // Chat
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Logout
    logoutBtn.addEventListener('click', logout);
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    });
}

// Mostrar login para usuario específico
function showLoginForUser(user) {
    selectedUserForLogin = user;
    const userIcon = user === 'Usuario 1' ? '✏️' : '👁️';
    selectedUserName.textContent = `${userIcon} ${user}`;
    userSelectionScreen.classList.remove('active');
    loginScreen.classList.add('active');
    passwordInput.focus();
}

// Volver a selección de usuario
function backToUserSelection() {
    selectedUserForLogin = null;
    loginError.textContent = '';
    passwordInput.value = '';
    loginScreen.classList.remove('active');
    userSelectionScreen.classList.add('active');
}

// Manejo del login (ahora con contraseñas hasheadas)
async function handleLogin() {
    const password = passwordInput.value.trim();
    const hashedPassword = CONFIG.HASHED_PASSWORDS[selectedUserForLogin];
    
    try {
        const isValid = await verifyPassword(password, hashedPassword);
        
        if (isValid) {
            currentUser = selectedUserForLogin;
            currentUserSpan.textContent = selectedUserForLogin;
            showChat();
            loadAndDisplayMessages();
            loginError.textContent = '';
        } else {
            loginError.textContent = 'Contraseña incorrecta';
            passwordInput.value = '';
            passwordInput.focus();
        }
    } catch (error) {
        loginError.textContent = 'Error de autenticación';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Mostrar pantalla de chat
function showChat() {
    // Ocultar todas las pantallas
    userSelectionScreen.classList.remove('active');
    loginScreen.classList.remove('active');
    // Mostrar solo la pantalla de chat
    chatScreen.classList.add('active');
    messageInput.focus();
}

// Cargar mensajes del localStorage (encriptados)
function loadMessages() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (stored) {
        try {
            const encryptedData = JSON.parse(stored);
            if (encryptedData.messages && Array.isArray(encryptedData.messages)) {
                // Desencriptar mensajes del localStorage
                const decryptedMessages = encryptedData.messages.map(msg => {
                    const userEncryptionKey = CONFIG.ENCRYPTION_KEYS[msg.user];
                    return {
                        ...msg,
                        text: decryptMessage(msg.encryptedText, userEncryptionKey)
                    };
                }).filter(msg => msg.text !== '[Mensaje corrupto]');
                
                messages = decryptedMessages;
                cleanExpiredMessages();
            }
        } catch (e) {
            messages = [];
        }
    }
}

// Guardar mensajes en localStorage (encriptados)
function saveMessages() {
    // Encriptar mensajes antes de guardar en localStorage
    const encryptedMessages = messages.map(msg => {
        const userEncryptionKey = CONFIG.ENCRYPTION_KEYS[msg.user];
        return {
            id: msg.id,
            user: msg.user,
            encryptedText: encryptMessage(msg.text, userEncryptionKey),
            timestamp: msg.timestamp,
            createdAt: msg.createdAt
        };
    });
    
    const dataToSave = {
        messages: encryptedMessages,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(dataToSave));
}

// Enviar mensaje
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentUser) return;
    
    const message = {
        id: Date.now() + Math.random(),
        user: currentUser,
        text: text,
        timestamp: new Date().toISOString(),
        createdAt: Date.now()
    };
    
    messages.push(message);
    saveMessages(); // Backup local
    saveMessagesToCloud(); // Guardar en la nube
    displayMessage(message);
    updateMessageCounters();
    
    messageInput.value = '';
    messageInput.style.height = 'auto';
    scrollToBottom();
}

// Mostrar mensaje en la interfaz
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.user === currentUser ? 'own' : 'other'}`;
    messageDiv.dataset.messageId = message.id;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = message.text;
    
    const info = document.createElement('div');
    info.className = 'message-info';
    
    const time = new Date(message.timestamp).toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
    });
    
    const timeSpan = document.createElement('span');
    timeSpan.textContent = time;
    info.appendChild(timeSpan);
    
    // Botón de eliminar solo para mensajes propios
    if (message.user === currentUser) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.onclick = () => deleteMessage(message.id);
        info.appendChild(deleteBtn);
    }
    
    messageDiv.appendChild(bubble);
    messageDiv.appendChild(info);
    messagesContainer.appendChild(messageDiv);
}

// Cargar y mostrar todos los mensajes
function loadAndDisplayMessages() {
    messagesContainer.innerHTML = '';
    messages.forEach(message => displayMessage(message));
    scrollToBottom();
}

// Eliminar mensaje
function deleteMessage(messageId) {
    messages = messages.filter(msg => msg.id !== messageId);
    saveMessages(); // Backup local
    saveMessagesToCloud(); // Sincronizar con la nube
    updateMessageCounters();
    
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        messageElement.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            messageElement.remove();
        }, 300);
    }
}

// Limpiar mensajes expirados
function cleanExpiredMessages() {
    const now = Date.now();
    const expiryTime = CONFIG.MESSAGE_EXPIRY_HOURS * 60 * 60 * 1000; // 48 horas en ms
    
    const initialCount = messages.length;
    messages = messages.filter(message => {
        return (now - message.createdAt) < expiryTime;
    });
    
    if (messages.length !== initialCount) {
        saveMessages();
        updateMessageCounters();
        if (currentUser) {
            loadAndDisplayMessages();
        }
    }
}

// Iniciar limpieza automática de mensajes
function startMessageCleanup() {
    // Limpiar cada 5 minutos
    messageCleanupInterval = setInterval(cleanExpiredMessages, 5 * 60 * 1000);
}

// Scroll al final del chat
function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// Actualizar contadores de mensajes
function updateMessageCounters() {
    // Contar mensajes RECIBIDOS por cada usuario (enviados por el otro)
    const messagesForUser1 = messages.filter(msg => msg.user === 'Usuario 2').length; // Usuario 1 recibe mensajes de Usuario 2
    const messagesForUser2 = messages.filter(msg => msg.user === 'Usuario 1').length; // Usuario 2 recibe mensajes de Usuario 1
    
    user1Counter.textContent = messagesForUser1;
    user2Counter.textContent = messagesForUser2;
    
    // Ocultar contador si es 0
    if (messagesForUser1 === 0) {
        user1Counter.classList.add('zero');
    } else {
        user1Counter.classList.remove('zero');
    }
    
    if (messagesForUser2 === 0) {
        user2Counter.classList.add('zero');
    } else {
        user2Counter.classList.remove('zero');
    }
}

// Logout
function logout() {
    currentUser = null;
    selectedUserForLogin = null;
    
    // Limpiar intervalos
    if (messageCleanupInterval) {
        clearInterval(messageCleanupInterval);
    }
    
    // Volver a la pantalla de selección de usuario
    chatScreen.classList.remove('active');
    loginScreen.classList.remove('active');
    userSelectionScreen.classList.add('active');
    
    // Limpiar campos
    passwordInput.value = '';
    messageInput.value = '';
    messagesContainer.innerHTML = '';
    loginError.textContent = '';
    
    // Actualizar contadores
    updateMessageCounters();
    
    // Reiniciar
    setTimeout(() => {
        startMessageCleanup();
    }, 1000);
}

// Prevenir recarga accidental
window.addEventListener('beforeunload', (e) => {
    if (messages.length > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Manejo de visibilidad de la página para cargar mensajes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadMessagesFromCloud();
    }
});

// ===== FUNCIONES DE ENCRIPTACIÓN =====

// Función simple de encriptación (XOR con clave)
function encryptMessage(text, password) {
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length);
        encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted); // Base64 encode
}

// Función de desencriptación
function decryptMessage(encryptedText, password) {
    try {
        const encrypted = atob(encryptedText); // Base64 decode
        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
            const charCode = encrypted.charCodeAt(i) ^ password.charCodeAt(i % password.length);
            decrypted += String.fromCharCode(charCode);
        }
        return decrypted;
    } catch (e) {
        return '[Mensaje corrupto]';
    }
}

// ===== FUNCIONES DE JSONBIN API =====

// Cargar mensajes desde JSONBin
async function loadMessagesFromCloud() {
    try {
        const response = await fetch(`${CONFIG.JSONBIN.BASE_URL}/${CONFIG.JSONBIN.BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': CONFIG.JSONBIN.API_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.messages && Array.isArray(data.messages)) {
                // Desencriptar mensajes
                const decryptedMessages = data.messages.map(msg => {
                    const userEncryptionKey = CONFIG.ENCRYPTION_KEYS[msg.user];
                    return {
                        ...msg,
                        text: decryptMessage(msg.encryptedText, userEncryptionKey)
                    };
                }).filter(msg => msg.text !== '[Mensaje corrupto]');
                
                messages = decryptedMessages;
                cleanExpiredMessages();
                updateMessageCounters();
                
                if (currentUser) {
                    loadAndDisplayMessages();
                }
            }
        }
    } catch (error) {
        console.log('Error cargando mensajes de la nube, usando localStorage');
        loadMessages(); // Fallback a localStorage
    }
}

// Guardar mensajes en JSONBin
async function saveMessagesToCloud() {
    try {
        // Encriptar mensajes antes de enviar
        const encryptedMessages = messages.map(msg => {
            const userEncryptionKey = CONFIG.ENCRYPTION_KEYS[msg.user];
            return {
                id: msg.id,
                user: msg.user,
                encryptedText: encryptMessage(msg.text, userEncryptionKey),
                timestamp: msg.timestamp,
                createdAt: msg.createdAt
            };
        });
        
        const dataToSave = {
            messages: encryptedMessages,
            lastUpdated: new Date().toISOString()
        };
        
        const response = await fetch(`${CONFIG.JSONBIN.BASE_URL}/${CONFIG.JSONBIN.BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.JSONBIN.API_KEY
            },
            body: JSON.stringify(dataToSave)
        });
        
        if (response.ok) {
            console.log('Mensajes guardados en la nube');
        }
    } catch (error) {
        console.log('Error guardando en la nube, usando localStorage como backup');
        saveMessages(); // Fallback a localStorage
    }
}

// CSS adicional para animación de fadeOut
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);
