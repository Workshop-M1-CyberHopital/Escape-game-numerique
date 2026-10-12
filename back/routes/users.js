const express = require('express');
const dataStore = require('../storage/dataStore');
const { authenticateToken } = require('../middleware/auth');
const { toPublicUser, toOwnScore, round1, toTime, byDateDesc } = require('../utils/serializers');
const { normalizeUsername, normalizeTeamName, parsePagination, queryString } = require('../utils/validation');

const router = express.Router();

const PERIODS_MS = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
};

const badRequest = (res, message) => res.status(400).json({
    error: 'Données invalides',
    message,
    code: 'VALIDATION_ERROR',
});

const activeUsers = () => dataStore.getAllUsers().filter((user) => user.isActive !== false);

// Récupérer le profil de l'utilisateur connecté
router.get('/profile', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: toPublicUser(req.currentUser)
    });
});

// Mettre à jour le profil (nom d'utilisateur et/ou nom d'équipe)
router.put('/profile', authenticateToken, (req, res) => {
    try {
        const body = req.body || {};
        const user = req.currentUser;
        const changes = {};

        if (body.username !== undefined) {
            const username = normalizeUsername(body.username);
            if (username.error) return badRequest(res, username.error);

            if (username.value !== user.username) {
                const canonical = (value) => value.replace(/\s+/g, ' ').trim().toLowerCase();
                const wanted = canonical(username.value);
                const taken = dataStore.getAllUsers().some((u) =>
                    u.id !== user.id && typeof u.username === 'string' && canonical(u.username) === wanted
                );
                if (taken) {
                    return res.status(409).json({
                        error: 'Nom d\'utilisateur déjà pris',
                        message: 'Ce nom d\'utilisateur est déjà pris.',
                        code: 'ALREADY_EXISTS'
                    });
                }
                changes.username = username.value;
            }
        }

        if (body.teamName !== undefined) {
            const teamName = normalizeTeamName(body.teamName);
            if (teamName.error) return badRequest(res, teamName.error);
            changes.teamName = teamName.value;
        }

        let updated = user;
        if (Object.keys(changes).length > 0) {
            updated = { ...user, ...changes, updatedAt: new Date() };
            dataStore.setUser(user.id, updated);
            // Les classements affichent le nom actuel du joueur.
            if (changes.username) {
                dataStore.updateScoresByUser(user.id, { username: changes.username });
            }
        }

        res.json({
            success: true,
            message: 'Profil mis à jour',
            user: toPublicUser(updated)
        });
    } catch (error) {
        console.error('Erreur mise à jour profil:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les statistiques de l'utilisateur (calculées à partir de ses scores réels)
router.get('/stats', authenticateToken, (req, res) => {
    try {
        const user = req.currentUser;
        const scores = dataStore.getScoresByUser(user.id);
        const stats = dataStore.computeUserStats(user.id);
        const completed = scores.filter((s) => s.completed === true);
        const fastest = completed.reduce((best, s) => (best === null || s.duration < best ? s.duration : best), null);
        const lastGame = scores.slice().sort(byDateDesc)[0];

        res.json({
            success: true,
            stats: {
                ...stats,
                completedGames: completed.length,
                bestDuration: fastest,
                lastGameAt: lastGame ? lastGame.submittedAt : null,
                memberSince: user.createdAt || null,
                lastLogin: user.lastLogin || null,
                teamName: user.teamName || null
            }
        });
    } catch (error) {
        console.error('Erreur récupération stats:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Historique réel des parties de l'utilisateur connecté (plus récentes d'abord)
router.get('/games', authenticateToken, (req, res) => {
    try {
        const { limit, offset } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 100 });
        const scores = dataStore.getScoresByUser(req.user.userId).sort(byDateDesc);

        const games = scores.slice(offset, offset + limit).map((score) => toOwnScore(score, {
            date: score.submittedAt
        }));

        res.json({
            success: true,
            games,
            pagination: {
                limit,
                offset,
                total: scores.length,
                hasMore: scores.length > offset + limit
            }
        });
    } catch (error) {
        console.error('Erreur récupération parties:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer le classement des utilisateurs
router.get('/leaderboard', (req, res) => {
    try {
        const { limit } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 100 });
        const sortBy = queryString(req.query.sortBy, 'bestScore');

        const comparators = {
            bestScore: (a, b) => (b.bestScore - a.bestScore) || (b.gamesPlayed - a.gamesPlayed),
            totalScore: (a, b) => (b.totalScore - a.totalScore) || (b.bestScore - a.bestScore),
            gamesPlayed: (a, b) => (b.gamesPlayed - a.gamesPlayed) || (b.bestScore - a.bestScore),
            username: (a, b) => a.username.localeCompare(b.username, 'fr'),
        };
        const compare = comparators[sortBy] || comparators.bestScore;

        const leaderboard = activeUsers()
            .map((user) => ({
                username: user.username,
                teamName: user.teamName || null,
                bestScore: round1(user.bestScore),
                totalScore: round1(user.totalScore),
                gamesPlayed: Number(user.gamesPlayed) || 0,
            }))
            .sort(compare)
            .slice(0, limit)
            .map((user, index) => ({
                rank: index + 1,
                ...user,
                averageScore: user.gamesPlayed > 0 ? round1(user.totalScore / user.gamesPlayed) : 0
            }));

        res.json({
            success: true,
            leaderboard,
            sortBy: comparators[sortBy] ? sortBy : 'bestScore',
            total: leaderboard.length
        });
    } catch (error) {
        console.error('Erreur récupération classement:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Rechercher des utilisateurs (par nom d'utilisateur ou d'équipe)
router.get('/search', (req, res) => {
    try {
        const q = queryString(req.query.q, '');
        const { limit } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 50 });

        if (q.length < 2) {
            return badRequest(res, 'Terme de recherche requis (minimum 2 caractères).');
        }

        const searchTerm = q.toLowerCase();
        const matchingUsers = activeUsers()
            .filter((user) =>
                user.username.toLowerCase().includes(searchTerm) ||
                (user.teamName && user.teamName.toLowerCase().includes(searchTerm))
            )
            .slice(0, limit)
            .map((user) => ({
                username: user.username,
                teamName: user.teamName || null,
                bestScore: round1(user.bestScore),
                gamesPlayed: Number(user.gamesPlayed) || 0
            }));

        res.json({
            success: true,
            users: matchingUsers,
            query: q,
            total: matchingUsers.length
        });
    } catch (error) {
        console.error('Erreur recherche utilisateurs:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Utilisateurs les plus actifs sur la période (nombre de parties enregistrées)
router.get('/most-active', (req, res) => {
    try {
        const { limit } = parsePagination(req.query, { defaultLimit: 10, maxLimit: 100 });
        const requested = queryString(req.query.period, 'week');
        const period = (PERIODS_MS[requested] || requested === 'all') ? requested : 'week';
        const since = period === 'all' ? 0 : Date.now() - PERIODS_MS[period];

        const counts = new Map();
        for (const score of dataStore.getAllScores()) {
            if (toTime(score.submittedAt) >= since) {
                counts.set(score.userId, (counts.get(score.userId) || 0) + 1);
            }
        }

        const users = activeUsers()
            .filter((user) => counts.has(user.id))
            .map((user) => ({
                username: user.username,
                teamName: user.teamName || null,
                gamesPlayed: counts.get(user.id),
                lastLogin: user.lastLogin || null,
                bestScore: round1(user.bestScore)
            }))
            .sort((a, b) => (b.gamesPlayed - a.gamesPlayed) || (b.bestScore - a.bestScore))
            .slice(0, limit)
            .map((user, index) => ({ rank: index + 1, ...user }));

        res.json({
            success: true,
            activeUsers: users,
            period,
            total: users.length
        });
    } catch (error) {
        console.error('Erreur récupération utilisateurs actifs:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

module.exports = router;
