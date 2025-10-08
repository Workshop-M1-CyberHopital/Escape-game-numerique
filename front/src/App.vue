<template>
    <div class="relative z-10 w-full min-h-screen">
        <!-- Animated Background Canvas -->
        <canvas id="animated-bg"></canvas>

        <!-- Header avec authentification -->
        <header
            class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-cyber-blue/30"
        >
            <div class="max-w-7xl mx-auto px-4 py-3">
                <div class="flex items-center justify-between">
                    <!-- Logo/Titre -->
                    <div class="flex items-center space-x-4">
                        <h1
                            class="text-xl font-cyber font-bold text-cyber-blue"
                        >
                            CYBER-HÔPITAL
                        </h1>
                        <span class="text-gray-400 font-tech text-sm">
                            Mission Résilience
                        </span>
                    </div>

                    <!-- Navigation -->
                    <div class="flex items-center space-x-4">
                        <!-- Bouton Scores -->
                        <button
                            @click="showScoresModal = true"
                            class="px-4 py-2 bg-cyber-green/20 hover:bg-cyber-green/30 text-cyber-green font-cyber font-bold rounded-lg transition-all"
                        >
                            SCORES
                        </button>

                        <!-- Authentification -->
                        <div
                            v-if="!isAuthenticated"
                            class="flex items-center space-x-2"
                        >
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

        <!-- Espace pour le header fixe -->
        <div class="h-16"></div>

        <!-- Game Started: Show Rooms -->
        <div v-if="gameState.isGameStarted">
            <!-- Rooms Section - Only show when not in a room -->
            <RoomsSection
                v-if="!gameState.currentRoom"
                :unlocked-rooms="gameState.unlockedRooms"
                :completed-rooms="gameState.completedRooms"
                @enter-room="handleEnterRoom"
            />

            <!-- Current Room -->
            <ServerRoom
                v-if="gameState.currentRoom === 'server'"
                @exit-room="handleExitRoom"
                @room-completed="handleRoomCompleted"
            />

            <DNARoom
                v-if="gameState.currentRoom === 'dna-lab'"
                @exit-room="handleExitRoom"
                @room-completed="handleRoomCompleted"
            />

            <ImagingRoom
                v-if="gameState.currentRoom === 'imaging'"
                @exit-room="handleExitRoom"
                @room-completed="handleRoomCompleted"
            />

            <HeartRoom
                v-if="gameState.currentRoom === 'heart'"
                @exit-room="handleExitRoom"
                @room-completed="handleRoomCompleted"
            />

            <ProsthesisRoom
                v-if="gameState.currentRoom === 'prosthesis'"
                @exit-room="handleExitRoom"
                @room-completed="handleRoomCompleted"
            />
        </div>

        <!-- Game Not Started: Show Landing Page -->
        <div v-else>
            <!-- Hero Section -->
            <HeroSection @start-mission="handleStartMission" />

            <!-- Team Setup Modal -->
            <TeamSetupModal
                :visible="showTeamSetup"
                :connected-player-name="user?.username || ''"
                @close="showTeamSetup = false"
                @start-game="handleStartGame"
            />

            <!-- Loading Screen -->
            <LoadingScreen
                :visible="showLoadingScreen"
                :team-name="loadingTeamName"
                :players="loadingPlayers"
                @complete="handleLoadingComplete"
            />

            <!-- Rooms Section (Preview) -->
            <RoomsSection />

            <!-- Footer -->
            <footer class="py-8 px-4 border-t border-gray-800">
                <div class="max-w-7xl mx-auto text-center">
                    <p class="text-gray-500 font-tech text-sm">
                        © 2024 Cyber-Hôpital – Mission Résilience | Escape Game
                        Numérique Pédagogique
                    </p>
                </div>
            </footer>
        </div>

        <!-- Final Score Modal -->
        <FinalScore
            v-if="showFinalScore"
            :score-data="finalScoreData"
            @close="handleCloseFinalScore"
            @restart="handleRestartGame"
        />

        <!-- Toast Container -->
        <ToastContainer />

        <!-- Audio Controls -->
        <AudioControls />

        <!-- Auth Modal -->
        <AuthModal
            :visible="showAuthModal"
            @close="showAuthModal = false"
            @success="handleAuthSuccess"
        />

        <!-- User Profile Modal -->
        <UserProfile
            :visible="showUserProfile"
            :game-state="gameState"
            @close="showUserProfile = false"
        />

        <!-- Scores Modal -->
        <ScoresModal
            :visible="showScoresModal"
            @close="showScoresModal = false"
        />

        <!-- DevTools -->
        <DevTools
            :game-state="gameState"
            @start-game="handleStartGame"
            @enter-room="handleEnterRoom"
            @unlock-all-rooms="handleUnlockAllRooms"
            @reset-game="handleResetGame"
        />

        <!-- Audio Briefing -->
        <AudioBriefing
            :visible="showAudioBriefing && !isBriefingShown('audio')"
            @close="handleCloseAudioBriefing"
        />

        <!-- Server Room Briefing -->
        <ServerRoomBriefing
            :visible="showServerRoomBriefing && !isBriefingShown('serverRoom')"
            @close="handleCloseServerRoomBriefing"
        />

        <!-- DNA Room Briefing -->
        <DNARoomBriefing
            :visible="showDNARoomBriefing"
            @close="handleCloseDNARoomBriefing"
        />

        <FinishServerRoomBriefing
            :visible="showFinishServerRoomBriefing"
            @close="handleCloseFinishServerRoomBriefing"
        />

        <FinishDNARoomBriefing
            :visible="showFinishDNARoomBriefing"
            @close="handleCloseFinishDNARoomBriefing"
        />

        <ImagingRoomBriefing
            :visible="showImagingRoomBriefing"
            @close="handleCloseImagingRoomBriefing"
        />

        <FinishImagingRoomBriefing
            :visible="showFinishImagingRoomBriefing"
            @close="handleCloseFinishImagingRoomBriefing"
        />

        <HeartRoomBriefing
            :visible="showHeartRoomBriefing"
            @close="handleCloseHeartRoomBriefing"
        />

        <!-- Audio Activation Button -->
        <div
            v-if="showAudioActivationButton"
            class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
            <div
                class="bg-gray-900/95 border-2 border-cyber-blue rounded-lg p-8 max-w-md mx-4 text-center"
            >
                <div class="mb-6">
                    <div
                        class="w-16 h-16 mx-auto mb-4 bg-cyber-blue/20 rounded-full flex items-center justify-center"
                    >
                        <svg
                            class="w-8 h-8 text-cyber-blue"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-cyber-blue mb-2">
                        🎵 ACTIVATION AUDIO
                    </h3>
                    <p class="text-gray-300 mb-6">
                        Pour une expérience immersive complète, activez l'audio
                        pour entendre le briefing de mission.
                    </p>
                </div>

                <div class="flex gap-4 justify-center">
                    <button
                        @click="activateAudio"
                        class="px-6 py-3 bg-cyber-blue text-black font-bold rounded-lg hover:bg-cyber-blue/80 transition-all duration-300 hover:scale-105"
                    >
                        🎵 ACTIVER L'AUDIO
                    </button>
                    <button
                        @click="continueWithoutAudio"
                        class="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-all duration-300"
                    >
                        CONTINUER SANS AUDIO
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import HeroSection from "./components/HeroSection.vue";
import TeamSetupModal from "./components/TeamSetupModal.vue";
import LoadingScreen from "./components/LoadingScreen.vue";
import RoomsSection from "./components/RoomsSection.vue";
import ServerRoom from "./components/rooms/ServerRoom.vue";
import DNARoom from "./components/rooms/DNARoom.vue";
import ImagingRoom from "./components/rooms/ImagingRoom.vue";
import HeartRoom from "./components/rooms/HeartRoom.vue";
import ProsthesisRoom from "./components/rooms/ProsthesisRoom.vue";
import ToastContainer from "./components/ToastContainer.vue";
import AudioControls from "./components/AudioControls.vue";
import DevTools from "./components/DevTools.vue";
import AudioBriefing from "./components/briefing/AudioBriefing.vue";
import FinishServerRoomBriefing from "./components/briefing/FinishServerRoomBriefing.vue";
import FinishDNARoomBriefing from "./components/briefing/FinishDNARoomBriefing.vue";
import FinishImagingRoomBriefing from "./components/briefing/FinishImagingRoomBriefing.vue";
import ServerRoomBriefing from "./components/briefing/ServerRoomBriefing.vue";
import DNARoomBriefing from "./components/briefing/DNARoomBriefing.vue";
import ImagingRoomBriefing from "./components/briefing/ImagingRoomBriefing.vue";
import HeartRoomBriefing from "./components/briefing/HeartRoomBriefing.vue";
import FinalScore from "./components/FinalScore.vue";
import { useGameState } from "./composables/useGameState";
import { useToast } from "./composables/useToast";
import { useAudio } from "./composables/useAudio";
import { useAuth } from "./composables/useAuth";
import { useScores } from "./composables/useScores";
import { initAnimations } from "./utils/animations";
import AuthModal from "./components/AuthModal.vue";
import UserProfile from "./components/UserProfile.vue";
import ScoresModal from "./components/ScoresModal.vue";

const {
    gameState,
    startGame,
    enterRoom,
    exitRoom,
    unlockRoom,
    unlockAllRooms,
    resetGame,
    formatTime,
    calculateFinalScore,
    isGameComplete,
    markBriefingAsShown,
    isBriefingShown,
} = useGameState();
const { showError, showSuccess, showWarning, showInfo } = useToast();
const { audioState, requestAudioPermission, playSound, stopSound } = useAudio();
const { user, isAuthenticated, logout } = useAuth();
const { submitScore, calculateScore } = useScores();
const showTeamSetup = ref(false);
const showLoadingScreen = ref(false);
const loadingTeamName = ref("");
const loadingPlayers = ref([]);
const hasPlayedRoomSelectionAudio = ref(false);
const showAudioActivationButton = ref(false);
const showAudioBriefing = ref(false);
const showServerRoomBriefing = ref(false);
const hasPlayedServerRoomAudio = ref(false);
const showDNARoomBriefing = ref(false);
const hasPlayedDNARoomAudio = ref(false);
const showFinishServerRoomBriefing = ref(false);
const hasPlayedFinishServerRoomAudio = ref(false);
const showFinishDNARoomBriefing = ref(false);
const hasPlayedFinishDNARoomAudio = ref(false);
const showImagingRoomBriefing = ref(false);
const hasPlayedImagingRoomAudio = ref(false);
const showFinishImagingRoomBriefing = ref(false);
const hasPlayedFinishImagingRoomAudio = ref(false);
const showHeartRoomBriefing = ref(false);
const hasPlayedHeartRoomAudio = ref(false);
const showFinalScore = ref(false);
const finalScoreData = ref(null);

// État des modales d'authentification
const showAuthModal = ref(false);
const showUserProfile = ref(false);
const showScoresModal = ref(false);

// Fonction pour jouer le son de sélection des salles
const playRoomSelectionAudio = async () => {
    try {
        console.log("🎵 Appel de playSound...");

        // Afficher le briefing pendant la lecture
        showAudioBriefing.value = true;

        await playSound("roomSelection");
        hasPlayedRoomSelectionAudio.value = true;
        showAudioActivationButton.value = false;
        console.log("✅ Son joué avec succès");

        // Masquer le briefing après la lecture (environ 60 secondes)
        setTimeout(() => {
            showAudioBriefing.value = false;
        }, 60000);
    } catch (error) {
        console.error("❌ Erreur lors de la lecture du son:", error);
        showAudioBriefing.value = false;
    }
};

// Fonction pour activer l'audio manuellement
const activateAudio = async () => {
    console.log("🎵 Activation manuelle de l'audio par l'utilisateur...");
    try {
        // Demander la permission audio d'abord
        const permissionGranted = await requestAudioPermission();
        console.log("🎵 Permission audio accordée:", permissionGranted);

        if (permissionGranted) {
            console.log("🎵 Permission accordée - Lancement de l'audio...");
            await playRoomSelectionAudio();
        } else {
            console.log("❌ Permission audio refusée par l'utilisateur");
            showError("Permission refusée", "L'audio ne peut pas être activé sans votre autorisation.");
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'activation audio:", error);
        showError("Erreur audio", "Impossible d'activer l'audio. Vérifiez vos paramètres de navigateur.");
    }
};

// Fonction pour continuer sans audio mais avec le briefing
const continueWithoutAudio = () => {
    console.log("🎵 Continuation sans audio - Affichage du briefing seulement");
    
    // Masquer le bouton d'activation
    showAudioActivationButton.value = false;
    
    // Marquer comme joué pour éviter la répétition
    hasPlayedRoomSelectionAudio.value = true;
    
    // Afficher le briefing sans audio
    showAudioBriefing.value = true;
    
    // Masquer le briefing après la durée normale (environ 60 secondes)
    setTimeout(() => {
        showAudioBriefing.value = false;
    }, 60000);
};

// Fonction pour jouer le son de la Salle du Serveur
const playServerRoomAudio = async () => {
    try {
        console.log("🎵 Lecture du son de la Salle du Serveur...");

        // Afficher le briefing pendant la lecture
        showServerRoomBriefing.value = true;

        await playSound("serverRoom");
        hasPlayedServerRoomAudio.value = true;
        console.log("✅ Son de la Salle du Serveur joué avec succès");

        // Masquer le briefing après la lecture (environ 55 secondes)
        setTimeout(() => {
            showServerRoomBriefing.value = false;
        }, 55000);
    } catch (error) {
        console.error(
            "❌ Erreur lors de la lecture du son de la Salle du Serveur:",
            error,
        );
        showServerRoomBriefing.value = false;
    }
};

// Fonction pour jouer le son de la Salle ADN
const playDNARoomAudio = async () => {
    try {
        console.log("🎵 Lecture du son de la Salle ADN...");

        // Afficher le briefing pendant la lecture
        showDNARoomBriefing.value = true;

        await playSound("dnaRoom");
        hasPlayedDNARoomAudio.value = true;
        console.log("✅ Son de la Salle ADN joué avec succès");

        // Masquer le briefing après la lecture (environ 45 secondes)
        setTimeout(() => {
            showDNARoomBriefing.value = false;
        }, 45000);
    } catch (error) {
        console.error(
            "❌ Erreur lors de la lecture du son de la Salle ADN:",
            error,
        );
        showDNARoomBriefing.value = false;
    }
};

// Fonction pour jouer le son de la Salle d'Imagerie
const playImagingRoomAudio = async () => {
    try {
        console.log("🎵 Lecture du son de la Salle d'Imagerie...");

        // Afficher le briefing pendant la lecture
        showImagingRoomBriefing.value = true;

        await playSound("imagingRoom");
        hasPlayedImagingRoomAudio.value = true;
        console.log("✅ Son de la Salle d'Imagerie joué avec succès");

        // Masquer le briefing après la lecture (environ 45 secondes)
        setTimeout(() => {
            showImagingRoomBriefing.value = false;
        }, 45000);
    } catch (error) {
        console.error(
            "❌ Erreur lors de la lecture du son de la Salle d'Imagerie:",
            error,
        );
        showImagingRoomBriefing.value = false;
    }
};

// Fonction pour jouer le son de la Salle du Cœur
const playHeartRoomAudio = async () => {
    try {
        console.log("🎵 Lecture du son de la Salle du Cœur...");

        // Afficher le briefing pendant la lecture
        showHeartRoomBriefing.value = true;

        await playSound("heartRoom");
        hasPlayedHeartRoomAudio.value = true;
        console.log("✅ Son de la Salle du Cœur joué avec succès");

        // Masquer le briefing après la lecture (environ 45 secondes)
        setTimeout(() => {
            showHeartRoomBriefing.value = false;
        }, 45000);
    } catch (error) {
        console.error(
            "❌ Erreur lors de la lecture du son de la Salle du Cœur:",
            error,
        );
        showHeartRoomBriefing.value = false;
    }
};

// Fonctions de fermeture des popups avec arrêt audio
const handleCloseAudioBriefing = () => {
    showAudioBriefing.value = false;
    markBriefingAsShown("audio");
    stopSound("roomSelection");
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound("roomSelection");
    }, 100);
    console.log("🎵 Audio briefing fermé et son arrêté");
};

const handleCloseServerRoomBriefing = () => {
    showServerRoomBriefing.value = false;
    markBriefingAsShown("serverRoom");
    stopSound("serverRoom");
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound("serverRoom");
    }, 100);
    console.log("🎵 Server room briefing fermé et son arrêté");
};

const handleCloseDNARoomBriefing = () => {
    showDNARoomBriefing.value = false;
    stopSound("dnaRoom");
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound("dnaRoom");
    }, 100);
    console.log("🎵 DNA room briefing fermé et son arrêté");
};

const handleCloseImagingRoomBriefing = () => {
    showImagingRoomBriefing.value = false;
    stopSound("imagingRoom");
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound("imagingRoom");
    }, 100);
    console.log("🎵 Imaging room briefing fermé et son arrêté");
};

// Fonction pour jouer le son de félicitations ServerRoom
const playFinishServerRoomAudio = async () => {
    try {
        console.log("🎵 Lecture du son de félicitations ServerRoom...");
        showFinishServerRoomBriefing.value = true;
        await playSound("finishServerRoom");
        hasPlayedFinishServerRoomAudio.value = true;
        console.log("✅ Son de félicitations ServerRoom joué avec succès");
        setTimeout(() => {
            showFinishServerRoomBriefing.value = false;
        }, 30000); // 30 secondes
    } catch (error) {
        console.error(
            "❌ Erreur lors de la lecture du son de félicitations ServerRoom:",
            error,
        );
        showFinishServerRoomBriefing.value = false;
    }
};

const handleCloseFinishServerRoomBriefing = () => {
    showFinishServerRoomBriefing.value = false;
    stopSound("finishServerRoom");
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound("finishServerRoom");
    }, 100);
    console.log("🎵 Finish ServerRoom briefing fermé et son arrêté");
};

// Fonction pour jouer le son de félicitations DNARoom
const playFinishDNARoomAudio = async () => {
    try {
        console.log("🎵 Lecture du son de félicitations DNARoom...");
        showFinishDNARoomBriefing.value = true;
        await playSound("finishDNARoom");
        hasPlayedFinishDNARoomAudio.value = true;
        console.log("✅ Son de félicitations DNARoom joué avec succès");
        setTimeout(() => {
            showFinishDNARoomBriefing.value = false;
        }, 38000); // 38 secondes
    } catch (error) {
        console.error(
            "❌ Erreur lors de la lecture du son de félicitations DNARoom:",
            error,
        );
        showFinishDNARoomBriefing.value = false;
    }
};

const handleCloseFinishDNARoomBriefing = () => {
    showFinishDNARoomBriefing.value = false;
    stopSound("finishDNARoom");
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound("finishDNARoom");
    }, 100);
    console.log("🎵 Finish DNARoom briefing fermé et son arrêté");
};

// Fonction pour jouer le son de félicitations ImagingRoom
const playFinishImagingRoomAudio = async () => {
    try {
        console.log("🎵 Lecture du son de félicitations ImagingRoom...");
        showFinishImagingRoomBriefing.value = true;
        await playSound("finishImagingRoom");
        hasPlayedFinishImagingRoomAudio.value = true;
        console.log("✅ Son de félicitations ImagingRoom joué avec succès");
        setTimeout(() => {
            showFinishImagingRoomBriefing.value = false;
        }, 33000); // 33 secondes
    } catch (error) {
        console.error(
            "❌ Erreur lors de la lecture du son de félicitations ImagingRoom:",
            error,
        );
        showFinishImagingRoomBriefing.value = false;
    }
};

const handleCloseFinishImagingRoomBriefing = () => {
    showFinishImagingRoomBriefing.value = false;
    stopSound("finishImagingRoom");
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound("finishImagingRoom");
    }, 100);
    console.log("🎵 Finish ImagingRoom briefing fermé et son arrêté");
};

const handleCloseHeartRoomBriefing = () => {
    showHeartRoomBriefing.value = false;
    stopSound("heartRoom");
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound("heartRoom");
    }, 100);
    console.log("🎵 Heart Room briefing fermé et son arrêté");
};

const handleStartMission = () => {
    showTeamSetup.value = true;
};

const handleStartGame = async (teamData) => {
    // Fermer d'abord la modal
    showTeamSetup.value = false;

    // Détecter si c'est un démarrage depuis DevTool (équipe "Équipe DEV")
    const isDevToolStart = teamData.name === "Équipe DEV";

    if (isDevToolStart) {
        // Démarrage direct sans loading screen pour DevTool
        startGame({
            name: teamData.name,
            players: teamData.players,
        });
    } else {
        // Attendre un peu avant d'afficher l'écran de chargement pour le démarrage normal
        await nextTick();
        setTimeout(() => {
            showLoadingScreen.value = true;
            loadingTeamName.value = teamData.name;
            loadingPlayers.value = teamData.players;
        }, 100);
    }
};

const handleLoadingComplete = async () => {
    // Démarrer le jeu après le chargement
    startGame({
        name: loadingTeamName.value,
        players: loadingPlayers.value,
    });
    showLoadingScreen.value = false;

    // Attendre que le DOM soit mis à jour
    await nextTick();

    // Fonction de scroll vers le haut
    const scrollToTop = () => {
        console.log("🔄 Tentative de scroll vers le haut...");
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
            console.log("📍 Position actuelle:", currentScroll);
            if (currentScroll > 0) {
                console.log("⚠️ Scroll non réussi, nouvelle tentative...");
                scrollToTop();
            } else {
                console.log("✅ Scroll réussi vers le haut");
            }
        }, 100);
    };

    // Première tentative immédiate
    scrollToTop();

    // Tentatives supplémentaires avec des délais
    setTimeout(scrollToTop, 100);
    setTimeout(scrollToTop, 300);
    setTimeout(scrollToTop, 500);
};

const handleEnterRoom = async (roomId) => {
    // Vérifier si la salle est débloquée
    if (!gameState.unlockedRooms.includes(roomId)) {
        showError(
            "SALLE VERROUILLÉE",
            "Vous devez compléter les salles précédentes pour débloquer cette zone.",
        );
        return;
    }

    enterRoom(roomId);

    // Scroll vers le haut de la page après que le DOM soit mis à jour
    await nextTick();
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        // Méthode alternative pour assurer le scroll
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 50);

    // Jouer le son spécifique à la salle si c'est la première fois
    console.log("🔍 Debug handleEnterRoom:", {
        roomId,
        hasPlayedServerRoomAudio: hasPlayedServerRoomAudio.value,
        hasPlayedDNARoomAudio: hasPlayedDNARoomAudio.value,
        audioStateEnabled: audioState.isEnabled,
    });

    if (
        roomId === "server" &&
        !hasPlayedServerRoomAudio.value &&
        audioState.isEnabled
    ) {
        await playServerRoomAudio();
    } else if (roomId === "server" && !hasPlayedServerRoomAudio.value) {
        console.log("🎵 Audio désactivé - Affichage du briefing Server Room sans audio");
        showServerRoomBriefing.value = true;
        hasPlayedServerRoomAudio.value = true;
        setTimeout(() => {
            showServerRoomBriefing.value = false;
        }, 55000);
    } else if (
        roomId === "dna-lab" &&
        !hasPlayedDNARoomAudio.value &&
        audioState.isEnabled
    ) {
        console.log("🎵 Tentative de lecture du son DNA Room...");
        await playDNARoomAudio();
    } else if (roomId === "dna-lab") {
        console.log("❌ Conditions DNA Room non remplies:", {
            hasPlayedDNARoomAudio: hasPlayedDNARoomAudio.value,
            audioStateEnabled: audioState.isEnabled,
        });

        // Test: forcer l'affichage du popup DNA pour debug
        console.log("🧪 Test: Affichage forcé du popup DNA...");
        showDNARoomBriefing.value = true;
        setTimeout(() => {
            showDNARoomBriefing.value = false;
        }, 5000); // 5 secondes pour le test
    } else if (
        roomId === "imaging" &&
        !hasPlayedImagingRoomAudio.value &&
        audioState.isEnabled
    ) {
        console.log("🎵 Tentative de lecture du son Imaging Room...");
        await playImagingRoomAudio();
    } else if (
        roomId === "heart" &&
        !hasPlayedHeartRoomAudio.value &&
        audioState.isEnabled
    ) {
        console.log("🎵 Tentative de lecture du son Heart Room...");
        await playHeartRoomAudio();
    } else if (roomId === "heart") {
        console.log("❌ Conditions Heart Room non remplies:", {
            hasPlayedHeartRoomAudio: hasPlayedHeartRoomAudio.value,
            audioStateEnabled: audioState.isEnabled,
            unlockedRooms: gameState.unlockedRooms,
        });

        // Test: forcer l'affichage du popup Heart pour debug
        console.log("🧪 Test: Affichage forcé du popup Heart...");
        showHeartRoomBriefing.value = true;
        setTimeout(() => {
            showHeartRoomBriefing.value = false;
        }, 5000); // 5 secondes pour le test
    } else if (roomId === "imaging") {
        console.log("❌ Conditions Imaging Room non remplies:", {
            hasPlayedImagingRoomAudio: hasPlayedImagingRoomAudio.value,
            audioStateEnabled: audioState.isEnabled,
            unlockedRooms: gameState.unlockedRooms,
        });

        // Test: forcer l'affichage du popup Imaging pour debug
        console.log("🧪 Test: Affichage forcé du popup Imaging...");
        showImagingRoomBriefing.value = true;
        setTimeout(() => {
            showImagingRoomBriefing.value = false;
        }, 5000); // 5 secondes pour le test
    }
};

const handleExitRoom = async () => {
    exitRoom();

    // Attendre que le DOM soit mis à jour
    await nextTick();

    // Forcer le scroll vers le haut immédiatement
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Double vérification après un court délai
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 50);
};

const handleRoomCompleted = async (roomId) => {
    // Débloquer la prochaine salle
    if (roomId === "server") {
        unlockRoom("dna-lab");
    } else if (roomId === "dna-lab") {
        unlockRoom("imaging");
    } else if (roomId === "imaging") {
        unlockRoom("heart");
    } else if (roomId === "heart") {
        unlockRoom("prosthesis");
    }

    // Vérifier si le jeu est terminé
    if (isGameComplete()) {
        setTimeout(async () => {
            const score = calculateFinalScore();
            const gameData = {
                score: score,
                duration: gameState.timer + gameState.penaltyTime,
                roomsCompleted: gameState.completedRooms.length,
                errors: gameState.errors,
                hints: gameState.hintsUsed,
                completed: true,
                teamName: gameState.teamName,
                timeScore: Math.max(
                    0,
                    8 - (gameState.timer + gameState.penaltyTime) / 120,
                ),
                errorScore: Math.max(0, 7 - gameState.errors * 0.5),
                hintScore: Math.max(0, 5 - gameState.hintsUsed * 1),
                totalTime: gameState.timer + gameState.penaltyTime,
                roomTimes: gameState.roomTimes,
                roomErrors: gameState.roomErrors,
                roomHints: gameState.roomHints,
            };

            finalScoreData.value = gameData;
            showFinalScore.value = true;

            // Soumettre le score si l'utilisateur est connecté
            await handleScoreSubmission(gameData);

            // Nettoyer le cache après la fin de mission
            console.log("🎉 Mission terminée - Nettoyage du cache");
            clearGameState();
        }, 2000); // Délai de 2 secondes après la dernière salle
    } else {
        exitRoom();
    }

    // Si c'est la salle ServerRoom, jouer l'audio de félicitations
    if (
        roomId === "server" &&
        !hasPlayedFinishServerRoomAudio.value &&
        audioState.isEnabled
    ) {
        console.log(
            "🎵 Déclenchement de l'audio de félicitations ServerRoom...",
        );
        await playFinishServerRoomAudio();
    }

    // Si c'est la salle DNARoom, jouer l'audio de félicitations
    console.log("🔍 Debug handleRoomCompleted:", {
        roomId,
        hasPlayedFinishDNARoomAudio: hasPlayedFinishDNARoomAudio.value,
        audioStateEnabled: audioState.isEnabled,
    });

    if (
        roomId === "dna-lab" &&
        !hasPlayedFinishDNARoomAudio.value &&
        audioState.isEnabled
    ) {
        console.log("🎵 Déclenchement de l'audio de félicitations DNARoom...");
        await playFinishDNARoomAudio();
    } else if (roomId === "dna-lab") {
        console.log("❌ Conditions DNARoom non remplies:", {
            hasPlayedFinishDNARoomAudio: hasPlayedFinishDNARoomAudio.value,
            audioStateEnabled: audioState.isEnabled,
        });
    }

    // Si c'est la salle ImagingRoom, jouer l'audio de félicitations
    if (
        roomId === "imaging" &&
        !hasPlayedFinishImagingRoomAudio.value &&
        audioState.isEnabled
    ) {
        console.log(
            "🎵 Déclenchement de l'audio de félicitations ImagingRoom...",
        );
        await playFinishImagingRoomAudio();
    }

    // Attendre que le DOM soit mis à jour
    await nextTick();

    // Forcer le scroll vers le haut immédiatement
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Double vérification après un court délai
    setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, 50);
};

// Gestion du score final
const handleCloseFinalScore = () => {
    showFinalScore.value = false;
};

const handleRestartGame = () => {
    showFinalScore.value = false;
    resetGame();
    showInfo("NOUVELLE PARTIE", "Le jeu a été réinitialisé");
};

// Gestion de l'authentification
const handleAuthSuccess = () => {
    showAuthModal.value = false;
    // Le message de succès est déjà affiché par AuthModal
};

// Gestion de la déconnexion avec blocage pendant la partie
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
        console.error("Erreur déconnexion:", error);
    }
};

// Gestion de la soumission des scores
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
            gameData: gameData,
        });
        showSuccess(
            "SCORE SAUVEGARDÉ",
            `Votre score de ${score.toLocaleString("fr-FR")} points a été enregistré !`,
        );
    } catch (error) {
        showError("ERREUR", "Impossible de sauvegarder le score");
        console.error("Erreur sauvegarde score:", error);
    }
};

// Fonctions pour DevTools
const handleUnlockAllRooms = () => {
    unlockAllRooms();
    showSuccess("DÉVELOPPEMENT", "Toutes les salles ont été débloquées !");
};

const handleResetGame = () => {
    resetGame();
    showInfo("DÉVELOPPEMENT", "Jeu réinitialisé");
};

// Watcher pour détecter l'arrivée sur la sélection des salles
watch(
    () => gameState.isGameStarted && !gameState.currentRoom,
    async (isOnRoomSelection) => {
        console.log("=== WATCHER DÉCLENCHÉ ===");
        console.log("isOnRoomSelection:", isOnRoomSelection);
        console.log("gameState.isGameStarted:", gameState.isGameStarted);
        console.log("gameState.currentRoom:", gameState.currentRoom);
        console.log(
            "hasPlayedRoomSelectionAudio:",
            hasPlayedRoomSelectionAudio.value,
        );
        console.log("audioState.isEnabled:", audioState.isEnabled);
        console.log("audioState.hasPermission:", audioState.hasPermission);
        console.log("audioState.isMuted:", audioState.isMuted);

        if (isOnRoomSelection && !hasPlayedRoomSelectionAudio.value) {
            console.log("🎵 ARRIVÉE SUR LA SÉLECTION DES SALLES");

            // Afficher le bouton d'activation audio
            showAudioActivationButton.value = true;
            console.log("🎵 Bouton d'activation audio affiché - Attente de l'action utilisateur");
            
            // Forcer le scroll vers le haut
            setTimeout(() => {
                console.log("🔄 [Watcher] Scroll vers le haut lors de l'arrivée sur la sélection des salles");
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }, 100);
        } else if (isOnRoomSelection && hasPlayedRoomSelectionAudio.value) {
            // Si l'audio a déjà été joué, afficher directement le briefing
            console.log("🎵 Audio déjà joué - Affichage du briefing");
            showAudioBriefing.value = true;
            
            // Forcer le scroll vers le haut
            setTimeout(() => {
                console.log("🔄 [Watcher] Scroll vers le haut lors de l'arrivée sur la sélection des salles (audio déjà joué)");
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            }, 100);
            
            // Masquer le briefing après la durée normale (environ 60 secondes)
            setTimeout(() => {
                showAudioBriefing.value = false;
            }, 60000);
        } else {
            console.log("❌ CONDITIONS NON REMPLIES");
            if (!isOnRoomSelection)
                console.log("  - Pas sur la sélection des salles");
        }
    },
);

onMounted(async () => {
    initAnimations();
    
    // S'assurer que le jeu repart de zéro à chaque refresh
    resetGame();

    // Vérifier la connectivité API
    console.log("🔍 Vérification de la connectivité API...");
    try {
        const { checkApiHealth } = await import("./composables/useApi");
        const isApiHealthy = await checkApiHealth();
        if (isApiHealthy) {
            console.log("✅ API backend accessible");
        } else {
            console.error("❌ API backend non accessible");
            showError(
                "ERREUR CONNEXION",
                "Le serveur backend n'est pas accessible. Vérifiez qu'il est démarré sur le port 3001.",
            );
        }
    } catch (error) {
        console.error("❌ Erreur de vérification API:", error);
        showError(
            "ERREUR CONNEXION",
            "Impossible de se connecter au serveur backend.",
        );
    }

    // Test direct du fichier audio
    console.log("🎵 Test direct du fichier audio...");
    const testAudio = new Audio("/RoomSelection.mp3");
    testAudio.addEventListener("canplaythrough", () => {
        console.log("✅ Fichier audio accessible et prêt");
    });
    testAudio.addEventListener("error", (e) => {
        console.error("❌ Erreur de chargement du fichier audio:", e);
    });
    testAudio.load();
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

/* Styles pour la modal de quitter la partie */
.quit-modal .scanline {
    background: linear-gradient(transparent 50%, rgba(239, 68, 68, 0.03) 50%);
    background-size: 100% 4px;
    animation: scanline-quit 0.1s linear infinite;
}

@keyframes scanline-quit {
    0% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(4px);
    }
}
</style>
