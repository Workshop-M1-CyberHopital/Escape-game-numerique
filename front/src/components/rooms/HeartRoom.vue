Escape-game-numerique/front/src/components/rooms/CPRRoom.vue
<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Score en temps réel -->
        <div v-if="isRunning" class="fixed top-4 right-4 z-50">
            <div class="bg-gray-900/95 backdrop-blur-md border-2 border-cyber-red rounded-lg p-4 shadow-lg">
                <div class="text-center">
                    <div class="text-sm text-gray-400 font-tech mb-1">SCORE RCP</div>
                    <div class="text-3xl font-bold text-cyber-red">
                        {{ correctCompressions }}/{{ requiredCompressions }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        {{ Math.round((correctCompressions / requiredCompressions) * 100) }}% complété
                    </div>
                </div>
            </div>
        </div>

        <!-- Feedback visuel central -->
        <div v-if="isRunning && lastCompressionSuccess !== null" class="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div 
                class="text-center p-8 rounded-2xl border-4 transition-all duration-500 transform"
                :class="{
                    'bg-green-500/90 border-green-400 text-white scale-110 shadow-2xl shadow-green-400/50': lastCompressionSuccess === true,
                    'bg-red-500/90 border-red-400 text-white scale-110 shadow-2xl shadow-red-400/50': lastCompressionSuccess === false
                }"
            >
                <div class="text-6xl mb-4">
                    <i v-if="lastCompressionSuccess === true" data-lucide="check-circle" class="animate-pulse"></i>
                    <i v-else data-lucide="x-circle" class="animate-pulse"></i>
                </div>
                <div class="text-2xl font-bold mb-2">
                    {{ lastCompressionSuccess === true ? 'EXCELLENT !' : 'RATÉ !' }}
                </div>
                <div class="text-lg">
                    {{ lastCompressionSuccess === true ? 'Compression correcte' : 'Respectez le rythme' }}
                </div>
            </div>
        </div>

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

                        <!-- Progress Bar Central -->
                        <div class="mb-6">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-lg text-gray-300 font-tech font-bold">PROGRESSION RCP</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-2xl text-cyber-blue font-bold">
                                        {{ correctCompressions }}/{{ requiredCompressions }}
                                    </span>
                                    <div class="text-xs text-gray-400">
                                        {{ Math.round((correctCompressions / requiredCompressions) * 100) }}%
                                    </div>
                                </div>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-4 border-2 border-gray-600 overflow-hidden shadow-inner">
                                <div 
                                    class="h-full bg-gradient-to-r from-cyber-red via-red-400 to-red-300 transition-all duration-500 ease-out relative"
                                    :style="{ width: `${(correctCompressions / requiredCompressions) * 100}%` }"
                                >
                                    <!-- Effet de brillance sur la barre de progression -->
                                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                </div>
                            </div>
                            
                            <!-- Indicateur de performance -->
                            <div class="mt-2 flex justify-center">
                                <div class="flex items-center gap-1">
                                    <div 
                                        v-for="i in 5" 
                                        :key="i"
                                        class="w-3 h-3 rounded-full transition-all duration-300"
                                        :class="{
                                            'bg-green-400 shadow-lg shadow-green-400/50': i <= Math.ceil((correctCompressions / requiredCompressions) * 5),
                                            'bg-gray-600': i > Math.ceil((correctCompressions / requiredCompressions) * 5)
                                        }"
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <!-- Feedback Status Central -->
                        <div class="mb-4">
                            <div 
                                v-if="isRunning"
                                class="text-center p-4 rounded-lg border-2 transition-all duration-300"
                                :class="{
                                    'border-green-500 bg-green-500/10 text-green-400 success-flash': lastCompressionSuccess,
                                    'border-red-500 bg-red-500/10 text-red-400 error-flash': lastCompressionSuccess === false,
                                    'border-gray-500 bg-gray-500/10 text-gray-400': lastCompressionSuccess === null
                                }"
                            >
                                <div class="flex items-center justify-center gap-2 mb-2">
                                    <i 
                                        v-if="lastCompressionSuccess === true"
                                        data-lucide="check-circle" 
                                        class="w-6 h-6 text-green-400"
                                    ></i>
                                    <i 
                                        v-else-if="lastCompressionSuccess === false"
                                        data-lucide="x-circle" 
                                        class="w-6 h-6 text-red-400"
                                    ></i>
                                    <i 
                                        v-else
                                        data-lucide="heart" 
                                        class="w-6 h-6 text-gray-400"
                                    ></i>
                                    <span class="font-bold text-lg">
                                        {{ lastCompressionSuccess === true ? 'COMPRESSION CORRECTE' : 
                                           lastCompressionSuccess === false ? 'RYTHME INCORRECT' : 
                                           'ATTENDEZ LE RYTHME' }}
                                    </span>
                                </div>
                                <div class="text-sm">
                                    {{ lastCompressionSuccess === true ? `+1 compression (${correctCompressions}/${requiredCompressions})` : 
                                       lastCompressionSuccess === false ? 'Continuez ! Respectez le rythme' : 
                                       'Attendez que la zone rouge s\'illumine' }}
                                </div>
                            </div>
                        </div>

                        <!-- Compression Indicator -->
                        <div class="relative">
                            <div class="flex justify-center mb-4">
                                <div
                                    class="w-32 h-32 rounded-full border-4 border-gray-600 flex items-center justify-center transition-all duration-300 relative"
                                    :class="{
                                        'border-cyber-red bg-cyber-red/20 scale-110 shadow-lg shadow-cyber-red/50':
                                            isCompressing,
                                        'border-gray-500 bg-gray-700/50':
                                            !isCompressing,
                                    }"
                                >
                                    <i
                                        data-lucide="heart"
                                        class="w-12 h-12 text-cyber-red transition-all duration-300"
                                        :class="{
                                            'heartbeat':
                                                isBeating,
                                            'compression-pulse':
                                                isCompressing,
                                        }"
                                    ></i>

                                    <!-- Compression depth indicator -->
                                    <div
                                        v-if="isCompressing"
                                        class="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                                    >
                                        <div
                                            class="w-2 h-6 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"
                                        ></div>
                                    </div>

                                    <!-- Success/Error overlay -->
                                    <div
                                        v-if="lastCompressionSuccess !== null"
                                        class="absolute inset-0 flex items-center justify-center"
                                    >
                                        <div
                                            class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500"
                                            :class="{
                                                'bg-green-500/80 text-white scale-110 animate-ping':
                                                    lastCompressionSuccess === true,
                                                'bg-red-500/80 text-white scale-110 animate-ping':
                                                    lastCompressionSuccess === false,
                                            }"
                                        >
                                            <i
                                                v-if="lastCompressionSuccess === true"
                                                data-lucide="check"
                                                class="w-8 h-8"
                                            ></i>
                                            <i
                                                v-else
                                                data-lucide="x"
                                                class="w-8 h-8"
                                            ></i>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Rhythm synchronizer -->
                            <div
                                class="bg-gray-900/50 border border-gray-600 rounded p-4"
                            >
                                <div
                                    class="text-xs text-gray-400 font-tech mb-3 text-center"
                                >
                                    SYNCHRONISEUR RYTHMIQUE
                                </div>
                                <div
                                    class="relative w-72 h-8 mx-auto bg-gray-700 rounded-full overflow-hidden border border-gray-600"
                                >
                                    <!-- Zone rouge de tolérance (correspond à la fenêtre de timing réelle) -->
                                    <div
                                        class="absolute top-0 h-full bg-red-500/40 rounded-full border border-red-400/50 transition-all duration-300"
                                        :style="{
                                            left: `${50 - (beatWindow / beatInterval) * 25}%`,
                                            width: `${(beatWindow / beatInterval) * 50}%`
                                        }"
                                        :class="{
                                            'bg-red-500/60 border-red-400 shadow-lg shadow-red-400/50':
                                                isInBeatWindow,
                                        }"
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
                                            class="w-6 h-6 bg-cyber-red rounded-full transition-all duration-200 border-2 border-white shadow-lg"
                                            :class="{
                                                'scale-150 bg-red-400 shadow-red-400/50 animate-ping':
                                                    isInBeatWindow,
                                                'animate-pulse':
                                                    isBeating,
                                            }"
                                        ></div>
                                    </div>
                                </div>
                                <div
                                    class="text-xs text-gray-500 mt-3 text-center font-tech"
                                >
                                    <span class="text-cyber-blue font-bold">Appuyez sur ESPACE</span>
                                    <span class="text-cyber-red font-bold"> quand la zone rouge s'illumine</span>
                                </div>
                                
                                <!-- Rythme visuel -->
                                <div class="mt-3 flex justify-center">
                                    <div class="flex gap-1">
                                        <div 
                                            v-for="i in 4" 
                                            :key="i"
                                            class="w-2 h-2 rounded-full transition-all duration-200"
                                            :class="{
                                                'bg-cyber-blue animate-pulse': isBeating && (i % 2 === 0),
                                                'bg-gray-500': !isBeating || (i % 2 === 1)
                                            }"
                                        ></div>
                                    </div>
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
                        💡 Appuyez sur ESPACE quand la zone rouge s'illumine pour compter comme
                        compression correcte
                    </div>
                    <div v-if="hintsShown >= 4" class="fade-in">
                        💡 La zone rouge s'illumine quand le timing est correct (vers 300ms du cycle)
                    </div>
                </div>

                <button
                    @click="showHint"
                    v-if="hintsShown < 4"
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
    title: "SALLE DU CŒUR",
    subtitle: "Arrêt cardiaque simulé",
    description:
        "Un patient fait un arrêt cardiaque ! Vous devez effectuer un massage cardiaque d'urgence en respectant le rythme correct de 100 compressions par minute.",
    objective: "Apprendre les gestes de premiers secours",
    icon: "heart",
    color: "#ff00ff",
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
const lastCompressionSuccess = ref(null); // null = pas encore de compression, true = succès, false = échec

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
            lastCompressionSuccess.value = true;
            
            // Feedback visuel central (garder les toasts pour l'audio)
            showSuccess(
                "COMPRESSION CORRECTE",
                `+1 compression (${correctCompressions.value}/${requiredCompressions})`,
            );

            if (correctCompressions.value >= requiredCompressions) {
                completeSimulation();
            }
        } else {
            addError("heart");
            lastCompressionSuccess.value = false;
            
            // Feedback visuel central (garder les toasts pour l'audio)
            showError(
                "RYTHME INCORRECT",
                `Compression hors rythme. Continuez ! +${PENALTY_PER_ERROR}s de pénalité`,
            );
        }

        // Reset compression après un instant
        setTimeout(() => {
            isCompressing.value = false;
        }, 200);

        // Reset le feedback après 2 secondes pour permettre de voir le résultat
        setTimeout(() => {
            lastCompressionSuccess.value = null;
        }, 2000);
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

    // Petit délai pour permettre au briefing de fin de s'afficher
    setTimeout(() => {
        completeRoom("heart");
        emit("room-completed", "heart");
    }, 300);
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

/* Animations personnalisées pour le feedback */
@keyframes heartbeat {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

@keyframes compressionPulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes successFlash {
    0%, 100% {
        background-color: rgba(34, 197, 94, 0.1);
        border-color: rgb(34, 197, 94);
    }
    50% {
        background-color: rgba(34, 197, 94, 0.3);
        border-color: rgb(34, 197, 94);
    }
}

@keyframes errorFlash {
    0%, 100% {
        background-color: rgba(239, 68, 68, 0.1);
        border-color: rgb(239, 68, 68);
    }
    50% {
        background-color: rgba(239, 68, 68, 0.3);
        border-color: rgb(239, 68, 68);
    }
}

.heartbeat {
    animation: heartbeat 0.6s ease-in-out infinite;
}

.compression-pulse {
    animation: compressionPulse 0.2s ease-in-out;
}

.success-flash {
    animation: successFlash 0.5s ease-in-out;
}

.error-flash {
    animation: errorFlash 0.5s ease-in-out;
}
</style>
