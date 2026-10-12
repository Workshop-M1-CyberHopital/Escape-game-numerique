const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../storage/dataStore');
const { SCORE_VERSION } = require('../storage/dataStore');
const { authenticateToken } = require('../middleware/auth');
const { computeScoreBreakdown } = require('../utils/scoring');
const {
    round1,
    toTime,
    toPublicScore,
    toOwnScore,
    byScore,
    byDateDesc,
    SCORE_SORTERS,
} = require('../utils/serializers');
const {
    normalizeTeamName,
    parseBoundedInt,
    parsePagination,
    queryString,
    isPlainObject,
} = require('../utils/validation');

const router = express.Router();

const MAX_DURATION = 24 * 60 * 60; // secondes
const MAX_ERRORS = 1000;
const MAX_HINTS = 100;
const ROOM_COUNT = 9;
// En dessous, une mission complète (9 salles, dont 30 compressions au rythme de 100/min) est
// physiquement impossible : partie truquée ou de test, refusée pour protéger le classement.
const MIN_COMPLETED_DURATION = 60; // secondes
const GAME_DATA_MAX_BYTES = 10 * 1024;
// Une même partie renvoyée (nouvel essai après un délai dépassé) ne crée pas de doublon.
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

const PERIODS_MS = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
};

const badRequest = (res, message) => res.status(400).json({
    error: 'Score invalide',
    message,
    code: 'VALIDATION_ERROR',
});

// --- gameData : seules des clés connues et bornées sont conservées --------------------------------
const ROOM_KEY = /^[A-Za-z0-9_-]{1,40}$/;

const sanitizeNumberMap = (value) => {
    if (!isPlainObject(value)) return undefined;
    const out = {};
    for (const [key, raw] of Object.entries(value).slice(0, 30)) {
        if (ROOM_KEY.test(key) && typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) {
            out[key] = Math.min(raw, 1e9);
        }
    }
    return out;
};

const sanitizePlayers = (value) => {
    if (!Array.isArray(value)) return undefined;
    return value
        .map((player) => (typeof player === 'string' ? player : player && typeof player.name === 'string' ? player.name : ''))
        .map((name) => name.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 50))
        .filter(Boolean)
        .slice(0, 10);
};

const sanitizeGameData = (gameData) => {
    const clean = {};
    const roomTimes = sanitizeNumberMap(gameData.roomTimes);
    const roomErrors = sanitizeNumberMap(gameData.roomErrors);
    const roomHints = sanitizeNumberMap(gameData.roomHints);
    const players = sanitizePlayers(gameData.players);
    if (roomTimes) clean.roomTimes = roomTimes;
    if (roomErrors) clean.roomErrors = roomErrors;
    if (roomHints) clean.roomHints = roomHints;
    if (players) clean.players = players;
    return clean;
};

const rankOf = (scoreId) => dataStore.getAllScores().sort(byScore).findIndex((s) => s.id === scoreId) + 1;

const filterByPeriod = (scores, period) => {
    const span = PERIODS_MS[period];
    if (!span) return scores;
    const since = Date.now() - span;
    return scores.filter((score) => toTime(score.submittedAt) >= since);
};

// Soumettre un score : la note /20 est RECALCULÉE par le serveur (la note envoyée par le client est ignorée).
router.post('/submit', authenticateToken, (req, res) => {
    try {
        const body = isPlainObject(req.body) ? req.body : {};

        const duration = parseBoundedInt(body.duration, { min: 0, max: MAX_DURATION, label: 'Durée (secondes)' });
        if (duration.error) return badRequest(res, duration.error);
        const errors = parseBoundedInt(body.errors, { min: 0, max: MAX_ERRORS, fallback: 0, label: 'Nombre d\'erreurs' });
        if (errors.error) return badRequest(res, errors.error);
        const hints = parseBoundedInt(body.hints, { min: 0, max: MAX_HINTS, fallback: 0, label: 'Nombre d\'indices' });
        if (hints.error) return badRequest(res, hints.error);
        const roomsCompleted = parseBoundedInt(body.roomsCompleted, { min: 0, max: ROOM_COUNT, fallback: 0, label: 'Nombre de salles terminées' });
        if (roomsCompleted.error) return badRequest(res, roomsCompleted.error);

        if (body.completed !== undefined && typeof body.completed !== 'boolean') {
            return badRequest(res, 'Le champ completed doit être un booléen.');
        }
        const completed = body.completed === true;
        if (completed && roomsCompleted.value === ROOM_COUNT && duration.value < MIN_COMPLETED_DURATION) {
            return badRequest(res, `Durée invalide : une mission complète dure au moins ${MIN_COMPLETED_DURATION} secondes.`);
        }

        let gameData = {};
        if (body.gameData !== undefined && body.gameData !== null) {
            if (!isPlainObject(body.gameData)) return badRequest(res, 'gameData doit être un objet.');
            if (Buffer.byteLength(JSON.stringify(body.gameData), 'utf8') > GAME_DATA_MAX_BYTES) {
                return badRequest(res, 'Les données de partie sont trop volumineuses (10 Ko maximum).');
            }
            gameData = body.gameData;
        }

        // Nom de l'équipe qui a joué cette partie (sinon l'équipe du compte).
        const rawTeamName = body.teamName ?? gameData.teamName ?? gameData.team?.name;
        const teamName = normalizeTeamName(rawTeamName);
        if (teamName.error) return badRequest(res, teamName.error);

        const user = req.currentUser;
        const record = {
            userId: user.id,
            username: user.username,
            teamName: teamName.value ?? user.teamName ?? null,
            duration: duration.value,
            roomsCompleted: roomsCompleted.value,
            errors: errors.value,
            hints: hints.value,
            completed,
            gameData: sanitizeGameData(gameData),
        };

        const now = Date.now();
        const duplicate = dataStore.getScoresByUser(user.id).find((s) =>
            now - toTime(s.submittedAt) < DUPLICATE_WINDOW_MS
            && s.duration === record.duration
            && s.errors === record.errors
            && s.hints === record.hints
            && s.roomsCompleted === record.roomsCompleted
            && s.completed === record.completed
            && (s.teamName || null) === (record.teamName || null)
        );
        if (duplicate) {
            return res.status(200).json({
                success: true,
                message: 'Score déjà enregistré',
                duplicate: true,
                score: toOwnScore(duplicate, { rank: rankOf(duplicate.id) }),
                userStats: dataStore.computeUserStats(user.id)
            });
        }

        const breakdown = computeScoreBreakdown({
            totalTime: record.duration,
            errors: record.errors,
            hints: record.hints,
        });

        const scoreId = uuidv4();
        const scoreRecord = {
            id: scoreId,
            ...record,
            score: breakdown.total,
            timeScore: breakdown.timeScore,
            errorScore: breakdown.errorScore,
            hintScore: breakdown.hintScore,
            scoreVersion: SCORE_VERSION,
            submittedAt: new Date(now),
        };

        dataStore.setScore(scoreId, scoreRecord);
        const userStats = dataStore.recomputeUserStats(user.id);

        res.status(201).json({
            success: true,
            message: 'Score enregistré avec succès',
            score: toOwnScore(scoreRecord, { rank: rankOf(scoreId) }),
            userStats
        });
    } catch (error) {
        console.error('Erreur soumission score:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les scores (publics) d'un utilisateur
router.get('/user/:userId', (req, res) => {
    try {
        const { limit, offset } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 100 });
        const userScores = dataStore.getScoresByUser(req.params.userId).sort(byDateDesc);

        res.json({
            success: true,
            scores: userScores.slice(offset, offset + limit).map((score) => toPublicScore(score)),
            pagination: {
                limit,
                offset,
                total: userScores.length,
                hasMore: userScores.length > offset + limit
            }
        });
    } catch (error) {
        console.error('Erreur récupération scores utilisateur:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les scores de l'utilisateur connecté (détail complet)
router.get('/my-scores', authenticateToken, (req, res) => {
    try {
        const { limit, offset } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 100 });
        const requested = queryString(req.query.sortBy, 'date');
        const sortBy = ['date', 'score', 'duration'].includes(requested) ? requested : 'date';

        const userScores = dataStore.getScoresByUser(req.user.userId).sort(SCORE_SORTERS[sortBy]);

        res.json({
            success: true,
            scores: userScores.slice(offset, offset + limit).map((score) => toOwnScore(score)),
            pagination: {
                limit,
                offset,
                total: userScores.length,
                hasMore: userScores.length > offset + limit
            },
            sortBy
        });
    } catch (error) {
        console.error('Erreur récupération mes scores:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer le classement global
router.get('/leaderboard', (req, res) => {
    try {
        const { limit, offset } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 100 });
        const requestedSort = queryString(req.query.sortBy, 'score');
        const sortBy = SCORE_SORTERS[requestedSort] ? requestedSort : 'score';
        const requestedPeriod = queryString(req.query.period, 'all');
        const period = PERIODS_MS[requestedPeriod] ? requestedPeriod : 'all';

        const allScores = filterByPeriod(dataStore.getAllScores(), period).sort(SCORE_SORTERS[sortBy]);

        const leaderboard = allScores
            .slice(offset, offset + limit)
            .map((score, index) => toPublicScore(score, { rank: offset + index + 1 }));

        res.json({
            success: true,
            leaderboard,
            pagination: {
                limit,
                offset,
                total: allScores.length,
                hasMore: allScores.length > offset + limit
            },
            sortBy,
            period
        });
    } catch (error) {
        console.error('Erreur récupération classement:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les statistiques globales des scores
router.get('/stats', (req, res) => {
    try {
        const allScores = dataStore.getAllScores();

        if (allScores.length === 0) {
            return res.json({
                success: true,
                stats: {
                    totalScores: 0,
                    averageScore: 0,
                    highestScore: 0,
                    totalPlayers: 0,
                    averageDuration: 0,
                    completionRate: 0
                }
            });
        }

        const totalScores = allScores.length;
        const totalScore = allScores.reduce((sum, score) => sum + (Number(score.score) || 0), 0);
        const highestScore = allScores.reduce((max, score) => Math.max(max, Number(score.score) || 0), 0);
        const totalDuration = allScores.reduce((sum, score) => sum + (Number(score.duration) || 0), 0);
        const completedGames = allScores.filter((s) => s.completed === true).length;

        res.json({
            success: true,
            stats: {
                totalScores,
                averageScore: round1(totalScore / totalScores),
                highestScore: round1(highestScore),
                totalPlayers: new Set(allScores.map((s) => s.userId)).size,
                averageDuration: Math.round(totalDuration / totalScores),
                completionRate: Math.round((completedGames / totalScores) * 100)
            }
        });
    } catch (error) {
        console.error('Erreur récupération stats scores:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les scores récents
router.get('/recent', (req, res) => {
    try {
        const { limit } = parsePagination(req.query, { defaultLimit: 20, maxLimit: 100 });
        const recentScores = dataStore.getAllScores()
            .sort(byDateDesc)
            .slice(0, limit)
            .map((score) => toPublicScore(score));

        res.json({
            success: true,
            scores: recentScores,
            total: recentScores.length
        });
    } catch (error) {
        console.error('Erreur récupération scores récents:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les meilleurs scores
router.get('/best', (req, res) => {
    try {
        const { limit } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 100 });
        const bestScores = dataStore.getAllScores()
            .sort(byScore)
            .slice(0, limit)
            .map((score, index) => toPublicScore(score, { rank: index + 1 }));

        res.json({
            success: true,
            scores: bestScores,
            total: bestScores.length
        });
    } catch (error) {
        console.error('Erreur récupération meilleurs scores:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Supprimer un score (propriétaire uniquement) puis recalculer les statistiques du joueur
router.delete('/:scoreId', authenticateToken, (req, res) => {
    try {
        const score = dataStore.getScore(req.params.scoreId);

        if (!score) {
            return res.status(404).json({ error: 'Score non trouvé', code: 'NOT_FOUND' });
        }

        if (score.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Non autorisé à supprimer ce score', code: 'FORBIDDEN' });
        }

        dataStore.deleteScore(req.params.scoreId);
        const userStats = dataStore.recomputeUserStats(req.user.userId);

        res.json({
            success: true,
            message: 'Score supprimé avec succès',
            userStats
        });
    } catch (error) {
        console.error('Erreur suppression score:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

module.exports = router;
