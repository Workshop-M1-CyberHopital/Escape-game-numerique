const express = require('express');
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../storage/dataStore');
const router = express.Router();

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'escape-game-super-secret-key';
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Le stockage est maintenant géré par dataStore

// Soumettre un score
router.post('/submit', authenticateToken, (req, res) => {
    try {
        const { 
            score, 
            duration, 
            roomsCompleted, 
            errors, 
            hints, 
            completed,
            gameData 
        } = req.body;
        
        if (typeof score !== 'number' || score < 0) {
            return res.status(400).json({
                error: 'Score invalide',
                message: 'Le score doit être un nombre positif'
            });
        }

        const scoreId = uuidv4();
        const now = new Date();
        
        const scoreRecord = {
            id: scoreId,
            userId: req.user.userId,
            username: req.user.username,
            score,
            duration: duration || 0,
            roomsCompleted: roomsCompleted || 0,
            errors: errors || 0,
            hints: hints || 0,
            completed: completed || false,
            gameData: gameData || {},
            submittedAt: now,
            rank: 0 // Sera calculé plus tard
        };

        dataStore.setScore(scoreId, scoreRecord);

        // Mettre à jour les statistiques de l'utilisateur
        const user = dataStore.getUser(req.user.userId);
        if (user) {
            user.gamesPlayed++;
            user.totalScore += score;
            
            if (score > user.bestScore) {
                user.bestScore = score;
            }
            
            dataStore.setUser(user.id, user);
        }

        // Calculer le rang
        const allScores = dataStore.getAllScores()
            .sort((a, b) => b.score - a.score);
        
        const rank = allScores.findIndex(s => s.id === scoreId) + 1;
        scoreRecord.rank = rank;

        res.status(201).json({
            success: true,
            message: 'Score enregistré avec succès',
            score: scoreRecord,
            userStats: user ? {
                gamesPlayed: user.gamesPlayed,
                bestScore: user.bestScore,
                totalScore: user.totalScore,
                averageScore: Math.round(user.totalScore / user.gamesPlayed)
            } : null
        });
    } catch (error) {
        console.error('Erreur soumission score:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les scores d'un utilisateur
router.get('/user/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10, offset = 0 } = req.query;
        
        const userScores = dataStore.getAllScores()
            .filter(score => score.userId === userId)
            .sort((a, b) => b.submittedAt - a.submittedAt)
            .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.json({
            success: true,
            scores: userScores,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: userScores.length
            }
        });
    } catch (error) {
        console.error('Erreur récupération scores utilisateur:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les scores de l'utilisateur connecté
router.get('/my-scores', authenticateToken, (req, res) => {
    try {
        const { limit = 10, offset = 0, sortBy = 'date' } = req.query;
        
        let userScores = dataStore.getAllScores()
            .filter(score => score.userId === req.user.userId);

        // Trier selon le critère
        switch (sortBy) {
            case 'score':
                userScores.sort((a, b) => b.score - a.score);
                break;
            case 'date':
                userScores.sort((a, b) => b.submittedAt - a.submittedAt);
                break;
            case 'duration':
                userScores.sort((a, b) => a.duration - b.duration);
                break;
        }

        const paginatedScores = userScores
            .slice(parseInt(offset), parseInt(offset) + parseInt(limit));

        res.json({
            success: true,
            scores: paginatedScores,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: userScores.length,
                hasMore: userScores.length > parseInt(offset) + parseInt(limit)
            },
            sortBy
        });
    } catch (error) {
        console.error('Erreur récupération mes scores:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer le classement global
router.get('/leaderboard', (req, res) => {
    try {
        const { 
            limit = 10, 
            offset = 0, 
            sortBy = 'score',
            period = 'all' 
        } = req.query;
        
        let allScores = dataStore.getAllScores();

        // Filtrer par période
        if (period !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (period) {
                case 'day':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
            
            if (startDate) {
                allScores = allScores.filter(score => score.submittedAt >= startDate);
            }
        }

        // Trier selon le critère
        switch (sortBy) {
            case 'score':
                allScores.sort((a, b) => b.score - a.score);
                break;
            case 'duration':
                allScores.sort((a, b) => a.duration - b.duration);
                break;
            case 'date':
                allScores.sort((a, b) => b.submittedAt - a.submittedAt);
                break;
            case 'rooms':
                allScores.sort((a, b) => b.roomsCompleted - a.roomsCompleted);
                break;
        }

        const leaderboard = allScores
            .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
            .map((score, index) => ({
                rank: parseInt(offset) + index + 1,
                ...score
            }));

        res.json({
            success: true,
            leaderboard,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: allScores.length,
                hasMore: allScores.length > parseInt(offset) + parseInt(limit)
            },
            sortBy,
            period
        });
    } catch (error) {
        console.error('Erreur récupération classement:', error);
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
        const totalScore = allScores.reduce((sum, score) => sum + score.score, 0);
        const averageScore = Math.round(totalScore / totalScores);
        const highestScore = Math.max(...allScores.map(s => s.score));
        const uniquePlayers = new Set(allScores.map(s => s.userId)).size;
        const totalDuration = allScores.reduce((sum, score) => sum + score.duration, 0);
        const averageDuration = Math.round(totalDuration / totalScores);
        const completedGames = allScores.filter(s => s.completed).length;
        const completionRate = Math.round((completedGames / totalScores) * 100);

        res.json({
            success: true,
            stats: {
                totalScores,
                averageScore,
                highestScore,
                totalPlayers: uniquePlayers,
                averageDuration,
                completionRate
            }
        });
    } catch (error) {
        console.error('Erreur récupération stats scores:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les scores récents
router.get('/recent', (req, res) => {
    try {
        const { limit = 20 } = req.query;
        
        const recentScores = dataStore.getAllScores()
            .sort((a, b) => b.submittedAt - a.submittedAt)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            scores: recentScores,
            total: recentScores.length
        });
    } catch (error) {
        console.error('Erreur récupération scores récents:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les meilleurs scores
router.get('/best', (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const bestScores = dataStore.getAllScores()
            .sort((a, b) => b.score - a.score)
            .slice(0, parseInt(limit));

        res.json({
            success: true,
            scores: bestScores,
            total: bestScores.length
        });
    } catch (error) {
        console.error('Erreur récupération meilleurs scores:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Supprimer un score (utilisateur connecté uniquement)
router.delete('/:scoreId', authenticateToken, (req, res) => {
    try {
        const { scoreId } = req.params;
        const score = dataStore.getScore(scoreId);
        
        if (!score) {
            return res.status(404).json({ error: 'Score non trouvé' });
        }

        if (score.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Non autorisé à supprimer ce score' });
        }

        dataStore.deleteScore(scoreId);

        res.json({
            success: true,
            message: 'Score supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression score:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

module.exports = router;
