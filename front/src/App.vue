<template>
    <div class="relative z-10 w-full min-h-screen">
        <!-- Animated Background Canvas -->
        <canvas id="animated-bg"></canvas>

        <!-- Game Started: Show Rooms -->
        <div v-if="gameState.isGameStarted">
            <!-- Rooms Section - Only show when not in a room -->
            <RoomsSection
                v-if="!gameState.currentRoom"
                :unlocked-rooms="gameState.unlockedRooms"
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
        </div>

        <!-- Game Not Started: Show Landing Page -->
        <div v-else>
            <!-- Hero Section -->
            <HeroSection @start-mission="handleStartMission" />

            <!-- Team Setup Modal -->
            <TeamSetupModal
                :visible="showTeamSetup"
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
        
        <!-- Toast Container -->
        <ToastContainer />
        
        <!-- Audio Controls -->
        <AudioControls />
        
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
            :visible="showAudioBriefing"
            @close="handleCloseAudioBriefing"
        />
        
        <!-- Server Room Briefing -->
        <ServerRoomBriefing 
            :visible="showServerRoomBriefing"
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
        
        <!-- Audio Activation Button -->
        <div 
            v-if="showAudioActivationButton"
            class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
            <div class="bg-gray-900/95 border-2 border-cyber-blue rounded-lg p-8 max-w-md mx-4 text-center">
                <div class="mb-6">
                    <div class="w-16 h-16 mx-auto mb-4 bg-cyber-blue/20 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-cyber-blue" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-cyber-blue mb-2">
                        🎵 ACTIVATION AUDIO
                    </h3>
                    <p class="text-gray-300 mb-6">
                        Pour une expérience immersive complète, activez l'audio pour entendre le briefing de mission.
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
                        @click="showAudioActivationButton = false"
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
import { useGameState } from "./composables/useGameState";
import { useToast } from "./composables/useToast";
import { useAudio } from "./composables/useAudio";
import { initAnimations } from "./utils/animations";

const { gameState, startGame, enterRoom, exitRoom, unlockRoom, unlockAllRooms, resetGame } =
    useGameState();
const { showError, showSuccess, showWarning, showInfo } = useToast();
const { audioState, requestAudioPermission, playSound, stopSound } = useAudio();
const showTeamSetup = ref(false);
const showLoadingScreen = ref(false);
const loadingTeamName = ref('');
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

// Fonction pour jouer le son de sélection des salles
const playRoomSelectionAudio = async () => {
    try {
        console.log('🎵 Appel de playSound...');
        
        // Afficher le briefing pendant la lecture
        showAudioBriefing.value = true;
        
        await playSound('roomSelection');
        hasPlayedRoomSelectionAudio.value = true;
        showAudioActivationButton.value = false;
        console.log('✅ Son joué avec succès');
        
        // Masquer le briefing après la lecture (environ 60 secondes)
        setTimeout(() => {
            showAudioBriefing.value = false;
        }, 60000);
        
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du son:', error);
        showAudioBriefing.value = false;
    }
};

// Fonction pour activer l'audio manuellement
const activateAudio = async () => {
    console.log('🎵 Activation manuelle de l\'audio...');
    try {
        // Test direct avec le fichier audio
        console.log('🎵 Test direct de lecture...');
        const directAudio = new Audio('/RoomSelection.mp3');
        directAudio.volume = 0.5;
        
        directAudio.addEventListener('play', () => {
            console.log('✅ Lecture directe réussie !');
        });
        
        directAudio.addEventListener('error', (e) => {
            console.error('❌ Erreur lecture directe:', e);
        });
        
        // Tenter la lecture directe
        await directAudio.play();
        console.log('✅ Son joué directement !');
        
        // Marquer comme joué
        hasPlayedRoomSelectionAudio.value = true;
        showAudioActivationButton.value = false;
        
        // Afficher le briefing pendant la lecture
        showAudioBriefing.value = true;
        
        // Masquer le briefing après la lecture (environ 60 secondes)
        setTimeout(() => {
            showAudioBriefing.value = false;
        }, 60000);
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'activation audio:', error);
        console.log('Tentative avec la méthode normale...');
        
        try {
            const permissionGranted = await requestAudioPermission();
            if (permissionGranted) {
                await playRoomSelectionAudio();
            } else {
                console.log('❌ Permission audio toujours refusée');
            }
        } catch (error2) {
            console.error('❌ Erreur lors de l\'activation audio (méthode normale):', error2);
        }
    }
};

// Fonction pour jouer le son de la Salle du Serveur
const playServerRoomAudio = async () => {
    try {
        console.log('🎵 Lecture du son de la Salle du Serveur...');
        
        // Afficher le briefing pendant la lecture
        showServerRoomBriefing.value = true;
        
        await playSound('serverRoom');
        hasPlayedServerRoomAudio.value = true;
        console.log('✅ Son de la Salle du Serveur joué avec succès');
        
        // Masquer le briefing après la lecture (environ 55 secondes)
        setTimeout(() => {
            showServerRoomBriefing.value = false;
        }, 55000);
        
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du son de la Salle du Serveur:', error);
        showServerRoomBriefing.value = false;
    }
};

// Fonction pour jouer le son de la Salle ADN
const playDNARoomAudio = async () => {
    try {
        console.log('🎵 Lecture du son de la Salle ADN...');
        
        // Afficher le briefing pendant la lecture
        showDNARoomBriefing.value = true;
        
        await playSound('dnaRoom');
        hasPlayedDNARoomAudio.value = true;
        console.log('✅ Son de la Salle ADN joué avec succès');
        
        // Masquer le briefing après la lecture (environ 45 secondes)
        setTimeout(() => {
            showDNARoomBriefing.value = false;
        }, 45000);
        
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du son de la Salle ADN:', error);
        showDNARoomBriefing.value = false;
    }
};

// Fonction pour jouer le son de la Salle d'Imagerie
const playImagingRoomAudio = async () => {
    try {
        console.log('🎵 Lecture du son de la Salle d\'Imagerie...');
        
        // Afficher le briefing pendant la lecture
        showImagingRoomBriefing.value = true;
        
        await playSound('imagingRoom');
        hasPlayedImagingRoomAudio.value = true;
        console.log('✅ Son de la Salle d\'Imagerie joué avec succès');
        
        // Masquer le briefing après la lecture (environ 45 secondes)
        setTimeout(() => {
            showImagingRoomBriefing.value = false;
        }, 45000);
        
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du son de la Salle d\'Imagerie:', error);
        showImagingRoomBriefing.value = false;
    }
};

// Fonctions de fermeture des popups avec arrêt audio
const handleCloseAudioBriefing = () => {
    showAudioBriefing.value = false;
    stopSound('roomSelection');
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound('roomSelection');
    }, 100);
    console.log('🎵 Audio briefing fermé et son arrêté');
};

const handleCloseServerRoomBriefing = () => {
    showServerRoomBriefing.value = false;
    stopSound('serverRoom');
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound('serverRoom');
    }, 100);
    console.log('🎵 Server room briefing fermé et son arrêté');
};

const handleCloseDNARoomBriefing = () => {
    showDNARoomBriefing.value = false;
    stopSound('dnaRoom');
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound('dnaRoom');
    }, 100);
    console.log('🎵 DNA room briefing fermé et son arrêté');
};

const handleCloseImagingRoomBriefing = () => {
    showImagingRoomBriefing.value = false;
    stopSound('imagingRoom');
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound('imagingRoom');
    }, 100);
    console.log('🎵 Imaging room briefing fermé et son arrêté');
};

// Fonction pour jouer le son de félicitations ServerRoom
const playFinishServerRoomAudio = async () => {
    try {
        console.log('🎵 Lecture du son de félicitations ServerRoom...');
        showFinishServerRoomBriefing.value = true;
        await playSound('finishServerRoom');
        hasPlayedFinishServerRoomAudio.value = true;
        console.log('✅ Son de félicitations ServerRoom joué avec succès');
        setTimeout(() => {
            showFinishServerRoomBriefing.value = false;
        }, 30000); // 30 secondes
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du son de félicitations ServerRoom:', error);
        showFinishServerRoomBriefing.value = false;
    }
};

const handleCloseFinishServerRoomBriefing = () => {
    showFinishServerRoomBriefing.value = false;
    stopSound('finishServerRoom');
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound('finishServerRoom');
    }, 100);
    console.log('🎵 Finish ServerRoom briefing fermé et son arrêté');
};

// Fonction pour jouer le son de félicitations DNARoom
const playFinishDNARoomAudio = async () => {
    try {
        console.log('🎵 Lecture du son de félicitations DNARoom...');
        showFinishDNARoomBriefing.value = true;
        await playSound('finishDNARoom');
        hasPlayedFinishDNARoomAudio.value = true;
        console.log('✅ Son de félicitations DNARoom joué avec succès');
        setTimeout(() => {
            showFinishDNARoomBriefing.value = false;
        }, 38000); // 38 secondes
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du son de félicitations DNARoom:', error);
        showFinishDNARoomBriefing.value = false;
    }
};

const handleCloseFinishDNARoomBriefing = () => {
    showFinishDNARoomBriefing.value = false;
    stopSound('finishDNARoom');
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound('finishDNARoom');
    }, 100);
    console.log('🎵 Finish DNARoom briefing fermé et son arrêté');
};

// Fonction pour jouer le son de félicitations ImagingRoom
const playFinishImagingRoomAudio = async () => {
    try {
        console.log('🎵 Lecture du son de félicitations ImagingRoom...');
        showFinishImagingRoomBriefing.value = true;
        await playSound('finishImagingRoom');
        hasPlayedFinishImagingRoomAudio.value = true;
        console.log('✅ Son de félicitations ImagingRoom joué avec succès');
        setTimeout(() => {
            showFinishImagingRoomBriefing.value = false;
        }, 33000); // 33 secondes
    } catch (error) {
        console.error('❌ Erreur lors de la lecture du son de félicitations ImagingRoom:', error);
        showFinishImagingRoomBriefing.value = false;
    }
};

const handleCloseFinishImagingRoomBriefing = () => {
    showFinishImagingRoomBriefing.value = false;
    stopSound('finishImagingRoom');
    // Arrêt agressif pour Safari
    setTimeout(() => {
        stopSound('finishImagingRoom');
    }, 100);
    console.log('🎵 Finish ImagingRoom briefing fermé et son arrêté');
};

const handleStartMission = () => {
    showTeamSetup.value = true;
};

const handleStartGame = async (teamData) => {
    // Fermer d'abord la modal
    showTeamSetup.value = false;
    
    // Attendre un peu avant d'afficher l'écran de chargement
    await nextTick();
    setTimeout(() => {
        showLoadingScreen.value = true;
        loadingTeamName.value = teamData.name;
        loadingPlayers.value = teamData.players;
    }, 100);
};

const handleLoadingComplete = async () => {
    // Démarrer le jeu après le chargement
    startGame({
        name: loadingTeamName.value,
        players: loadingPlayers.value
    });
    showLoadingScreen.value = false;
    
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

const handleEnterRoom = async (roomId) => {
    // Vérifier si la salle est débloquée
    if (!gameState.unlockedRooms.includes(roomId)) {
        showError(
            "SALLE VERROUILLÉE",
            "Vous devez compléter les salles précédentes pour débloquer cette zone."
        );
        return;
    }
    
    enterRoom(roomId);
    
    // Jouer le son spécifique à la salle si c'est la première fois
    console.log('🔍 Debug handleEnterRoom:', {
        roomId,
        hasPlayedServerRoomAudio: hasPlayedServerRoomAudio.value,
        hasPlayedDNARoomAudio: hasPlayedDNARoomAudio.value,
        audioStateEnabled: audioState.isEnabled
    });
    
    if (roomId === 'server' && !hasPlayedServerRoomAudio.value && audioState.isEnabled) {
        await playServerRoomAudio();
    } else if (roomId === 'dna-lab' && !hasPlayedDNARoomAudio.value && audioState.isEnabled) {
        console.log('🎵 Tentative de lecture du son DNA Room...');
        await playDNARoomAudio();
    } else if (roomId === 'dna-lab') {
        console.log('❌ Conditions DNA Room non remplies:', {
            hasPlayedDNARoomAudio: hasPlayedDNARoomAudio.value,
            audioStateEnabled: audioState.isEnabled
        });
        
        // Test: forcer l'affichage du popup DNA pour debug
        console.log('🧪 Test: Affichage forcé du popup DNA...');
        showDNARoomBriefing.value = true;
        setTimeout(() => {
            showDNARoomBriefing.value = false;
        }, 5000); // 5 secondes pour le test
    } else if (roomId === 'imaging' && !hasPlayedImagingRoomAudio.value && audioState.isEnabled) {
        console.log('🎵 Tentative de lecture du son Imaging Room...');
        await playImagingRoomAudio();
    } else if (roomId === 'imaging') {
        console.log('❌ Conditions Imaging Room non remplies:', {
            hasPlayedImagingRoomAudio: hasPlayedImagingRoomAudio.value,
            audioStateEnabled: audioState.isEnabled,
            unlockedRooms: gameState.unlockedRooms
        });
        
        // Test: forcer l'affichage du popup Imaging pour debug
        console.log('🧪 Test: Affichage forcé du popup Imaging...');
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
    }
    exitRoom();
    
    // Si c'est la salle ServerRoom, jouer l'audio de félicitations
    if (roomId === 'server' && !hasPlayedFinishServerRoomAudio.value && audioState.isEnabled) {
        console.log('🎵 Déclenchement de l\'audio de félicitations ServerRoom...');
        await playFinishServerRoomAudio();
    }
    
    // Si c'est la salle DNARoom, jouer l'audio de félicitations
    console.log('🔍 Debug handleRoomCompleted:', {
        roomId,
        hasPlayedFinishDNARoomAudio: hasPlayedFinishDNARoomAudio.value,
        audioStateEnabled: audioState.isEnabled
    });
    
    if (roomId === 'dna-lab' && !hasPlayedFinishDNARoomAudio.value && audioState.isEnabled) {
        console.log('🎵 Déclenchement de l\'audio de félicitations DNARoom...');
        await playFinishDNARoomAudio();
    } else if (roomId === 'dna-lab') {
        console.log('❌ Conditions DNARoom non remplies:', {
            hasPlayedFinishDNARoomAudio: hasPlayedFinishDNARoomAudio.value,
            audioStateEnabled: audioState.isEnabled
        });
    }
    
    // Si c'est la salle ImagingRoom, jouer l'audio de félicitations
    if (roomId === 'imaging' && !hasPlayedFinishImagingRoomAudio.value && audioState.isEnabled) {
        console.log('🎵 Déclenchement de l\'audio de félicitations ImagingRoom...');
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
        console.log('=== WATCHER DÉCLENCHÉ ===');
        console.log('isOnRoomSelection:', isOnRoomSelection);
        console.log('gameState.isGameStarted:', gameState.isGameStarted);
        console.log('gameState.currentRoom:', gameState.currentRoom);
        console.log('hasPlayedRoomSelectionAudio:', hasPlayedRoomSelectionAudio.value);
        console.log('audioState.isEnabled:', audioState.isEnabled);
        console.log('audioState.hasPermission:', audioState.hasPermission);
        console.log('audioState.isMuted:', audioState.isMuted);
        
        if (isOnRoomSelection && !hasPlayedRoomSelectionAudio.value) {
            console.log('🎵 ARRIVÉE SUR LA SÉLECTION DES SALLES');
            
            // Afficher le bouton d'activation audio
            showAudioActivationButton.value = true;
            
            // Tenter automatiquement la permission
            try {
                console.log('🎵 Tentative automatique de permission audio...');
                const permissionGranted = await requestAudioPermission();
                console.log('🎵 Permission audio accordée:', permissionGranted);
                
                if (permissionGranted) {
                    console.log('🎵 CONDITIONS REMPLIES - TENTATIVE DE LECTURE DU SON');
                    await playRoomSelectionAudio();
                } else {
                    console.log('❌ Permission audio refusée - Bouton d\'activation affiché');
                }
            } catch (error) {
                console.error('❌ Erreur lors de la demande de permission:', error);
                console.log('❌ Bouton d\'activation affiché');
            }
        } else {
            console.log('❌ CONDITIONS NON REMPLIES');
            if (!isOnRoomSelection) console.log('  - Pas sur la sélection des salles');
            if (hasPlayedRoomSelectionAudio.value) console.log('  - Son déjà joué');
        }
    }
);

onMounted(async () => {
    initAnimations();
    
        // Test direct du fichier audio
        console.log('🎵 Test direct du fichier audio...');
        const testAudio = new Audio('/RoomSelection.mp3');
    testAudio.addEventListener('canplaythrough', () => {
        console.log('✅ Fichier audio accessible et prêt');
    });
    testAudio.addEventListener('error', (e) => {
        console.error('❌ Erreur de chargement du fichier audio:', e);
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
</style>
