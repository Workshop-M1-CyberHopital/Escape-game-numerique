const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
// Charger la configuration
require('dotenv').config({ path: './config.env' });

// Initialiser les données au démarrage
const { execSync } = require('child_process');
try {
    execSync('node scripts/init-data.js', { stdio: 'inherit' });
} catch (error) {
    console.log('⚠️  Initialisation des données ignorée (déjà fait)');
}

const app = express();
const PORT = process.env.PORT || 3001;

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

// Middleware CORS pour le frontend
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173', // Vite dev server
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 200
}));

// Compression des réponses
app.use(compression());

// Logging des requêtes
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite à 100 requêtes par IP par fenêtre
    message: {
        error: 'Trop de requêtes, veuillez réessayer plus tard.'
    }
});
app.use('/api/', limiter);

// Middleware pour gérer les requêtes OPTIONS (preflight)
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Erreur interne du serveur' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur Escape Game démarré sur le port ${PORT}`);
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
    console.log('🛑 Signal SIGTERM reçu, arrêt gracieux...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Signal SIGINT reçu, arrêt gracieux...');
    process.exit(0);
});

module.exports = app;
