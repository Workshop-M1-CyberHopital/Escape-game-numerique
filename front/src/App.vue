<template>
    <div class="relative z-10 w-full min-h-screen">
        <!-- Animated Background Canvas -->
        <canvas id="animated-bg"></canvas>

        <!-- Game Started: Show Rooms -->
        <div v-if="gameState.isGameStarted">
            <!-- Rooms Section -->
            <RoomsSection
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
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import HeroSection from "./components/HeroSection.vue";
import TeamSetup from "./components/TeamSetup.vue";
import RoomsSection from "./components/RoomsSection.vue";
import ServerRoom from "./components/rooms/ServerRoom.vue";
import DNARoom from "./components/rooms/DNARoom.vue";
import { useGameState } from "./composables/useGameState";
import { initAnimations } from "./utils/animations";

const { gameState, startGame, enterRoom, exitRoom, unlockRoom } =
    useGameState();
const showTeamSetup = ref(false);

const handleStartMission = () => {
    showTeamSetup.value = true;
};

const handleStartGame = (teamData) => {
    startGame(teamData);
    showTeamSetup.value = false;
};

const handleEnterRoom = (roomId) => {
    enterRoom(roomId);
};

const handleExitRoom = () => {
    exitRoom();
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleRoomCompleted = (roomId) => {
    // Débloquer la prochaine salle
    if (roomId === "server") {
        unlockRoom("dna-lab");
    }
    exitRoom();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
