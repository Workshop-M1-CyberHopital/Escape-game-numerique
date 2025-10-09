<template>
    <div
        v-if="config.DEV_MODE && isDev"
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
                    @click="goToRoom('server')"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    Salle 1: Serveur
                </button>

                <button
                    @click="goToRoom('dna-lab')"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    Salle 2: ADN
                </button>

                <button
                    @click="goToRoom('imaging')"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    Salle 3: IRM
                </button>

                <button
                    @click="goToRoom('heart')"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-purple-500 text-white hover:bg-purple-600'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    Salle 4: Cœur
                </button>

                <button
                    @click="goToRoom('prosthesis')"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    Salle 5: Prothèses
                </button>

                <button
                    @click="goToRoom('pathology')"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    Salle 6: Pathologies
                </button>

                <button
                    @click="goToRoom('audition')"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-purple-500 text-white hover:bg-purple-600'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    Salle 7: Audition
                </button>

                <button
                    @click="goToRoom('eye')"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    Salle 8: Yeux
                </button>

                <button
                    @click="goToRoom('final')"
                    :disabled="!gameState.isGameStarted"
                    :class="[
                        'px-3 py-1 font-tech text-xs rounded transition-all',
                        gameState.isGameStarted
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed',
                    ]"
                >
                    Salle 9: Final
                </button>

                <button
                    @click="resetGame"
                    class="px-3 py-1 bg-gray-700 text-white font-tech text-xs rounded hover:bg-gray-800 transition-all"
                >
                    🔄 Reset
                </button>

                <button
                    @click="toggleDev"
                    class="px-3 py-1 bg-red-700 text-white font-tech text-xs rounded hover:bg-red-800 transition-all"
                >
                    ❌ Fermer
                </button>
            </div>
        </div>
    </div>

    <!-- Bouton pour réouvrir le panneau dev -->
    <button
        v-if="config.DEV_MODE && !isDev"
        @click="toggleDev"
        class="fixed bottom-4 right-4 z-50 w-12 h-12 bg-yellow-600 text-black rounded-full shadow-lg hover:bg-yellow-500 transition-all flex items-center justify-center font-bold text-xl"
        title="Ouvrir DevTools"
    >
        🛠️
    </button>
</template>

<script setup>
import { ref } from "vue";
import { config } from "../config.js";

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
]);

const isDev = ref(false);

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
    // Ne rien faire si le jeu n'est pas démarré (boutons désactivés)
    if (!props.gameState.isGameStarted) {
        return;
    }

    emit("enter-room", roomId);
};

const resetGame = () => {
    emit("reset-game");
};
</script>

<style scoped>
.font-cyber {
    font-family: "Orbitron", sans-serif;
}

.font-tech {
    font-family: "Courier New", monospace;
}
</style>
