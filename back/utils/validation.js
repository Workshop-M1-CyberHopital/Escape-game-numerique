// Validation et normalisation des entrées (aucune valeur client n'est utilisée telle quelle).

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
const CONTROL_CHARS_ALL = /[\u0000-\u001F\u007F]/g;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const USERNAME_MIN = 2;
const USERNAME_MAX = 30;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 128;
const TEAM_NAME_MAX = 50;

// Résultat : { value } si valide, { error } sinon.
const ok = (value) => ({ value });
const fail = (error) => ({ error });

const collapseSpaces = (value) => value.replace(/\s+/g, ' ').trim();

const normalizeEmail = (raw) => {
    if (typeof raw !== 'string') return fail('L\'email est requis.');
    const email = raw.trim().toLowerCase();
    if (!email) return fail('L\'email est requis.');
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) return fail('L\'adresse email n\'est pas valide.');
    return ok(email);
};

const normalizeUsername = (raw) => {
    if (typeof raw !== 'string') return fail('Le nom d\'utilisateur est requis.');
    const username = collapseSpaces(raw);
    if (!username) return fail('Le nom d\'utilisateur est requis.');
    if (CONTROL_CHARS.test(username)) return fail('Le nom d\'utilisateur contient des caractères invalides.');
    if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
        return fail(`Le nom d'utilisateur doit contenir entre ${USERNAME_MIN} et ${USERNAME_MAX} caractères.`);
    }
    return ok(username);
};

// Nom d'équipe facultatif : null/'' => null. Tronqué à 50 caractères.
const normalizeTeamName = (raw) => {
    if (raw === undefined || raw === null) return ok(null);
    if (typeof raw !== 'string') return fail('Le nom d\'équipe doit être un texte.');
    const teamName = collapseSpaces(raw.replace(CONTROL_CHARS_ALL, ' ')).slice(0, TEAM_NAME_MAX).trim();
    return ok(teamName || null);
};

// Nouveau mot de passe (inscription / changement).
const validateNewPassword = (raw) => {
    if (typeof raw !== 'string' || raw.length === 0) return fail('Le mot de passe est requis.');
    if (raw.length < PASSWORD_MIN) return fail(`Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères.`);
    if (raw.length > PASSWORD_MAX) return fail(`Le mot de passe ne doit pas dépasser ${PASSWORD_MAX} caractères.`);
    return ok(raw);
};

// Mot de passe saisi pour vérification (connexion, confirmation).
const validatePasswordInput = (raw, message = 'Le mot de passe est requis.') => {
    if (typeof raw !== 'string' || raw.length === 0) return fail(message);
    if (raw.length > 1024) return fail('Mot de passe invalide.');
    return ok(raw);
};

// Entier dans [min, max] ; les décimaux sont arrondis. undefined => valeur par défaut (si fournie).
const parseBoundedInt = (raw, { min, max, fallback, label }) => {
    if (raw === undefined || raw === null) {
        if (fallback !== undefined) return ok(fallback);
        return fail(`${label} : valeur requise.`);
    }
    if (typeof raw !== 'number' || !Number.isFinite(raw)) return fail(`${label} : un nombre est attendu.`);
    const value = Math.round(raw);
    if (value < min || value > max) return fail(`${label} : valeur attendue entre ${min} et ${max}.`);
    return ok(value);
};

// Pagination des listes publiques : limit dans [1, maxLimit], offset >= 0.
const parsePagination = (query, { defaultLimit = 10, maxLimit = 100 } = {}) => {
    const toInt = (value, fallback) => {
        const n = Number.parseInt(Array.isArray(value) ? value[0] : value, 10);
        return Number.isFinite(n) ? n : fallback;
    };
    const limit = Math.min(maxLimit, Math.max(1, toInt(query.limit, defaultLimit)));
    const offset = Math.max(0, toInt(query.offset, 0));
    return { limit, offset };
};

const queryString = (value, fallback) => {
    const v = Array.isArray(value) ? value[0] : value;
    return typeof v === 'string' && v.trim() ? v.trim() : fallback;
};

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

module.exports = {
    USERNAME_MIN,
    USERNAME_MAX,
    PASSWORD_MIN,
    PASSWORD_MAX,
    TEAM_NAME_MAX,
    normalizeEmail,
    normalizeUsername,
    normalizeTeamName,
    validateNewPassword,
    validatePasswordInput,
    parseBoundedInt,
    parsePagination,
    queryString,
    isPlainObject,
};
