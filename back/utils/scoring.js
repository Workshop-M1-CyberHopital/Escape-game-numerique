// Système de notation sur 20 (copie serveur de front/src/utils/scoring.js : garder les deux synchronisés).
// Le serveur recalcule la note à partir de la durée, des erreurs et des indices au lieu de faire
// confiance à la note envoyée par le client.

const MISSION_DURATION = 60 * 60; // 60 minutes (en secondes)
const TIME_FULL_SCORE = 20 * 60; // 20 minutes (en secondes)

const PENALTY_PER_HINT = 1;
const ERROR_POINT_PENALTY = 0.5;

const MAX_TIME_SCORE = 8;
const MAX_ERROR_SCORE = 7;
const MAX_HINT_SCORE = 5;
const MAX_SCORE = MAX_TIME_SCORE + MAX_ERROR_SCORE + MAX_HINT_SCORE; // 20

const round = (value, decimals) => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

// totalTime : temps réel + pénalités, en secondes
const computeTimeScore = (totalTime) => {
    const t = Math.max(0, Number(totalTime) || 0);
    if (t <= TIME_FULL_SCORE) return MAX_TIME_SCORE;
    const ratio = (MISSION_DURATION - t) / (MISSION_DURATION - TIME_FULL_SCORE);
    return Math.max(0, MAX_TIME_SCORE * ratio);
};

const computeErrorScore = (errors) =>
    Math.max(0, MAX_ERROR_SCORE - Math.max(0, Number(errors) || 0) * ERROR_POINT_PENALTY);

const computeHintScore = (hints) =>
    Math.max(0, MAX_HINT_SCORE - Math.max(0, Number(hints) || 0) * PENALTY_PER_HINT);

const computeScoreBreakdown = ({ totalTime, errors, hints }) => {
    const timeScore = computeTimeScore(totalTime);
    const errorScore = computeErrorScore(errors);
    const hintScore = computeHintScore(hints);
    const total = Math.min(MAX_SCORE, Math.max(0, timeScore + errorScore + hintScore));

    return {
        timeScore: round(timeScore, 2),
        errorScore: round(errorScore, 2),
        hintScore: round(hintScore, 2),
        total: round(total, 1),
    };
};

module.exports = {
    MISSION_DURATION,
    TIME_FULL_SCORE,
    MAX_SCORE,
    computeScoreBreakdown,
};
