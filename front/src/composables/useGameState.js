import { reactive } from "vue";
import { ROOM_IDS, getNextRoomId } from "../config/roomsConfig";

export { ROOM_IDS, getNextRoomId };

// Constantes pour le système de notation
export const PENALTY_PER_ERROR = 30; // Secondes par erreur
export const PENALTY_PER_HINT = 1; // Points retirés par indice
export const MAX_SCORE = 20; // Score maximum

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
  finalRoom: false,
  finishServerRoom: false,
  finishDNARoom: false,
  finishImagingRoom: false,
  finishProsthesisRoom: false,
  finishPathologyRoom: false,
  finishAuditionRoom: false,
  finishFinalRoom: false,
};

// État global du jeu
export const gameState = reactive({
  isGameStarted: false,
  teamName: "",
  players: [],
  currentRoom: null,
  unlockedRooms: ["server"], // Salle du serveur débloquée par défaut
  startTime: null,
  timer: 0,
  // Système de notation
  errors: 0,
  penaltyTime: 0,
  roomErrors: {},
  hintsUsed: 0,
  roomHints: {},
  roomTimes: {},
  roomStartTime: null,
  completedRooms: [],
  finalScore: null,
  // États des briefings
  briefingsShown: { ...INITIAL_BRIEFINGS_SHOWN },
});

// Timer
let timerInterval = null;

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (gameState.startTime) {
      gameState.timer = Math.floor((Date.now() - gameState.startTime) / 1000);
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

export function useGameState() {
  const startGame = (teamData) => {
    gameState.isGameStarted = true;
    gameState.teamName = teamData.name;
    gameState.players = teamData.players;
    gameState.startTime = Date.now();
    gameState.roomStartTime = Date.now();
    startTimer();
  };

  const enterRoom = (roomId) => {
    gameState.currentRoom = roomId;
    gameState.roomStartTime = Date.now();
  };

  const exitRoom = () => {
    gameState.currentRoom = null;
  };

  const unlockRoom = (roomId) => {
    if (roomId && !gameState.unlockedRooms.includes(roomId)) {
      gameState.unlockedRooms.push(roomId);
    }
  };

  const unlockNextRoom = (currentRoomId) => {
    const nextRoom = getNextRoomId(currentRoomId);
    if (nextRoom) {
      unlockRoom(nextRoom);
    }
    return nextRoom;
  };

  const unlockAllRooms = () => {
    gameState.unlockedRooms = [...ROOM_IDS];
  };

  const resetGame = () => {
    stopTimer();
    gameState.isGameStarted = false;
    gameState.teamName = "";
    gameState.players = [];
    gameState.currentRoom = null;
    gameState.unlockedRooms = ["server"];
    gameState.startTime = null;
    gameState.timer = 0;
    gameState.errors = 0;
    gameState.penaltyTime = 0;
    gameState.roomErrors = {};
    gameState.hintsUsed = 0;
    gameState.roomHints = {};
    gameState.roomTimes = {};
    gameState.roomStartTime = null;
    gameState.completedRooms = [];
    gameState.finalScore = null;
    gameState.briefingsShown = { ...INITIAL_BRIEFINGS_SHOWN };
  };

  // Alias pour éviter tout crash si clearGameState est appelé
  const clearGameState = resetGame;

  const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds || 0));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const addError = (roomId) => {
    gameState.errors++;
    gameState.penaltyTime += PENALTY_PER_ERROR;
    if (roomId) {
      gameState.roomErrors[roomId] = (gameState.roomErrors[roomId] || 0) + 1;
    }
  };

  const addHint = (roomId) => {
    gameState.hintsUsed++;
    if (roomId) {
      gameState.roomHints[roomId] = (gameState.roomHints[roomId] || 0) + 1;
    }
  };

  const completeRoom = (roomId) => {
    if (roomId && !gameState.completedRooms.includes(roomId)) {
      gameState.completedRooms.push(roomId);
      const roomTime = gameState.roomStartTime
        ? Math.floor((Date.now() - gameState.roomStartTime) / 1000)
        : 0;
      gameState.roomTimes[roomId] = roomTime;
    }
  };

  const getTotalTime = () => {
    return gameState.timer + gameState.penaltyTime;
  };

  const calculateFinalScore = () => {
    const totalTime = getTotalTime();

    // Calcul des scores individuels
    const timeScore = Math.max(0, 8 - totalTime / 120);
    const errorScore = Math.max(0, 7 - gameState.errors * 0.5);
    const hintScore = Math.max(0, 5 - gameState.hintsUsed * 1);

    // Score total (limité entre 0 et 20)
    const score = Math.min(
      MAX_SCORE,
      Math.max(0, timeScore + errorScore + hintScore),
    );

    gameState.finalScore = Math.round(score * 10) / 10; // Arrondi à 1 décimale
    return gameState.finalScore;
  };

  const isGameComplete = () => {
    return ROOM_IDS.every((room) => gameState.completedRooms.includes(room));
  };

  const markBriefingAsShown = (briefingType) => {
    if (briefingType) {
      gameState.briefingsShown[briefingType] = true;
    }
  };

  const isBriefingShown = (briefingType) => {
    return Boolean(gameState.briefingsShown[briefingType]);
  };

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
    formatTime,
    addError,
    addHint,
    completeRoom,
    getTotalTime,
    calculateFinalScore,
    isGameComplete,
    markBriefingAsShown,
    isBriefingShown,
    PENALTY_PER_ERROR,
    PENALTY_PER_HINT,
    MAX_SCORE,
    ROOM_IDS,
  };
}
