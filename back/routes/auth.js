const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// Stockage en mémoire des utilisateurs (en production, utiliser une base de données)
const users = new Map();
const sessions = new Map();

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'escape-game-super-secret-key';
const JWT_EXPIRES_IN = '24h';

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};

// Inscription d'un nouvel utilisateur
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, teamName } = req.body;
        
        // Validation des données
        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Données manquantes',
                required: ['username', 'email', 'password']
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = Array.from(users.values()).find(user => 
            user.email === email || user.username === username
        );
        
        if (existingUser) {
            return res.status(409).json({
                error: 'Utilisateur déjà existant',
                message: 'Un utilisateur avec cet email ou nom d\'utilisateur existe déjà'
            });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Créer l'utilisateur
        const userId = uuidv4();
        const user = {
            id: userId,
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            teamName: teamName?.trim() || null,
            createdAt: new Date(),
            lastLogin: null,
            isActive: true,
            gamesPlayed: 0,
            bestScore: 0,
            totalScore: 0
        };

        users.set(userId, user);

        // Générer le token JWT
        const token = jwt.sign(
            { userId, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                teamName: user.teamName,
                createdAt: user.createdAt
            },
            token
        });
    } catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Connexion d'un utilisateur
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email et mot de passe requis'
            });
        }

        // Trouver l'utilisateur
        const user = Array.from(users.values()).find(u => 
            u.email === email.toLowerCase().trim() && u.isActive
        );
        
        if (!user) {
            return res.status(401).json({
                error: 'Identifiants invalides'
            });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Identifiants invalides'
            });
        }

        // Mettre à jour la dernière connexion
        user.lastLogin = new Date();
        users.set(user.id, user);

        // Générer le token JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Créer une session
        const sessionId = uuidv4();
        sessions.set(sessionId, {
            id: sessionId,
            userId: user.id,
            createdAt: new Date(),
            isActive: true
        });

        res.json({
            success: true,
            message: 'Connexion réussie',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                teamName: user.teamName,
                lastLogin: user.lastLogin,
                gamesPlayed: user.gamesPlayed,
                bestScore: user.bestScore,
                totalScore: user.totalScore
            },
            token,
            sessionId
        });
    } catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Déconnexion
router.post('/logout', authenticateToken, (req, res) => {
    try {
        // En production, ajouter le token à une blacklist
        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (error) {
        console.error('Erreur déconnexion:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Vérifier le token
router.get('/verify', authenticateToken, (req, res) => {
    try {
        const user = users.get(req.user.userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({ error: 'Utilisateur non trouvé ou inactif' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                teamName: user.teamName,
                lastLogin: user.lastLogin,
                gamesPlayed: user.gamesPlayed,
                bestScore: user.bestScore,
                totalScore: user.totalScore
            }
        });
    } catch (error) {
        console.error('Erreur vérification token:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Changer le mot de passe
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Mot de passe actuel et nouveau mot de passe requis'
            });
        }

        const user = users.get(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Vérifier le mot de passe actuel
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        }

        // Hacher le nouveau mot de passe
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedNewPassword;
        users.set(user.id, user);

        res.json({
            success: true,
            message: 'Mot de passe modifié avec succès'
        });
    } catch (error) {
        console.error('Erreur changement mot de passe:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Supprimer le compte
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ error: 'Mot de passe requis pour supprimer le compte' });
        }

        const user = users.get(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        // Désactiver l'utilisateur au lieu de le supprimer
        user.isActive = false;
        users.set(user.id, user);

        res.json({
            success: true,
            message: 'Compte supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur suppression compte:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

module.exports = router;
