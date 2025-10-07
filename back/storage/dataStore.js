const fs = require('fs');
const path = require('path');

class DataStore {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.usersFile = path.join(this.dataDir, 'users.json');
        this.scoresFile = path.join(this.dataDir, 'scores.json');
        this.sessionsFile = path.join(this.dataDir, 'sessions.json');
        
        // Créer le dossier data s'il n'existe pas
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
        
        // Initialiser les données
        this.users = this.loadData('users');
        this.scores = this.loadData('scores');
        this.sessions = this.loadData('sessions');
    }

    loadData(type) {
        const filePath = this.getFilePath(type);
        
        if (!fs.existsSync(filePath)) {
            // Créer le fichier avec des données vides
            this.saveData(type, {});
            return {};
        }

        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Erreur lecture fichier ${type}:`, error);
            return {};
        }
    }

    saveData(type, data) {
        const filePath = this.getFilePath(type);
        
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error(`Erreur sauvegarde fichier ${type}:`, error);
        }
    }

    getFilePath(type) {
        switch (type) {
            case 'users': return this.usersFile;
            case 'scores': return this.scoresFile;
            case 'sessions': return this.sessionsFile;
            default: throw new Error(`Type de fichier inconnu: ${type}`);
        }
    }

    // Méthodes pour les utilisateurs
    getUser(userId) {
        return this.users[userId] || null;
    }

    setUser(userId, userData) {
        this.users[userId] = userData;
        this.saveData('users', this.users);
    }

    getAllUsers() {
        return Object.values(this.users);
    }

    deleteUser(userId) {
        delete this.users[userId];
        this.saveData('users', this.users);
    }

    // Méthodes pour les scores
    getScore(scoreId) {
        return this.scores[scoreId] || null;
    }

    setScore(scoreId, scoreData) {
        this.scores[scoreId] = scoreData;
        this.saveData('scores', this.scores);
    }

    getAllScores() {
        return Object.values(this.scores);
    }

    deleteScore(scoreId) {
        delete this.scores[scoreId];
        this.saveData('scores', this.scores);
    }

    // Méthodes pour les sessions
    getSession(sessionId) {
        return this.sessions[sessionId] || null;
    }

    setSession(sessionId, sessionData) {
        this.sessions[sessionId] = sessionData;
        this.saveData('sessions', this.sessions);
    }

    deleteSession(sessionId) {
        delete this.sessions[sessionId];
        this.saveData('sessions', this.sessions);
    }

    // Nettoyer les sessions expirées
    cleanExpiredSessions() {
        const now = new Date();
        const expiredSessions = [];

        for (const [sessionId, session] of Object.entries(this.sessions)) {
            if (session.expiresAt && new Date(session.expiresAt) < now) {
                expiredSessions.push(sessionId);
            }
        }

        expiredSessions.forEach(sessionId => {
            delete this.sessions[sessionId];
        });

        if (expiredSessions.length > 0) {
            this.saveData('sessions', this.sessions);
            console.log(`Nettoyé ${expiredSessions.length} sessions expirées`);
        }
    }

    // Sauvegarder toutes les données
    saveAll() {
        this.saveData('users', this.users);
        this.saveData('scores', this.scores);
        this.saveData('sessions', this.sessions);
    }
}

// Instance singleton
const dataStore = new DataStore();

// Nettoyer les sessions expirées toutes les 5 minutes
setInterval(() => {
    dataStore.cleanExpiredSessions();
}, 5 * 60 * 1000);

module.exports = dataStore;
