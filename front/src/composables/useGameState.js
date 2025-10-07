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
    finishImagingRoom: false
  }
});

// Timer
let timerInterval = null;

// Clé pour le localStorage
const GAME_STATE_KEY = 'escape_game_state';

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

// Fonctions de persistance
const saveGameState = () => {
  try {
    const stateToSave = {
      ...gameState,
      // Ne pas sauvegarder les fonctions et les références
      startTime: gameState.startTime,
      roomStartTime: gameState.roomStartTime,
      // Calculer le temps écoulé depuis le début
      elapsedTime: gameState.startTime ? Math.floor((Date.now() - gameState.startTime) / 1000) : 0
    };
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(stateToSave));
    console.log('💾 État du jeu sauvegardé:', {
      isGameStarted: stateToSave.isGameStarted,
      teamName: stateToSave.teamName,
      currentRoom: stateToSave.currentRoom,
      elapsedTime: stateToSave.elapsedTime
    });
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de l\'état du jeu:', error);
  }
};

const loadGameState = () => {
  try {
    const savedState = localStorage.getItem(GAME_STATE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      console.log('🔄 Restauration de l\'état du jeu:', parsedState);
      
      // Vérifier que l'état sauvegardé est valide
      if (parsedState.isGameStarted && parsedState.teamName && parsedState.players) {
        // Restaurer l'état sans écraser les fonctions
        Object.keys(parsedState).forEach(key => {
          if (key !== 'startTime' && key !== 'roomStartTime' && key !== 'elapsedTime') {
            gameState[key] = parsedState[key];
          }
        });
        
        // Gérer les timestamps
        if (parsedState.startTime) {
          const timeElapsed = parsedState.elapsedTime || 0;
          gameState.startTime = Date.now() - (timeElapsed * 1000);
          console.log('⏰ Timer restauré - temps écoulé:', timeElapsed, 'secondes');
        }
        
        if (parsedState.roomStartTime) {
          gameState.roomStartTime = parsedState.roomStartTime;
        }
        
        // Si une partie était en cours, redémarrer le timer
        if (gameState.isGameStarted && gameState.startTime) {
          startTimer();
          console.log('🎮 Partie restaurée - Timer redémarré');
        }
      } else {
        console.warn('⚠️ État sauvegardé invalide, nettoyage du localStorage');
        localStorage.removeItem(GAME_STATE_KEY);
      }
    } else {
      console.log('📝 Aucun état sauvegardé trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement de l\'état du jeu:', error);
    // En cas d'erreur, nettoyer le localStorage
    localStorage.removeItem(GAME_STATE_KEY);
  }
};

const clearGameState = () => {
  localStorage.removeItem(GAME_STATE_KEY);
};

// Fonction pour vérifier la cohérence de l'état
const validateGameState = () => {
  if (gameState.isGameStarted) {
    // Vérifier que les données essentielles sont présentes
    if (!gameState.teamName || !gameState.players || gameState.players.length === 0) {
      console.warn('⚠️ État du jeu incohérent, réinitialisation');
      resetGame();
      return false;
    }
  }
  return true;
};

export function useGameState() {
  // Flag pour éviter les sauvegardes pendant le chargement
  let isLoadingState = false;
  let lastSavedState = null;

  // Charger l'état sauvegardé au démarrage
  const initializeGameState = () => {
    isLoadingState = true;
    loadGameState();
    // Attendre un tick pour que l'état soit complètement restauré
    setTimeout(() => {
      // Valider l'état restauré
      if (validateGameState()) {
        isLoadingState = false;
        // Sauvegarder l'état initial après le chargement
        if (gameState.isGameStarted) {
          saveGameState();
        }
      } else {
        isLoadingState = false;
      }
    }, 200);
  };

  // Initialiser l'état
  initializeGameState();

  // Watcher pour sauvegarder automatiquement l'état (seulement après le chargement)
  watch(gameState, (newState) => {
    if (gameState.isGameStarted && !isLoadingState) {
      // Éviter les sauvegardes inutiles en comparant avec l'état précédent
      const currentState = JSON.stringify({
        isGameStarted: newState.isGameStarted,
        teamName: newState.teamName,
        players: newState.players,
        currentRoom: newState.currentRoom,
        unlockedRooms: newState.unlockedRooms,
        completedRooms: newState.completedRooms,
        errors: newState.errors,
        hintsUsed: newState.hintsUsed
      });
      
      if (currentState !== lastSavedState) {
        lastSavedState = currentState;
        saveGameState();
      }
    }
  }, { deep: true });

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
    stopTimer();
    
    // Nettoyer le localStorage
    clearGameState();
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
    // Vérifier si les 3 salles principales sont complétées
    const mainRooms = ["server", "dna-lab", "imaging"];
    return mainRooms.every((room) => gameState.completedRooms.includes(room));
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
    clearGameState,
    markBriefingAsShown,
    isBriefingShown,
    PENALTY_PER_ERROR,
    PENALTY_PER_HINT,
    MAX_SCORE,
  };
}
