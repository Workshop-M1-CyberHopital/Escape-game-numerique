<template>
    <div
        v-if="isDevEnabled && isDev"
        class="fixed top-16 left-0 right-0 z-50 bg-yellow-600 text-black p-2 shadow-lg"
    >
        <div
            class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2"
        >
            <div class="flex items-center gap-2 flex-wrap">
                <span class="font-cyber font-bold text-sm"
                    >🛠️ MODE DÉVELOPPEMENT</span
                >
                <span
                    v-if="gameState.devToolsUsed"
                    class="px-2 py-0.5 bg-black/80 text-yellow-300 font-tech text-xs rounded"
                >
                    Partie assistée : score non enregistré
                </span>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-tech">Accès direct :</span>

                <button
                    type="button"
                    @click="quickStart"
                    class="px-3 py-1 bg-black text-yellow-400 font-tech text-xs rounded hover:bg-gray-800 transition-all"
                >
                    ⚡ Démarrer jeu
                </button>

                <button
                    v-for="(room, index) in ROOMS_CONFIG"
                    :key="room.id"
                    type="button"
                    @click="goToRoom(room.id)"
                    :disabled="!isGameInProgress"
                    :class="[
                        'px-2 py-1 font-tech text-xs rounded transition-all',
                        isGameInProgress
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    {{ index + 1 }}: {{ room.shortName }}
                </button>

                <button
                    type="button"
                    @click="resetGame"
                    class="px-3 py-1 bg-gray-700 text-white font-tech text-xs rounded hover:bg-gray-800 transition-all"
                >
                    🔄 Reset
                </button>

                <button
                    type="button"
                    @click="triggerEndGame"
                    :disabled="!isGameInProgress"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        isGameInProgress
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    🏆 Fin de jeu
                </button>

                <button
                    type="button"
                    @click="toggleDev"
                    class="px-2 py-1 bg-gray-800 text-white font-tech text-xs rounded hover:bg-gray-900 transition-all"
                    aria-label="Fermer les DevTools"
                >
                    ✕
                </button>
            </div>
        </div>
    </div>

    <!-- Bouton flottant pour ouvrir DevTools -->
    <button
        v-if="isDevEnabled && !isDev"
        type="button"
        @click="toggleDev"
        class="fixed bottom-4 right-4 z-50 w-12 h-12 bg-yellow-600 text-black rounded-full shadow-lg hover:bg-yellow-500 transition-all flex items-center justify-center font-bold text-xl"
        title="Ouvrir DevTools"
        aria-label="Ouvrir DevTools"
    >
        🛠️
    </button>
</template>

<script setup>
import { ref, computed } from "vue";
import { ENV_CONFIG } from "../config/environment";
import { ROOMS_CONFIG } from "../config/roomsConfig";
import { useGameState } from "../composables/useGameState";

const props = defineProps({
    gameState: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits([
    "start-game",
    "enter-room",
    "unlock-all-rooms",
    "reset-game",
    "trigger-end-game",
]);

// Toute action DevTools marque la partie : elle ne sera jamais envoyée au classement
const { markDevToolsUsed } = useGameState();

const isDev = ref(false);
const isDevEnabled = computed(() => Boolean(ENV_CONFIG.DEV_MODE));
const isGameInProgress = computed(
    () => props.gameState.isGameStarted && !props.gameState.isGameOver,
);

const toggleDev = () => {
    isDev.value = !isDev.value;
};

const quickStart = () => {
    // Le parent démarre la partie de façon synchrone : le marquage s'applique à la nouvelle partie
    emit("start-game", {
        name: "Équipe DEV",
        players: ["Dev 1", "Dev 2"],
    });
    markDevToolsUsed();
    emit("unlock-all-rooms");
};

const goToRoom = (roomId) => {
    if (!isGameInProgress.value) {
        return;
    }
    markDevToolsUsed();
    emit("enter-room", roomId);
};

const resetGame = () => {
    emit("reset-game");
};

const triggerEndGame = () => {
    if (!isGameInProgress.value) {
        return;
    }
    markDevToolsUsed();
    emit("trigger-end-game");
};
</script>

<style scoped>
.font-cyber {
    font-family: "Orbitron", sans-serif;
}

.font-tech {
    font-family: "Share Tech Mono", monospace;
}
</style>
