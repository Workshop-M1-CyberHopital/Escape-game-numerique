<template>
    <div
        v-if="isDevEnabled && isDev"
        class="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-black p-2 shadow-lg"
    >
        <div
            class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2"
        >
            <div class="flex items-center gap-2">
                <span class="font-cyber font-bold text-sm"
                    >🛠️ MODE DÉVELOPPEMENT</span
                >
            </div>

            <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-tech">Accès direct :</span>

                <button
                    @click="quickStart"
                    class="px-3 py-1 bg-black text-yellow-400 font-tech text-xs rounded hover:bg-gray-800 transition-all"
                >
                    ⚡ Démarrer jeu
                </button>

                <button
                    v-for="(room, index) in ROOMS_CONFIG"
                    :key="room.id"
                    @click="goToRoom(room.id)"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-2 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-black text-white hover:bg-gray-800'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    {{ index + 1 }}: {{ room.shortName }}
                </button>

                <button
                    @click="resetGame"
                    class="px-3 py-1 bg-gray-700 text-white font-tech text-xs rounded hover:bg-gray-800 transition-all"
                >
                    🔄 Reset
                </button>

                <button
                    @click="triggerEndGame"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    🏆 Fin de jeu
                </button>

                <button
                    @click="toggleDev"
                    class="px-2 py-1 bg-gray-800 text-white font-tech text-xs rounded hover:bg-gray-900 transition-all"
                >
                    ✕
                </button>
            </div>
        </div>
    </div>

    <!-- Bouton flottant pour ouvrir DevTools -->
    <button
        v-if="isDevEnabled && !isDev"
        @click="toggleDev"
        class="fixed bottom-4 right-4 z-50 w-12 h-12 bg-yellow-600 text-black rounded-full shadow-lg hover:bg-yellow-500 transition-all flex items-center justify-center font-bold text-xl"
        title="Ouvrir DevTools"
    >
        🛠️
    </button>
</template>

<script setup>
import { ref, computed } from "vue";
import { ENV_CONFIG } from "../config/environment";
import { ROOMS_CONFIG } from "../config/roomsConfig";

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

const isDev = ref(false);
const isDevEnabled = computed(() => Boolean(ENV_CONFIG.DEV_MODE));

const toggleDev = () => {
    isDev.value = !isDev.value;
};

const quickStart = () => {
    emit("start-game", {
        name: "Équipe DEV",
        players: ["Dev 1", "Dev 2"],
    });

    emit("unlock-all-rooms");
};

const goToRoom = (roomId) => {
    if (!props.gameState.isGameStarted) {
        return;
    }
    emit("enter-room", roomId);
};

const resetGame = () => {
    emit("reset-game");
};

const triggerEndGame = () => {
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
