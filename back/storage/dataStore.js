const fs = require('fs');
const path = require('path');
const config = require('../config');
const { computeScoreBreakdown } = require('../utils/scoring');
const { round1 } = require('../utils/serializers');

// Stockage JSON en mémoire + fichiers (un seul processus : exactement 1 réplica en production).
// - écritures atomiques (fichier temporaire + fsync + rename) : un arrêt brutal ne tronque jamais un fichier ;
// - un fichier illisible n'est jamais écrasé : il est déplacé en <fichier>.corrupt-<horodatage> ;
// - les dates sont reconverties en objets Date au chargement.

const SCORE_VERSION = 2; // 2 = note /20 recalculée par le serveur

const COLLECTIONS = {
    users: { file: 'users.json', dateFields: ['createdAt', 'lastLogin', 'updatedAt'] },
    scores: { file: 'scores.json', dateFields: ['submittedAt'] },
};

const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-');
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const toFiniteNumber = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

const reviveDate = (value) => {
    if (value === null || value === undefined || value instanceof Date) return value ?? null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

class DataStore {
    constructor({ dataDir = config.storage.dataDir } = {}) {
        this.dataDir = dataDir;
        fs.mkdirSync(this.dataDir, { recursive: true });
        this.removeStaleTempFiles();

        this.users = this.loadCollection('users');
        this.scores = this.loadCollection('scores');

        this.migrate();
    }

    // --- Fichiers --------------------------------------------------------------------------------
    getFilePath(type) {
        const collection = COLLECTIONS[type];
        if (!collection) throw new Error(`Type de fichier inconnu: ${type}`);
        return path.join(this.dataDir, collection.file);
    }

    removeStaleTempFiles() {
        try {
            for (const name of fs.readdirSync(this.dataDir)) {
                if (/\.json\.\d+\.\d+\.tmp$/.test(name)) {
                    fs.rmSync(path.join(this.dataDir, name), { force: true });
                }
            }
        } catch (error) {
            console.warn('⚠️  Nettoyage des fichiers temporaires impossible:', error.message);
        }
    }

    // Met de côté un fichier illisible sans jamais l'écraser.
    quarantine(filePath, reason) {
        const backupPath = `${filePath}.corrupt-${timestamp()}`;
        fs.renameSync(filePath, backupPath);
        console.error('!'.repeat(78));
        console.error(`!!  Fichier de données illisible : ${filePath}`);
        console.error(`!!  Raison : ${reason}`);
        console.error(`!!  Le fichier a été conservé sous : ${backupPath}`);
        console.error('!!  Le serveur repart avec une collection vide : restaurez la sauvegarde si besoin.');
        console.error('!'.repeat(78));
        return backupPath;
    }

    loadCollection(type) {
        const filePath = this.getFilePath(type);
        if (!fs.existsSync(filePath)) {
            this.writeFileAtomic(filePath, {});
            return {};
        }

        let raw;
        try {
            raw = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            // Fichier présent mais non lisible (droits...) : on refuse de démarrer plutôt que de l'écraser.
            throw new Error(`Lecture impossible de ${filePath}: ${error.message}`);
        }

        if (raw.trim() === '') return {};

        let data;
        try {
            data = JSON.parse(raw);
            if (!isPlainObject(data)) throw new Error('le contenu n\'est pas un objet JSON');
        } catch (error) {
            this.quarantine(filePath, error.message);
            return {};
        }

        const { dateFields } = COLLECTIONS[type];
        for (const [id, record] of Object.entries(data)) {
            if (!isPlainObject(record)) {
                delete data[id];
                continue;
            }
            for (const field of dateFields) {
                if (field in record) record[field] = reviveDate(record[field]);
            }
        }
        return data;
    }

    writeFileAtomic(filePath, data) {
        const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
        const json = JSON.stringify(data, null, 2);
        let fd;
        try {
            fd = fs.openSync(tmpPath, 'w');
            fs.writeSync(fd, json, null, 'utf8');
            fs.fsyncSync(fd);
            fs.closeSync(fd);
            fd = undefined;
            fs.renameSync(tmpPath, filePath);
        } catch (error) {
            if (fd !== undefined) {
                try { fs.closeSync(fd); } catch { /* déjà fermé */ }
            }
            fs.rmSync(tmpPath, { force: true });
            throw error;
        }
    }

    saveData(type) {
        try {
            this.writeFileAtomic(this.getFilePath(type), this[type]);
        } catch (error) {
            console.error(`Erreur sauvegarde fichier ${type}:`, error.message);
            throw error;
        }
    }

    // Applique une modification en mémoire puis l'écrit ; annule la modification si l'écriture échoue.
    transaction(types, mutate) {
        const snapshots = types.map((type) => [type, { ...this[type] }]);
        try {
            const result = mutate();
            types.forEach((type) => this.saveData(type));
            return result;
        } catch (error) {
            snapshots.forEach(([type, snapshot]) => { this[type] = snapshot; });
            throw error;
        }
    }

    // --- Utilisateurs ----------------------------------------------------------------------------
    getUser(userId) {
        if (typeof userId !== 'string') return null;
        return Object.prototype.hasOwnProperty.call(this.users, userId) ? this.users[userId] : null;
    }

    setUser(userId, userData) {
        this.transaction(['users'], () => { this.users[userId] = userData; });
    }

    getAllUsers() {
        return Object.values(this.users);
    }

    deleteUser(userId) {
        this.transaction(['users'], () => { delete this.users[userId]; });
    }

    // Suppression définitive d'un compte et de tous ses scores. Retourne le nombre de scores supprimés.
    deleteUserAndScores(userId) {
        return this.transaction(['users', 'scores'], () => {
            let removed = 0;
            for (const [scoreId, score] of Object.entries(this.scores)) {
                if (score.userId === userId) {
                    delete this.scores[scoreId];
                    removed++;
                }
            }
            delete this.users[userId];
            return removed;
        });
    }

    // --- Scores ----------------------------------------------------------------------------------
    getScore(scoreId) {
        if (typeof scoreId !== 'string') return null;
        return Object.prototype.hasOwnProperty.call(this.scores, scoreId) ? this.scores[scoreId] : null;
    }

    setScore(scoreId, scoreData) {
        this.transaction(['scores'], () => { this.scores[scoreId] = scoreData; });
    }

    getAllScores() {
        return Object.values(this.scores);
    }

    getScoresByUser(userId) {
        return this.getAllScores().filter((score) => score.userId === userId);
    }

    deleteScore(scoreId) {
        this.transaction(['scores'], () => { delete this.scores[scoreId]; });
    }

    // Met à jour plusieurs scores en une seule écriture (ex. renommage d'un joueur).
    updateScoresByUser(userId, patch) {
        this.transaction(['scores'], () => {
            for (const [scoreId, score] of Object.entries(this.scores)) {
                if (score.userId === userId) this.scores[scoreId] = { ...score, ...patch };
            }
        });
    }

    // --- Statistiques ----------------------------------------------------------------------------
    computeUserStats(userId) {
        const scores = this.getScoresByUser(userId);
        const gamesPlayed = scores.length;
        const totalScore = round1(scores.reduce((sum, s) => sum + toFiniteNumber(s.score), 0));
        const bestScore = scores.reduce((best, s) => Math.max(best, toFiniteNumber(s.score)), 0);
        return {
            gamesPlayed,
            bestScore: round1(bestScore),
            totalScore,
            averageScore: gamesPlayed > 0 ? round1(totalScore / gamesPlayed) : 0,
        };
    }

    // Recalcule les agrégats d'un utilisateur à partir de ses scores réels et les enregistre.
    recomputeUserStats(userId) {
        const user = this.getUser(userId);
        if (!user) return null;
        const stats = this.computeUserStats(userId);
        this.setUser(userId, {
            ...user,
            gamesPlayed: stats.gamesPlayed,
            bestScore: stats.bestScore,
            totalScore: stats.totalScore,
        });
        return stats;
    }

    // --- Migration des anciennes données ---------------------------------------------------------
    // 1. purge des comptes "désactivés" par l'ancienne suppression logique (l'utilisateur avait demandé la suppression) ;
    // 2. conversion des anciens scores en points vers la note /20 (ancienne valeur conservée dans legacyScore) ;
    // 3. recalcul des statistiques de chaque utilisateur à partir de ses scores réels.
    migrate() {
        let usersChanged = false;
        let scoresChanged = false;

        const inactiveIds = new Set(
            Object.values(this.users).filter((u) => u.isActive === false).map((u) => u.id)
        );
        if (inactiveIds.size > 0) {
            for (const id of inactiveIds) delete this.users[id];
            for (const [scoreId, score] of Object.entries(this.scores)) {
                if (inactiveIds.has(score.userId)) delete this.scores[scoreId];
            }
            usersChanged = true;
            scoresChanged = true;
            console.log(`🧹 ${inactiveIds.size} compte(s) supprimé(s) par l'utilisateur purgé(s) définitivement.`);
        }

        const legacy = Object.entries(this.scores).filter(([, s]) => s.scoreVersion !== SCORE_VERSION);
        if (legacy.length > 0) {
            // Sauvegarde des scores avant conversion (après la purge ci-dessus).
            const backupPath = `${this.getFilePath('scores')}.bak-v1-${timestamp()}`;
            this.writeFileAtomic(backupPath, this.scores);

            for (const [scoreId, score] of legacy) {
                const duration = Math.max(0, Math.round(toFiniteNumber(score.duration)));
                const errors = Math.max(0, Math.round(toFiniteNumber(score.errors)));
                const hints = Math.max(0, Math.round(toFiniteNumber(score.hints)));
                const breakdown = computeScoreBreakdown({ totalTime: duration, errors, hints });
                const { rank, ...rest } = score;
                this.scores[scoreId] = {
                    ...rest,
                    id: score.id || scoreId,
                    teamName: score.teamName ?? (typeof score.gameData?.teamName === 'string' ? score.gameData.teamName.slice(0, 50) : null),
                    duration,
                    errors,
                    hints,
                    roomsCompleted: Math.max(0, Math.round(toFiniteNumber(score.roomsCompleted))),
                    completed: score.completed === true,
                    legacyScore: score.score,
                    score: breakdown.total,
                    timeScore: breakdown.timeScore,
                    errorScore: breakdown.errorScore,
                    hintScore: breakdown.hintScore,
                    scoreVersion: SCORE_VERSION,
                };
            }
            scoresChanged = true;
            console.log(`🔁 ${legacy.length} ancien(s) score(s) converti(s) en note /20 (sauvegarde : ${backupPath}).`);
        }

        for (const user of Object.values(this.users)) {
            const stats = this.computeUserStats(user.id);
            if (user.gamesPlayed !== stats.gamesPlayed
                || user.bestScore !== stats.bestScore
                || user.totalScore !== stats.totalScore) {
                user.gamesPlayed = stats.gamesPlayed;
                user.bestScore = stats.bestScore;
                user.totalScore = stats.totalScore;
                usersChanged = true;
            }
        }

        if (usersChanged) this.saveData('users');
        if (scoresChanged) this.saveData('scores');
    }

    saveAll() {
        this.saveData('users');
        this.saveData('scores');
    }
}

// Instance singleton
const dataStore = new DataStore();

module.exports = dataStore;
module.exports.DataStore = DataStore;
module.exports.SCORE_VERSION = SCORE_VERSION;
