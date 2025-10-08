import { ref, reactive, watch } from "vue";

// Constantes pour le système de notation
const PENALTY_PER_ERROR = 30; // Secondes par erreur
const PENALTY_PER_HINT = 1; // Points retirés par indice
const MAX_SCORE = 20; // Score maximum

// État global du jeu
const gameState = reactive({
  isGameStarted: false,
  teamName: "",
  players: [],
  currentRoom: null,
  unlockedRooms: ["server"], // Salle du serveur débloquée par défaut
  startTime: null,
  timer: 0,
  // Nouvelles propriétés pour le système de notation
  errors: 0, // Compteur d'erreurs global
  penaltyTime: 0, // Temps de pénalité cumulé
  roomErrors: {}, // Erreurs par salle
  hintsUsed: 0, // Compteur d'indices global
  roomHints: {}, // Indices par salle
  roomTimes: {}, // Temps passé par salle
  roomStartTime: null, // Timestamp de début de salle
  completedRooms: [], // Liste des salles complétées
  finalScore: null, // Score final calculé
  // États des briefings
  briefingsShown: {
    audio: false,
    serverRoom: false,
    dnaRoom: false,
    imagingRoom: false,
    finishServerRoom: false,
    finishDNARoom: false,
    finishImagingRoom: false,
  },
});

// Timer
let timerInterval = null;

// Fonction pour démarrer le timer
const startTimer = () => {
  timerInterval = setInterval(() => {
    gameState.timer = Math.floor((Date.now() - gameState.startTime) / 1000);
  }, 1000);
};

// Fonction pour arrêter le timer
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

    // Démarrer le timer
    startTimer();

    // Sauvegarder l'état
    saveGameState();

    // Forcer le scroll vers le haut de la page avec vérification
    const scrollToTop = () => {
      console.log("🔄 [useGameState] Tentative de scroll vers le haut...");
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
      });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
      
      // Vérifier si le scroll a fonctionné
      setTimeout(() => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        console.log("📍 [useGameState] Position actuelle:", currentScroll);
        if (currentScroll > 0) {
          console.log("⚠️ [useGameState] Scroll non réussi, nouvelle tentative...");
          scrollToTop();
        } else {
          console.log("✅ [useGameState] Scroll réussi vers le haut");
        }
      }, 50);
    };

    // Tentatives de scroll avec différents délais
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 200);
    setTimeout(scrollToTop, 500);
  };

  const enterRoom = (roomId) => {
    gameState.currentRoom = roomId;
    gameState.roomStartTime = Date.now();
  };

  const exitRoom = () => {
    gameState.currentRoom = null;
  };

  const unlockRoom = (roomId) => {
    if (!gameState.unlockedRooms.includes(roomId)) {
      gameState.unlockedRooms.push(roomId);
    }
  };

  const unlockAllRooms = () => {
    gameState.unlockedRooms = ["server", "dna-lab", "imaging", "heart"];
  };

  const resetGame = () => {
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
    // Réinitialiser les briefings
    gameState.briefingsShown = {
      audio: false,
      serverRoom: false,
      dnaRoom: false,
      imagingRoom: false,
      finishServerRoom: false,
      finishDNARoom: false,
      finishImagingRoom: false,
    };
    stopTimer();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Nouvelles fonctions pour le système de notation
  const addError = (roomId) => {
    gameState.errors++;
    gameState.penaltyTime += PENALTY_PER_ERROR;
    if (!gameState.roomErrors[roomId]) {
      gameState.roomErrors[roomId] = 0;
    }
    gameState.roomErrors[roomId]++;
  };

  const addHint = (roomId) => {
    gameState.hintsUsed++;
    if (!gameState.roomHints[roomId]) {
      gameState.roomHints[roomId] = 0;
    }
    gameState.roomHints[roomId]++;
  };

  const completeRoom = (roomId) => {
    if (!gameState.completedRooms.includes(roomId)) {
      gameState.completedRooms.push(roomId);
      // Calculer le temps passé dans cette salle
      const roomTime = Math.floor(
        (Date.now() - gameState.roomStartTime) / 1000,
      );
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
    // Vérifier si les 4 salles sont complétées
    const allRooms = ["server", "dna-lab", "imaging", "heart"];
    return allRooms.every((room) => gameState.completedRooms.includes(room));
  };

  // Fonctions pour gérer les briefings
  const markBriefingAsShown = (briefingType) => {
    if (gameState.briefingsShown.hasOwnProperty(briefingType)) {
      gameState.briefingsShown[briefingType] = true;
    }
  };

  const isBriefingShown = (briefingType) => {
    return gameState.briefingsShown[briefingType] || false;
  };

  return {
    gameState,
    startGame,
    stopTimer,
    enterRoom,
    exitRoom,
    unlockRoom,
    unlockAllRooms,
    resetGame,
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
  };
}
