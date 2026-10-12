import { ref, computed, readonly } from 'vue';
import { api, onSessionExpired } from './useApi';
import { API_ENDPOINTS } from '../config/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// localStorage peut être indisponible (navigation privée, stockage bloqué) : jamais d'exception.
const storage = {
    get(key) {
        try { return localStorage.getItem(key); } catch { return null; }
    },
    set(key, value) {
        try { localStorage.setItem(key, value); } catch { /* stockage indisponible */ }
    },
    remove(key) {
        try { localStorage.removeItem(key); } catch { /* stockage indisponible */ }
    }
};

// Les routes qui hachent ou vérifient un mot de passe (bcrypt) peuvent être lentes quand toute une classe
// se connecte en même temps : délai plus long que le délai par défaut des requêtes.
const PASSWORD_REQUEST_TIMEOUT_MS = 30000;

const parseUser = (raw) => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
};

// État global de l'authentification
const user = ref(null);
const token = ref(storage.get(TOKEN_KEY));
const isAuthenticated = computed(() => !!token.value && !!user.value);

const setUser = (newUser) => {
    user.value = newUser ? { ...newUser } : null;
    if (newUser) {
        storage.set(USER_KEY, JSON.stringify(newUser));
    } else {
        storage.remove(USER_KEY);
    }
};

const setSession = (newToken, newUser) => {
    token.value = newToken || null;
    if (newToken) {
        storage.set(TOKEN_KEY, newToken);
    } else {
        storage.remove(TOKEN_KEY);
    }
    setUser(newToken ? newUser : null);
};

// Vide l'état local (sans requête réseau ni rechargement de page).
const clearAuthState = () => setSession(null, null);

// Session refusée par le serveur : on ne vide que si le jeton concerné est toujours le jeton courant
// (une ancienne requête, même envoyée sans jeton, ne doit pas déconnecter un joueur qui vient de se connecter).
onSessionExpired((usedToken) => {
    if ((usedToken || null) === (token.value || null)) {
        clearAuthState();
    }
});

// Initialiser l'utilisateur depuis le localStorage
const initUser = () => {
    if (!token.value) {
        storage.remove(USER_KEY);
        return;
    }
    const stored = parseUser(storage.get(USER_KEY));
    if (stored) {
        user.value = stored;
    } else {
        storage.remove(USER_KEY);
    }
};

// Vérifier le token : déconnexion uniquement si le serveur refuse la session (401/403),
// jamais sur une erreur réseau ou un délai dépassé (serveur pas encore démarré, redémarrage...).
const verifyToken = async () => {
    const currentToken = token.value;
    if (!currentToken) return null;

    try {
        const response = await api.get(API_ENDPOINTS.AUTH.VERIFY);
        if (token.value === currentToken && response.user) {
            setUser(response.user);
        }
        return user.value;
    } catch (error) {
        if ((error.isSessionError || error.status === 401 || error.status === 403) && token.value === currentToken) {
            clearAuthState();
        }
        return null;
    }
};

// Inscription
const register = async (userData) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData, { timeout: PASSWORD_REQUEST_TIMEOUT_MS });
    setSession(response.token, response.user);
    return response;
};

// Connexion
const login = async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials, { timeout: PASSWORD_REQUEST_TIMEOUT_MS });
    setSession(response.token, response.user);
    return response;
};

// Déconnexion : l'état local est vidé immédiatement (le serveur n'a rien à invalider, JWT sans état).
const logout = async () => {
    const hadToken = !!token.value;
    clearAuthState();
    if (hadToken) {
        try {
            await api.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch {
            // Sans importance : la session locale est déjà fermée.
        }
    }
};

// Changer le mot de passe ({ currentPassword, newPassword }). Le serveur renvoie un nouveau jeton.
const changePassword = async (passwordData) => {
    const response = await api.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData, { timeout: PASSWORD_REQUEST_TIMEOUT_MS });
    if (response.token) {
        setSession(response.token, response.user || user.value);
    }
    return response;
};

// Supprimer définitivement le compte (et ses scores) après confirmation du mot de passe
const deleteAccount = async (password) => {
    const response = await api.delete(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
        body: JSON.stringify({ password }),
        timeout: PASSWORD_REQUEST_TIMEOUT_MS
    });
    clearAuthState();
    return response;
};

// Mettre à jour le profil ({ username?, teamName? })
const updateProfile = async (profileData) => {
    const response = await api.put(API_ENDPOINTS.USERS.PROFILE, profileData);
    if (response.user) {
        setUser({ ...(user.value || {}), ...response.user });
    }
    return response;
};

// Recharger le profil (createdAt, statistiques...) depuis le serveur et mettre à jour l'état
const refreshUser = async () => {
    const response = await api.get(API_ENDPOINTS.USERS.PROFILE);
    if (response.user) {
        setUser(response.user);
    }
    return user.value;
};

// Récupérer les statistiques de l'utilisateur (et synchroniser celles affichées dans le profil)
const getUserStats = async () => {
    const response = await api.get(API_ENDPOINTS.USERS.STATS);
    const stats = response.stats;
    if (stats && user.value) {
        setUser({
            ...user.value,
            gamesPlayed: stats.gamesPlayed ?? user.value.gamesPlayed,
            bestScore: stats.bestScore ?? user.value.bestScore,
            totalScore: stats.totalScore ?? user.value.totalScore,
            averageScore: stats.averageScore ?? user.value.averageScore
        });
    }
    return stats;
};

const withQuery = (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return `${endpoint}${queryString ? `?${queryString}` : ''}`;
};

// Récupérer l'historique des parties (scores réels du joueur)
const getUserGames = async (params = {}) => api.get(withQuery(API_ENDPOINTS.USERS.GAMES, params));

// Rechercher des utilisateurs
const searchUsers = async (query, limit = 10) => api.get(withQuery(API_ENDPOINTS.USERS.SEARCH, { q: query, limit }));

// Récupérer le classement des utilisateurs
const getLeaderboard = async (params = {}) => api.get(withQuery(API_ENDPOINTS.USERS.LEADERBOARD, params));

// Synchronisation entre onglets (PC partagés en classe : une déconnexion s'applique partout)
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        if (event.key === TOKEN_KEY) {
            token.value = event.newValue;
            if (!event.newValue) user.value = null;
        } else if (event.key === USER_KEY) {
            user.value = token.value ? parseUser(event.newValue) : null;
        }
    });
}

// Initialiser l'auth au démarrage
initUser();
if (token.value) {
    verifyToken();
}

// Composable principal
export const useAuth = () => {
    return {
        // État (lecture seule : utiliser refreshUser() / updateProfile() pour le modifier)
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
        refreshUser,
        getUserStats,
        getUserGames,
        searchUsers,
        getLeaderboard,

        // Utilitaires
        verifyToken
    };
};

export default useAuth;
