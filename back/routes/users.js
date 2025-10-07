const express = require('express');
const bcrypt = require('bcryptjs');
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

// Récupérer le profil de l'utilisateur connecté
router.get('/profile', authenticateToken, (req, res) => {
    try {
        const user = dataStore.getUser(req.user.userId);
        
        if (!user || !user.isActive) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                teamName: user.teamName,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                gamesPlayed: user.gamesPlayed,
                bestScore: user.bestScore,
                totalScore: user.totalScore
            }
        });
    } catch (error) {
        console.error('Erreur récupération profil:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Mettre à jour le profil
router.put('/profile', authenticateToken, (req, res) => {
    try {
        const { username, teamName } = req.body;
        const user = dataStore.getUser(req.user.userId);
        
        if (!user || !user.isActive) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Vérifier si le nouveau nom d'utilisateur est déjà pris
        if (username && username !== user.username) {
            const existingUser = Array.from(users.values()).find(u => 
                u.username === username && u.id !== user.id
            );
            
            if (existingUser) {
                return res.status(409).json({
                    error: 'Nom d\'utilisateur déjà pris'
                });
            }
        }

        // Mettre à jour les champs
        if (username) user.username = username.trim();
        if (teamName !== undefined) user.teamName = teamName?.trim() || null;
        
        user.updatedAt = new Date();
        dataStore.setUser(user.id, user);

        res.json({
            success: true,
            message: 'Profil mis à jour',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                teamName: user.teamName,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Erreur mise à jour profil:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les statistiques de l'utilisateur
router.get('/stats', authenticateToken, (req, res) => {
    try {
        const user = dataStore.getUser(req.user.userId);
        
        if (!user || !user.isActive) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const stats = {
            gamesPlayed: user.gamesPlayed,
            bestScore: user.bestScore,
            totalScore: user.totalScore,
            averageScore: user.gamesPlayed > 0 ? Math.round(user.totalScore / user.gamesPlayed) : 0,
            memberSince: user.createdAt,
            lastLogin: user.lastLogin,
            teamName: user.teamName
        };

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Erreur récupération stats:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer l'historique des parties
router.get('/games', authenticateToken, (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        
        // En production, récupérer depuis la base de données
        const games = Array.from({ length: Math.min(parseInt(limit), 10) }, (_, index) => ({
            id: uuidv4(),
            date: new Date(Date.now() - index * 86400000), // Simulation
            score: Math.floor(Math.random() * 1000) + 500,
            duration: Math.floor(Math.random() * 3600) + 1800, // 30-90 minutes
            completed: Math.random() > 0.2, // 80% de réussite
            roomsCompleted: Math.floor(Math.random() * 4) + 1,
            errors: Math.floor(Math.random() * 20),
            hints: Math.floor(Math.random() * 10)
        }));

        res.json({
            success: true,
            games,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total: 25 // Simulation
            }
        });
    } catch (error) {
        console.error('Erreur récupération parties:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer le classement des utilisateurs
router.get('/leaderboard', (req, res) => {
    try {
        const { limit = 10, sortBy = 'bestScore' } = req.query;
        
        const allUsers = dataStore.getAllUsers()
            .filter(user => user.isActive)
            .sort((a, b) => {
                switch (sortBy) {
                    case 'bestScore':
                        return b.bestScore - a.bestScore;
                    case 'totalScore':
                        return b.totalScore - a.totalScore;
                    case 'gamesPlayed':
                        return b.gamesPlayed - a.gamesPlayed;
                    case 'username':
                        return a.username.localeCompare(b.username);
                    default:
                        return b.bestScore - a.bestScore;
                }
            })
            .slice(0, parseInt(limit))
            .map((user, index) => ({
                rank: index + 1,
                username: user.username,
                teamName: user.teamName,
                bestScore: user.bestScore,
                totalScore: user.totalScore,
                gamesPlayed: user.gamesPlayed,
                averageScore: user.gamesPlayed > 0 ? Math.round(user.totalScore / user.gamesPlayed) : 0
            }));

        res.json({
            success: true,
            leaderboard: allUsers,
            sortBy,
            total: allUsers.length
        });
    } catch (error) {
        console.error('Erreur récupération classement:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Rechercher des utilisateurs
router.get('/search', (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                error: 'Terme de recherche requis (minimum 2 caractères)'
            });
        }

        const searchTerm = q.toLowerCase().trim();
        const matchingUsers = dataStore.getAllUsers()
            .filter(user => 
                user.isActive && (
                    user.username.toLowerCase().includes(searchTerm) ||
                    (user.teamName && user.teamName.toLowerCase().includes(searchTerm))
                )
            )
            .slice(0, parseInt(limit))
            .map(user => ({
                id: user.id,
                username: user.username,
                teamName: user.teamName,
                bestScore: user.bestScore,
                gamesPlayed: user.gamesPlayed
            }));

        res.json({
            success: true,
            users: matchingUsers,
            query: q,
            total: matchingUsers.length
        });
    } catch (error) {
        console.error('Erreur recherche utilisateurs:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Récupérer les utilisateurs les plus actifs
router.get('/most-active', (req, res) => {
    try {
        const { limit = 10, period = 'week' } = req.query;
        
        // Simulation des utilisateurs les plus actifs
        const activeUsers = dataStore.getAllUsers()
            .filter(user => user.isActive)
            .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
            .slice(0, parseInt(limit))
            .map((user, index) => ({
                rank: index + 1,
                username: user.username,
                teamName: user.teamName,
                gamesPlayed: user.gamesPlayed,
                lastLogin: user.lastLogin,
                bestScore: user.bestScore
            }));

        res.json({
            success: true,
            activeUsers,
            period,
            total: activeUsers.length
        });
    } catch (error) {
        console.error('Erreur récupération utilisateurs actifs:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

module.exports = router;
