// Charge les variables d'environnement et la configuration avant tout le reste.
const config = require('./config');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Derrière nginx / un Ingress, req.ip (rate limiting, logs) doit refléter le vrai client.
app.set('trust proxy', config.server.trustProxy);

// Middleware de sécurité
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// --- CORS ----------------------------------------------------------------------------------------
// En production, le front appelle /api sur la même origine (proxy nginx) : CORS n'est utile que pour
// les origines listées dans CORS_ORIGIN / FRONTEND_URL. En développement, localhost et le LAN sont acceptés.
const normalizeOrigin = (value) => {
    try {
        return new URL(value).origin;
    } catch {
        return null;
    }
};

const allowAnyOrigin = config.cors.origins.includes('*');
const allowedOrigins = new Set(config.cors.origins.map(normalizeOrigin).filter(Boolean));

const PRIVATE_HOST = /^(localhost|127(?:\.\d{1,3}){3}|\[::1\]|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|169\.254(?:\.\d{1,3}){2}|[a-z0-9-]+\.local|[a-z0-9.-]+\.localhost)$/i;

const isOriginAllowed = (origin) => {
    if (allowAnyOrigin) return true;
    const normalized = normalizeOrigin(origin);
    if (!normalized) return false;
    if (allowedOrigins.has(normalized)) return true;
    if (config.cors.allowPrivateNetwork) {
        const { protocol, hostname } = new URL(normalized);
        return (protocol === 'http:' || protocol === 'https:') && PRIVATE_HOST.test(hostname);
    }
    return false;
};

app.use(cors({
    // Pas d'en-tête Origin (curl, même origine en GET) : rien à autoriser.
    origin: (origin, callback) => callback(null, !origin || isOriginAllowed(origin)),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    maxAge: 600,
    optionsSuccessStatus: 204
}));

// Compression des réponses
app.use(compression());

// Logging des requêtes (sans corps de requête ; les sondes de santé ne sont pas journalisées en production)
app.use(morgan(config.logging.format, {
    skip: (req) => config.isProduction && req.originalUrl === '/api/health',
}));

// --- Rate limiting -------------------------------------------------------------------------------
// Limite globale large (une classe entière peut partager une IP), limite stricte sur les échecs de connexion.
const rateLimitMessage = (message) => ({ error: 'Trop de requêtes', message, code: 'RATE_LIMITED' });

const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.maxRequests,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => req.path === '/health',
    message: rateLimitMessage('Trop de requêtes depuis cette adresse, réessayez dans quelques minutes.')
});

const authLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.authMaxFailures,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: rateLimitMessage('Trop de tentatives de connexion échouées, réessayez dans quelques minutes.')
});

app.use('/api/', apiLimiter);
app.use(['/api/auth/login', '/api/auth/register'], authLimiter);

// Parser JSON (corps limités : seul le score et ses détails transitent)
app.use(express.json({ limit: config.server.jsonLimit }));

// Routes de l'API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/scores', require('./routes/scores'));

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0'
    });
});

// Route racine
app.get('/', (req, res) => {
    res.json({
        message: 'Escape Game Cyber-Hôpital API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            users: '/api/users',
            scores: '/api/scores'
        }
    });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint non trouvé',
        path: req.originalUrl,
        method: req.method
    });
});

// Gestionnaire d'erreurs global
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON invalide', message: 'Le corps de la requête n\'est pas un JSON valide.', code: 'INVALID_JSON' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Requête trop volumineuse', message: 'Les données envoyées sont trop volumineuses.', code: 'PAYLOAD_TOO_LARGE' });
    }

    console.error('Erreur serveur:', err.message);
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
    const publicMessage = status >= 500 ? 'Erreur interne du serveur' : 'Requête invalide';
    res.status(status).json({
        error: publicMessage,
        ...(!config.isProduction && { details: err.message })
    });
});

// Démarrage du serveur (uniquement si lancé directement : `node main.js`, nodemon)
if (require.main === module) {
    const dataStore = require('./storage/dataStore');
    const server = app.listen(config.server.port, config.server.host, () => {
        const corsSummary = allowAnyOrigin
            ? 'toutes origines'
            : [...allowedOrigins].join(', ') || (config.cors.allowPrivateNetwork ? '(aucune liste)' : 'même origine uniquement');
        console.log(`🚀 Serveur Escape Game démarré sur le port ${config.server.port}`);
        console.log(`📊 Environnement: ${config.env}`);
        console.log(`🌐 URL: http://${config.server.host}:${config.server.port}`);
        console.log(`📋 Health check: http://${config.server.host}:${config.server.port}/api/health`);
        console.log(`💾 Données: ${dataStore.dataDir}`);
        console.log(`🔐 CORS: ${corsSummary}${config.cors.allowPrivateNetwork ? ' + localhost/LAN (développement)' : ''}`);
        console.log(`🛡️  Trust proxy: ${JSON.stringify(config.server.trustProxy)} | Rate limit: ${config.rateLimit.maxRequests} req / ${Math.round(config.rateLimit.windowMs / 60000)} min`);
        if (config.security.jwtSecretSource === 'dev-default') {
            console.log('🔑 JWT: secret de développement (définissez JWT_SECRET hors développement)');
        }
    });

    const shutdown = (signal) => {
        console.log(`🛑 Signal ${signal} reçu, arrêt gracieux...`);
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(0), 5000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
