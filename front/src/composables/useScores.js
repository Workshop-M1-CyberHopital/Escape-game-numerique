import { ref, computed, readonly } from 'vue';
import { api, handleAuthError } from './useApi';
import { API_ENDPOINTS } from '../config/api';

// État global des scores
const scores = ref([]);
const leaderboard = ref([]);
const userScores = ref([]);
const stats = ref(null);

// Soumettre un score
const submitScore = async (scoreData) => {
    try {
        const response = await api.post(API_ENDPOINTS.SCORES.SUBMIT, scoreData);
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer les scores de l'utilisateur connecté
const getMyScores = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.SCORES.MY_SCORES}${queryString ? `?${queryString}` : ''}`;
        const response = await api.get(endpoint);
        userScores.value = response.scores;
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer les scores d'un utilisateur spécifique
const getUserScores = async (userId, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.SCORES.USER_SCORES}/${userId}${queryString ? `?${queryString}` : ''}`;
        const response = await api.get(endpoint);
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer le classement global
const getLeaderboard = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.SCORES.LEADERBOARD}${queryString ? `?${queryString}` : ''}`;
        const response = await api.get(endpoint);
        leaderboard.value = response.leaderboard;
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer les statistiques globales des scores
const getStats = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.SCORES.STATS);
        stats.value = response.stats;
        return response.stats;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer les scores récents
const getRecentScores = async (limit = 20) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.SCORES.RECENT}?limit=${limit}`);
        scores.value = response.scores;
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer les meilleurs scores
const getBestScores = async (limit = 10) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.SCORES.BEST}?limit=${limit}`);
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Supprimer un score
const deleteScore = async (scoreId) => {
    try {
        const response = await api.delete(`${API_ENDPOINTS.SCORES.DELETE}/${scoreId}`);
        // Retirer le score de la liste locale
        const index = userScores.value.findIndex(score => score.id === scoreId);
        if (index !== -1) {
            userScores.value.splice(index, 1);
        }
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Calculer le score basé sur les performances du jeu
const calculateScore = (gameData) => {
    const {
        duration = 0,        // en secondes
        roomsCompleted = 0,    // nombre de salles complétées
        errors = 0,           // nombre d'erreurs
        hints = 0,            // nombre d'indices utilisés
        completed = false     // jeu terminé ou non
    } = gameData;

    // Score de base
    let baseScore = 1000;
    
    // Bonus pour la complétion
    if (completed) {
        baseScore += 500;
    }
    
    // Bonus pour les salles complétées
    baseScore += roomsCompleted * 200;
    
    // Malus pour les erreurs (10 points par erreur)
    baseScore -= errors * 10;
    
    // Malus pour les indices (5 points par indice)
    baseScore -= hints * 5;
    
    // Bonus de rapidité (plus c'est rapide, plus c'est bon)
    const timeBonus = Math.max(0, 300 - duration); // 5 minutes = 300 secondes
    baseScore += timeBonus;
    
    // Score minimum
    return Math.max(0, Math.round(baseScore));
};

// Formater la durée en format lisible
const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
};

// Formater le score avec des séparateurs
const formatScore = (score) => {
    return score.toLocaleString('fr-FR');
};

// Obtenir le rang d'un score
const getScoreRank = (score, leaderboardData) => {
    const sortedScores = leaderboardData.sort((a, b) => b.score - a.score);
    const rank = sortedScores.findIndex(s => s.score <= score) + 1;
    return rank || sortedScores.length + 1;
};

// Composable principal
export const useScores = () => {
    return {
        // État
        scores: readonly(scores),
        leaderboard: readonly(leaderboard),
        userScores: readonly(userScores),
        stats: readonly(stats),
        
        // Actions
        submitScore,
        getMyScores,
        getUserScores,
        getLeaderboard,
        getStats,
        getRecentScores,
        getBestScores,
        deleteScore,
        
        // Utilitaires
        calculateScore,
        formatDuration,
        formatScore,
        getScoreRank
    };
};

export default useScores;
