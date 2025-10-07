module.exports = {
    // Configuration du serveur
    server: {
        port: process.env.PORT || 3001,
        env: process.env.NODE_ENV || 'development',
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }
    },

    // Configuration de sécurité
    security: {
        jwtSecret: process.env.JWT_SECRET || 'escape-game-super-secret-key',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
        sessionSecret: process.env.SESSION_SECRET || 'session-super-secret-key',
        sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000 // 24h
    },

    // Configuration du rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },

    // Configuration des logs
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
    },

    // Configuration de la base de données (pour future implémentation)
    database: {
        url: process.env.DATABASE_URL || 'mongodb://localhost:27017/escape-game',
        redis: process.env.REDIS_URL || 'redis://localhost:6379'
    },

    // Configuration du jeu
    game: {
        maxPlayersPerTeam: 6,
        maxTeams: 100,
        roomOrder: ['server', 'dna-lab', 'imaging', 'heart'],
        penaltyPerError: 10, // secondes
        maxHintsPerRoom: 3
    }
};
