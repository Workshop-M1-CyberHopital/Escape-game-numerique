import { ref, readonly, watch } from 'vue';
import { api, handleAuthError } from './useApi';
import { useAuth } from './useAuth';
import { API_ENDPOINTS } from '../config/api';
import { computeScoreBreakdown, MAX_SCORE } from '../utils/scoring';

// État global des scores
const scores = ref([]);
const leaderboard = ref([]);
const userScores = ref([]);
const stats = ref(null);

// Incrémenté à chaque réinitialisation de "MES SCORES" : une réponse arrivée
// après une déconnexion (ou un changement de compte) est ignorée.
let userScoresEpoch = 0;

// Limites acceptées par POST /scores/submit (voir back/routes/scores.js)
const LIMITS = {
    duration: 86400,
    errors: 1000,
    hints: 100,
    roomsCompleted: 9,
    teamName: 50,
    players: 10,
    playerName: 50,
    roomKeys: 20,
};

const toBoundedInt = (value, max) => {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.min(n, max);
};

// Durée totale (temps réel + pénalités) d'une partie, en secondes
const getTotalDuration = (data = {}) => {
    if (data.duration !== undefined && data.duration !== null) return Number(data.duration) || 0;
    if (data.totalTime !== undefined && data.totalTime !== null) return Number(data.totalTime) || 0;
    return (Number(data.realTime ?? data.timer) || 0) + (Number(data.penaltyTime) || 0);
};

// Ne garde que des compteurs entiers positifs ({ server: 42, ... })
const sanitizeCounters = (counters) => {
    if (!counters || typeof counters !== 'object') return {};
    return Object.entries(counters)
        .slice(0, LIMITS.roomKeys)
        .reduce((acc, [key, value]) => {
            acc[String(key).slice(0, 32)] = toBoundedInt(value, LIMITS.duration);
            return acc;
        }, {});
};

const sanitizePlayers = (players) => {
    if (!Array.isArray(players)) return [];
    return players
        .map((player) => (typeof player === 'string' ? player : player?.name || ''))
        .map((name) => String(name).trim().slice(0, LIMITS.playerName))
        .filter(Boolean)
        .slice(0, LIMITS.players);
};

// Note /20 (seule note du jeu) à partir des performances d'une partie
const calculateScore = (gameData = {}) =>
    computeScoreBreakdown({
        totalTime: getTotalDuration(gameData),
        errors: Number(gameData.errors) || 0,
        hints: Number(gameData.hints ?? gameData.hintsUsed) || 0,
    }).total;

// Note /20 d'un score enregistré. Les anciens enregistrements utilisaient un
// système de points (> 20) : leur note est recalculée à partir de la durée,
// des erreurs et des indices.
const getRecordNote = (record) => {
    if (!record) return 0;
    const score = Number(record.score);
    if (Number.isFinite(score) && score >= 0 && score <= MAX_SCORE) return score;
    return calculateScore(record);
};

// Construit le corps de POST /scores/submit à partir de l'instantané de fin de partie
const buildScorePayload = (snapshot = {}) => {
    const duration = toBoundedInt(getTotalDuration(snapshot), LIMITS.duration);
    const errors = toBoundedInt(snapshot.errors, LIMITS.errors);
    const hints = toBoundedInt(snapshot.hints ?? snapshot.hintsUsed, LIMITS.hints);

    return {
        score: computeScoreBreakdown({ totalTime: duration, errors, hints }).total,
        duration,
        roomsCompleted: toBoundedInt(snapshot.roomsCompleted, LIMITS.roomsCompleted),
        errors,
        hints,
        completed: snapshot.completed === true,
        teamName: String(snapshot.teamName || '').trim().slice(0, LIMITS.teamName),
        gameData: {
            roomTimes: sanitizeCounters(snapshot.roomTimes),
            roomErrors: sanitizeCounters(snapshot.roomErrors),
            roomHints: sanitizeCounters(snapshot.roomHints),
            players: sanitizePlayers(snapshot.players),
        },
    };
};

// Soumettre le score d'une partie terminée (instantané construit par App.vue).
// Renvoie la réponse du serveur ({ success, message, score, userStats }) et lève une erreur en cas d'échec.
const submitScore = async (snapshot) => {
    try {
        return await api.post(API_ENDPOINTS.SCORES.SUBMIT, buildScorePayload(snapshot));
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Vider "MES SCORES" (déconnexion, changement de compte)
const resetUserScores = () => {
    userScoresEpoch++;
    userScores.value = [];
};

// Récupérer les scores de l'utilisateur connecté
const getMyScores = async (params = {}) => {
    const epoch = userScoresEpoch;
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.SCORES.MY_SCORES}${queryString ? `?${queryString}` : ''}`;
        const response = await api.get(endpoint);
        if (epoch === userScoresEpoch) {
            userScores.value = Array.isArray(response?.scores) ? response.scores : [];
        }
        return response;
    } catch (error) {
        if (epoch === userScoresEpoch) {
            userScores.value = [];
        }
        handleAuthError(error);
        throw error;
    }
};

// Récupérer les scores d'un utilisateur spécifique
const getUserScores = async (userId, params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `${API_ENDPOINTS.SCORES.USER_SCORES}/${encodeURIComponent(userId)}${queryString ? `?${queryString}` : ''}`;
        return await api.get(endpoint);
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
        leaderboard.value = Array.isArray(response?.leaderboard) ? response.leaderboard : [];
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
        stats.value = response?.stats || null;
        return stats.value;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer les scores récents
const getRecentScores = async (limit = 20) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.SCORES.RECENT}?limit=${encodeURIComponent(limit)}`);
        scores.value = Array.isArray(response?.scores) ? response.scores : [];
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Récupérer les meilleurs scores
const getBestScores = async (limit = 10) => {
    try {
        return await api.get(`${API_ENDPOINTS.SCORES.BEST}?limit=${encodeURIComponent(limit)}`);
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Supprimer un score
const deleteScore = async (scoreId) => {
    try {
        const response = await api.delete(`${API_ENDPOINTS.SCORES.DELETE}/${encodeURIComponent(scoreId)}`);
        // Retirer le score de la liste locale
        userScores.value = userScores.value.filter((score) => score.id !== scoreId);
        return response;
    } catch (error) {
        handleAuthError(error);
        throw error;
    }
};

// Formater la durée en format lisible
const formatDuration = (seconds) => {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
};

// Formater une note : "13.5/20". Une valeur hors barème (ancien système de points) affiche "—".
const formatScore = (score) => {
    const n = Number(score);
    if (!Number.isFinite(n) || n < 0 || n > MAX_SCORE) return '—';
    return `${(Math.round(n * 10) / 10).toFixed(1)}/${MAX_SCORE}`;
};

// Obtenir le rang qu'aurait une note dans un classement (note décroissante, puis durée croissante)
const getScoreRank = (score, leaderboardData = [], duration = Infinity) => {
    const note = Number(score) || 0;
    const better = leaderboardData.filter((entry) => {
        const entryNote = getRecordNote(entry);
        return entryNote > note || (entryNote === note && (Number(entry.duration) || 0) < duration);
    }).length;
    return better + 1;
};

// "MES SCORES" ne doit jamais montrer les parties d'un autre compte (PC partagés) :
// on vide la liste dès que l'utilisateur se déconnecte ou change de compte.
// (Une connexion depuis l'état déconnecté ne vide rien : la liste l'est déjà, et une
// requête "MES SCORES" lancée juste après la connexion ne doit pas être ignorée.)
const { user: authUser, isAuthenticated } = useAuth();
watch(
    () => (isAuthenticated.value ? authUser.value?.id ?? '__authenticated__' : null),
    (current, previous) => {
        if (previous !== null && current !== previous) {
            resetUserScores();
        }
    }
);

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
        resetUserScores,

        // Utilitaires
        calculateScore,
        buildScorePayload,
        getRecordNote,
        formatDuration,
        formatScore,
        getScoreRank
    };
};

export default useScores;
