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

                <div class="flex items-center gap-6">
                    <!-- Timer -->
                    <div class="flex items-center gap-2">
                        <Clock class="w-5 h-5 text-cyber-red" />
                        <span class="font-tech text-cyber-red font-bold">
                            {{ formatTime(gameState.timer) }}
                        </span>
                    </div>

                    <!-- Équipe -->
                    <div class="flex items-center gap-2">
                        <Users class="w-5 h-5 text-cyber-green" />
                        <span class="font-tech text-cyber-green">
                            {{ gameState.teamName }}
                        </span>
                    </div>

                    <!-- Bouton Stats -->
                    <div class="flex items-center gap-2">
                        <button
                            @click="openStatsModal"
                            class="flex items-center gap-2 px-3 py-1 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 font-tech text-sm rounded transition-all"
                        >
                            <BarChart3 class="w-4 h-4" />
                            STATS
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Modal Stats -->
        <transition name="modal">
            <div
                v-if="isStatsExpanded"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                @click="closeStatsModal"
            >
                <div
                    class="bg-gray-900/95 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto scanline"
                    @click.stop
                >
                    <!-- Header avec titre et bouton fermer -->
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <BarChart3 class="w-6 h-6 text-cyber-blue" />
                            <h2 class="font-cyber text-xl text-white font-bold">
                                STATISTIQUES DE JEU
                            </h2>
                        </div>
                        <button
                            @click="closeStatsModal"
                            class="text-gray-400 hover:text-white transition-colors"
                        >
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </div>

                    <!-- Détails -->
                    <div class="space-y-4">
                        <!-- Timer détaillé -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <Clock class="w-5 h-5 text-cyber-blue" />
                                <span class="font-tech text-sm text-gray-400"
                                    >Temps écoulé</span
                                >
                            </div>
                            <span
                                class="font-cyber text-lg text-cyber-blue font-bold"
                            >
                                {{ formatTime(gameState.timer) }}
                            </span>
                        </div>

                        <!-- Erreurs détaillé -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <i
                                    data-lucide="x-circle"
                                    class="w-5 h-5 text-red-500"
                                ></i>
                                <span class="font-tech text-sm text-gray-400"
                                    >Erreurs</span
                                >
                            </div>
                            <span
                                class="font-cyber text-lg text-red-500 font-bold"
                            >
                                {{ gameState.errors }}
                            </span>
                        </div>

                        <!-- Indices détaillé -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <i
                                    data-lucide="lightbulb"
                                    class="w-5 h-5 text-yellow-500"
                                ></i>
                                <span class="font-tech text-sm text-gray-400"
                                    >Indices utilisés</span
                                >
                            </div>
                            <span
                                class="font-cyber text-lg text-yellow-500 font-bold"
                            >
                                {{ gameState.hintsUsed }}
                            </span>
                        </div>

                        <!-- Pénalités (si > 0) -->
                        <div
                            v-if="gameState.penaltyTime > 0"
                            class="flex items-center justify-between pt-4 border-t border-gray-700"
                        >
                            <div class="flex items-center gap-2">
                                <i
                                    data-lucide="alert-triangle"
                                    class="w-5 h-5 text-orange-500"
                                ></i>
                                <span class="font-tech text-sm text-gray-400"
                                    >Pénalités</span
                                >
                            </div>
                            <span
                                class="font-cyber text-lg text-orange-500 font-bold"
                            >
                                +{{ formatTime(gameState.penaltyTime) }}
                            </span>
                        </div>

                        <!-- Temps total (si pénalités > 0) -->
                        <div
                            v-if="gameState.penaltyTime > 0"
                            class="flex items-center justify-between pt-4 border-t border-cyber-red"
                        >
                            <div class="flex items-center gap-2">
                                <i
                                    data-lucide="timer"
                                    class="w-5 h-5 text-cyber-red"
                                ></i>
                                <span
                                    class="font-tech text-sm text-gray-300 font-bold"
                                    >Temps Total</span
                                >
                            </div>
                            <span
                                class="font-cyber text-xl text-cyber-red font-bold"
                            >
                                {{ formatTime(getTotalTime()) }}
                            </span>
                        </div>

                        <!-- Équipe -->
                        <div
                            class="flex items-center justify-between pt-4 border-t border-gray-700"
                        >
                            <div class="flex items-center gap-2">
                                <Users class="w-5 h-5 text-cyber-green" />
                                <span class="font-tech text-sm text-gray-400"
                                    >Équipe</span
                                >
                            </div>
                            <span
                                class="font-tech text-sm text-cyber-green truncate max-w-[140px]"
                            >
                                {{ gameState.teamName }}
                            </span>
                        </div>

                        <!-- Détails par salle (si salles complétées) -->
                        <div
                            v-if="gameState.completedRooms.length > 0"
                            class="pt-4 border-t border-gray-700"
                        >
                            <div
                                class="text-sm font-tech text-gray-400 mb-3 font-bold"
                            >
                                DÉTAILS PAR SALLE
                            </div>
                            <div class="space-y-3">
                                <div
                                    v-for="room in gameState.completedRooms"
                                    :key="room"
                                    class="bg-gray-800/40 rounded p-3"
                                >
                                    <div
                                        class="flex items-center justify-between mb-2"
                                    >
                                        <span
                                            class="text-sm font-tech text-gray-300 font-bold"
                                        >
                                            {{ getRoomName(room) }}
                                        </span>
                                        <span
                                            class="text-sm font-tech text-gray-500"
                                        >
                                            {{
                                                formatTime(
                                                    gameState.roomTimes[room] ||
                                                        0,
                                                )
                                            }}
                                        </span>
                                    </div>
                                    <div class="flex gap-4 text-sm">
                                        <span class="text-red-400">
                                            ❌
                                            {{
                                                gameState.roomErrors[room] || 0
                                            }}
                                        </span>
                                        <span class="text-yellow-400">
                                            💡
                                            {{ gameState.roomHints[room] || 0 }}
                                        </span>
                                    </div>
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
import { ref, onMounted } from "vue";
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
} from "lucide-vue-next";

const props = defineProps({
    roomData: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["exit-room"]);

const { gameState, formatTime, getTotalTime } = useGameState();

const isStatsExpanded = ref(false);

const openStatsModal = () => {
    isStatsExpanded.value = true;
    setTimeout(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, 50);
};

const closeStatsModal = () => {
    isStatsExpanded.value = false;
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
.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.modal-enter-to,
.modal-leave-from {
    opacity: 1;
    transform: scale(1);
}
</style>
