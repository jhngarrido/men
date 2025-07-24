// Archivo de configuración - NO INCLUIR EN EL REPOSITORIO PÚBLICO
// Crear un archivo .gitignore y agregar: config.js

const SECURE_CONFIG = {
    // API Keys - Reemplaza con tus propias credenciales
    JSONBIN: {
        API_KEY: "$2a$10$Q2VqLWbQB3FnTnB56nqsBQ361P2.9PFcaZNBM4hgYTf8MbAux6NS",
        BIN_ID: "68824e96ae596e708fbb1d15",
        BASE_URL: "https://api.jsonbin.io/v3/b"
    },
    
    // Contraseñas hasheadas (SHA-256)
    HASHED_PASSWORDS: {
        "Usuario 1": "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", //
        "Usuario 2": "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae" // 
    }
};

// Función para hashear contraseñas (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Función para verificar contraseñas
async function verifyPassword(inputPassword, hashedPassword) {
    const inputHash = await hashPassword(inputPassword);
    return inputHash === hashedPassword;
}
