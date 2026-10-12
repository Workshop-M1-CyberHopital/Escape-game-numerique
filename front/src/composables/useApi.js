import { ref, computed, readonly } from 'vue';
import {
    API_CONFIG,
    API_ENDPOINTS,
    ERROR_MESSAGES,
    HTTP_STATUS,
    SESSION_ERROR_CODES
} from '../config/api';
import { checkEnvironment } from '../config/environment';

const TOKEN_KEY = 'auth_token';

// État global de l'API
const pendingRequests = ref(0);
const isLoading = computed(() => pendingRequests.value > 0);
const error = ref(null);

// Appelé quand le serveur indique que la session n'est plus valable (enregistré par useAuth).
let sessionExpiredHandler = null;
export const onSessionExpired = (handler) => {
    sessionExpiredHandler = typeof handler === 'function' ? handler : null;
};

/**
 * Erreur levée par l'API : `message` est toujours un texte français affichable tel quel.
 * status (0 si le serveur n'a pas répondu), code (code métier du backend), isNetworkError,
 * isTimeout, isSessionError (jeton expiré/invalide : l'état d'authentification a été vidé).
 */
export class ApiError extends Error {
    constructor(message, { status = 0, code = null, isNetworkError = false, isTimeout = false, isSessionError = false, cause } = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.isNetworkError = isNetworkError;
        this.isTimeout = isTimeout;
        this.isSessionError = isSessionError;
        if (cause !== undefined) this.cause = cause;
    }
}

const readToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

const serverMessage = (data) => {
    if (data && typeof data.message === 'string' && data.message.trim()) return data.message;
    if (data && typeof data.error === 'string' && data.error.trim()) return data.error;
    return null;
};

// Message affiché au joueur selon le statut HTTP (les messages du serveur sont déjà en français).
const messageForStatus = (status, data) => {
    if (status === HTTP_STATUS.BAD_GATEWAY || status === HTTP_STATUS.SERVICE_UNAVAILABLE || status === HTTP_STATUS.GATEWAY_TIMEOUT) {
        return ERROR_MESSAGES.UNAVAILABLE_ERROR;
    }
    if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) return ERROR_MESSAGES.SERVER_ERROR;

    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
            return serverMessage(data) || ERROR_MESSAGES.VALIDATION_ERROR;
        case HTTP_STATUS.UNAUTHORIZED:
            return serverMessage(data) || ERROR_MESSAGES.AUTH_ERROR;
        case HTTP_STATUS.FORBIDDEN:
            return serverMessage(data) || ERROR_MESSAGES.FORBIDDEN_ERROR;
        case HTTP_STATUS.NOT_FOUND:
            return ERROR_MESSAGES.NOT_FOUND_ERROR;
        case HTTP_STATUS.CONFLICT:
            return serverMessage(data) || ERROR_MESSAGES.CONFLICT_ERROR;
        case HTTP_STATUS.PAYLOAD_TOO_LARGE:
            return ERROR_MESSAGES.PAYLOAD_TOO_LARGE;
        case HTTP_STATUS.TOO_MANY_REQUESTS:
            return serverMessage(data) || ERROR_MESSAGES.RATE_LIMITED;
        default:
            return serverMessage(data) || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
};

// Fonction utilitaire pour les requêtes HTTP
const apiRequest = async (endpoint, options = {}) => {
    checkEnvironment();
    pendingRequests.value++;
    error.value = null;

    const { headers: extraHeaders, timeout, ...fetchOptions } = options;
    const method = (fetchOptions.method || 'GET').toUpperCase();
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = readToken();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout ?? API_CONFIG.TIMEOUT);

    try {
        let response;
        try {
            response = await fetch(url, {
                ...fetchOptions,
                method,
                headers: {
                    ...API_CONFIG.DEFAULT_HEADERS,
                    ...(token && { Authorization: `Bearer ${token}` }),
                    ...extraHeaders
                },
                signal: controller.signal
            });
        } catch (err) {
            // fetch ne rejette que si le serveur n'a pas répondu (réseau, CORS, délai dépassé...)
            const isTimeout = err?.name === 'AbortError';
            throw new ApiError(isTimeout ? ERROR_MESSAGES.TIMEOUT_ERROR : ERROR_MESSAGES.NETWORK_ERROR, {
                isTimeout,
                isNetworkError: !isTimeout,
                cause: err
            });
        }

        let data = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch {
                data = {};
            }
        }

        // Journal de développement uniquement : jamais de corps, d'en-têtes ni de jeton.
        if (import.meta.env.DEV) {
            console.debug(`[API] ${method} ${endpoint} → ${response.status}`);
        }

        if (!response.ok) {
            const code = data && typeof data.code === 'string' ? data.code : null;
            const isAuthStatus = response.status === HTTP_STATUS.UNAUTHORIZED || response.status === HTTP_STATUS.FORBIDDEN;
            const isSessionError = isAuthStatus && (SESSION_ERROR_CODES.includes(code) || (!code && Boolean(token)));

            if (isSessionError && sessionExpiredHandler) {
                // Vide l'état d'authentification (sans recharger la page : la partie en cours continue).
                sessionExpiredHandler(token);
            }

            let message = messageForStatus(response.status, data);
            if (isSessionError) {
                // Sans jeton envoyé, le joueur n'était pas connecté : la session n'a pas « expiré ».
                message = token ? ERROR_MESSAGES.SESSION_EXPIRED : ERROR_MESSAGES.LOGIN_REQUIRED;
            }

            throw new ApiError(message, { status: response.status, code, isSessionError });
        }

        return data;
    } catch (err) {
        const apiError = err instanceof ApiError
            ? err
            : new ApiError(ERROR_MESSAGES.UNKNOWN_ERROR, { cause: err });
        error.value = apiError.message;
        throw apiError;
    } finally {
        clearTimeout(timeoutId);
        pendingRequests.value = Math.max(0, pendingRequests.value - 1);
    }
};

// Méthodes HTTP
export const api = {
    // GET
    get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),

    // POST
    post: (endpoint, data, options = {}) => apiRequest(endpoint, {
        ...options,
        method: 'POST',
        ...(data !== undefined && { body: JSON.stringify(data) })
    }),

    // PUT
    put: (endpoint, data, options = {}) => apiRequest(endpoint, {
        ...options,
        method: 'PUT',
        ...(data !== undefined && { body: JSON.stringify(data) })
    }),

    // DELETE (options.body permet d'envoyer un corps JSON, ex. confirmation par mot de passe)
    delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' })
};

// Composable principal
export const useApi = () => {
    return {
        api,
        isLoading: readonly(isLoading),
        error: readonly(error),
        clearError: () => { error.value = null; }
    };
};

// Fonction pour vérifier la santé de l'API
export const checkApiHealth = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.HEALTH, { timeout: 5000 });
        return response.status === 'OK';
    } catch (err) {
        if (import.meta.env.DEV) {
            console.warn('API non disponible:', err.message);
        }
        return false;
    }
};

/**
 * Compatibilité : indique si l'erreur correspond à une session expirée/invalide.
 * L'état d'authentification est déjà vidé par apiRequest ; la page n'est JAMAIS rechargée.
 */
export const handleAuthError = (err) => Boolean(err && err.isSessionError);

export default useApi;
