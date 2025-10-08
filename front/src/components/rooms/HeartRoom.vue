Escape-game-numerique/front/src/components/rooms/CPRRoom.vue
<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Instructions -->
        <div v-if="!puzzleSolved" class="space-y-8">
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="heart" class="w-5 h-5 text-cyber-red"></i>
                    <h3 class="font-cyber font-bold text-cyber-red">
                        SIMULATION DE MASSAGE CARDIAQUE
                    </h3>
                </div>

                <div class="text-gray-300 space-y-2">
                    <p class="font-tech text-sm">
                        Un patient fait un arrêt cardiaque ! Vous devez
                        effectuer un massage cardiaque en appuyant sur la touche
                        <strong class="text-cyber-red">ESPACE</strong> en rythme
                        avec la musique.
                    </p>
                    <div
                        class="bg-red-900/30 border border-red-500/50 rounded p-2"
                    >
                        <div class="text-cyber-red font-tech text-xs">
                            <strong>RYTHME :</strong> 100 compressions par
                            minute (rythme réaliste du massage cardiaque)
                        </div>
                    </div>
                    <div class="text-sm">
                        <strong>Objectif :</strong>
                        {{ requiredCompressions }} compressions correctes ({{
                            correctCompressions
                        }}/{{ requiredCompressions }} terminées)
                    </div>
                </div>
            </div>

            <!-- Zone de jeu -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i
                        data-lucide="activity"
                        class="w-5 h-5 text-cyber-blue"
                    ></i>
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ZONE DE RÉANIMATION
                    </h3>
                </div>

                <div class="text-center space-y-6">
                    <!-- Cœur animé -->
                    <div class="relative">
                        <div
                            class="w-32 h-32 mx-auto rounded-full border-4 border-cyber-red flex items-center justify-center transition-all duration-200"
                            :class="{
                                'bg-cyber-red/20 scale-110': isCompressing,
                                'bg-gray-700/50': !isCompressing,
                            }"
                        >
                            <i
                                data-lucide="heart"
                                class="w-16 h-16 text-cyber-red"
                                :class="{ 'animate-pulse': isBeating }"
                            ></i>
                        </div>

                        <!-- Indicateur de rythme -->
                        <div class="mt-4">
                            <div class="text-sm text-gray-400 mb-2">
                                RYTHME DE LA MUSIQUE
                            </div>
                            <div
                                class="relative w-64 h-8 mx-auto bg-gray-700 rounded-full overflow-hidden"
                            >
                                <!-- Zone rouge de tolérance (fixe au centre) -->
                                <div
                                    class="absolute top-0 h-full bg-red-500/30 rounded-full"
                                    style="
                                        left: 50%;
                                        width: 100px;
                                        transform: translateX(-50px);
                                    "
                                ></div>
                                <!-- Barre de progression bleue -->
                                <div
                                    class="absolute top-0 left-0 h-full bg-cyber-blue transition-all duration-300 ease-linear"
                                    :style="{ width: `${beatProgress}%` }"
                                ></div>
                                <!-- Point indicateur -->
                                <div
                                    class="absolute inset-0 flex items-center justify-center"
                                >
                                    <div
                                        class="w-6 h-6 bg-cyber-red rounded-full transition-all duration-200 border-2 border-white shadow-lg"
                                        :class="{
                                            'scale-125 bg-red-400':
                                                isInBeatWindow,
                                            'animate-pulse': isInBeatWindow,
                                        }"
                                    ></div>
                                </div>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">
                                Appuyez sur ESPACE quand le point rouge est dans
                                la zone rouge
                            </div>
                        </div>
                    </div>

                    <!-- Contrôles -->
                    <div class="flex gap-4 justify-center">
                        <button
                            @click="startSimulation"
                            v-if="!isRunning"
                            class="px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all"
                        >
                            COMMENCER LE MASSAGE
                        </button>
                        <button
                            @click="stopSimulation"
                            v-if="isRunning"
                            class="px-6 py-3 border border-cyber-red text-cyber-red hover:bg-cyber-red/10 font-cyber font-bold rounded-lg transition-all"
                        >
                            ARRÊTER
                        </button>
                        <button
                            @click="resetSimulation"
                            class="px-6 py-3 border border-gray-500 text-gray-400 hover:bg-gray-700 font-cyber rounded-lg transition-all"
                        >
                            RÉINITIALISER
                        </button>
                    </div>

                    <!-- Audio (caché) -->
                    <audio
                        ref="audioRef"
                        src="/CPRRoom.mp3"
                        preload="auto"
                        loop
                    ></audio>
                </div>
            </div>
        </div>

        <!-- Indices -->
        <div class="mt-8">
            <div
                class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-6"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i
                        data-lucide="lightbulb"
                        class="w-5 h-5 text-yellow-500"
                    ></i>
                    <h4 class="font-cyber font-bold text-yellow-500">
                        INDICES
                    </h4>
                </div>

                <div class="space-y-2 text-sm text-gray-300">
                    <div v-if="hintsShown >= 1" class="fade-in">
                        💡 Le rythme du massage cardiaque est de 100-120
                        compressions par minute
                    </div>
                    <div v-if="hintsShown >= 2" class="fade-in">
                        💡 Suivez le rythme de la musique "Stayin' Alive" des
                        Bee Gees
                    </div>
                    <div v-if="hintsShown >= 3" class="fade-in">
                        💡 Appuyez sur ESPACE au bon moment pour compter comme
                        compression correcte
                    </div>
                </div>

                <button
                    @click="showHint"
                    v-if="hintsShown < 3"
                    class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-tech text-sm rounded transition-all"
                >
                    AFFICHER UN INDICE
                </button>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import GameRoom from "../GameRoom.vue";
import { createFireworks } from "../../utils/fireworks";
import { useToast } from "../../composables/useToast";
import { useGameState } from "../../composables/useGameState";

const emit = defineEmits(["exit-room", "room-completed"]);
const { showSuccess, showError } = useToast();
const { addError, addHint, completeRoom, PENALTY_PER_ERROR } = useGameState();

const roomData = {
    title: "SALLE DE RÉANIMATION",
    subtitle: "Arrêt cardiaque simulé",
    description:
        "Un patient fait un arrêt cardiaque ! Vous devez effectuer un massage cardiaque d'urgence en respectant le rythme correct de 100 compressions par minute.",
    objective: "Apprendre les gestes de premiers secours",
    icon: "heart",
    color: "#dc2626",
};

const requiredCompressions = 30;
const correctCompressions = ref(0);
const puzzleSolved = ref(false);
const isCompleted = ref(false);
const hintsShown = ref(0);
const isRunning = ref(false);
const isCompressing = ref(false);
const isBeating = ref(false);
const beatProgress = ref(0);
const isInBeatWindow = ref(false);
const audioRef = ref(null);

// Rythme : 100 BPM = 600ms par compression (rythme réaliste)
const beatInterval = 600;
const beatWindow = 150; // Tolérance ±150ms
let beatTimer = null;
let compressTimer = null;
let lastBeatTime = 0;

const startSimulation = () => {
    if (isRunning.value) return;

    isRunning.value = true;
    correctCompressions.value = 0;
    lastBeatTime = Date.now();

    // Démarrer l'audio
    if (audioRef.value) {
        audioRef.value.currentTime = 0;
        audioRef.value.play().catch(() => {
            // Fallback si audio non disponible
        });
    }

    // Démarrer le rythme
    startBeatTimer();
};

const stopSimulation = () => {
    isRunning.value = false;
    clearInterval(beatTimer);
    clearTimeout(compressTimer);
    isBeating.value = false;
    beatProgress.value = 0;
    isInBeatWindow.value = false;

    if (audioRef.value) {
        audioRef.value.pause();
    }
};

const resetSimulation = () => {
    stopSimulation();
    correctCompressions.value = 0;
};

const startBeatTimer = () => {
    beatTimer = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastBeatTime;
        const progress = (elapsed / beatInterval) * 100;

        beatProgress.value = Math.min(progress, 100);
        isInBeatWindow.value =
            Math.abs(elapsed - beatInterval / 2) < beatWindow;

        if (elapsed >= beatInterval) {
            // Nouveau battement
            isBeating.value = true;
            lastBeatTime = now;

            // Reset après un court instant
            setTimeout(() => {
                isBeating.value = false;
            }, 200);

            beatProgress.value = 0;
        }
    }, 50); // Mise à jour fréquente pour l'animation
};

const handleKeyPress = (event) => {
    if (event.code === "Space" && isRunning.value) {
        event.preventDefault();
        isCompressing.value = true;

        // Vérifier si dans la fenêtre de rythme
        const now = Date.now();
        const timeSinceLastBeat = now - lastBeatTime;
        const isCorrectTiming =
            Math.abs(timeSinceLastBeat - beatInterval / 2) < beatWindow;

        if (isCorrectTiming) {
            correctCompressions.value++;
            showSuccess(
                "COMPRESSION CORRECTE",
                `+1 compression (${correctCompressions.value}/${requiredCompressions})`,
            );

            if (correctCompressions.value >= requiredCompressions) {
                completeSimulation();
            }
        } else {
            addError("heart");
            showError(
                "RYTHME INCORRECT",
                `Compression hors rythme. Continuez ! +${PENALTY_PER_ERROR}s de pénalité`,
            );
        }

        // Reset compression après un instant
        setTimeout(() => {
            isCompressing.value = false;
        }, 200);
    }
};

const completeSimulation = () => {
    stopSimulation();
    puzzleSolved.value = true;
    isCompleted.value = true;
    createFireworks(3000);

    showSuccess(
        "PATIENT SAUVÉ !",
        "Excellent ! Vous avez effectué un massage cardiaque parfait. Le patient est stabilisé.",
    );

    completeRoom("heart");
    emit("room-completed", "heart");
};

const showHint = () => {
    hintsShown.value++;
    addHint("heart");
};

onMounted(() => {
    window.addEventListener("keydown", handleKeyPress);
});

onUnmounted(() => {
    stopSimulation();
    window.removeEventListener("keydown", handleKeyPress);
});
</script>

<style scoped>
.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

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
    background: linear-gradient(90deg, transparent, #dc2626, transparent);
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
</style>
