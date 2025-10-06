import { ref, reactive } from "vue";

// État global du jeu
const gameState = reactive({
  isGameStarted: false,
  teamName: "",
  players: [],
  currentRoom: null,
  unlockedRooms: ["server"], // Salle du serveur débloquée par défaut
  startTime: null,
  timer: 0,
});

// Timer
let timerInterval = null;

export function useGameState() {
  const startGame = (teamData) => {
    gameState.isGameStarted = true;
    gameState.teamName = teamData.name;
    gameState.players = teamData.players;
    gameState.startTime = Date.now();

    // Démarrer le timer
    startTimer();
  };

  const startTimer = () => {
    timerInterval = setInterval(() => {
      gameState.timer = Math.floor((Date.now() - gameState.startTime) / 1000);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const enterRoom = (roomId) => {
    gameState.currentRoom = roomId;
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
    stopTimer();
    gameState.isGameStarted = false;
    gameState.teamName = "";
    gameState.players = [];
    gameState.currentRoom = null;
    gameState.unlockedRooms = ["server"];
    gameState.startTime = null;
    gameState.timer = 0;
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
  };
}
