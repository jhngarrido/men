// Archivo de configuración de ejemplo - SEGURO PARA REPOSITORIO PÚBLICO
// Copia este archivo como 'config.js' y reemplaza con tus propias credenciales

const SECURE_CONFIG = {
    // API Keys - Reemplaza con tus propias credenciales de JSONBin.io
    JSONBIN: {
        API_KEY: "TU_API_KEY_AQUI", // Obtén tu API key de https://jsonbin.io
        BIN_ID: "TU_BIN_ID_AQUI",   // Crea un Bin y copia su ID
        BASE_URL: "https://api.jsonbin.io/v3/b"
    },
    
    // Contraseñas hasheadas (SHA-256) - Cambia por las tuyas
    HASHED_PASSWORDS: {
        "Usuario 1": "HASH_DE_TU_CONTRASEÑA_USUARIO_1", // Genera el hash de tu contraseña
        "Usuario 2": "HASH_DE_TU_CONTRASEÑA_USUARIO_2"  // Genera el hash de tu contraseña
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

// Para generar el hash de una contraseña, ejecuta en la consola del navegador:
// hashPassword("tu_contraseña").then(hash => console.log(hash));
