// URL de base de l'API :
// - VITE_API_URL si elle est définie au build ;
// - en développement (vite) : même hôte que la page, port 3001 (fonctionne aussi depuis le LAN) ;
// - en production : même origine, `/api` (nginx relaie /api/ vers Node).
const resolveApiUrl = () => {
    const configured = import.meta.env.VITE_API_URL;
    if (configured) return String(configured).replace(/\/+$/, '');
    if (import.meta.env.DEV) {
        return `${window.location.protocol}//${window.location.hostname}:3001/api`;
    }
    return '/api';
};

// Configuration de l'environnement
export const ENV_CONFIG = {
    // URL de l'API Backend
    API_URL: resolveApiUrl(),

    // Mode de développement : activé par défaut (true) si rien n'est spécifié dans les variables d'environnement
    DEV_MODE: import.meta.env.VITE_DEV_MODE !== undefined
        ? import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.VITE_DEV_MODE === true
        : true,

    // Configuration de l'application
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Cyber-Hôpital Escape Game',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

let environmentLogged = false;

// Affiche la configuration une seule fois, uniquement pendant le développement (vite).
export const checkEnvironment = () => {
    if (import.meta.env.DEV && !environmentLogged) {
        environmentLogged = true;
        console.info('🔧 Configuration de l\'environnement:', {
            API_URL: ENV_CONFIG.API_URL,
            DEV_MODE: ENV_CONFIG.DEV_MODE,
        });
    }
    return ENV_CONFIG;
};

export default ENV_CONFIG;
