// Configuration centralisée du serveur.
// Ce module charge les variables d'environnement (une seule fois) puis expose des valeurs typées.
// Tout le backend (main.js, middleware, routes, stockage) lit sa configuration ici.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Chargement des fichiers d'environnement -------------------------------------------------
// 1. back/.env (local, non commité) s'il existe ;
// 2. back/config.env (valeurs de développement commitées), uniquement hors production.
// dotenv ne remplace jamais une variable déjà définie : l'environnement du conteneur reste prioritaire.
const dotenv = require('dotenv');
const localEnv = path.resolve(__dirname, '.env');
if (fs.existsSync(localEnv)) {
    dotenv.config({ path: localEnv });
}
if (process.env.NODE_ENV !== 'production') {
    const devEnv = path.resolve(__dirname, 'config.env');
    if (fs.existsSync(devEnv)) {
        dotenv.config({ path: devEnv });
    }
}

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

// --- Helpers de parsing ------------------------------------------------------------------------
const readInt = (name, fallback, { min = -Infinity, max = Infinity } = {}) => {
    const raw = process.env[name];
    if (raw === undefined || String(raw).trim() === '') return fallback;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < min || value > max) {
        console.warn(`⚠️  ${name}="${raw}" invalide, valeur par défaut utilisée (${fallback}).`);
        return fallback;
    }
    return value;
};

const readList = (...names) => names
    .flatMap((name) => String(process.env[name] || '').split(','))
    .map((item) => item.trim())
    .filter(Boolean);

// Valeur express "trust proxy" : false/true, nombre de proxies, ou liste d'adresses / sous-réseaux.
const parseTrustProxy = (raw, fallback) => {
    if (raw === undefined || String(raw).trim() === '') return fallback;
    const value = String(raw).trim();
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^\d+$/.test(value)) return Number(value);
    return value;
};

// "24h", "7d", "3600" (secondes). Une chaîne purement numérique serait lue en millisecondes par jsonwebtoken.
const parseExpiresIn = (raw, fallback) => {
    if (raw === undefined || String(raw).trim() === '') return fallback;
    const value = String(raw).trim();
    return /^\d+$/.test(value) ? Number(value) : value;
};

// --- Secret JWT ----------------------------------------------------------------------------------
// Secret de développement : connu de tous, il n'est accepté qu'en dehors de la production.
const DEV_JWT_SECRET = 'escape-game-dev-secret-not-for-production';
// Valeurs publiées dans le dépôt (anciennes versions incluses) : jamais acceptées en production.
const KNOWN_PUBLIC_SECRETS = new Set([
    DEV_JWT_SECRET,
    'escape-game-super-secret-key-change-in-production',
    'escape-game-super-secret-key',
    'session-super-secret-key',
    'change-me',
    'changeme',
    'secret',
]);

const resolveJwtSecret = () => {
    const raw = String(process.env.JWT_SECRET || '').trim();

    if (raw && !KNOWN_PUBLIC_SECRETS.has(raw)) {
        if (raw.length < 32) {
            console.warn('⚠️  JWT_SECRET est court (< 32 caractères) : utilisez par exemple `openssl rand -hex 32`.');
        }
        return { secret: raw, source: 'env' };
    }

    if (!isProduction) {
        return { secret: raw || DEV_JWT_SECRET, source: 'dev-default' };
    }

    // Production sans secret valable : on ne signe JAMAIS avec une valeur publique.
    const banner = '!'.repeat(78);
    console.error(banner);
    console.error(raw
        ? '!!  JWT_SECRET correspond à une valeur publique du dépôt : elle est IGNORÉE.'
        : '!!  JWT_SECRET n\'est pas défini en production.');
    console.error('!!  Un secret aléatoire est généré pour ce processus : les sessions seront');
    console.error('!!  invalidées à chaque redémarrage. Définissez JWT_SECRET (openssl rand -hex 32).');
    console.error(banner);
    return { secret: crypto.randomBytes(48).toString('hex'), source: 'random' };
};

const jwt = resolveJwtSecret();

// --- Configuration exportée ----------------------------------------------------------------------
const config = {
    env,
    isProduction,

    server: {
        port: readInt('PORT', 3001, { min: 1, max: 65535 }),
        host: process.env.HOST || '0.0.0.0',
        // Derrière nginx (et éventuellement Traefik/Ingress), req.ip doit venir de X-Forwarded-For.
        trustProxy: parseTrustProxy(process.env.TRUST_PROXY, isProduction ? 1 : false),
        jsonLimit: '100kb',
    },

    cors: {
        // CORS_ORIGIN (liste séparée par des virgules) et FRONTEND_URL sont cumulés. "*" autorise toutes les origines.
        origins: readList('CORS_ORIGIN', 'FRONTEND_URL'),
        // En développement, toute origine localhost / réseau privé (LAN de la classe) est acceptée.
        allowPrivateNetwork: !isProduction,
    },

    security: {
        jwtSecret: jwt.secret,
        jwtSecretSource: jwt.source,
        jwtExpiresIn: parseExpiresIn(process.env.JWT_EXPIRES_IN, '24h'),
        bcryptRounds: readInt('BCRYPT_ROUNDS', 10, { min: 4, max: 15 }),
    },

    rateLimit: {
        windowMs: readInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000, { min: 1000 }),
        // Toute une classe peut partager une seule IP publique : limite globale large.
        maxRequests: readInt('RATE_LIMIT_MAX_REQUESTS', 1000, { min: 1 }),
        // Limite stricte sur /auth/login et /auth/register (seuls les échecs sont comptés).
        authMaxFailures: readInt('AUTH_RATE_LIMIT_MAX', 50, { min: 1 }),
    },

    storage: {
        // Chemin absolu, ou relatif au dossier back/.
        dataDir: path.resolve(__dirname, String(process.env.DATA_DIR || '').trim() || 'data'),
    },

    logging: {
        format: isProduction ? 'combined' : 'dev',
    },
};

module.exports = config;
