// Système de notation sur 20 (source unique de vérité côté front).
// La même formule est dupliquée côté serveur dans back/utils/scoring.js : garder les deux synchronisés.

// Durée de la mission : le compte à rebours affiché part de MISSION_DURATION
export const MISSION_DURATION = 60 * 60; // 60 minutes (en secondes)

// Rapidité : note pleine jusqu'à TIME_FULL_SCORE, puis décroissance linéaire jusqu'à 0 à MISSION_DURATION
export const TIME_FULL_SCORE = 20 * 60; // 20 minutes (en secondes)

export const PENALTY_PER_ERROR = 30; // Secondes ajoutées au temps par erreur
export const PENALTY_PER_HINT = 1; // Points retirés par indice
export const ERROR_POINT_PENALTY = 0.5; // Points retirés par erreur

export const MAX_TIME_SCORE = 8;
export const MAX_ERROR_SCORE = 7;
export const MAX_HINT_SCORE = 5;
export const MAX_SCORE = MAX_TIME_SCORE + MAX_ERROR_SCORE + MAX_HINT_SCORE; // 20

const round = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

// totalTime : temps réel + pénalités, en secondes
export const computeTimeScore = (totalTime) => {
  const t = Math.max(0, Number(totalTime) || 0);
  if (t <= TIME_FULL_SCORE) return MAX_TIME_SCORE;
  const ratio = (MISSION_DURATION - t) / (MISSION_DURATION - TIME_FULL_SCORE);
  return Math.max(0, MAX_TIME_SCORE * ratio);
};

export const computeErrorScore = (errors) =>
  Math.max(0, MAX_ERROR_SCORE - Math.max(0, Number(errors) || 0) * ERROR_POINT_PENALTY);

export const computeHintScore = (hints) =>
  Math.max(0, MAX_HINT_SCORE - Math.max(0, Number(hints) || 0) * PENALTY_PER_HINT);

// Détail complet de la note : { timeScore, errorScore, hintScore, total }
// total est arrondi à 1 décimale, les sous-notes à 2 décimales.
export const computeScoreBreakdown = ({ totalTime, errors, hints }) => {
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

// Barème d'appréciation (docs/SYSTEME_NOTATION.md)
export const getAppreciation = (score) => {
  if (score >= 18) return { label: "EXCELLENT", emoji: "🏆", message: "Performance exceptionnelle ! Experts en cybersécurité médicale" };
  if (score >= 16) return { label: "TRÈS BIEN", emoji: "🌟", message: "Excellente maîtrise ! Protection efficace des données" };
  if (score >= 14) return { label: "BIEN", emoji: "✨", message: "Bonne performance ! Solides compétences" };
  if (score >= 12) return { label: "ASSEZ BIEN", emoji: "👍", message: "Travail satisfaisant. Continuez à vous améliorer !" };
  if (score >= 10) return { label: "PASSABLE", emoji: "💪", message: "Résultat correct. Vous pouvez faire mieux" };
  return { label: "À AMÉLIORER", emoji: "📚", message: "Place à l'amélioration. Retentez l'expérience !" };
};
