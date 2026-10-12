// Formes renvoyées par l'API et comparateurs de tri partagés par les routes.

const round1 = (value) => Math.round((Number(value) || 0) * 10) / 10;

// Horodatage numérique robuste (Date, chaîne ISO ou valeur invalide => 0).
const toTime = (value) => {
    if (value instanceof Date) return value.getTime() || 0;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
};

// Utilisateur tel que renvoyé au propriétaire du compte (jamais le hash du mot de passe).
const toPublicUser = (user) => {
    if (!user) return null;
    const gamesPlayed = Number(user.gamesPlayed) || 0;
    const totalScore = round1(user.totalScore);
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        teamName: user.teamName || null,
        createdAt: user.createdAt || null,
        lastLogin: user.lastLogin || null,
        updatedAt: user.updatedAt || null,
        gamesPlayed,
        bestScore: round1(user.bestScore),
        totalScore,
        averageScore: gamesPlayed > 0 ? round1(totalScore / gamesPlayed) : 0,
    };
};

// Score affiché publiquement (classements) : ni userId, ni gameData (prénoms des joueurs).
const toPublicScore = (score, extra = {}) => ({
    id: score.id,
    username: score.username,
    teamName: score.teamName || null,
    score: Number(score.score) || 0,
    duration: Number(score.duration) || 0,
    roomsCompleted: Number(score.roomsCompleted) || 0,
    errors: Number(score.errors) || 0,
    hints: Number(score.hints) || 0,
    completed: score.completed === true,
    submittedAt: score.submittedAt || null,
    ...extra,
});

// Score renvoyé à son propriétaire : détail complet.
const toOwnScore = (score, extra = {}) => {
    const { legacyScore, scoreVersion, ...rest } = score;
    return { ...rest, ...extra };
};

// Tri : note décroissante puis durée croissante (puis le plus ancien d'abord à égalité).
const byScore = (a, b) => (b.score - a.score)
    || (a.duration - b.duration)
    || (toTime(a.submittedAt) - toTime(b.submittedAt));
const byDuration = (a, b) => (a.duration - b.duration) || (b.score - a.score);
const byDateDesc = (a, b) => toTime(b.submittedAt) - toTime(a.submittedAt);
const byRooms = (a, b) => (b.roomsCompleted - a.roomsCompleted) || byScore(a, b);

const SCORE_SORTERS = {
    score: byScore,
    duration: byDuration,
    date: byDateDesc,
    rooms: byRooms,
};

module.exports = {
    round1,
    toTime,
    toPublicUser,
    toPublicScore,
    toOwnScore,
    byScore,
    byDuration,
    byDateDesc,
    byRooms,
    SCORE_SORTERS,
};
