<template>
    <div class="relative z-10 w-full min-h-screen">
        <!-- Animated Background Canvas -->
        <canvas id="animated-bg"></canvas>

        <!-- Hero Section -->
        <HeroSection @start-mission="handleStartMission" />

        <!-- Team Setup Section -->
        <TeamSetup
            v-if="showTeamSetup"
            @close="showTeamSetup = false"
            @start-game="handleStartGame"
        />

        <!-- Rooms Section -->
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
</template>

<script setup>
import { ref, onMounted } from "vue";
import HeroSection from "./components/HeroSection.vue";
import TeamSetup from "./components/TeamSetup.vue";
import RoomsSection from "./components/RoomsSection.vue";
import { initAnimations } from "./utils/animations";

const showTeamSetup = ref(false);

const handleStartMission = () => {
    showTeamSetup.value = true;
};

const handleStartGame = (teamData) => {
    console.log("Starting game with team:", teamData);
    showTeamSetup.value = false;
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
