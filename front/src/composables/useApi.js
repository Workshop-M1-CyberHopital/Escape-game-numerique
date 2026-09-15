import { ref, reactive, readonly } from 'vue';
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES, HTTP_STATUS } from '../config/api';
import { ENV_CONFIG, checkEnvironment } from '../config/environment';

// État global de l'API
const isLoading = ref(false);
const error = ref(null);

// Fonction utilitaire pour les requêtes HTTP
const apiRequest = async (endpoint, options = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
        // Vérifier la configuration au premier appel
        if (ENV_CONFIG.DEV_MODE) {
            checkEnvironment();
        }
        
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const token = localStorage.getItem('auth_token');
        
        console.log('🌐 API Request:', {
            url,
            method: options.method || 'GET',
            headers: options.headers,
            body: options.body
        });

        const defaultOptions = {
            headers: {
                ...API_CONFIG.DEFAULT_HEADERS,
                ...(token && { Authorization: `Bearer ${token}` })
            }
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        let data = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (jsonErr) {
                data = {};
            }
        }
        
        console.log('📡 API Response:', {
            status: response.status,
            ok: response.ok,
            data
        });

        if (!response.ok) {
            let errorMessage = data.error || ERROR_MESSAGES.SERVER_ERROR;
            
            switch (response.status) {
                case HTTP_STATUS.UNAUTHORIZED:
                    errorMessage = ERROR_MESSAGES.AUTH_ERROR;
                    break;
                case HTTP_STATUS.BAD_REQUEST:
                    errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
                    break;
                case HTTP_STATUS.NOT_FOUND:
                    errorMessage = 'Ressource non trouvée';
                    break;
                case HTTP_STATUS.INTERNAL_SERVER_ERROR:
                    errorMessage = ERROR_MESSAGES.SERVER_ERROR;
                    break;
            }
            
            throw new Error(errorMessage);
        }

        return data;
    } catch (err) {
        if (err.name === 'AbortError') {
            error.value = ERROR_MESSAGES.TIMEOUT_ERROR;
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
            error.value = ERROR_MESSAGES.NETWORK_ERROR;
        } else {
            error.value = err.message || ERROR_MESSAGES.UNKNOWN_ERROR;
        }
        throw err;
    } finally {
        isLoading.value = false;
    }
};

// Méthodes HTTP
export const api = {
    // GET
    get: (endpoint, options = {}) => apiRequest(endpoint, { method: 'GET', ...options }),
    
    // POST
    post: (endpoint, data, options = {}) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options
    }),
    
    // PUT
    put: (endpoint, data, options = {}) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options
    }),
    
    // DELETE
    delete: (endpoint, options = {}) => apiRequest(endpoint, { method: 'DELETE', ...options })
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
        const response = await api.get(API_ENDPOINTS.HEALTH);
        return response.status === 'OK';
    } catch (err) {
        console.error('API non disponible:', err);
        return false;
    }
};

// Fonction pour gérer les erreurs d'authentification
export const handleAuthError = (error) => {
    if (error.message.includes('Token') || error.message.includes('401') || error.message.includes('403')) {
        // Token expiré ou invalide, déconnecter l'utilisateur
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/';
    }
};

export default useApi;
