Escape-game-numerique/front/src/components/rooms/CPRRoom.vue
<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Instructions -->
        <div v-if="!puzzleSolved" class="space-y-8">
            <!-- Moniteur cardiaque -->
            <div
                class="bg-gray-900/80 backdrop-blur-md border-2 border-gray-600 rounded-lg p-6 scanline"
            >
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <i
                            data-lucide="monitor"
                            class="w-5 h-5 text-cyber-blue"
                        ></i>
                        <h3 class="font-cyber font-bold text-cyber-blue">
                            MONITEUR CARDIAQUE - DÉFIBRILLATEUR
                        </h3>
                    </div>
                    <div class="text-xs text-gray-400 font-tech">
                        ID: DEF-001 | CHARGE: 200J
                    </div>
                </div>

                <div class="space-y-6">
                    <!-- ECG Display -->
                    <div
                        class="bg-black border-2 border-gray-600 rounded-lg p-4"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <div class="text-xs text-green-400 font-tech">
                                ECG LEAD II
                            </div>
                            <div class="text-xs text-gray-400 font-tech">
                                HR: --- BPM
                            </div>
                        </div>

                        <!-- ECG Waveform -->
                        <div
                            class="relative h-20 bg-black border border-gray-700 rounded overflow-hidden"
                        >
                            <svg viewBox="0 0 400 60" class="w-full h-full">
                                <!-- Grid lines -->
                                <defs>
                                    <pattern
                                        id="grid"
                                        width="20"
                                        height="20"
                                        patternUnits="userSpaceOnUse"
                                    >
                                        <path
                                            d="M 20 0 L 0 0 0 20"
                                            fill="none"
                                            stroke="#374151"
                                            stroke-width="0.5"
                                        />
                                    </pattern>
                                </defs>
                                <rect
                                    width="400"
                                    height="60"
                                    fill="url(#grid)"
                                />

                                <!-- ECG Baseline -->
                                <line
                                    x1="0"
                                    y1="30"
                                    x2="400"
                                    y2="30"
                                    stroke="#10b981"
                                    stroke-width="1"
                                    opacity="0.7"
                                />

                                <!-- Animated ECG spikes (simplified) -->
                                <g v-if="isBeating">
                                    <path
                                        d="M 50 30 L 50 25 L 55 45 L 60 10 L 65 30"
                                        stroke="#10b981"
                                        stroke-width="2"
                                        fill="none"
                                        opacity="0.8"
                                    />
                                    <path
                                        d="M 150 30 L 150 25 L 155 45 L 160 10 L 165 30"
                                        stroke="#10b981"
                                        stroke-width="2"
                                        fill="none"
                                        opacity="0.8"
                                    />
                                    <path
                                        d="M 250 30 L 250 25 L 255 45 L 260 10 L 265 30"
                                        stroke="#10b981"
                                        stroke-width="2"
                                        fill="none"
                                        opacity="0.8"
                                    />
                                    <path
                                        d="M 350 30 L 350 25 L 355 45 L 360 10 L 365 30"
                                        stroke="#10b981"
                                        stroke-width="2"
                                        fill="none"
                                        opacity="0.8"
                                    />
                                </g>

                                <!-- Flatline when not beating -->
                                <line
                                    v-else
                                    x1="0"
                                    y1="30"
                                    x2="400"
                                    y2="30"
                                    stroke="#ef4444"
                                    stroke-width="2"
                                />
                            </svg>
                        </div>
                    </div>

                    <!-- Compression Monitor -->
                    <div
                        class="bg-gray-800/50 border border-gray-600 rounded-lg p-4"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <div class="text-sm text-cyber-blue font-tech">
                                PRESSION THORACIQUE
                            </div>
                            <div class="text-xs text-gray-400 font-tech">
                                Temps restant:
                                {{
                                    Math.ceil(
                                        (requiredCompressions -
                                            correctCompressions) *
                                            0.6,
                                    )
                                }}s
                            </div>
                        </div>

                        <!-- Compression Indicator -->
                        <div class="relative">
                            <div class="flex justify-center mb-4">
                                <div
                                    class="w-24 h-24 rounded-full border-4 border-gray-600 flex items-center justify-center transition-all duration-200 relative"
                                    :class="{
                                        'border-cyber-red bg-cyber-red/20 scale-110':
                                            isCompressing,
                                        'border-gray-500 bg-gray-700/50':
                                            !isCompressing,
                                    }"
                                >
                                    <i
                                        data-lucide="heart"
                                        class="w-10 h-10 text-cyber-red transition-all duration-200"
                                        :class="{
                                            'animate-pulse scale-110':
                                                isBeating,
                                        }"
                                    ></i>

                                    <!-- Compression depth indicator -->
                                    <div
                                        v-if="isCompressing"
                                        class="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                                    >
                                        <div
                                            class="w-1 h-4 bg-green-400 rounded-full animate-pulse"
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Rhythm synchronizer -->
                            <div
                                class="bg-gray-900/50 border border-gray-600 rounded p-3"
                            >
                                <div
                                    class="text-xs text-gray-400 font-tech mb-2 text-center"
                                >
                                    SYNCHRONISEUR RYTHMIQUE
                                </div>
                                <div
                                    class="relative w-64 h-6 mx-auto bg-gray-700 rounded-full overflow-hidden border border-gray-600"
                                >
                                    <!-- Zone rouge de tolérance (fixe au centre) -->
                                    <div
                                        class="absolute top-0 h-full bg-red-500/40 rounded-full border border-red-400/50"
                                        style="
                                            left: 50%;
                                            width: 80px;
                                            transform: translateX(-40px);
                                        "
                                    ></div>
                                    <!-- Barre de progression bleue -->
                                    <div
                                        class="absolute top-0 left-0 h-full bg-gradient-to-r from-cyber-blue to-blue-400 transition-all duration-300 ease-linear"
                                        :style="{ width: `${beatProgress}%` }"
                                    ></div>
                                    <!-- Point indicateur -->
                                    <div
                                        class="absolute inset-0 flex items-center justify-center"
                                    >
                                        <div
                                            class="w-4 h-4 bg-cyber-red rounded-full transition-all duration-200 border border-white shadow-md"
                                            :class="{
                                                'scale-150 bg-red-400 shadow-red-400/50 animate-ping':
                                                    isInBeatWindow,
                                            }"
                                        ></div>
                                    </div>
                                </div>
                                <div
                                    class="text-xs text-gray-500 mt-2 text-center font-tech"
                                >
                                    Appuyez sur
                                    <span class="text-cyber-red font-bold"
                                        >ESPACE</span
                                    >
                                    dans la zone rouge
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Contrôles médicaux -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            @click="startSimulation"
                            v-if="!isRunning"
                            class="px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-cyber font-bold rounded-lg transition-all border border-green-500 shadow-lg hover:shadow-green-500/25"
                        >
                            <i
                                data-lucide="play"
                                class="w-4 h-4 inline mr-2"
                            ></i>
                            DÉBUT RCP
                        </button>
                        <button
                            @click="stopSimulation"
                            v-if="isRunning"
                            class="px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-cyber font-bold rounded-lg transition-all border border-red-500 shadow-lg hover:shadow-red-500/25"
                        >
                            <i
                                data-lucide="square"
                                class="w-4 h-4 inline mr-2"
                            ></i>
                            ARRÊT URGENT
                        </button>
                        <button
                            @click="resetSimulation"
                            class="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-cyber rounded-lg transition-all border border-gray-500 shadow-lg hover:shadow-gray-500/25"
                        >
                            <i
                                data-lucide="rotate-ccw"
                                class="w-4 h-4 inline mr-2"
                            ></i>
                            RESET
                        </button>
                    </div>

                    <!-- Système audio médical -->
                    <div
                        class="bg-gray-800/30 border border-gray-600 rounded p-3"
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <i
                                    data-lucide="volume-2"
                                    class="w-4 h-4 text-cyber-blue"
                                ></i>
                                <span class="text-xs text-gray-400 font-tech"
                                    >AUDIO RCP</span
                                >
                            </div>
                            <div class="text-xs text-green-400 font-tech">
                                ACTIF
                            </div>
                        </div>
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
