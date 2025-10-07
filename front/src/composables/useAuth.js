import { ref, computed, watch, readonly } from 'vue';
import { api, handleAuthError } from './useApi';
import { API_ENDPOINTS } from '../config/api';

// État global de l'authentification
const user = ref(null);
const token = ref(localStorage.getItem('auth_token'));
const isAuthenticated = computed(() => !!token.value && !!user.value);

// Initialiser l'utilisateur depuis le localStorage
const initUser = () => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
        try {
            user.value = JSON.parse(userData);
        } catch (error) {
            console.error('Erreur parsing user data:', error);
            localStorage.removeItem('user_data');
        }
    }
};

// Vérifier le token au démarrage
const verifyToken = async () => {
    if (token.value) {
        try {
            const response = await api.get('/auth/verify');
            user.value = response.user;
            localStorage.setItem('user_data', JSON.stringify(response.user));
        } catch (error) {
            console.error('Token invalide:', error);
            logout();
        }
    }
};

// Inscription
const register = async (userData) => {
    try {
        const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
        
        // Stocker le token et les données utilisateur
        token.value = response.token;
        user.value = response.user;
        
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Connexion
const login = async (credentials) => {
    try {
        const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
        
        // Stocker le token et les données utilisateur
        token.value = response.token;
        user.value = response.user;
        
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify(response.user));
        
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Déconnexion
const logout = async () => {
    try {
        if (token.value) {
            await api.post(API_ENDPOINTS.AUTH.LOGOUT);
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
    } finally {
        // Nettoyer les données locales
        token.value = null;
        user.value = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    }
};

// Changer le mot de passe
const changePassword = async (passwordData) => {
    try {
        const response = await api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Supprimer le compte
const deleteAccount = async (password) => {
    try {
        const response = await api.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, { password });
        await logout(); // Déconnecter après suppression
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Mettre à jour le profil
const updateProfile = async (profileData) => {
    try {
        const response = await api.put(API_ENDPOINTS.USERS.PROFILE, profileData);
        
        // Mettre à jour les données utilisateur locales
        if (response.user) {
            user.value = { ...user.value, ...response.user };
            localStorage.setItem('user_data', JSON.stringify(user.value));
        }
        
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer les statistiques de l'utilisateur
const getUserStats = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.USERS.STATS);
        return response.stats;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer l'historique des parties
const getUserGames = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.USERS.GAMES}${queryString ? `?${queryString}` : ''}`;
        const response = await api.get(endpoint);
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Rechercher des utilisateurs
const searchUsers = async (query, limit = 10) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.USERS.SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`);
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer le classement des utilisateurs
const getLeaderboard = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.USERS.LEADERBOARD}${queryString ? `?${queryString}` : ''}`;
        const response = await api.get(endpoint);
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Initialiser l'auth au démarrage
initUser();
if (token.value) {
    verifyToken();
}

// Watcher pour synchroniser le token avec localStorage
watch(token, (newToken) => {
    if (newToken) {
        localStorage.setItem('auth_token', newToken);
    } else {
        localStorage.removeItem('auth_token');
    }
});

// Composable principal
export const useAuth = () => {
    return {
        // État
        user: readonly(user),
        token: readonly(token),
        isAuthenticated,
        
        // Actions
        register,
        login,
        logout,
        changePassword,
        deleteAccount,
        updateProfile,
        getUserStats,
        getUserGames,
        searchUsers,
        getLeaderboard,
        
        // Utilitaires
        verifyToken
    };
};

export default useAuth;
