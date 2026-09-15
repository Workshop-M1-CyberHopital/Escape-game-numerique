<template>
  <div class="relative z-10 w-full min-h-screen">
    <!-- Animated Background Canvas -->
    <canvas id="animated-bg"></canvas>

    <!-- Header avec navigation et statut utilisateur -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-cyber-blue/30">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo & Titre -->
          <div class="flex items-center space-x-4">
            <h1 class="text-xl font-cyber font-bold text-cyber-blue">
              CYBER-HÔPITAL
            </h1>
            <span class="text-gray-400 font-tech text-sm">
              Mission Résilience
            </span>
          </div>

          <!-- Actions de navigation -->
          <div class="flex items-center space-x-4">
            <button
              @click="showScoresModal = true"
              class="px-4 py-2 bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green font-cyber font-bold rounded-lg transition-all"
            >
              SCORES
            </button>

            <!-- Non authentifié -->
            <div v-if="!isAuthenticated" class="flex items-center space-x-2">
              <button
                @click="showAuthModal = true"
                class="px-4 py-2 bg-cyber-blue hover:bg-cyber-blue/80 text-black font-cyber font-bold rounded-lg transition-all"
              >
                CONNEXION
              </button>
            </div>

            <!-- Utilisateur connecté -->
            <div v-else class="flex items-center space-x-2">
              <span class="text-gray-300 font-tech text-sm">
                {{ user?.username }}
              </span>
              <button
                @click="showUserProfile = true"
                class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white font-tech text-sm rounded transition-all"
              >
                Profil
              </button>
              <button
                @click="handleLogout"
                :disabled="gameState.isGameStarted"
                :class="[
                  'px-3 py-1 font-tech text-sm rounded transition-all',
                  gameState.isGameStarted
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white',
                ]"
                :title="
                  gameState.isGameStarted
                    ? 'Impossible de se déconnecter pendant une partie'
                    : 'Se déconnecter'
                "
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Espacement pour header fixe -->
    <div class="h-16"></div>

    <!-- Mode Jeu : Affichage de la sélection des salles ou de la salle active -->
    <main v-if="gameState.isGameStarted">
      <RoomsSection
        v-if="!gameState.currentRoom"
        :unlocked-rooms="gameState.unlockedRooms"
        :completed-rooms="gameState.completedRooms"
        @enter-room="handleEnterRoom"
      />

      <component
        v-else-if="currentRoomComponent"
        :is="currentRoomComponent"
        @exit-room="handleExitRoom"
        @room-completed="handleRoomCompleted"
      />
    </main>

    <!-- Mode Accueil / Landing -->
    <main v-else>
      <HeroSection @start-mission="handleStartMission" />

      <TeamSetupModal
        :visible="showTeamSetup"
        :connected-player-name="user?.username || ''"
        @close="showTeamSetup = false"
        @start-game="handleStartGame"
        @open-auth="showAuthModal = true"
      />

      <LoadingScreen
        :visible="showLoadingScreen"
        :team-name="loadingTeamName"
        :players="loadingPlayers"
        @complete="handleLoadingComplete"
      />

      <RoomsSection />

      <!-- Footer -->
      <footer class="py-8 px-4 border-t border-gray-800">
        <div class="max-w-7xl mx-auto text-center">
          <p class="text-gray-500 font-tech text-sm">
            © 2024 Cyber-Hôpital – Mission Résilience | Escape Game Numérique Pédagogique
          </p>
        </div>
      </footer>
    </main>

    <!-- Modale de Score Final -->
    <FinalScore
      v-if="showFinalScore"
      :score-data="finalScoreData"
      @close="handleCloseFinalScore"
      @restart="handleRestartGame"
    />

    <!-- Conteneur Toasts & Contrôles Audio -->
    <ToastContainer />
    <AudioControls />

    <!-- Modales secondaires -->
    <AuthModal
      :visible="showAuthModal"
      @close="showAuthModal = false"
      @success="handleAuthSuccess"
    />

    <UserProfile
      :visible="showUserProfile"
      :game-state="gameState"
      @close="showUserProfile = false"
    />

    <ScoresModal
      :visible="showScoresModal"
      @close="showScoresModal = false"
    />

    <!-- Outils de développement -->
    <DevTools
      :game-state="gameState"
      @start-game="handleStartGame"
      @enter-room="handleEnterRoom"
      @unlock-all-rooms="handleUnlockAllRooms"
      @reset-game="handleResetGame"
      @trigger-end-game="handleTriggerEndGame"
    />

    <!-- Modale d'activation audio initiale -->
    <AudioActivationModal
      :visible="showAudioActivationModal"
      @activate="handleActivateAudio"
      @continue-without="handleContinueWithoutAudio"
    />

    <!-- Modale dynamique de briefing (chargement à la demande) -->
    <component
      v-if="activeBriefing"
      :is="activeBriefing.component"
      :visible="true"
      @close="closeActiveBriefing"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, defineAsyncComponent } from "vue";
import HeroSection from "./components/HeroSection.vue";
import RoomsSection from "./components/RoomsSection.vue";
import ToastContainer from "./components/ToastContainer.vue";
import AudioControls from "./components/AudioControls.vue";
import AudioActivationModal from "./components/AudioActivationModal.vue";

// Composables
import { useGameState } from "./composables/useGameState";
import { useToast } from "./composables/useToast";
import { useAudio } from "./composables/useAudio";
import { useAuth } from "./composables/useAuth";
import { useScores } from "./composables/useScores";
import { useBriefing } from "./composables/useBriefing";
import { checkApiHealth } from "./composables/useApi";
import { initAnimations } from "./utils/animations";

// Lazy loading des modales lourdes
const TeamSetupModal = defineAsyncComponent(() => import("./components/TeamSetupModal.vue"));
const LoadingScreen = defineAsyncComponent(() => import("./components/LoadingScreen.vue"));
const FinalScore = defineAsyncComponent(() => import("./components/FinalScore.vue"));
const AuthModal = defineAsyncComponent(() => import("./components/AuthModal.vue"));
const UserProfile = defineAsyncComponent(() => import("./components/UserProfile.vue"));
const ScoresModal = defineAsyncComponent(() => import("./components/ScoresModal.vue"));
const DevTools = defineAsyncComponent(() => import("./components/DevTools.vue"));

// Lazy loading des 9 salles du jeu
const ROOM_COMPONENTS = {
  server: defineAsyncComponent(() => import("./components/rooms/ServerRoom.vue")),
  "dna-lab": defineAsyncComponent(() => import("./components/rooms/DNARoom.vue")),
  imaging: defineAsyncComponent(() => import("./components/rooms/ImagingRoom.vue")),
  heart: defineAsyncComponent(() => import("./components/rooms/HeartRoom.vue")),
  prosthesis: defineAsyncComponent(() => import("./components/rooms/ProsthesisRoom.vue")),
  eye: defineAsyncComponent(() => import("./components/rooms/EyeRoom.vue")),
  pathology: defineAsyncComponent(() => import("./components/rooms/PathologyRoom.vue")),
  audition: defineAsyncComponent(() => import("./components/rooms/AuditionRoom.vue")),
  final: defineAsyncComponent(() => import("./components/rooms/FinalRoom.vue")),
};

// État du jeu
const {
  gameState,
  startGame,
  enterRoom,
  exitRoom,
  unlockNextRoom,
  unlockAllRooms,
  resetGame,
  clearGameState,
  calculateFinalScore,
  isGameComplete,
} = useGameState();

const { showError, showSuccess, showWarning, showInfo } = useToast();
const { audioState, requestAudioPermission } = useAudio();
const { user, isAuthenticated, logout } = useAuth();
const { submitScore, calculateScore } = useScores();

// Gestionnaire des briefings
const {
  activeBriefing,
  closeActiveBriefing,
  showRoomIntro,
  showRoomFinish,
  showMissionBriefing,
  isBriefingShown
} = useBriefing();

// États de l'interface
const showTeamSetup = ref(false);
const showLoadingScreen = ref(false);
const loadingTeamName = ref("");
const loadingPlayers = ref([]);
const showAudioActivationModal = ref(false);
const hasDecidedAudio = ref(false);
const showFinalScore = ref(false);
const finalScoreData = ref(null);
const showAuthModal = ref(false);
const showUserProfile = ref(false);
const showScoresModal = ref(false);

// Salle active
const currentRoomComponent = computed(() => {
  return gameState.currentRoom ? ROOM_COMPONENTS[gameState.currentRoom] : null;
});

// Utilitaire de défilement fluide
const scrollToTop = (behavior = "instant") => {
  window.scrollTo({ top: 0, left: 0, behavior });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

// Démarrage de la mission
const handleStartMission = () => {
  showTeamSetup.value = true;
};

const handleStartGame = async (teamData) => {
  showTeamSetup.value = false;
  const isDevToolStart = teamData.name === "Équipe DEV";

  if (isDevToolStart) {
    startGame(teamData);
  } else {
    await nextTick();
    loadingTeamName.value = teamData.name;
    loadingPlayers.value = teamData.players;
    showLoadingScreen.value = true;
  }
};

const handleLoadingComplete = async () => {
  startGame({
    name: loadingTeamName.value,
    players: loadingPlayers.value,
  });
  showLoadingScreen.value = false;
  await nextTick();
  scrollToTop("instant");
};

// Navigation dans les salles
const handleEnterRoom = async (roomId) => {
  if (!gameState.unlockedRooms.includes(roomId)) {
    showError(
      "SALLE VERROUILLÉE",
      "Vous devez compléter les salles précédentes pour débloquer cette zone.",
    );
    return;
  }

  enterRoom(roomId);
  await nextTick();
  scrollToTop("smooth");

  // Déclencher le briefing de salle si présent
  await showRoomIntro(roomId);
};

const handleExitRoom = async () => {
  exitRoom();
  await nextTick();
  scrollToTop("instant");
};

const handleRoomCompleted = async (roomId) => {
  // Débloquer la salle suivante
  unlockNextRoom(roomId);

  // Déclencher le briefing de félicitations
  await showRoomFinish(roomId);

  // Vérifier la fin de mission
  if (isGameComplete()) {
    setTimeout(async () => {
      const score = calculateFinalScore();
      const totalTime = gameState.timer + gameState.penaltyTime;
      const gameData = {
        score,
        duration: totalTime,
        roomsCompleted: gameState.completedRooms.length,
        errors: gameState.errors,
        hints: gameState.hintsUsed,
        completed: true,
        teamName: gameState.teamName,
        timeScore: Math.max(0, 8 - totalTime / 120),
        errorScore: Math.max(0, 7 - gameState.errors * 0.5),
        hintScore: Math.max(0, 5 - gameState.hintsUsed * 1),
        totalTime,
        roomTimes: gameState.roomTimes,
        roomErrors: gameState.roomErrors,
        roomHints: gameState.roomHints,
      };

      finalScoreData.value = gameData;
      showFinalScore.value = true;

      await handleScoreSubmission(gameData);
      clearGameState();
    }, 2000);
  } else {
    exitRoom();
  }

  await nextTick();
  scrollToTop("instant");
};

// Gestion de l'audio initial
const handleActivateAudio = async () => {
  showAudioActivationModal.value = false;
  hasDecidedAudio.value = true;

  try {
    const granted = await requestAudioPermission();
    if (!granted) {
      showError("Permission refusée", "L'audio ne peut pas être activé sans votre autorisation.");
    }
  } catch (error) {
    console.warn("Erreur d'activation audio:", error);
  }

  await showMissionBriefing();
};

const handleContinueWithoutAudio = async () => {
  showAudioActivationModal.value = false;
  hasDecidedAudio.value = true;
  await showMissionBriefing();
};

// Fin de jeu manuelle (DevTools)
const handleTriggerEndGame = async () => {
  Object.keys(ROOM_COMPONENTS).forEach((roomId) => {
    if (!gameState.completedRooms.includes(roomId)) {
      gameState.completedRooms.push(roomId);
    }
  });

  showSuccess("DÉVELOPPEMENT", "Fin de jeu déclenchée manuellement !");

  setTimeout(async () => {
    const score = calculateFinalScore();
    const totalTime = gameState.timer + gameState.penaltyTime;
    const gameData = {
      score,
      duration: totalTime,
      roomsCompleted: gameState.completedRooms.length,
      errors: gameState.errors,
      hints: gameState.hintsUsed,
      completed: true,
      teamName: gameState.teamName || "Équipe DEV",
      timeScore: Math.max(0, 8 - totalTime / 120),
      errorScore: Math.max(0, 7 - gameState.errors * 0.5),
      hintScore: Math.max(0, 5 - gameState.hintsUsed * 1),
      totalTime,
      roomTimes: gameState.roomTimes,
      roomErrors: gameState.roomErrors,
      roomHints: gameState.roomHints,
    };

    finalScoreData.value = gameData;
    showFinalScore.value = true;

    await handleScoreSubmission(gameData);
    clearGameState();
  }, 1000);
};

// Score et réinitialisation
const handleCloseFinalScore = () => {
  showFinalScore.value = false;
};

const handleRestartGame = () => {
  showFinalScore.value = false;
  resetGame();
  showInfo("NOUVELLE PARTIE", "Le jeu a été réinitialisé");
};

const handleUnlockAllRooms = () => {
  unlockAllRooms();
  showSuccess("DÉVELOPPEMENT", "Toutes les salles ont été débloquées !");
};

const handleResetGame = () => {
  resetGame();
  showInfo("DÉVELOPPEMENT", "Jeu réinitialisé");
};

// Authentification
const handleAuthSuccess = () => {
  showAuthModal.value = false;
};

const handleLogout = async () => {
  if (gameState.isGameStarted) {
    showWarning(
      "DÉCONNEXION BLOQUÉE",
      "Impossible de se déconnecter pendant une partie en cours. Terminez d'abord votre mission ou réinitialisez le jeu.",
    );
    return;
  }

  try {
    await logout();
    showSuccess("DÉCONNEXION", "Vous avez été déconnecté avec succès");
  } catch (error) {
    showError("ERREUR", "Erreur lors de la déconnexion");
  }
};

const handleScoreSubmission = async (gameData) => {
  if (!isAuthenticated.value) {
    showWarning(
      "CONNEXION REQUISE",
      "Vous devez être connecté pour sauvegarder votre score",
    );
    return;
  }

  try {
    const score = calculateScore(gameData);
    await submitScore({
      score,
      duration: gameData.duration || 0,
      roomsCompleted: gameData.roomsCompleted || 0,
      errors: gameData.errors || 0,
      hints: gameData.hints || 0,
      completed: gameData.completed || false,
      gameData,
    });
    showSuccess(
      "SCORE SAUVEGARDÉ",
      `Votre score de ${score.toLocaleString("fr-FR")} points a été enregistré !`,
    );
  } catch (error) {
    showError("ERREUR", "Impossible de sauvegarder le score");
  }
};

// Détection de l'arrivée sur l'écran de sélection des salles
watch(
  () => gameState.isGameStarted && !gameState.currentRoom,
  async (isOnRoomSelection) => {
    if (isOnRoomSelection) {
      scrollToTop("instant");
      if (!isBriefingShown("audio")) {
        if (!hasDecidedAudio.value && !audioState.hasPermission) {
          showAudioActivationModal.value = true;
        } else {
          await showMissionBriefing();
        }
      }
    }
  }
);

onMounted(async () => {
  initAnimations();
  resetGame();

  try {
    const isApiHealthy = await checkApiHealth();
    if (!isApiHealthy) {
      showError(
        "SERVEUR INDISPONIBLE",
        "Le serveur backend n'est pas accessible. Vérifiez qu'il est démarré sur le port 3001.",
      );
    }
  } catch (error) {
    console.warn("Vérification API ignorée:", error);
  }
});
</script>

<style>
@import "./assets/cyber-styles.css";

#app {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.relative.z-10 {
  width: 100%;
  min-height: 100vh;
}
</style>
