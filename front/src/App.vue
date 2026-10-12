<template>
  <div class="relative z-10 w-full min-h-screen">
    <!-- Animated Background Canvas -->
    <canvas id="animated-bg"></canvas>

    <!-- Header avec navigation et statut utilisateur (hauteur fixe = espaceur h-16) -->
    <header class="fixed top-0 left-0 right-0 z-50 h-16 bg-black/80 backdrop-blur-sm border-b border-cyber-blue/30">
      <div class="max-w-7xl mx-auto h-full px-3 sm:px-4 flex items-center justify-between gap-2">
        <!-- Logo & Titre -->
        <div class="flex items-center gap-2 sm:gap-4 min-w-0">
          <h1 class="text-sm sm:text-xl font-cyber font-bold text-cyber-blue truncate">
            CYBER-HÔPITAL
          </h1>
          <span class="hidden md:inline text-gray-400 font-tech text-sm whitespace-nowrap">
            Mission Résilience
          </span>
        </div>

        <!-- Actions de navigation -->
        <nav class="flex items-center gap-1.5 sm:gap-3 shrink-0" aria-label="Navigation principale">
          <!-- Abandon de la mission en cours -->
          <button
            v-if="isGameInProgress"
            type="button"
            @click="openQuitConfirm"
            class="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/40 font-cyber font-bold text-xs sm:text-sm rounded-lg transition-all"
            title="Abandonner la mission en cours"
            aria-label="Abandonner la mission"
          >
            <Flag class="w-4 h-4" />
            <span class="hidden sm:inline">ABANDONNER</span>
          </button>

          <button
            type="button"
            @click="openScoresModal"
            class="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green font-cyber font-bold text-xs sm:text-base rounded-lg transition-all"
            title="Classement"
            aria-label="Scores"
          >
            <Trophy class="w-4 h-4 sm:hidden" />
            <span class="hidden sm:inline">SCORES</span>
          </button>

          <!-- Non authentifié -->
          <button
            v-if="!isAuthenticated"
            type="button"
            @click="openAuthModal"
            class="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-cyber-blue hover:bg-cyber-blue/80 text-black font-cyber font-bold text-xs sm:text-base rounded-lg transition-all whitespace-nowrap"
          >
            CONNEXION
          </button>

          <!-- Utilisateur connecté -->
          <template v-else>
            <span class="hidden lg:inline text-gray-300 font-tech text-sm max-w-[10rem] truncate">
              {{ user?.username }}
            </span>
            <button
              type="button"
              @click="openUserProfile"
              class="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-1 bg-gray-700 hover:bg-gray-600 text-white font-tech text-sm rounded transition-all"
              title="Profil"
              aria-label="Profil"
            >
              <User class="w-4 h-4 sm:hidden" />
              <span class="hidden sm:inline">Profil</span>
            </button>
            <button
              type="button"
              @click="handleLogout"
              :aria-disabled="isGameInProgress"
              :class="[
                'flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-1 font-tech text-sm rounded transition-all',
                isGameInProgress
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white',
              ]"
              :title="
                isGameInProgress
                  ? 'Impossible de se déconnecter pendant une mission : terminez-la ou abandonnez-la'
                  : 'Se déconnecter'
              "
              aria-label="Déconnexion"
            >
              <LogOut class="w-4 h-4 sm:hidden" />
              <span class="hidden sm:inline">Déconnexion</span>
            </button>
          </template>
        </nav>
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
        :key="gameState.currentRoom"
        @exit-room="handleExitRoom"
        @room-completed="handleRoomCompleted"
      />
    </main>

    <!-- Mode Accueil / Landing -->
    <main v-else>
      <HeroSection @start-mission="handleStartMission" />

      <TeamSetupModal
        :key="lazyKeys.TeamSetupModal"
        :visible="showTeamSetup"
        :connected-player-name="user?.username || ''"
        @close="showTeamSetup = false"
        @start-game="handleStartGame"
        @open-auth="openAuthModal"
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

    <!-- Modale de Score Final (instantané figé de la partie terminée) -->
    <FinalScore
      v-if="showFinalScore && finalScoreData"
      :score-data="finalScoreData"
      :save-status="saveStatus"
      @close="handleCloseFinalScore"
      @restart="handleRestartGame"
      @retry-save="handleRetrySave"
    />

    <!-- Confirmation d'abandon de la mission -->
    <div
      v-if="showQuitConfirm"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quit-mission-title"
      @click.self="closeQuitConfirm"
    >
      <div class="bg-gray-900/95 border-2 border-red-500 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="border-b border-red-500/50 p-4 sm:p-6 flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-12 h-12 shrink-0 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500">
              <AlertTriangle class="w-6 h-6 text-red-500" />
            </div>
            <div class="min-w-0">
              <h3 id="quit-mission-title" class="text-lg sm:text-xl font-bold text-red-500 font-tech">
                ABANDONNER LA MISSION ?
              </h3>
              <p class="text-sm text-gray-300 font-tech">Confirmation requise</p>
            </div>
          </div>
          <button
            type="button"
            @click="closeQuitConfirm"
            class="w-8 h-8 shrink-0 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all duration-300 hover:scale-110"
            aria-label="Fermer"
          >
            <X class="w-4 h-4 text-red-500" />
          </button>
        </div>

        <div class="p-4 sm:p-6 space-y-4">
          <div class="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <div class="text-red-400 font-bold text-sm mb-2">⚠️ ATTENTION</div>
            <p class="text-gray-300 text-sm">
              Toute la progression de l'équipe sera perdue et aucun score ne sera enregistré.
              Une nouvelle équipe pourra ensuite lancer sa mission.
            </p>
          </div>

          <div class="text-center text-gray-300 text-sm font-tech space-y-1">
            <p><strong>Équipe :</strong> {{ gameState.teamName }}</p>
            <p><strong>Temps écoulé :</strong> {{ formatTime(gameState.timer) }}</p>
            <p>
              <strong>Salles sécurisées :</strong>
              {{ gameState.completedRooms.length }}/{{ ROOM_IDS.length }}
            </p>
          </div>
        </div>

        <div class="border-t border-red-500/50 p-4 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            ref="quitCancelButton"
            type="button"
            @click="closeQuitConfirm"
            class="px-5 py-3 bg-gray-600 hover:bg-gray-500 text-white font-tech rounded-lg transition-all"
          >
            CONTINUER LA MISSION
          </button>
          <button
            type="button"
            @click="confirmAbandonMission"
            class="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-tech font-bold rounded-lg transition-all"
          >
            ABANDONNER
          </button>
        </div>
      </div>
    </div>

    <!-- Conteneur Toasts & Contrôles Audio -->
    <ToastContainer />
    <AudioControls />

    <!-- Modales secondaires -->
    <AuthModal
      :key="lazyKeys.AuthModal"
      :visible="showAuthModal"
      @close="showAuthModal = false"
      @success="handleAuthSuccess"
    />

    <UserProfile
      :key="lazyKeys.UserProfile"
      :visible="showUserProfile"
      :game-state="gameState"
      @close="showUserProfile = false"
    />

    <ScoresModal
      :key="lazyKeys.ScoresModal"
      :visible="showScoresModal"
      @close="showScoresModal = false"
    />

    <!-- Outils de développement (uniquement si ENV_CONFIG.DEV_MODE) -->
    <DevTools
      v-if="isDevMode"
      :game-state="gameState"
      @start-game="handleDevStartGame"
      @enter-room="handleDevEnterRoom"
      @unlock-all-rooms="handleUnlockAllRooms"
      @reset-game="handleResetGame"
      @trigger-end-game="handleTriggerEndGame"
    />

    <!-- Modale d'activation audio initiale (reste ouverte tant que la permission est en cours) -->
    <AudioActivationModal
      :visible="showAudioActivationModal"
      :pending="audioPermissionPending"
      :resumed="audioPromptAfterResume"
      @activate="handleActivateAudio"
      @continue-without="handleContinueWithoutAudio"
    />

    <!-- Modale dynamique de briefing (chargement à la demande) -->
    <component
      v-if="activeBriefing"
      :is="activeBriefing.component"
      :key="activeBriefing.id"
      :visible="true"
      :duration="activeBriefing.duration"
      @close="closeActiveBriefing"
    />
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  onErrorCaptured,
  nextTick,
  watch,
  defineAsyncComponent,
  h,
} from "vue";
import { Flag, Trophy, User, LogOut, AlertTriangle, X } from "lucide-vue-next";
import HeroSection from "./components/HeroSection.vue";
import RoomsSection from "./components/RoomsSection.vue";
import ToastContainer from "./components/ToastContainer.vue";
import AudioControls from "./components/AudioControls.vue";
import AudioActivationModal from "./components/AudioActivationModal.vue";

// Composables
import { useGameState, ROOM_IDS } from "./composables/useGameState";
import { useToast } from "./composables/useToast";
import { useAudio } from "./composables/useAudio";
import { useAuth } from "./composables/useAuth";
import { useScores } from "./composables/useScores";
import { useBriefing } from "./composables/useBriefing";
import { checkApiHealth } from "./composables/useApi";
import { computeScoreBreakdown } from "./utils/scoring";
import { initAnimations } from "./utils/animations";
import { ENV_CONFIG } from "./config/environment";

const isDevMode = Boolean(ENV_CONFIG.DEV_MODE);

// --- Chargement à la demande (avec nouvelles tentatives en cas d'échec réseau) ---

const MAX_LOAD_RETRIES = 2;

const lazyComponent = (loader, options = {}) =>
  defineAsyncComponent({
    loader,
    onError(error, retry, fail, attempts) {
      if (attempts <= MAX_LOAD_RETRIES) {
        setTimeout(retry, 800 * attempts);
      } else {
        fail();
      }
    },
    ...options,
  });

// Modales lourdes
const loadFinalScore = () => import("./components/FinalScore.vue");
const TeamSetupModal = lazyComponent(() => import("./components/TeamSetupModal.vue"));
const LoadingScreen = lazyComponent(() => import("./components/LoadingScreen.vue"));
const FinalScore = lazyComponent(loadFinalScore);
const AuthModal = lazyComponent(() => import("./components/AuthModal.vue"));
const UserProfile = lazyComponent(() => import("./components/UserProfile.vue"));
const ScoresModal = lazyComponent(() => import("./components/ScoresModal.vue"));
const DevTools = lazyComponent(() => import("./components/DevTools.vue"));

const LAZY_COMPONENT_NAMES = new Map([
  [TeamSetupModal, "TeamSetupModal"],
  [LoadingScreen, "LoadingScreen"],
  [FinalScore, "FinalScore"],
  [AuthModal, "AuthModal"],
  [UserProfile, "UserProfile"],
  [ScoresModal, "ScoresModal"],
  [DevTools, "DevTools"],
]);

// Changer la clé d'une modale dont le chargement a échoué la remonte, ce qui relance le téléchargement
const lazyKeys = reactive({ TeamSetupModal: 0, AuthModal: 0, UserProfile: 0, ScoresModal: 0 });
const failedLazyComponents = new Set();
const reloadIfFailed = (name) => {
  if (failedLazyComponents.delete(name) && name in lazyKeys) {
    lazyKeys[name]++;
  }
};

// Panneau affiché pendant le téléchargement d'une salle (avec un RETOUR toujours accessible)
const RoomLoadingPanel = {
  name: "RoomLoadingPanel",
  setup() {
    return () =>
      h(
        "div",
        {
          class: "min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center",
          role: "status",
        },
        [
          h("p", { class: "font-cyber text-cyber-blue text-lg sm:text-2xl font-bold animate-pulse" }, "CHARGEMENT DE LA SALLE…"),
          h("p", { class: "font-tech text-gray-400 text-sm" }, "Connexion aux systèmes de l'hôpital en cours"),
          h(
            "button",
            {
              type: "button",
              class: "mt-2 px-4 py-2 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 font-tech text-sm rounded transition-all",
              onClick: () => handleExitRoom(),
            },
            "RETOUR",
          ),
        ],
      );
  },
};

const createRoomComponent = (loader) =>
  lazyComponent(loader, { loadingComponent: RoomLoadingPanel, delay: 200, timeout: 20000 });

// Lazy loading des 9 salles du jeu
const ROOM_COMPONENTS = {
  server: createRoomComponent(() => import("./components/rooms/ServerRoom.vue")),
  "dna-lab": createRoomComponent(() => import("./components/rooms/DNARoom.vue")),
  imaging: createRoomComponent(() => import("./components/rooms/ImagingRoom.vue")),
  heart: createRoomComponent(() => import("./components/rooms/HeartRoom.vue")),
  prosthesis: createRoomComponent(() => import("./components/rooms/ProsthesisRoom.vue")),
  eye: createRoomComponent(() => import("./components/rooms/EyeRoom.vue")),
  pathology: createRoomComponent(() => import("./components/rooms/PathologyRoom.vue")),
  audition: createRoomComponent(() => import("./components/rooms/AuditionRoom.vue")),
  final: createRoomComponent(() => import("./components/rooms/FinalRoom.vue")),
};

// --- État du jeu ---
const {
  gameState,
  startGame,
  enterRoom,
  exitRoom,
  unlockRoom,
  unlockAllRooms,
  resetGame,
  restoreSavedGame,
  finishGame,
  completeRoom,
  isGameComplete,
  markDevToolsUsed,
  formatTime,
} = useGameState();

const { showError, showSuccess, showWarning, showInfo, clearToasts } = useToast();
const { audioState, requestAudioPermission, stopAllSounds } = useAudio();
const { user, isAuthenticated, logout, refreshUser } = useAuth();
const { submitScore } = useScores();

// Gestionnaire des briefings
const {
  activeBriefing,
  closeActiveBriefing,
  showRoomIntro,
  showRoomFinish,
  showMissionBriefing,
  playActiveBriefingVoice,
  isBriefingShown,
} = useBriefing();

// États de l'interface
const showTeamSetup = ref(false);
const showLoadingScreen = ref(false);
const loadingTeamName = ref("");
const loadingPlayers = ref([]);
const showAudioActivationModal = ref(false);
const audioPermissionPending = ref(false);
const audioPromptAfterResume = ref(false); // modale audio rouverte après la reprise d'une partie
const missionBriefingPending = ref(false);
const hasDecidedAudio = ref(false);
const showFinalScore = ref(false);
const finalScoreData = ref(null);
const saveStatus = ref(null); // 'pending' | 'saved' | 'failed' | 'unauthenticated' | 'devtools'
const showAuthModal = ref(false);
const showUserProfile = ref(false);
const showScoresModal = ref(false);
const showQuitConfirm = ref(false);
const quitCancelButton = ref(null);

// Une partie est « en cours » tant qu'elle n'est pas terminée (l'écran de score n'en fait plus partie)
const isGameInProgress = computed(() => gameState.isGameStarted && !gameState.isGameOver);

// Salle active
const currentRoomComponent = computed(() => {
  return gameState.currentRoom ? ROOM_COMPONENTS[gameState.currentRoom] || null : null;
});

// Utilitaire de défilement
const scrollToTop = (behavior = "instant") => {
  window.scrollTo({ top: 0, left: 0, behavior });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

// --- Score en attente de sauvegarde (survit à un rechargement de la page) ---

const PENDING_SCORE_KEY = "cyberhopital:pending-score:v1";
const PENDING_SCORE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const deepFreeze = (value) => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

const savePendingScore = (snapshot) => {
  try {
    localStorage.setItem(PENDING_SCORE_KEY, JSON.stringify({ savedAt: Date.now(), snapshot }));
  } catch {
    // Stockage indisponible : le score reste au moins en mémoire
  }
};

const clearPendingScore = () => {
  try {
    localStorage.removeItem(PENDING_SCORE_KEY);
  } catch {
    // Ignorer
  }
};

const loadPendingScore = () => {
  try {
    const raw = localStorage.getItem(PENDING_SCORE_KEY);
    if (!raw) return null;
    const { savedAt, snapshot } = JSON.parse(raw) || {};
    const isValid =
      snapshot &&
      Number.isFinite(savedAt) &&
      Date.now() - savedAt < PENDING_SCORE_MAX_AGE_MS &&
      Number.isFinite(snapshot.score) &&
      Number.isFinite(snapshot.duration) &&
      typeof snapshot.teamName === "string";
    if (!isValid) {
      clearPendingScore();
      return null;
    }
    return deepFreeze({
      ...snapshot,
      players: Array.isArray(snapshot.players) ? snapshot.players : [],
      roomTimes: snapshot.roomTimes || {},
      roomErrors: snapshot.roomErrors || {},
      roomHints: snapshot.roomHints || {},
    });
  } catch {
    clearPendingScore();
    return null;
  }
};

// --- Démarrage de la mission ---

const handleStartMission = () => {
  reloadIfFailed("TeamSetupModal");
  showTeamSetup.value = true;
};

let loadingScreenFailed = false;

// Remet à zéro tout ce qui concerne la partie (briefing ouvert, sons, score final, sauvegarde)
let endProcessed = false;
let finalScoreTimer = null;

const resetRun = () => {
  if (finalScoreTimer) {
    clearTimeout(finalScoreTimer);
    finalScoreTimer = null;
  }
  // Fermer le briefing AVANT le reset : il est marqué « vu » sur l'ancienne partie, pas sur la suivante
  closeActiveBriefing();
  stopAllSounds();
  // Les notifications de la partie précédente ne doivent pas apparaître dans celle de l'équipe suivante
  clearToasts();
  resetGame();
  endProcessed = false;
  showFinalScore.value = false;
  finalScoreData.value = null;
  saveStatus.value = null;
  showQuitConfirm.value = false;
  showAudioActivationModal.value = false;
  audioPromptAfterResume.value = false;
  clearPendingScore();
};

const beginGame = (teamData) => {
  if (gameState.isGameStarted || finalScoreData.value) {
    resetRun();
  }
  endProcessed = false;
  startGame(teamData);
  // Préchargement de l'écran de score final tant que le réseau est disponible
  loadFinalScore().catch(() => {});
};

const handleStartGame = async (teamData) => {
  showTeamSetup.value = false;
  if (loadingScreenFailed) {
    // L'écran de chargement n'a pas pu être téléchargé : on lance directement la mission
    beginGame(teamData);
    await nextTick();
    scrollToTop("instant");
    return;
  }
  await nextTick();
  loadingTeamName.value = teamData.name;
  loadingPlayers.value = teamData.players;
  showLoadingScreen.value = true;
};

const handleLoadingComplete = async () => {
  if (!showLoadingScreen.value) return; // évite un double démarrage
  showLoadingScreen.value = false;
  beginGame({
    name: loadingTeamName.value,
    players: loadingPlayers.value,
  });
  await nextTick();
  scrollToTop("instant");
};

// --- Navigation dans les salles ---

const handleEnterRoom = async (roomId) => {
  if (!isGameInProgress.value || !ROOM_IDS.includes(roomId)) return;

  // Attendre la décision audio et l'ouverture du briefing de mission : sinon celui-ci écraserait
  // l'introduction de la salle (ou serait reporté après la première salle)
  if (showAudioActivationModal.value || audioPermissionPending.value || missionBriefingPending.value) return;

  if (gameState.completedRooms.includes(roomId)) {
    showInfo("SALLE DÉJÀ SÉCURISÉE", "Cette salle est déjà sécurisée. Passez à la salle suivante !");
    return;
  }

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
  if (gameState.currentRoom === roomId) {
    await showRoomIntro(roomId);
  }
};

const handleExitRoom = async () => {
  if (!gameState.currentRoom) return;
  exitRoom();
  await nextTick();
  scrollToTop("instant");
};

// Un import dynamique échoué reste en échec jusqu'au rechargement (cache des modules du navigateur,
// ou nouvelle version déployée) : si le serveur répond de nouveau, on recharge la page, la partie est reprise.
const CHUNK_RELOAD_GUARD_KEY = "cyberhopital:chunk-reload";
const CHUNK_RELOAD_MIN_INTERVAL_MS = 60 * 1000;

// Rechargement sans perte : partie en cours (sauvegardée) ou page d'accueil sans écran de score affiché
const canReloadSafely = () =>
  isGameInProgress.value || (!gameState.isGameStarted && !finalScoreData.value && !showLoadingScreen.value);

const reloadForFreshChunks = async ({ outsideGame = false } = {}) => {
  const isSafe = () => (outsideGame ? canReloadSafely() : isGameInProgress.value);
  try {
    const lastReload = Number(sessionStorage.getItem(CHUNK_RELOAD_GUARD_KEY)) || 0;
    if (Date.now() - lastReload < CHUNK_RELOAD_MIN_INTERVAL_MS || !isSafe()) return false;
    const response = await fetch(window.location.pathname, { method: "HEAD", cache: "no-store" });
    if (!response.ok || !isSafe()) return false;
    sessionStorage.setItem(CHUNK_RELOAD_GUARD_KEY, String(Date.now()));
    showInfo(
      "RECHARGEMENT",
      isGameInProgress.value
        ? "Rechargement de la page pour récupérer la dernière version du jeu… Votre progression est sauvegardée."
        : "Rechargement de la page pour récupérer la dernière version du jeu…",
    );
    setTimeout(() => window.location.reload(), 1200);
    return true;
  } catch {
    return false;
  }
};

// Fichier JS/CSS d'un chargement à la demande introuvable (nouvelle version déployée pendant que l'onglet
// était ouvert) : on recharge la page si c'est sans risque. L'erreur reste aussi gérée là où elle survient.
const handlePreloadError = () => {
  reloadForFreshChunks({ outsideGame: true });
};

const handleRoomLoadFailure = async (roomId, error) => {
  console.error(`[App] Impossible de charger la salle "${roomId}" :`, error);
  if (gameState.currentRoom === roomId) {
    handleExitRoom();
  }
  if (await reloadForFreshChunks()) return;
  showError(
    "CHARGEMENT IMPOSSIBLE",
    "La salle n'a pas pu être chargée. Vérifiez la connexion puis cliquez à nouveau sur la salle. Votre progression est sauvegardée.",
    8000,
  );
};

// --- Fin de partie (traitée une seule fois) ---

const FINAL_SCORE_DELAY_MS = 2000;

const buildEndSnapshot = () => {
  const realTime = gameState.timer;
  const penaltyTime = gameState.penaltyTime;
  const duration = realTime + penaltyTime;
  const breakdown = computeScoreBreakdown({
    totalTime: duration,
    errors: gameState.errors,
    hints: gameState.hintsUsed,
  });
  gameState.finalScore = breakdown.total;

  return deepFreeze({
    score: breakdown.total,
    timeScore: breakdown.timeScore,
    errorScore: breakdown.errorScore,
    hintScore: breakdown.hintScore,
    duration, // temps réel + pénalités (s)
    totalTime: duration, // alias de duration
    realTime, // temps réel (s)
    penaltyTime,
    roomsCompleted: gameState.completedRooms.length,
    errors: gameState.errors,
    hints: gameState.hintsUsed,
    completed: true,
    teamName: gameState.teamName,
    players: [...gameState.players],
    roomTimes: { ...gameState.roomTimes },
    roomErrors: { ...gameState.roomErrors },
    roomHints: { ...gameState.roomHints },
  });
};

const formatNote = (score) => (Number(score) || 0).toFixed(1);

let inFlightSnapshot = null;

const submitFinalScore = async () => {
  const snapshot = finalScoreData.value;
  if (!snapshot || inFlightSnapshot === snapshot) return;
  if (saveStatus.value === "devtools" || saveStatus.value === "saved") return;

  if (!isAuthenticated.value) {
    saveStatus.value = "unauthenticated";
    showWarning(
      "CONNEXION REQUISE",
      "Connectez-vous avec « SAUVEGARDER MON SCORE » pour enregistrer votre note.",
    );
    return;
  }

  inFlightSnapshot = snapshot;
  saveStatus.value = "pending";
  try {
    const response = await submitScore(snapshot);
    // Note recalculée par le serveur (identique à celle du client, mais c'est elle qui est enregistrée)
    const savedNote = Number.isFinite(Number(response?.score?.score)) ? Number(response.score.score) : snapshot.score;
    showSuccess("SCORE SAUVEGARDÉ", `Votre note de ${formatNote(savedNote)}/20 a été enregistrée !`);
    if (finalScoreData.value === snapshot) {
      saveStatus.value = "saved";
      clearPendingScore();
    }
    // Statistiques du profil à jour sans attendre sa prochaine ouverture (échec sans importance)
    refreshUser().catch(() => {});
  } catch (error) {
    if (finalScoreData.value === snapshot) {
      saveStatus.value = isAuthenticated.value ? "failed" : "unauthenticated";
    }
    const reason = String(error?.message || "").trim() || "Le score n'a pas pu être enregistré.";
    showError(
      "SAUVEGARDE IMPOSSIBLE",
      `${/[.!?…]$/.test(reason) ? reason : `${reason}.`} Utilisez « SAUVEGARDER MON SCORE » pour réessayer.`,
      6000,
    );
  } finally {
    if (inFlightSnapshot === snapshot) inFlightSnapshot = null;
  }
};

const processGameEnd = (lastRoomId = null) => {
  if (endProcessed || !gameState.isGameStarted || gameState.isGameOver) return;
  endProcessed = true;

  // Chrono arrêté, sauvegarde de partie supprimée ; l'état reste lisible jusqu'au reset
  finishGame();
  const snapshot = buildEndSnapshot();
  const devToolsUsed = gameState.devToolsUsed;

  finalScoreData.value = snapshot;
  saveStatus.value = devToolsUsed ? "devtools" : "pending";
  if (!devToolsUsed) savePendingScore(snapshot);

  // Aucune modale de partie ne doit masquer le débriefing ni l'écran de score
  showQuitConfirm.value = false;
  showAudioActivationModal.value = false;
  if (gameState.currentRoom) exitRoom();
  if (lastRoomId) showRoomFinish(lastRoomId);

  finalScoreTimer = setTimeout(() => {
    finalScoreTimer = null;
    showFinalScore.value = true;
    scrollToTop("instant");
    if (saveStatus.value === "devtools") {
      showInfo("MODE DÉVELOPPEMENT", "Partie assistée par les DevTools : le score ne sera pas enregistré.");
    } else {
      submitFinalScore();
    }
  }, FINAL_SCORE_DELAY_MS);
};

const handleRoomCompleted = async (roomId) => {
  if (!ROOM_IDS.includes(roomId) || !isGameInProgress.value) return;

  // Filet de sécurité idempotent (la salle l'a normalement déjà appelé) : débloque aussi la salle suivante
  completeRoom(roomId);

  if (isGameComplete()) {
    processGameEnd(roomId);
    return;
  }

  if (gameState.currentRoom === roomId) {
    exitRoom();
  }
  await nextTick();
  scrollToTop("instant");

  // Briefing de félicitations
  await showRoomFinish(roomId);
};

// Si l'événement room-completed s'est perdu (salle démontée), la fin de partie est quand même déclenchée
watch(
  () => isGameInProgress.value && isGameComplete(),
  (complete) => {
    if (complete) {
      processGameEnd(gameState.completedRooms[gameState.completedRooms.length - 1] || null);
    }
  },
);

// --- Score final : fermer / recommencer / réessayer la sauvegarde ---

const handleCloseFinalScore = async () => {
  resetRun();
  await nextTick();
  scrollToTop("instant");
};

const handleRestartGame = async () => {
  resetRun();
  reloadIfFailed("TeamSetupModal");
  showTeamSetup.value = true;
  await nextTick();
  scrollToTop("instant");
};

const handleRetrySave = () => {
  if (!finalScoreData.value) return;
  if (["saved", "pending", "devtools"].includes(saveStatus.value)) return;
  if (!isAuthenticated.value) {
    saveStatus.value = "unauthenticated";
    openAuthModal();
    return;
  }
  submitFinalScore();
};

// Sauvegarde automatique après connexion pendant que l'écran de score est ouvert
watch(isAuthenticated, (authenticated, wasAuthenticated) => {
  if (
    authenticated &&
    !wasAuthenticated &&
    finalScoreData.value &&
    saveStatus.value === "unauthenticated"
  ) {
    submitFinalScore();
  }
});

// --- Abandon de la mission ---

const openQuitConfirm = async () => {
  if (!isGameInProgress.value) return;
  showQuitConfirm.value = true;
  await nextTick();
  quitCancelButton.value?.focus();
};

const closeQuitConfirm = () => {
  showQuitConfirm.value = false;
};

const confirmAbandonMission = async () => {
  showQuitConfirm.value = false;
  if (!gameState.isGameStarted) return;
  resetRun();
  showInfo("MISSION ABANDONNÉE", "La progression a été effacée. Une nouvelle équipe peut lancer sa mission.");
  await nextTick();
  scrollToTop("smooth");
};

const handleKeydown = (event) => {
  if (event.key === "Escape" && showQuitConfirm.value) {
    closeQuitConfirm();
  }
};

// --- Audio initial ---

const AUDIO_PERMISSION_TIMEOUT_MS = 5000;

const maybeShowMissionBriefing = async () => {
  // Le briefing de mission ne s'affiche que sur la sélection des salles (jamais par-dessus l'intro d'une salle)
  if (!isGameInProgress.value || gameState.currentRoom) return;
  if (isBriefingShown("audio") || audioPermissionPending.value || missionBriefingPending.value) return;

  if (!hasDecidedAudio.value && !audioState.hasPermission) {
    showAudioActivationModal.value = true;
    return;
  }

  // Le briefing est téléchargé avant d'apparaître : les salles restent bloquées pendant ce temps
  missionBriefingPending.value = true;
  try {
    await showMissionBriefing();
  } finally {
    missionBriefingPending.value = false;
  }
};

const handleActivateAudio = async () => {
  if (audioPermissionPending.value) return;
  audioPermissionPending.value = true;
  hasDecidedAudio.value = true;
  audioPromptAfterResume.value = false;

  try {
    // La modale reste affichée (et bloque les salles) jusqu'à la réponse du navigateur
    const permissionRequest = requestAudioPermission();
    const granted = await Promise.race([
      permissionRequest,
      new Promise((resolve) => setTimeout(() => resolve(null), AUDIO_PERMISSION_TIMEOUT_MS)),
    ]);
    if (granted === null) {
      // Réponse tardive du navigateur : la voix du briefing alors affiché démarre dès l'autorisation
      Promise.resolve(permissionRequest)
        .then((lateGranted) => {
          if (lateGranted && activeBriefing.value) playActiveBriefingVoice();
        })
        .catch(() => {});
    }
    if (granted === false) {
      showError("Permission refusée", "L'audio ne peut pas être activé sans votre autorisation.");
    } else if (granted && activeBriefing.value) {
      playActiveBriefingVoice();
    }
  } catch (error) {
    console.warn("Erreur d'activation audio:", error);
  } finally {
    audioPermissionPending.value = false;
    showAudioActivationModal.value = false;
  }

  await maybeShowMissionBriefing();
};

const handleContinueWithoutAudio = async () => {
  if (audioPermissionPending.value) return;
  showAudioActivationModal.value = false;
  audioPromptAfterResume.value = false;
  hasDecidedAudio.value = true;
  await maybeShowMissionBriefing();
};

// --- Outils de développement (chaque action marque la partie comme assistée) ---

const handleDevStartGame = (teamData) => {
  showTeamSetup.value = false;
  showLoadingScreen.value = false;
  beginGame(teamData);
  markDevToolsUsed();
};

const handleDevEnterRoom = (roomId) => {
  if (!isGameInProgress.value) return;
  markDevToolsUsed();
  unlockRoom(roomId);
  handleEnterRoom(roomId);
};

const handleUnlockAllRooms = () => {
  if (!isGameInProgress.value) return;
  markDevToolsUsed();
  unlockAllRooms();
  showSuccess("DÉVELOPPEMENT", "Toutes les salles ont été débloquées !");
};

const handleResetGame = () => {
  resetRun();
  showInfo("DÉVELOPPEMENT", "Jeu réinitialisé");
};

// Fin de jeu manuelle (DevTools) : jamais soumise au classement
const handleTriggerEndGame = () => {
  if (!isGameInProgress.value) return;
  markDevToolsUsed();
  ROOM_IDS.forEach((roomId) => completeRoom(roomId));
  showSuccess("DÉVELOPPEMENT", "Fin de jeu déclenchée manuellement !");
  processGameEnd(null);
};

// --- Modales & authentification ---

const openAuthModal = () => {
  reloadIfFailed("AuthModal");
  showAuthModal.value = true;
};

const openScoresModal = () => {
  reloadIfFailed("ScoresModal");
  showScoresModal.value = true;
};

const openUserProfile = () => {
  reloadIfFailed("UserProfile");
  showUserProfile.value = true;
};

const handleAuthSuccess = () => {
  showAuthModal.value = false;
};

const handleLogout = async () => {
  if (isGameInProgress.value) {
    showWarning(
      "DÉCONNEXION BLOQUÉE",
      "Impossible de se déconnecter pendant une mission en cours. Terminez-la, ou abandonnez-la avec le bouton « ABANDONNER » (icône drapeau) en haut de l'écran.",
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

// --- Erreurs de chargement des composants à la demande ---

const handleLazyLoadFailure = (name, error) => {
  console.error(`[App] Impossible de charger le composant ${name} :`, error);
  failedLazyComponents.add(name);

  if (name === "DevTools") return;
  if (name === "LoadingScreen") {
    loadingScreenFailed = true;
    if (showLoadingScreen.value) handleLoadingComplete();
    return;
  }
  if (name === "FinalScore") {
    showError(
      "AFFICHAGE IMPOSSIBLE",
      "L'écran de score n'a pas pu être chargé. Vérifiez la connexion puis rechargez la page : votre note sera restaurée.",
      10000,
    );
    return;
  }
  showError(
    "CHARGEMENT IMPOSSIBLE",
    "Cette fenêtre n'a pas pu être chargée. Vérifiez la connexion puis réessayez.",
    6000,
  );
};

onErrorCaptured((error, instance) => {
  const type = instance?.$?.type;
  if (!type) return;

  const failedRoomId = ROOM_IDS.find((id) => ROOM_COMPONENTS[id] === type);
  if (failedRoomId) {
    handleRoomLoadFailure(failedRoomId, error);
    return false;
  }

  const lazyName = LAZY_COMPONENT_NAMES.get(type);
  if (lazyName) {
    handleLazyLoadFailure(lazyName, error);
    return false;
  }
});

// --- Arrivée sur l'écran de sélection des salles ---
watch(
  () => isGameInProgress.value && !gameState.currentRoom,
  (isOnRoomSelection) => {
    if (isOnRoomSelection) {
      scrollToTop("instant");
      maybeShowMissionBriefing();
    }
  },
);

// --- Reprise d'une partie sauvegardée (avant le premier rendu) ---
if (restoreSavedGame()) {
  showInfo(
    "MISSION REPRISE",
    `Bon retour, équipe ${gameState.teamName} ! Progression restaurée : ${gameState.completedRooms.length}/${ROOM_IDS.length} salles sécurisées.`,
    6000,
  );
  // Le navigateur exige un nouveau clic pour réactiver le son après un rechargement
  if (!audioState.hasPermission) {
    audioPromptAfterResume.value = true;
    showAudioActivationModal.value = true;
  }
  loadFinalScore().catch(() => {});
} else {
  // Score d'une partie terminée mais pas encore sauvegardée (page rechargée sur l'écran de score)
  const pendingScore = loadPendingScore();
  if (pendingScore) {
    finalScoreData.value = pendingScore;
    saveStatus.value = null;
    showFinalScore.value = true;
    submitFinalScore();
  }
}

onMounted(async () => {
  initAnimations();
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("vite:preloadError", handlePreloadError);

  try {
    const isApiHealthy = await checkApiHealth();
    if (!isApiHealthy) {
      showError(
        "SERVEUR INDISPONIBLE",
        "Le serveur de l'hôpital n'est pas joignable : vous pouvez jouer, mais les scores ne pourront pas être sauvegardés pour le moment.",
      );
    }
  } catch (error) {
    console.warn("Vérification API ignorée:", error);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("vite:preloadError", handlePreloadError);
  if (finalScoreTimer) clearTimeout(finalScoreTimer);
});
</script>

<style>
#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}
</style>
