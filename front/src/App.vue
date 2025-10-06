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
        </div>

        <!-- Game Not Started: Show Landing Page -->
        <div v-else>
            <!-- Hero Section -->
            <HeroSection @start-mission="handleStartMission" />

            <!-- Team Setup Section -->
            <TeamSetup
                v-if="showTeamSetup"
                @close="showTeamSetup = false"
                @start-game="handleStartGame"
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
import TeamSetup from "./components/TeamSetup.vue";
import RoomsSection from "./components/RoomsSection.vue";
import ServerRoom from "./components/rooms/ServerRoom.vue";
import DNARoom from "./components/rooms/DNARoom.vue";
import ToastContainer from "./components/ToastContainer.vue";
import AudioControls from "./components/AudioControls.vue";
import AudioBriefing from "./components/AudioBriefing.vue";
import ServerRoomBriefing from "./components/ServerRoomBriefing.vue";
import DNARoomBriefing from "./components/DNARoomBriefing.vue";
import { useGameState } from "./composables/useGameState";
import { useToast } from "./composables/useToast";
import { useAudio } from "./composables/useAudio";
import { initAnimations } from "./utils/animations";

const { gameState, startGame, enterRoom, exitRoom, unlockRoom } =
    useGameState();
const { showError, showSuccess, showWarning, showInfo } = useToast();
const { audioState, requestAudioPermission, playSound, stopSound } = useAudio();
const showTeamSetup = ref(false);
const hasPlayedRoomSelectionAudio = ref(false);
const showAudioActivationButton = ref(false);
const showAudioBriefing = ref(false);
const showServerRoomBriefing = ref(false);
const hasPlayedServerRoomAudio = ref(false);
const showDNARoomBriefing = ref(false);
const hasPlayedDNARoomAudio = ref(false);

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

// Fonctions de fermeture des popups avec arrêt audio
const handleCloseAudioBriefing = () => {
    showAudioBriefing.value = false;
    stopSound('roomSelection');
    console.log('🎵 Audio briefing fermé et son arrêté');
};

const handleCloseServerRoomBriefing = () => {
    showServerRoomBriefing.value = false;
    stopSound('serverRoom');
    console.log('🎵 Server room briefing fermé et son arrêté');
};

const handleCloseDNARoomBriefing = () => {
    showDNARoomBriefing.value = false;
    stopSound('dnaRoom');
    console.log('🎵 DNA room briefing fermé et son arrêté');
};

const handleStartMission = () => {
    showTeamSetup.value = true;
    
    // Scroll vers la section de configuration d'équipe
    setTimeout(() => {
        const teamSetupSection = document.querySelector('.team-setup-section');
        if (teamSetupSection) {
            teamSetupSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }, 100);
};

const handleStartGame = async (teamData) => {
    startGame(teamData);
    showTeamSetup.value = false;
    
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
    }
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
