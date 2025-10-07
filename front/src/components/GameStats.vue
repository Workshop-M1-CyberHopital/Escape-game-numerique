<template>
    <div class="fixed top-4 right-4 z-50">
        <div
            class="bg-gray-900/95 backdrop-blur-md border-2 rounded-lg min-w-[280px] scanline transition-all duration-300"
            :class="isExpanded ? 'border-cyber-blue' : 'border-gray-600 hover:border-cyber-blue'"
        >
            <!-- Barre cliquable (toujours visible) -->
            <button
                @click="toggleExpand"
                class="w-full p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50 transition-all rounded-t-lg"
            >
                <div class="flex items-center gap-3">
                    <i
                        data-lucide="bar-chart-3"
                        class="w-5 h-5 text-cyber-blue"
                    ></i>
                    <span class="font-cyber text-lg text-white font-bold">
                        STATISTIQUES
                    </span>
                </div>
                <i
                    :data-lucide="isExpanded ? 'chevron-up' : 'chevron-down'"
                    class="w-5 h-5 text-cyber-blue transition-transform"
                ></i>
            </button>

            <!-- Résumé compact (toujours visible) -->
            <div class="px-4 pb-3 border-b border-gray-700">
                <div class="flex items-center justify-between text-sm">
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
                </div>
            </div>

            <!-- Détails (collapsible) -->
            <transition name="expand">
                <div v-if="isExpanded" class="p-4 space-y-3">
                    <!-- Timer détaillé -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i
                                data-lucide="clock"
                                class="w-5 h-5 text-cyber-blue"
                            ></i>
                            <span class="font-tech text-sm text-gray-400"
                                >Temps écoulé</span
                            >
                        </div>
                        <span class="font-cyber text-lg text-cyber-blue font-bold">
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
                        <span class="font-cyber text-lg text-red-500 font-bold">
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
                        <span class="font-cyber text-lg text-yellow-500 font-bold">
                            {{ gameState.hintsUsed }}
                        </span>
                    </div>

                    <!-- Pénalités (si > 0) -->
                    <div
                        v-if="gameState.penaltyTime > 0"
                        class="flex items-center justify-between pt-3 border-t border-gray-700"
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
                        <span class="font-cyber text-lg text-orange-500 font-bold">
                            +{{ formatTime(gameState.penaltyTime) }}
                        </span>
                    </div>

                    <!-- Temps total (si pénalités > 0) -->
                    <div
                        v-if="gameState.penaltyTime > 0"
                        class="flex items-center justify-between pt-3 border-t border-cyber-red"
                    >
                        <div class="flex items-center gap-2">
                            <i
                                data-lucide="timer"
                                class="w-5 h-5 text-cyber-red"
                            ></i>
                            <span class="font-tech text-sm text-gray-300 font-bold">
                                Temps Total
                            </span>
                        </div>
                        <span class="font-cyber text-xl text-cyber-red font-bold">
                            {{ formatTime(getTotalTime()) }}
                        </span>
                    </div>

                    <!-- Équipe -->
                    <div
                        class="flex items-center justify-between pt-3 border-t border-gray-700"
                    >
                        <div class="flex items-center gap-2">
                            <i
                                data-lucide="users"
                                class="w-5 h-5 text-cyber-green"
                            ></i>
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
                        class="pt-3 border-t border-gray-700"
                    >
                        <div class="text-xs font-tech text-gray-400 mb-2 font-bold">
                            DÉTAILS PAR SALLE
                        </div>
                        <div class="space-y-2">
                            <div
                                v-for="room in gameState.completedRooms"
                                :key="room"
                                class="bg-gray-800/40 rounded p-2"
                            >
                                <div class="flex items-center justify-between mb-1">
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
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useGameState } from "../composables/useGameState";

const { gameState, formatTime, getTotalTime } = useGameState();
const isExpanded = ref(false);

const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
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

onMounted(() => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

watch(
    [() => gameState.hintsUsed, () => gameState.errors, () => isExpanded.value],
    () => {
        setTimeout(() => {
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }, 100);
    },
);
</script>

<style scoped>
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
