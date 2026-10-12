const jwt = require('jsonwebtoken');
const config = require('../config');
const dataStore = require('../storage/dataStore');

const JWT_SECRET = config.security.jwtSecret;
const JWT_ALGORITHM = 'HS256';

// Codes renvoyés au front : seuls ces cas signifient "session invalide, reconnectez-vous".
const AUTH_CODES = {
    TOKEN_MISSING: 'TOKEN_MISSING',
    TOKEN_INVALID: 'TOKEN_INVALID',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
};

/**
 * Génère un JWT pour un utilisateur. `tv` (version du jeton) permet d'invalider
 * les anciens jetons après un changement de mot de passe.
 */
const signToken = (user) => jwt.sign(
    { userId: user.id, username: user.username, tv: user.tokenVersion || 0 },
    JWT_SECRET,
    { expiresIn: config.security.jwtExpiresIn, algorithm: JWT_ALGORITHM }
);

const extractToken = (req) => {
    const header = req.headers.authorization;
    if (typeof header !== 'string') return null;
    const [scheme, token] = header.trim().split(/\s+/);
    return scheme && /^bearer$/i.test(scheme) && token ? token : null;
};

/**
 * Middleware d'authentification : vérifie le JWT du header Authorization et que le compte existe encore.
 * Remplit req.user ({ userId, username }) et req.currentUser (enregistrement complet).
 */
const authenticateToken = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: "Token d'accès requis", code: AUTH_CODES.TOKEN_MISSING });
    }

    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expirée', code: AUTH_CODES.TOKEN_EXPIRED });
        }
        return res.status(401).json({ error: 'Token invalide', code: AUTH_CODES.TOKEN_INVALID });
    }

    const user = dataStore.getUser(payload.userId);
    if (!user || user.isActive === false) {
        return res.status(401).json({ error: 'Utilisateur non trouvé ou supprimé', code: AUTH_CODES.USER_NOT_FOUND });
    }
    if ((payload.tv || 0) !== (user.tokenVersion || 0)) {
        return res.status(401).json({ error: 'Session expirée', code: AUTH_CODES.TOKEN_EXPIRED });
    }

    // Le nom d'utilisateur vient du stockage (il a pu changer depuis l'émission du jeton).
    req.user = { userId: user.id, username: user.username };
    req.currentUser = user;
    next();
};

module.exports = {
    authenticateToken,
    signToken,
    AUTH_CODES,
};
