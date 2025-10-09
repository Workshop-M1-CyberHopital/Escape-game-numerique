<template>
    <div class="min-h-screen bg-gray-900 relative">
        <!-- Header avec timer et équipe -->
        <header
            class="bg-gray-800/90 backdrop-blur-md border-b-2 border-cyber-blue p-4"
        >
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <button
                        @click="$emit('exit-room')"
                        class="flex items-center gap-2 px-4 py-2 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 font-tech text-sm rounded transition-all"
                    >
                        <ArrowLeft class="w-4 h-4" />
                        RETOUR
                    </button>
                    <div class="text-cyber-blue font-cyber font-bold text-lg">
                        {{ roomData.title }}
                    </div>
                </div>

                <!-- Statistiques compactes -->
                <div class="flex items-center gap-6">
                    <!-- Stats cliquables -->
                    <button
                        @click="toggleStatsMenu"
                        class="flex items-center gap-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-cyber-blue rounded-lg transition-all cursor-pointer"
                    >
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400">⏱️</span>
                            <span class="font-tech text-cyber-blue font-bold">
                                {{ formatTime(gameState.timer) }}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400">❌</span>
                            <span class="font-tech text-red-500 font-bold">
                                {{ gameState.errors }}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-gray-400">💡</span>
                            <span class="font-tech text-yellow-500 font-bold">
                                {{ gameState.hintsUsed }}
                            </span>
                        </div>
                        <i
                            :data-lucide="isStatsExpanded ? 'chevron-up' : 'chevron-down'"
                            class="w-4 h-4 text-cyber-blue transition-transform"
                        ></i>
                    </button>
                </div>
            </div>
        </header>

        <!-- Menu détaillé des statistiques -->
        <transition name="expand">
            <div v-if="isStatsExpanded" class="bg-gray-800/95 backdrop-blur-md border-b-2 border-cyber-blue p-4">
                <div class="max-w-7xl mx-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <!-- Timer détaillé -->
                        <div class="flex items-center justify-between bg-gray-700/30 rounded-lg p-4">
                            <div class="flex items-center gap-2">
                                <i data-lucide="clock" class="w-5 h-5 text-cyber-blue"></i>
                                <span class="font-tech text-sm text-gray-400">Temps écoulé</span>
                            </div>
                            <span class="font-cyber text-lg text-cyber-blue font-bold">
                                {{ formatTime(gameState.timer) }}
                            </span>
                        </div>

                        <!-- Erreurs détaillé -->
                        <div class="flex items-center justify-between bg-gray-700/30 rounded-lg p-4">
                            <div class="flex items-center gap-2">
                                <i data-lucide="x-circle" class="w-5 h-5 text-red-500"></i>
                                <span class="font-tech text-sm text-gray-400">Erreurs</span>
                            </div>
                            <span class="font-cyber text-lg text-red-500 font-bold">
                                {{ gameState.errors }}
                            </span>
                        </div>

                        <!-- Indices détaillé -->
                        <div class="flex items-center justify-between bg-gray-700/30 rounded-lg p-4">
                            <div class="flex items-center gap-2">
                                <i data-lucide="lightbulb" class="w-5 h-5 text-yellow-500"></i>
                                <span class="font-tech text-sm text-gray-400">Indices utilisés</span>
                            </div>
                            <span class="font-cyber text-lg text-yellow-500 font-bold">
                                {{ gameState.hintsUsed }}
                            </span>
                        </div>

                        <!-- Équipe -->
                        <div class="flex items-center justify-between bg-gray-700/30 rounded-lg p-4">
                            <div class="flex items-center gap-2">
                                <i data-lucide="users" class="w-5 h-5 text-cyber-green"></i>
                                <span class="font-tech text-sm text-gray-400">Équipe</span>
                            </div>
                            <span class="font-tech text-sm text-cyber-green truncate max-w-[140px]">
                                {{ gameState.teamName }}
                            </span>
                        </div>
                    </div>

                    <!-- Pénalités et temps total (si pénalités > 0) -->
                    <div v-if="gameState.penaltyTime > 0" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex items-center justify-between bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                            <div class="flex items-center gap-2">
                                <i data-lucide="alert-triangle" class="w-5 h-5 text-orange-500"></i>
                                <span class="font-tech text-sm text-gray-400">Pénalités</span>
                            </div>
                            <span class="font-cyber text-lg text-orange-500 font-bold">
                                +{{ formatTime(gameState.penaltyTime) }}
                            </span>
                        </div>

                        <div class="flex items-center justify-between bg-cyber-red/20 border border-cyber-red/30 rounded-lg p-4">
                            <div class="flex items-center gap-2">
                                <i data-lucide="timer" class="w-5 h-5 text-cyber-red"></i>
                                <span class="font-tech text-sm text-gray-300 font-bold">Temps Total</span>
                            </div>
                            <span class="font-cyber text-xl text-cyber-red font-bold">
                                {{ formatTime(getTotalTime()) }}
                            </span>
                        </div>
                    </div>

                    <!-- Détails par salle (si salles complétées) -->
                    <div v-if="gameState.completedRooms.length > 0" class="mt-4">
                        <div class="text-xs font-tech text-gray-400 mb-3 font-bold">
                            DÉTAILS PAR SALLE
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div
                                v-for="room in gameState.completedRooms"
                                :key="room"
                                class="bg-gray-800/40 rounded-lg p-3"
                            >
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-xs font-tech text-gray-300 font-bold">
                                        {{ getRoomName(room) }}
                                    </span>
                                    <span class="text-xs font-tech text-gray-500">
                                        {{ formatTime(gameState.roomTimes[room] || 0) }}
                                    </span>
                                </div>
                                <div class="flex gap-3 text-xs">
                                    <span class="text-red-400">
                                        ❌ {{ gameState.roomErrors[room] || 0 }}
                                    </span>
                                    <span class="text-yellow-400">
                                        💡 {{ gameState.roomHints[room] || 0 }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Contenu de la salle -->
        <main class="p-8">
            <div class="max-w-6xl mx-auto">
                <!-- Description de la salle -->
                <div class="mb-8">
                    <div
                        class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline"
                    >
                        <div class="flex items-start gap-4">
                            <div
                                class="w-16 h-16 rounded-lg flex items-center justify-center"
                                :style="`background-color: ${roomData.color}20; border: 2px solid ${roomData.color};`"
                            >
                                <component
                                    :is="getIconComponent(roomData.icon)"
                                    class="w-8 h-8"
                                    :style="`color: ${roomData.color};`"
                                />
                            </div>
                            <div class="flex-1">
                                <h1
                                    class="text-3xl font-cyber font-bold mb-2"
                                    :style="`color: ${roomData.color};`"
                                >
                                    {{ roomData.title }}
                                </h1>
                                <p class="text-lg font-tech text-gray-400 mb-3">
                                    {{ roomData.subtitle }}
                                </p>
                                <p class="text-gray-300 leading-relaxed mb-4">
                                    {{ roomData.description }}
                                </p>
                                <div class="flex items-center gap-2">
                                    <span
                                        class="px-3 py-1 border border-cyber-blue text-cyber-blue font-tech text-sm rounded"
                                    >
                                        OBJECTIF
                                    </span>
                                    <span class="text-sm text-gray-400">{{
                                        roomData.objective
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenu spécifique de la salle -->
                <slot></slot>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useGameState } from "../composables/useGameState";
import {
    ArrowLeft,
    Clock,
    Users,
    Server,
    Dna,
    ScanLine,
    Heart,
    BarChart3,
    Volume2,
    HeartPulse,
    Settings,
} from "lucide-vue-next";

const props = defineProps({
    roomData: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["exit-room"]);

const { gameState, formatTime, getTotalTime } = useGameState();

// État du menu des statistiques
const isStatsExpanded = ref(false);

const toggleStatsMenu = () => {
    isStatsExpanded.value = !isStatsExpanded.value;
    setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, 50);
};

const getRoomName = (roomId) => {
    const names = {
        server: "SERVEUR",
        "dna-lab": "LAB ADN",
        imaging: "IMAGERIE",
        heart: "CŒUR",
    };
    return names[roomId] || roomId;
};

// Mapping des icônes
const iconMap = {
    server: Server,
    dna: Dna,
    "scan-line": ScanLine,
    heart: Heart,
    "volume-2": Volume2,
    "heart-pulse": HeartPulse,
    settings: Settings,
};

// Fonction pour obtenir le composant d'icône
const getIconComponent = (iconName) => {
    return iconMap[iconName] || Server;
};

onMounted(() => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
</script>

<style scoped>
.scanline {
    position: relative;
    overflow: hidden;
}

.scanline::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #06b6d4, transparent);
    animation: scan 3s linear infinite;
}

@keyframes scan {
    0% {
        left: -100%;
    }
    100% {
        left: 100%;
    }
}

/* Animation pour le menu des statistiques */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
    max-height: 800px;
    opacity: 1;
}
</style>
