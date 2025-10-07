<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <div v-if="!puzzleSolved" class="space-y-6">
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-cyan rounded-lg p-4 scanline"
            >
                <div class="flex items-center gap-2 mb-3">
                    <i data-lucide="brain" class="w-5 h-5 text-cyber-cyan"></i>
                    <h3 class="font-cyber font-bold text-cyber-cyan text-lg">
                        RECONSTITUTION IRM
                    </h3>
                </div>

                <div class="text-gray-300 space-y-2">
                    <p class="font-tech text-sm">
                        Le virus a mélangé les coupes d'une IRM cérébrale.
                        Remettez les
                        <strong class="text-cyber-cyan"
                            >4 coupes dans le bon ordre</strong
                        >
                        de haut en bas (numérotez-les de 1 à 4).
                    </p>
                    <div
                        class="bg-cyan-900/30 border border-cyan-500/50 rounded p-2"
                    >
                        <div class="text-cyber-cyan font-tech text-xs">
                            <strong>ASTUCE :</strong> Du sommet (petit) vers la
                            base (large)
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-4 scanline"
            >
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <i
                            data-lucide="layers"
                            class="w-5 h-5 text-cyber-blue"
                        ></i>
                        <h3 class="font-cyber font-bold text-cyber-blue">
                            COUPES IRM - Cliquez pour numéroter
                        </h3>
                    </div>
                    <div class="text-cyber-green font-tech text-sm">
                        Position actuelle : {{ getCurrentPosition() }}
                    </div>
                </div>

                <!-- Grille 2x2 -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div
                        v-for="(slice, index) in slices"
                        :key="index"
                        @click="assignNumber(index)"
                        class="bg-black/50 border-2 rounded-lg p-3 cursor-pointer transition-all hover:border-cyan-400 relative"
                        :class="
                            slice.assignedNumber
                                ? 'border-cyan-500'
                                : 'border-gray-600'
                        "
                    >
                        <!-- Numéro assigné -->
                        <div
                            v-if="slice.assignedNumber"
                            class="absolute top-2 left-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center font-cyber font-bold text-black text-lg z-10"
                        >
                            {{ slice.assignedNumber }}
                        </div>

                        <!-- IRM SVG -->
                        <svg viewBox="0 0 200 120" class="w-full h-auto">
                            <rect width="200" height="120" fill="#0a0a15" />

                            <g v-if="slice.id === 1">
                                <ellipse
                                    cx="100"
                                    cy="60"
                                    rx="50"
                                    ry="40"
                                    fill="none"
                                    stroke="#4a5568"
                                    stroke-width="2"
                                />
                                <ellipse
                                    cx="100"
                                    cy="60"
                                    rx="40"
                                    ry="30"
                                    fill="#2d3748"
                                    stroke="#718096"
                                    stroke-width="2"
                                />
                                <line
                                    x1="100"
                                    y1="25"
                                    x2="100"
                                    y2="95"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                    stroke-dasharray="3,3"
                                />
                                <text
                                    x="100"
                                    y="110"
                                    font-family="monospace"
                                    font-size="8"
                                    fill="#6b7280"
                                    text-anchor="middle"
                                >
                                    SOMMET
                                </text>
                            </g>

                            <g v-else-if="slice.id === 2">
                                <ellipse
                                    cx="100"
                                    cy="60"
                                    rx="58"
                                    ry="48"
                                    fill="none"
                                    stroke="#4a5568"
                                    stroke-width="2"
                                />
                                <ellipse
                                    cx="100"
                                    cy="60"
                                    rx="48"
                                    ry="38"
                                    fill="#2d3748"
                                    stroke="#718096"
                                    stroke-width="2"
                                />
                                <ellipse
                                    cx="88"
                                    cy="60"
                                    rx="6"
                                    ry="12"
                                    fill="#1a202c"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                />
                                <ellipse
                                    cx="112"
                                    cy="60"
                                    rx="6"
                                    ry="12"
                                    fill="#1a202c"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                />
                                <line
                                    x1="100"
                                    y1="20"
                                    x2="100"
                                    y2="100"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                    stroke-dasharray="3,3"
                                />
                                <text
                                    x="100"
                                    y="110"
                                    font-family="monospace"
                                    font-size="8"
                                    fill="#6b7280"
                                    text-anchor="middle"
                                >
                                    SUPÉRIEURE
                                </text>
                            </g>

                            <g v-else-if="slice.id === 3">
                                <ellipse
                                    cx="100"
                                    cy="60"
                                    rx="66"
                                    ry="54"
                                    fill="none"
                                    stroke="#4a5568"
                                    stroke-width="2"
                                />
                                <ellipse
                                    cx="100"
                                    cy="60"
                                    rx="56"
                                    ry="44"
                                    fill="#2d3748"
                                    stroke="#718096"
                                    stroke-width="2"
                                />
                                <ellipse
                                    cx="85"
                                    cy="60"
                                    rx="8"
                                    ry="15"
                                    fill="#1a202c"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                />
                                <ellipse
                                    cx="115"
                                    cy="60"
                                    rx="8"
                                    ry="15"
                                    fill="#1a202c"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                />
                                <path
                                    d="M 55 60 Q 45 68 55 76"
                                    fill="none"
                                    stroke="#4a5568"
                                    stroke-width="1.5"
                                />
                                <path
                                    d="M 145 60 Q 155 68 145 76"
                                    fill="none"
                                    stroke="#4a5568"
                                    stroke-width="1.5"
                                />
                                <line
                                    x1="100"
                                    y1="15"
                                    x2="100"
                                    y2="105"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                    stroke-dasharray="3,3"
                                />
                                <text
                                    x="100"
                                    y="115"
                                    font-family="monospace"
                                    font-size="8"
                                    fill="#6b7280"
                                    text-anchor="middle"
                                >
                                    MÉDIANE
                                </text>
                            </g>

                            <g v-else-if="slice.id === 4">
                                <ellipse
                                    cx="100"
                                    cy="65"
                                    rx="74"
                                    ry="58"
                                    fill="none"
                                    stroke="#4a5568"
                                    stroke-width="2"
                                />
                                <ellipse
                                    cx="100"
                                    cy="65"
                                    rx="64"
                                    ry="48"
                                    fill="#2d3748"
                                    stroke="#718096"
                                    stroke-width="2"
                                />
                                <ellipse
                                    cx="88"
                                    cy="62"
                                    rx="6"
                                    ry="10"
                                    fill="#1a202c"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                />
                                <ellipse
                                    cx="112"
                                    cy="62"
                                    rx="6"
                                    ry="10"
                                    fill="#1a202c"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                />
                                <path
                                    d="M 50 72 Q 40 80 50 88"
                                    fill="none"
                                    stroke="#4a5568"
                                    stroke-width="1.5"
                                />
                                <path
                                    d="M 150 72 Q 160 80 150 88"
                                    fill="none"
                                    stroke="#4a5568"
                                    stroke-width="1.5"
                                />
                                <ellipse
                                    cx="100"
                                    cy="85"
                                    rx="20"
                                    ry="6"
                                    fill="#1a202c"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                />
                                <text
                                    x="100"
                                    y="110"
                                    font-family="monospace"
                                    font-size="8"
                                    fill="#6b7280"
                                    text-anchor="middle"
                                >
                                    BASE
                                </text>
                            </g>
                        </svg>
                    </div>
                </div>

                <div class="flex justify-center gap-3">
                    <button
                        @click="resetNumbers"
                        class="px-4 py-2 border border-cyber-red text-cyber-red hover:bg-cyber-red/10 font-cyber text-sm rounded-lg transition-all"
                    >
                        RÉINITIALISER
                    </button>
                    <button
                        @click="checkOrder"
                        :disabled="!allNumbersAssigned()"
                        class="px-6 py-2 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber text-sm rounded-lg transition-all"
                    >
                        VÉRIFIER
                    </button>
                </div>
            </div>

            <!-- Indices compacts -->
            <div
                class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-3"
            >
                <div class="flex items-center gap-2 mb-2">
                    <i
                        data-lucide="lightbulb"
                        class="w-4 h-4 text-yellow-500"
                    ></i>
                    <h4 class="font-cyber font-bold text-yellow-500 text-sm">
                        INDICES
                    </h4>
                </div>

                <div class="space-y-1 text-xs text-gray-300">
                    <div v-if="hintsShown >= 1" class="fade-in">
                        💡 Plus c'est petit, plus c'est haut dans le crâne
                    </div>
                    <div v-if="hintsShown >= 2" class="fade-in">
                        💡 La base du crâne a une forme ovale en bas
                    </div>
                    <div v-if="hintsShown >= 3" class="fade-in">
                        💡 Ordre : SOMMET → SUPÉRIEURE → MÉDIANE → BASE
                    </div>
                </div>

                <button
                    @click="showHint"
                    v-if="hintsShown < 3 && !puzzleSolved"
                    class="mt-2 px-3 py-1 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-tech text-xs rounded transition-all"
                >
                    AFFICHER UN INDICE
                </button>
            </div>
        </div>

    </GameRoom>
</template>

<script setup>
import { ref, computed } from "vue";
import GameRoom from "../GameRoom.vue";
import { createFireworks } from "../../utils/fireworks";
import { useToast } from "../../composables/useToast";

const emit = defineEmits(["exit-room", "room-completed"]);
const { showError } = useToast();

const roomData = {
    title: "SALLE D'IMAGERIE",
    subtitle: "IRM fantôme",
    description:
        "Le virus a mélangé les coupes d'une IRM cérébrale. Remettez les 4 coupes dans le bon ordre (de haut en bas du crâne) pour restaurer l'imagerie médicale.",
    objective: "Découvrir le rôle de l'imagerie médicale",
    icon: "scan",
    color: "#06b6d4",
};

const slices = ref([
    { id: 3, assignedNumber: null },
    { id: 1, assignedNumber: null },
    { id: 4, assignedNumber: null },
    { id: 2, assignedNumber: null },
]);

const currentNumber = ref(1);
const puzzleSolved = ref(false);
const isCompleted = ref(false);
const hintsShown = ref(0);

const assignNumber = (index) => {
    if (puzzleSolved.value) return;

    if (slices.value[index].assignedNumber) {
        slices.value[index].assignedNumber = null;
        return;
    }

    if (currentNumber.value <= 4) {
        slices.value[index].assignedNumber = currentNumber.value;
        currentNumber.value++;
    }
};

const resetNumbers = () => {
    slices.value.forEach((slice) => {
        slice.assignedNumber = null;
    });
    currentNumber.value = 1;
};

const allNumbersAssigned = () => {
    return slices.value.every((slice) => slice.assignedNumber !== null);
};

const checkOrder = () => {
    const isCorrect = slices.value.every(
        (slice) => slice.assignedNumber === slice.id,
    );

    if (isCorrect) {
        puzzleSolved.value = true;
        isCompleted.value = true;
        createFireworks(3000);

        showSucess(
            "RÉPONSE CORRECTE",
            "L'ordre est correct. Vous avez réussi à restaurer l'imagerie médicale.",
        )
        
        // Émettre directement l'événement room-completed comme ServerRoom et DNARoom
        emit("room-completed", "imaging");
    } else {
        showError(
            "L'ordre n'est pas correct. Réessayez ! (Indice : du plus petit au plus large)",
        )
    }
};

const getCurrentPosition = () => {
    if (currentNumber.value > 4) return "Complété";
    return `Cliquez pour position ${currentNumber.value}`;
};

const showHint = () => {
    hintsShown.value++;
};
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

svg {
    user-select: none;
}
</style>