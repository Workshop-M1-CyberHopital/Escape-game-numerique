import { reactive } from "vue";
import { ROOM_IDS, getNextRoomId } from "../config/roomsConfig";
import {
  computeScoreBreakdown,
  MISSION_DURATION,
  PENALTY_PER_ERROR,
  PENALTY_PER_HINT,
  MAX_SCORE,
} from "../utils/scoring";

export { ROOM_IDS, getNextRoomId };

// Constantes du système de notation (source unique : utils/scoring.js)
export { MISSION_DURATION, PENALTY_PER_ERROR, PENALTY_PER_HINT, MAX_SCORE };

// Sauvegarde locale de la partie en cours
export const SAVE_KEY = "cyberhopital:save:v1";
const SAVE_VERSION = 1;
const SAVE_MAX_AGE_MS = 12 * 60 * 60 * 1000; // une sauvegarde plus vieille que 12 h est ignorée

// Liste exhaustive de tous les briefings
const INITIAL_BRIEFINGS_SHOWN = {
  audio: false,
  serverRoom: false,
  dnaRoom: false,
  imagingRoom: false,
  heartRoom: false,
  prosthesisRoom: false,
  pathologyRoom: false,
  auditionRoom: false,
  eyeRoom: false,
  finalRoom: false,
  finishServerRoom: false,
  finishDNARoom: false,
  finishImagingRoom: false,
  finishHeartRoom: false,
  finishProsthesisRoom: false,
  finishPathologyRoom: false,
  finishAuditionRoom: false,
  finishEyeRoom: false,
  finishFinalRoom: false,
};

// Identifiant stable d'une partie (conservé dans la sauvegarde, contrairement à startTime qui est
// recalculé à la reprise) : les salles y rattachent leur progression locale (étapes résolues…).
const createGameId = () => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // randomUUID indisponible (page servie en http hors localhost) : repli ci-dessous
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;
};

const isValidGameId = (value) => typeof value === "string" && /^[A-Za-z0-9-]{8,64}$/.test(value);

// Valeurs initiales des champs propres à une partie
const createInitialFields = () => ({
  gameId: null,
  isGameStarted: false,
  isGameOver: false,
  teamName: "",
  players: [],
  currentRoom: null,
  unlockedRooms: [ROOM_IDS[0]], // Salle du serveur débloquée par défaut
  startTime: null,
  timer: 0,
  // Système de notation
  errors: 0,
  penaltyTime: 0,
  roomErrors: {},
  hintsUsed: 0,
  roomHints: {}, // nombre d'indices déjà payés par salle
  roomTimes: {}, // temps cumulé (s) passé dans chaque salle
  roomStartTime: null,
  completedRooms: [],
  finalScore: null,
  devToolsUsed: false,
  // États des briefings
  briefingsShown: { ...INITIAL_BRIEFINGS_SHOWN },
});

// État global du jeu
export const gameState = reactive(createInitialFields());

const applyInitialFields = () => {
  Object.assign(gameState, createInitialFields());
};

// --- Persistance (localStorage) -------------------------------------------

const getStorage = () => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

const elapsedSeconds = (since) =>
  since ? Math.max(0, Math.floor((Date.now() - since) / 1000)) : 0;

const saveGame = () => {
  if (!gameState.isGameStarted || gameState.isGameOver) return;
  try {
    const storage = getStorage();
    if (!storage) return;

    const currentRoomSegment =
      gameState.currentRoom &&
      gameState.roomStartTime &&
      !gameState.completedRooms.includes(gameState.currentRoom)
        ? { roomId: gameState.currentRoom, seconds: elapsedSeconds(gameState.roomStartTime) }
        : null;

    const data = {
      version: SAVE_VERSION,
      savedAt: Date.now(),
      gameId: gameState.gameId,
      teamName: gameState.teamName,
      players: gameState.players,
      unlockedRooms: gameState.unlockedRooms,
      completedRooms: gameState.completedRooms,
      timer: gameState.startTime ? elapsedSeconds(gameState.startTime) : gameState.timer,
      errors: gameState.errors,
      penaltyTime: gameState.penaltyTime,
      roomErrors: gameState.roomErrors,
      hintsUsed: gameState.hintsUsed,
      roomHints: gameState.roomHints,
      roomTimes: gameState.roomTimes,
      currentRoomSegment,
      briefingsShown: gameState.briefingsShown,
      devToolsUsed: gameState.devToolsUsed,
    };
    storage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Stockage indisponible (navigation privée, quota dépassé…) : on continue sans sauvegarde
  }
};

export const clearSavedGame = () => {
  try {
    getStorage()?.removeItem(SAVE_KEY);
  } catch {
    // Ignorer : rien à nettoyer
  }
};

const toCount = (value, max = Number.MAX_SAFE_INTEGER) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.min(max, Math.floor(n)) : 0;
};

const sanitizeRoomList = (list) =>
  Array.isArray(list) ? ROOM_IDS.filter((id) => list.includes(id)) : [];

const sanitizeRoomCounts = (counts) => {
  const result = {};
  if (counts && typeof counts === "object") {
    ROOM_IDS.forEach((id) => {
      const n = toCount(counts[id]);
      if (n > 0) result[id] = n;
    });
  }
  return result;
};

const sanitizeBriefings = (briefings) => {
  const result = { ...INITIAL_BRIEFINGS_SHOWN };
  if (briefings && typeof briefings === "object") {
    Object.entries(briefings).forEach(([key, value]) => {
      if (value === true) result[key] = true;
    });
  }
  return result;
};

// --- Timer -------------------------------------------------------------------

let timerInterval = null;

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (gameState.startTime) {
      gameState.timer = elapsedSeconds(gameState.startTime);
    }
    saveGame();
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// Dernière chance de sauvegarder avant fermeture / mise en arrière-plan de l'onglet
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", saveGame);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveGame();
  });
}

// --- Actions -----------------------------------------------------------------

const unlockRoom = (roomId) => {
  if (roomId && ROOM_IDS.includes(roomId) && !gameState.unlockedRooms.includes(roomId)) {
    gameState.unlockedRooms.push(roomId);
    saveGame();
  }
};

const unlockNextRoom = (currentRoomId) => {
  const nextRoom = getNextRoomId(currentRoomId);
  if (nextRoom) {
    unlockRoom(nextRoom);
  }
  return nextRoom;
};

// Ajoute le temps passé depuis l'entrée dans la salle courante (temps cumulé sur toutes les visites)
const closeRoomSegment = () => {
  const roomId = gameState.currentRoom;
  if (roomId && gameState.roomStartTime) {
    gameState.roomTimes[roomId] =
      (gameState.roomTimes[roomId] || 0) + elapsedSeconds(gameState.roomStartTime);
  }
  gameState.roomStartTime = null;
};

const startGame = (teamData = {}) => {
  stopTimer();
  // Toujours repartir d'un état propre : rien ne fuit d'une partie précédente
  applyInitialFields();
  gameState.gameId = createGameId();
  gameState.isGameStarted = true;
  gameState.teamName = String(teamData.name || "").trim();
  gameState.players = Array.isArray(teamData.players) ? [...teamData.players] : [];
  gameState.startTime = Date.now();
  startTimer();
  saveGame();
};

const enterRoom = (roomId) => {
  // Clôturer le segment en cours (même s'il s'agit de la même salle) : aucun temps n'est perdu
  if (gameState.currentRoom) {
    closeRoomSegment();
  }
  gameState.currentRoom = roomId;
  gameState.roomStartTime = Date.now();
  saveGame();
};

const exitRoom = () => {
  closeRoomSegment();
  gameState.currentRoom = null;
  saveGame();
};

const unlockAllRooms = () => {
  gameState.unlockedRooms = [...ROOM_IDS];
  saveGame();
};

const resetGame = () => {
  stopTimer();
  applyInitialFields();
  clearSavedGame();
};

// Alias historique
const clearGameState = resetGame;

// Restaure une partie sauvegardée (reprise sur la sélection des salles). Retourne true si une partie a été reprise.
const restoreSavedGame = () => {
  const storage = getStorage();
  if (!storage) return false;

  let raw = null;
  try {
    raw = storage.getItem(SAVE_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;

  try {
    const data = JSON.parse(raw);
    const now = Date.now();
    const isValid =
      data &&
      data.version === SAVE_VERSION &&
      typeof data.teamName === "string" &&
      data.teamName.trim() !== "" &&
      Number.isFinite(data.savedAt) &&
      now - data.savedAt < SAVE_MAX_AGE_MS &&
      data.savedAt <= now + 60 * 1000;
    if (!isValid) {
      clearSavedGame();
      return false;
    }

    stopTimer();
    applyInitialFields();

    const completedRooms = sanitizeRoomList(data.completedRooms);
    const unlocked = new Set([ROOM_IDS[0], ...sanitizeRoomList(data.unlockedRooms)]);
    completedRooms.forEach((id) => {
      unlocked.add(id);
      const next = getNextRoomId(id);
      if (next) unlocked.add(next);
    });

    const roomTimes = sanitizeRoomCounts(data.roomTimes);
    const segment = data.currentRoomSegment;
    if (segment && ROOM_IDS.includes(segment.roomId)) {
      roomTimes[segment.roomId] = (roomTimes[segment.roomId] || 0) + toCount(segment.seconds);
    }

    const timer = toCount(data.timer);

    // Sauvegarde antérieure à gameId : nouvel identifiant (la progression locale des salles est alors ignorée)
    gameState.gameId = isValidGameId(data.gameId) ? data.gameId : createGameId();
    gameState.teamName = data.teamName.trim();
    gameState.players = Array.isArray(data.players)
      ? data.players.filter((p) => typeof p === "string" && p.trim() !== "").slice(0, 12)
      : [];
    gameState.completedRooms = completedRooms;
    gameState.unlockedRooms = ROOM_IDS.filter((id) => unlocked.has(id));
    gameState.errors = toCount(data.errors);
    gameState.penaltyTime = toCount(data.penaltyTime);
    gameState.roomErrors = sanitizeRoomCounts(data.roomErrors);
    gameState.hintsUsed = toCount(data.hintsUsed);
    gameState.roomHints = sanitizeRoomCounts(data.roomHints);
    gameState.roomTimes = roomTimes;
    gameState.briefingsShown = sanitizeBriefings(data.briefingsShown);
    gameState.devToolsUsed = data.devToolsUsed === true;
    gameState.currentRoom = null;
    // Le temps passé onglet fermé n'est pas compté
    gameState.timer = timer;
    gameState.startTime = now - timer * 1000;
    gameState.isGameStarted = true;

    startTimer();
    saveGame();
    return true;
  } catch {
    clearSavedGame();
    applyInitialFields();
    return false;
  }
};

const formatTime = (seconds) => {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const addError = (roomId) => {
  if (!gameState.isGameStarted || gameState.isGameOver) return;
  gameState.errors++;
  gameState.penaltyTime += PENALTY_PER_ERROR;
  if (roomId) {
    gameState.roomErrors[roomId] = (gameState.roomErrors[roomId] || 0) + 1;
  }
  saveGame();
};

const addHint = (roomId) => {
  if (!gameState.isGameStarted || gameState.isGameOver) return;
  gameState.hintsUsed++;
  if (roomId) {
    gameState.roomHints[roomId] = (gameState.roomHints[roomId] || 0) + 1;
  }
  saveGame();
};

// Idempotent : enregistre la salle comme terminée, cumule son temps et débloque la salle suivante.
// Retourne true uniquement la première fois.
const completeRoom = (roomId) => {
  if (!roomId || !ROOM_IDS.includes(roomId)) return false;
  if (!gameState.isGameStarted || gameState.isGameOver) return false;
  if (gameState.completedRooms.includes(roomId)) return false;

  if (gameState.currentRoom === roomId) {
    closeRoomSegment();
  }
  gameState.completedRooms.push(roomId);
  unlockNextRoom(roomId);
  saveGame();
  return true;
};

const getTotalTime = () => {
  return gameState.timer + gameState.penaltyTime;
};

// Temps restant avant la fin du compte à rebours de la mission (peut être négatif)
const getRemainingTime = () => {
  return MISSION_DURATION - getTotalTime();
};

// Détail de la note /20 : { timeScore, errorScore, hintScore, total }
const getScoreBreakdown = () =>
  computeScoreBreakdown({
    totalTime: getTotalTime(),
    errors: gameState.errors,
    hints: gameState.hintsUsed,
  });

const calculateFinalScore = () => {
  const { total } = getScoreBreakdown();
  gameState.finalScore = total;
  return total;
};

const isGameComplete = () => {
  return ROOM_IDS.every((room) => gameState.completedRooms.includes(room));
};

// Fige la partie terminée : arrêt du chrono et suppression de la sauvegarde (l'état reste lisible jusqu'au reset)
const finishGame = () => {
  if (gameState.startTime) {
    gameState.timer = elapsedSeconds(gameState.startTime);
  }
  stopTimer();
  if (gameState.currentRoom) {
    closeRoomSegment();
  }
  gameState.isGameOver = true;
  clearSavedGame();
};

const markDevToolsUsed = () => {
  if (!gameState.isGameStarted) return;
  gameState.devToolsUsed = true;
  saveGame();
};

const markBriefingAsShown = (briefingType) => {
  if (briefingType) {
    gameState.briefingsShown[briefingType] = true;
    saveGame();
  }
};

const isBriefingShown = (briefingType) => {
  return Boolean(gameState.briefingsShown[briefingType]);
};

export function useGameState() {
  return {
    gameState,
    startGame,
    stopTimer,
    enterRoom,
    exitRoom,
    unlockRoom,
    unlockNextRoom,
    unlockAllRooms,
    resetGame,
    clearGameState,
    restoreSavedGame,
    clearSavedGame,
    finishGame,
    formatTime,
    addError,
    addHint,
    completeRoom,
    getTotalTime,
    getRemainingTime,
    getScoreBreakdown,
    calculateFinalScore,
    isGameComplete,
    markDevToolsUsed,
    markBriefingAsShown,
    isBriefingShown,
    PENALTY_PER_ERROR,
    PENALTY_PER_HINT,
    MAX_SCORE,
    MISSION_DURATION,
    ROOM_IDS,
  };
}
