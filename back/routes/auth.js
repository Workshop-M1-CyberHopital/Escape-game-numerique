const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const dataStore = require('../storage/dataStore');
const config = require('../config');
const { authenticateToken, signToken } = require('../middleware/auth');
const { toPublicUser } = require('../utils/serializers');
const {
    normalizeEmail,
    normalizeUsername,
    normalizeTeamName,
    validateNewPassword,
    validatePasswordInput,
} = require('../utils/validation');

const router = express.Router();
const BCRYPT_ROUNDS = config.security.bcryptRounds;

// Hash factice : la connexion avec un email inconnu prend autant de temps qu'avec un mauvais mot de passe.
const DUMMY_HASH = bcrypt.hashSync('escape-game-dummy-password', BCRYPT_ROUNDS);

const badRequest = (res, message) => res.status(400).json({
    error: 'Données invalides',
    message,
    code: 'VALIDATION_ERROR',
});

const invalidCredentials = (res, message) => res.status(401).json({
    error: 'Identifiants invalides',
    message,
    code: 'INVALID_CREDENTIALS',
});

// Comparaison insensible à la casse et aux espaces (début, fin, espaces multiples).
const canonical = (value) => value.replace(/\s+/g, ' ').trim().toLowerCase();
const sameText = (a, b) => typeof a === 'string' && typeof b === 'string' && canonical(a) === canonical(b);

const findConflict = (email, username) => {
    for (const user of dataStore.getAllUsers()) {
        if (sameText(user.email, email)) {
            return { field: 'email', message: 'Un compte existe déjà avec cet email.' };
        }
        if (sameText(user.username, username)) {
            return { field: 'username', message: 'Ce nom d\'utilisateur est déjà pris.' };
        }
    }
    return null;
};

// Inscription d'un nouvel utilisateur
router.post('/register', async (req, res) => {
    try {
        const body = req.body || {};
        const email = normalizeEmail(body.email);
        if (email.error) return badRequest(res, email.error);
        const username = normalizeUsername(body.username);
        if (username.error) return badRequest(res, username.error);
        const password = validateNewPassword(body.password);
        if (password.error) return badRequest(res, password.error);
        const teamName = normalizeTeamName(body.teamName);
        if (teamName.error) return badRequest(res, teamName.error);

        const conflictBefore = findConflict(email.value, username.value);
        if (conflictBefore) {
            return res.status(409).json({ error: 'Utilisateur déjà existant', message: conflictBefore.message, code: 'ALREADY_EXISTS' });
        }

        const hashedPassword = await bcrypt.hash(password.value, BCRYPT_ROUNDS);

        // Nouvelle vérification après l'attente du hash (deux inscriptions simultanées).
        const conflictAfter = findConflict(email.value, username.value);
        if (conflictAfter) {
            return res.status(409).json({ error: 'Utilisateur déjà existant', message: conflictAfter.message, code: 'ALREADY_EXISTS' });
        }

        const userId = uuidv4();
        const user = {
            id: userId,
            username: username.value,
            email: email.value,
            password: hashedPassword,
            teamName: teamName.value,
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true,
            tokenVersion: 0,
            gamesPlayed: 0,
            bestScore: 0,
            totalScore: 0,
        };

        dataStore.setUser(userId, user);

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            user: toPublicUser(user),
            token: signToken(user),
        });
    } catch (error) {
        console.error('Erreur inscription:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Connexion d'un utilisateur
router.post('/login', async (req, res) => {
    try {
        const body = req.body || {};
        const email = normalizeEmail(body.email);
        const password = validatePasswordInput(body.password);
        if (typeof body.email !== 'string' || !body.email.trim() || password.error) {
            return badRequest(res, 'Email et mot de passe requis.');
        }

        const user = email.value
            ? dataStore.getAllUsers().find((u) => u.isActive !== false && sameText(u.email, email.value))
            : null;

        const hasHash = Boolean(user) && typeof user.password === 'string' && user.password.length > 0;
        const isValidPassword = await bcrypt.compare(password.value, hasHash ? user.password : DUMMY_HASH);
        if (!hasHash || !isValidPassword) {
            return invalidCredentials(res, 'Email ou mot de passe incorrect.');
        }

        const updated = { ...user, lastLogin: new Date() };
        dataStore.setUser(user.id, updated);

        res.json({
            success: true,
            message: 'Connexion réussie',
            user: toPublicUser(updated),
            token: signToken(updated),
        });
    } catch (error) {
        console.error('Erreur connexion:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Déconnexion : les JWT sont sans état, le client supprime simplement son jeton.
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Déconnexion réussie'
    });
});

// Vérifier le token (le middleware vérifie aussi que le compte existe toujours)
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: toPublicUser(req.currentUser)
    });
});

// Changer le mot de passe : les autres sessions sont invalidées, un nouveau jeton est renvoyé.
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const body = req.body || {};
        const currentPassword = validatePasswordInput(body.currentPassword, 'Le mot de passe actuel est requis.');
        if (currentPassword.error) return badRequest(res, currentPassword.error);
        const newPassword = validateNewPassword(body.newPassword);
        if (newPassword.error) return badRequest(res, newPassword.error);

        const user = req.currentUser;
        const isValidPassword = await bcrypt.compare(currentPassword.value, user.password);
        if (!isValidPassword) {
            return invalidCredentials(res, 'Mot de passe actuel incorrect.');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword.value, BCRYPT_ROUNDS);
        const fresh = dataStore.getUser(user.id);
        if (!fresh) {
            return res.status(401).json({ error: 'Utilisateur non trouvé ou supprimé', code: 'USER_NOT_FOUND' });
        }
        const updated = {
            ...fresh,
            password: hashedNewPassword,
            tokenVersion: (fresh.tokenVersion || 0) + 1,
            updatedAt: new Date(),
        };
        dataStore.setUser(user.id, updated);

        res.json({
            success: true,
            message: 'Mot de passe modifié avec succès',
            token: signToken(updated),
            user: toPublicUser(updated),
        });
    } catch (error) {
        console.error('Erreur changement mot de passe:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Supprimer le compte : suppression DÉFINITIVE du compte et de tous ses scores.
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        const password = validatePasswordInput((req.body || {}).password, 'Mot de passe requis pour supprimer le compte.');
        if (password.error) return badRequest(res, password.error);

        const user = req.currentUser;
        const isValidPassword = await bcrypt.compare(password.value, user.password);
        if (!isValidPassword) {
            return invalidCredentials(res, 'Mot de passe incorrect.');
        }

        const deletedScores = dataStore.deleteUserAndScores(user.id);

        res.json({
            success: true,
            message: 'Compte et scores supprimés définitivement',
            deletedScores
        });
    } catch (error) {
        console.error('Erreur suppression compte:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

module.exports = router;
