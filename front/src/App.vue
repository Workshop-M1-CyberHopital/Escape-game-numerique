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
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import HeroSection from "./components/HeroSection.vue";
import TeamSetup from "./components/TeamSetup.vue";
import RoomsSection from "./components/RoomsSection.vue";
import ServerRoom from "./components/rooms/ServerRoom.vue";
import DNARoom from "./components/rooms/DNARoom.vue";
import ToastContainer from "./components/ToastContainer.vue";
import { useGameState } from "./composables/useGameState";
import { useToast } from "./composables/useToast";
import { initAnimations } from "./utils/animations";

const { gameState, startGame, enterRoom, exitRoom, unlockRoom } =
    useGameState();
const { showError, showSuccess, showWarning, showInfo } = useToast();
const showTeamSetup = ref(false);

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

const handleEnterRoom = (roomId) => {
    // Vérifier si la salle est débloquée
    if (!gameState.unlockedRooms.includes(roomId)) {
        showError(
            "SALLE VERROUILLÉE",
            "Vous devez compléter les salles précédentes pour débloquer cette zone."
        );
        return;
    }
    
    enterRoom(roomId);
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

onMounted(() => {
    initAnimations();
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
