// Configuración del sistema
const CONFIG = {
    // Contraseñas originales para encriptación (NO las contraseñas de login)
    ENCRYPTION_KEYS: {
        "Usuario 1": "user1_2385", // Clave para encriptar mensajes de Usuario 1
        "Usuario 2": "user2_2350"  // Clave para encriptar mensajes de Usuario 2
    },
    STORAGE_KEY: "mensajeria_privada",
    MESSAGE_EXPIRY_HOURS: 48,
    // JSONBin.io configuración eliminada para funcionamiento offline
    // Contraseñas simples para login (sin hash)
    PASSWORDS: {
        'Usuario 1': 'flor35',
        'Usuario 2': 'cielo35'
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
    console.log('=== INICIALIZACIÓN DE LA APLICACIÓN ===');
    
    // Verificar que todos los elementos DOM existan
    console.log('Verificando elementos DOM:');
    console.log('user1Btn:', user1Btn);
    console.log('user2Btn:', user2Btn);
    console.log('loginScreen:', loginScreen);
    console.log('userSelectionScreen:', userSelectionScreen);
    console.log('passwordInput:', passwordInput);
    console.log('loginBtn:', loginBtn);
    
    // loadMessagesFromCloud(); // Deshabilitado para funcionar offline
    loadMessages(); // Cargar desde localStorage
    setupEventListeners();
    startMessageCleanup();
    
    // Método alternativo para PWA - Agregar funciones globales
    window.loginUser1 = () => {
        console.log('=== FUNCIÓN GLOBAL USUARIO 1 ===');
        showLoginForUser('Usuario 1');
    };
    
    window.loginUser2 = () => {
        console.log('=== FUNCIÓN GLOBAL USUARIO 2 ===');
        showLoginForUser('Usuario 2');
    };
    
    // Diagnóstico PWA y activación forzada
    setTimeout(() => {
        console.log('=== DIAGNÓSTICO PWA ===');
        console.log('Es PWA:', window.matchMedia('(display-mode: standalone)').matches);
        console.log('User agent:', navigator.userAgent);
        
        // Activación forzada para PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('PWA detectada - Aplicando fix de eventos...');
            forcePWAEvents();
        }
    }, 2000);
    
    console.log('=== INICIALIZACIÓN COMPLETADA ===');
});

// Fix específico para PWA instalada
function forcePWAEvents() {
    console.log('=== APLICANDO FIX PWA ===');
    
    // Solo aplicar si realmente es PWA
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        console.log('No es PWA - Fix no aplicado');
        return;
    }
    
    // Remover todos los event listeners existentes y recrearlos
    const user1 = document.getElementById('user1Btn');
    const user2 = document.getElementById('user2Btn');
    
    if (user1) {
        console.log('Aplicando fix a Usuario 1...');
        
        // Crear nuevo elemento para evitar problemas de eventos
        const newUser1 = user1.cloneNode(true);
        user1.parentNode.replaceChild(newUser1, user1);
        
        // Aplicar eventos directos con lógica inline
        const openLoginUser1 = (e) => {
            e.preventDefault();
            console.log('=== ABRIENDO LOGIN USUARIO 1 PWA ===');
            
            // Lógica directa sin depender de showLoginForUser
            selectedUserForLogin = 'Usuario 1';
            
            const loginScreen = document.getElementById('loginScreen');
            const userSelectionScreen = document.getElementById('userSelectionScreen');
            const selectedUserName = document.getElementById('selectedUserName');
            const passwordInput = document.getElementById('passwordInput');
            
            if (selectedUserName) selectedUserName.textContent = '✏️ Usuario 1';
            if (userSelectionScreen) userSelectionScreen.classList.remove('active');
            if (loginScreen) loginScreen.classList.add('active');
            if (passwordInput) {
                setTimeout(() => passwordInput.focus(), 100);
            }
            
            console.log('Login Usuario 1 abierto exitosamente');
        };
        
        newUser1.ontouchstart = openLoginUser1;
        newUser1.ontouchend = openLoginUser1;
        newUser1.onclick = openLoginUser1;
        
        // Estilo para mejor respuesta táctil
        newUser1.style.touchAction = 'manipulation';
        newUser1.style.userSelect = 'none';
        newUser1.style.webkitUserSelect = 'none';
        newUser1.style.webkitTouchCallout = 'none';
    }
    
    if (user2) {
        console.log('Aplicando fix a Usuario 2...');
        
        // Crear nuevo elemento para evitar problemas de eventos
        const newUser2 = user2.cloneNode(true);
        user2.parentNode.replaceChild(newUser2, user2);
        
        // Aplicar eventos directos con lógica inline
        const openLoginUser2 = (e) => {
            e.preventDefault();
            console.log('=== ABRIENDO LOGIN USUARIO 2 PWA ===');
            
            // Lógica directa sin depender de showLoginForUser
            selectedUserForLogin = 'Usuario 2';
            
            const loginScreen = document.getElementById('loginScreen');
            const userSelectionScreen = document.getElementById('userSelectionScreen');
            const selectedUserName = document.getElementById('selectedUserName');
            const passwordInput = document.getElementById('passwordInput');
            
            if (selectedUserName) selectedUserName.textContent = '👁️ Usuario 2';
            if (userSelectionScreen) userSelectionScreen.classList.remove('active');
            if (loginScreen) loginScreen.classList.add('active');
            if (passwordInput) {
                setTimeout(() => passwordInput.focus(), 100);
            }
            
            console.log('Login Usuario 2 abierto exitosamente');
        };
        
        newUser2.ontouchstart = openLoginUser2;
        newUser2.ontouchend = openLoginUser2;
        newUser2.onclick = openLoginUser2;
        
        // Estilo para mejor respuesta táctil
        newUser2.style.touchAction = 'manipulation';
        newUser2.style.userSelect = 'none';
        newUser2.style.webkitUserSelect = 'none';
        newUser2.style.webkitTouchCallout = 'none';
    }
    
    console.log('Fix PWA aplicado exitosamente');
}

// Métodos de diagnóstico y activación manual para PWA
window.debugPWA = () => {
    console.log('=== DEBUG PWA ===');
    console.log('Es PWA:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('user1Btn:', document.getElementById('user1Btn'));
    console.log('user2Btn:', document.getElementById('user2Btn'));
    console.log('loginScreen:', document.getElementById('loginScreen'));
    console.log('userSelectionScreen:', document.getElementById('userSelectionScreen'));
    
    // Intentar activación manual
    console.log('Aplicando fix manual...');
    forcePWAEvents();
};

// Activación manual directa con lógica inline
window.manualLogin1 = () => {
    console.log('=== ACTIVACIÓN MANUAL USUARIO 1 ===');
    
    // Lógica directa
    selectedUserForLogin = 'Usuario 1';
    const loginScreen = document.getElementById('loginScreen');
    const userSelectionScreen = document.getElementById('userSelectionScreen');
    const selectedUserName = document.getElementById('selectedUserName');
    const passwordInput = document.getElementById('passwordInput');
    
    if (selectedUserName) selectedUserName.textContent = '✏️ Usuario 1';
    if (userSelectionScreen) userSelectionScreen.classList.remove('active');
    if (loginScreen) loginScreen.classList.add('active');
    if (passwordInput) setTimeout(() => passwordInput.focus(), 100);
    
    console.log('Login Usuario 1 manual exitoso');
};

window.manualLogin2 = () => {
    console.log('=== ACTIVACIÓN MANUAL USUARIO 2 ===');
    
    // Lógica directa
    selectedUserForLogin = 'Usuario 2';
    const loginScreen = document.getElementById('loginScreen');
    const userSelectionScreen = document.getElementById('userSelectionScreen');
    const selectedUserName = document.getElementById('selectedUserName');
    const passwordInput = document.getElementById('passwordInput');
    
    if (selectedUserName) selectedUserName.textContent = '👁️ Usuario 2';
    if (userSelectionScreen) userSelectionScreen.classList.remove('active');
    if (loginScreen) loginScreen.classList.add('active');
    if (passwordInput) setTimeout(() => passwordInput.focus(), 100);
    
    console.log('Login Usuario 2 manual exitoso');
};

// Función de ayuda para PWA
window.helpPWA = () => {
    console.log('=== AYUDA PWA ===');
    console.log('Si los botones no responden, prueba estos comandos en la consola:');
    console.log('- debugPWA() : Diagnóstico completo');
    console.log('- manualLogin1() : Abrir login Usuario 1');
    console.log('- manualLogin2() : Abrir login Usuario 2');
    console.log('- forcePWAEvents() : Aplicar fix de eventos');
};

// Configurar event listeners
function setupEventListeners() {
    // Selección de usuario - Múltiples métodos para máxima compatibilidad PWA
    console.log('Configurando event listeners para botones de usuario...');
    
    // Función simple para Usuario 1
    const loginUser1 = () => {
        console.log('=== CLICK EN USUARIO 1 ===');
        showLoginForUser('Usuario 1');
    };
    
    // Función simple para Usuario 2
    const loginUser2 = () => {
        console.log('=== CLICK EN USUARIO 2 ===');
        showLoginForUser('Usuario 2');
    };
    
    // Múltiples event listeners para Usuario 1
    if (user1Btn) {
        console.log('Configurando eventos para Usuario 1...');
        user1Btn.onclick = loginUser1;
        user1Btn.addEventListener('click', loginUser1);
        user1Btn.addEventListener('touchstart', loginUser1);
        user1Btn.addEventListener('touchend', loginUser1);
        user1Btn.addEventListener('mousedown', loginUser1);
        user1Btn.style.cursor = 'pointer';
        user1Btn.style.pointerEvents = 'auto';
        console.log('Usuario 1 configurado');
    } else {
        console.error('user1Btn no encontrado!');
    }
    
    // Múltiples event listeners para Usuario 2
    if (user2Btn) {
        console.log('Configurando eventos para Usuario 2...');
        user2Btn.onclick = loginUser2;
        user2Btn.addEventListener('click', loginUser2);
        user2Btn.addEventListener('touchstart', loginUser2);
        user2Btn.addEventListener('touchend', loginUser2);
        user2Btn.addEventListener('mousedown', loginUser2);
        user2Btn.style.cursor = 'pointer';
        user2Btn.style.pointerEvents = 'auto';
        console.log('Usuario 2 configurado');
    } else {
        console.error('user2Btn no encontrado!');
    }
    
    // Función helper para agregar eventos PWA-compatible a cualquier botón
    const addPWAButtonEvents = (button, handler) => {
        const wrappedHandler = (e) => {
            e.preventDefault();
            handler();
        };
        button.addEventListener('click', wrappedHandler);
        button.addEventListener('touchend', wrappedHandler);
        button.style.cursor = 'pointer';
        button.style.userSelect = 'none';
        button.style.webkitUserSelect = 'none';
        button.style.webkitTapHighlightColor = 'transparent';
    };
    
    // Login - Mejorado para PWA
    addPWAButtonEvents(loginBtn, handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    // Botón volver - Mejorado para PWA
    addPWAButtonEvents(backBtn, backToUserSelection);
    
    // Chat - Mejorado para PWA
    addPWAButtonEvents(sendBtn, sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Logout - Mejorado para PWA
    addPWAButtonEvents(logoutBtn, logout);
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    });
}

// Mostrar login para usuario específico
function showLoginForUser(user) {
    console.log('showLoginForUser llamada con:', user);
    selectedUserForLogin = user;
    const userIcon = user === 'Usuario 1' ? '✏️' : '👁️';
    selectedUserName.textContent = `${userIcon} ${user}`;
    
    console.log('Ocultando pantalla de selección de usuario');
    userSelectionScreen.classList.remove('active');
    
    console.log('Mostrando pantalla de login');
    loginScreen.classList.add('active');
    
    console.log('Enfocando campo de contraseña');
    setTimeout(() => {
        passwordInput.focus();
    }, 100);
    
    console.log('showLoginForUser completada');
}

// Volver a selección de usuario
function backToUserSelection() {
    selectedUserForLogin = null;
    loginError.textContent = '';
    passwordInput.value = '';
    loginScreen.classList.remove('active');
    userSelectionScreen.classList.add('active');
}

// Manejo del login (ultra-simplificado)
function handleLogin() {
    console.log('=== INICIANDO PROCESO DE LOGIN ===');
    
    const password = passwordInput ? passwordInput.value.trim() : '';
    console.log('Usuario seleccionado:', selectedUserForLogin);
    console.log('Contraseña ingresada:', password);
    
    // Verificación usando CONFIG.PASSWORDS
    const correctPassword = CONFIG.PASSWORDS[selectedUserForLogin];
    console.log('Contraseña correcta esperada:', correctPassword);
    
    const loginExitoso = password === correctPassword;
    
    console.log('Login exitoso:', loginExitoso);
    
    if (loginExitoso) {
        console.log('=== LOGIN EXITOSO ===');
        currentUser = selectedUserForLogin;
        if (currentUserSpan) currentUserSpan.textContent = selectedUserForLogin;
        showChat();
        loadAndDisplayMessages();
        if (loginError) loginError.textContent = '';
    } else {
        console.log('=== LOGIN FALLIDO ===');
        if (loginError) loginError.textContent = 'Contraseña incorrecta';
        if (passwordInput) {
            passwordInput.value = '';
            passwordInput.focus();
        }
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
    console.log('=== ENVIANDO MENSAJE ===');
    const text = messageInput.value.trim();
    console.log('Texto del mensaje:', text);
    console.log('Usuario actual:', currentUser);
    
    if (!text || !currentUser) {
        console.log('Mensaje vacío o usuario no definido');
        return;
    }
    
    const message = {
        id: Date.now() + Math.random(),
        user: currentUser,
        text: text,
        timestamp: new Date().toISOString(),
        createdAt: Date.now()
    };
    
    console.log('Mensaje creado:', message);
    
    messages.push(message);
    console.log('Mensaje agregado al array. Total mensajes:', messages.length);
    
    saveMessages(); // Backup local
    console.log('Mensaje guardado en localStorage');
    
    displayMessage(message);
    console.log('displayMessage() ejecutado');
    
    updateMessageCounters();
    console.log('Contadores actualizados');
    
    messageInput.value = '';
    messageInput.style.height = 'auto';
    scrollToBottom();
    
    console.log('=== MENSAJE ENVIADO EXITOSAMENTE ===');
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

// Eliminar mensaje específico
function deleteMessage(messageId) {
    console.log('=== ELIMINANDO MENSAJE ===');
    console.log('ID del mensaje a eliminar:', messageId);
    
    // Encontrar el índice del mensaje en el array
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1) {
        // Eliminar del array
        const deletedMessage = messages.splice(messageIndex, 1)[0];
        console.log('Mensaje eliminado del array:', deletedMessage);
        
        // Guardar cambios en localStorage
        saveMessages();
        console.log('Cambios guardados en localStorage');
        
        // Eliminar del DOM
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
            console.log('Elemento eliminado del DOM');
        }
        
        // Actualizar contadores
        updateMessageCounters();
        console.log('Contadores actualizados');
        
        console.log('=== MENSAJE ELIMINADO EXITOSAMENTE ===');
    } else {
        console.log('ERROR: Mensaje no encontrado');
    }
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
        // loadMessagesFromCloud(); // Eliminado para funcionar offline
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

// ===== FUNCIONES DE JSONBIN API ELIMINADAS =====
// Todas las funciones de JSONBin han sido eliminadas para funcionamiento offline

// Función saveMessagesToCloud() eliminada para funcionamiento offline

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

// ===== INICIALIZACIÓN =====

// Inicializar la aplicación cuando el DOM esté listo
function initializeApp() {
    console.log('=== INICIALIZANDO APLICACIÓN ===');
    
    // Cargar mensajes del localStorage
    loadMessages();
    
    // Configurar event listeners normales (para web)
    setupEventListeners();
    
    // Actualizar contadores
    updateMessageCounters();
    
    // Iniciar limpieza automática de mensajes
    startMessageCleanup();
    
    // Detectar si es PWA y aplicar fix si es necesario
    setTimeout(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('PWA detectada - Aplicando fix de eventos');
            forcePWAEvents();
        } else {
            console.log('Ejecutándose en navegador web normal');
        }
    }, 500);
    
    console.log('Aplicación inicializada correctamente');
}

// Configurar event listeners para funcionamiento normal en web
function setupEventListeners() {
    console.log('Configurando event listeners para web...');
    
    // Botones de usuario - Funcionamiento normal para web
    if (user1Btn) {
        user1Btn.onclick = () => {
            console.log('Click Usuario 1 (web)');
            showLoginForUser('Usuario 1');
        };
    }
    
    if (user2Btn) {
        user2Btn.onclick = () => {
            console.log('Click Usuario 2 (web)');
            showLoginForUser('Usuario 2');
        };
    }
    
    // Login
    if (loginBtn) {
        loginBtn.onclick = handleLogin;
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
    
    // Botón volver
    if (backBtn) {
        backBtn.onclick = backToUserSelection;
    }
    
    // Chat
    if (sendBtn) {
        sendBtn.onclick = sendMessage;
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Auto-resize textarea
        messageInput.addEventListener('input', () => {
            messageInput.style.height = 'auto';
            messageInput.style.height = messageInput.scrollHeight + 'px';
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.onclick = logout;
    }
    
    console.log('Event listeners configurados para web');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM ya está listo
    initializeApp();
}
