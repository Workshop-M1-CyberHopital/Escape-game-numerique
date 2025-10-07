// Configuration de l'environnement
export const ENV_CONFIG = {
    // URL de l'API Backend
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    
    // Mode de développement
    DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,
    
    // Configuration de l'application
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Cyber-Hôpital Escape Game',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // URLs de développement
    FRONTEND_URL: 'http://localhost:3000',
    BACKEND_URL: 'http://localhost:3001'
};

// Fonction pour vérifier la configuration
export const checkEnvironment = () => {
    console.log('🔧 Configuration de l\'environnement:', {
        API_URL: ENV_CONFIG.API_URL,
        DEV_MODE: ENV_CONFIG.DEV_MODE,
        FRONTEND_URL: ENV_CONFIG.FRONTEND_URL,
        BACKEND_URL: ENV_CONFIG.BACKEND_URL
    });
    
    return ENV_CONFIG;
};

export default ENV_CONFIG;
