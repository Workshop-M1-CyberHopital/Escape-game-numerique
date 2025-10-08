// Configuration de l'API
export const API_CONFIG = {
    // URL de base de l'API
    BASE_URL: import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001/api`,
    
    // Timeout des requêtes (en millisecondes)
    TIMEOUT: 10000,
    
    // Configuration des retry
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    
    // Headers par défaut
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Endpoints de l'API
export const API_ENDPOINTS = {
    // Santé
    HEALTH: '/health',
    
    // Authentification
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        VERIFY: '/auth/verify',
        CHANGE_PASSWORD: '/auth/change-password',
        DELETE_ACCOUNT: '/auth/account'
    },
    
    // Utilisateurs
    USERS: {
        PROFILE: '/users/profile',
        STATS: '/users/stats',
        GAMES: '/users/games',
        LEADERBOARD: '/users/leaderboard',
        SEARCH: '/users/search',
        MOST_ACTIVE: '/users/most-active'
    },
    
    // Scores
    SCORES: {
        SUBMIT: '/scores/submit',
        MY_SCORES: '/scores/my-scores',
        USER_SCORES: '/scores/user',
        LEADERBOARD: '/scores/leaderboard',
        STATS: '/scores/stats',
        RECENT: '/scores/recent',
        BEST: '/scores/best',
        DELETE: '/scores'
    }
};

// Messages d'erreur
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Erreur de connexion au serveur',
    TIMEOUT_ERROR: 'La requête a expiré',
    AUTH_ERROR: 'Erreur d\'authentification',
    VALIDATION_ERROR: 'Données invalides',
    SERVER_ERROR: 'Erreur du serveur',
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite'
};

// Codes de statut HTTP
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};
