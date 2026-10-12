import { ENV_CONFIG } from './environment';

// Configuration de l'API
export const API_CONFIG = {
    // URL de base de l'API (voir config/environment.js : VITE_API_URL, :3001 en dev, /api en production)
    BASE_URL: ENV_CONFIG.API_URL,

    // Timeout des requêtes (en millisecondes)
    TIMEOUT: 10000,

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

// Messages d'erreur affichés aux joueurs
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.',
    TIMEOUT_ERROR: 'Le serveur met trop de temps à répondre. Réessayez dans un instant.',
    UNAVAILABLE_ERROR: 'Le serveur est momentanément indisponible. Réessayez dans un instant.',
    SESSION_EXPIRED: 'Votre session a expiré : reconnectez-vous pour continuer.',
    LOGIN_REQUIRED: 'Connectez-vous pour effectuer cette action.',
    AUTH_ERROR: 'Email ou mot de passe incorrect.',
    FORBIDDEN_ERROR: 'Action non autorisée.',
    NOT_FOUND_ERROR: 'Ressource introuvable.',
    CONFLICT_ERROR: 'Ces informations sont déjà utilisées.',
    VALIDATION_ERROR: 'Données invalides.',
    PAYLOAD_TOO_LARGE: 'Les données envoyées sont trop volumineuses.',
    RATE_LIMITED: 'Trop de tentatives : patientez quelques minutes avant de réessayer.',
    SERVER_ERROR: 'Erreur du serveur. Réessayez plus tard.',
    UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.'
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
    PAYLOAD_TOO_LARGE: 413,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};

// Codes renvoyés par le backend quand la session (jeton) n'est plus valable
export const SESSION_ERROR_CODES = ['TOKEN_MISSING', 'TOKEN_INVALID', 'TOKEN_EXPIRED', 'USER_NOT_FOUND'];
