<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <div v-if="!puzzleSolved" class="space-y-6">
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-cyan rounded-lg p-4 scanline"
            >
                <div class="flex items-center gap-2 mb-3">
                    <Brain class="w-5 h-5 text-cyber-cyan" />
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
                    <p class="font-tech text-xs text-gray-400">
                        Cliquez (ou sélectionnez avec Tab puis Entrée) sur une
                        coupe pour lui donner le prochain numéro libre.
                        Cliquez à nouveau sur une coupe numérotée pour retirer
                        son numéro.
                    </p>
                    <div
                        class="bg-cyan-900/30 border border-cyan-500/50 rounded p-2"
                    >
                        <div class="text-cyber-cyan font-tech text-xs">
                            <strong>ASTUCE :</strong> du sommet du crâne vers
                            la base du cerveau, les coupes s'élargissent.
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-4 scanline"
            >
                <div
                    class="flex flex-wrap items-center justify-between gap-2 mb-4"
                >
                    <div class="flex items-center gap-2">
                        <Layers class="w-5 h-5 text-cyber-blue" />
                        <h3 class="font-cyber font-bold text-cyber-blue">
                            COUPES IRM - Cliquez pour numéroter
                        </h3>
                    </div>
                    <div
                        class="text-cyber-green font-tech text-sm"
                        aria-live="polite"
                    >
                        {{ statusText }}
                    </div>
                </div>

                <!-- Grille 2x2 -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <button
                        v-for="(slice, index) in slices"
                        :key="slice.label"
                        type="button"
                        @click="assignNumber(index)"
                        :disabled="puzzleSolved"
                        :aria-label="getSliceAriaLabel(slice)"
                        class="block w-full text-left bg-black/50 border-2 rounded-lg p-3 cursor-pointer transition-all hover:border-cyan-400 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                        :class="
                            slice.assignedNumber
                                ? 'border-cyan-500'
                                : 'border-gray-600'
                        "
                    >
                        <!-- Numéro assigné -->
                        <span
                            v-if="slice.assignedNumber"
                            class="absolute top-2 left-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center font-cyber font-bold text-black text-lg z-10"
                            aria-hidden="true"
                        >
                            {{ slice.assignedNumber }}
                        </span>

                        <!-- IRM SVG -->
                        <svg
                            viewBox="0 0 200 120"
                            class="w-full h-auto"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <rect width="200" height="120" fill="#0a0a15" />

                            <!-- Sommet du crâne : cortex seul, pas de ventricules -->
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
                            </g>

                            <!-- Coupe supérieure : apparition des ventricules latéraux -->
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
                            </g>

                            <!-- Coupe médiane : ventricules plus larges + scissures latérales -->
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
                            </g>

                            <!-- Base du cerveau : lobes temporaux + cervelet à l'arrière (bas de l'image) -->
                            <g v-else-if="slice.id === 4">
                                <ellipse
                                    cx="100"
                                    cy="61"
                                    rx="74"
                                    ry="58"
                                    fill="none"
                                    stroke="#4a5568"
                                    stroke-width="2"
                                />
                                <ellipse
                                    cx="100"
                                    cy="61"
                                    rx="64"
                                    ry="48"
                                    fill="#2d3748"
                                    stroke="#718096"
                                    stroke-width="2"
                                />
                                <ellipse
                                    cx="88"
                                    cy="58"
                                    rx="6"
                                    ry="10"
                                    fill="#1a202c"
                                    stroke="#4a5568"
                                    stroke-width="1"
                                />
                                <ellipse
                                    cx="112"
                                    cy="58"
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
                                    cy="92"
                                    rx="26"
                                    ry="10"
                                    fill="#4a5568"
                                    stroke="#a0aec0"
                                    stroke-width="1"
                                />
                                <line
                                    x1="100"
                                    y1="82"
                                    x2="100"
                                    y2="102"
                                    stroke="#2d3748"
                                    stroke-width="1"
                                />
                            </g>
                        </svg>

                        <!-- Identifiant neutre de la coupe (ne révèle pas l'ordre) -->
                        <span
                            class="block mt-2 text-center font-tech text-xs text-gray-300"
                            aria-hidden="true"
                        >
                            COUPE {{ slice.label }}
                        </span>
                    </button>
                </div>

                <p
                    v-if="isLastWrongOrder"
                    class="text-center text-xs font-tech text-cyber-red mb-3"
                    aria-live="polite"
                >
                    Cet ordre a déjà été testé : cliquez sur une coupe pour
                    retirer son numéro et modifiez l'ordre.
                </p>

                <div class="flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        @click="resetNumbers"
                        class="px-4 py-2 border border-cyber-red text-cyber-red hover:bg-cyber-red/10 font-cyber text-sm rounded-lg transition-all"
                    >
                        RÉINITIALISER
                    </button>
                    <button
                        type="button"
                        @click="checkOrder"
                        :disabled="!canCheck"
                        class="px-6 py-2 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-black font-cyber text-sm rounded-lg transition-all"
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
                    <Lightbulb class="w-4 h-4 text-yellow-500" />
                    <h4 class="font-cyber font-bold text-yellow-500 text-sm">
                        INDICES
                    </h4>
                </div>

                <div class="space-y-1 text-xs text-gray-300" aria-live="polite">
                    <div
                        v-for="(hint, i) in HINTS.slice(0, hintsShown)"
                        :key="i"
                        class="fade-in"
                    >
                        💡 {{ hint }}
                    </div>
                </div>

                <button
                    type="button"
                    @click="showHint"
                    :disabled="!hasMoreHints"
                    class="mt-2 px-3 py-1 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 disabled:border-gray-600 disabled:text-gray-500 disabled:hover:bg-transparent disabled:cursor-not-allowed font-tech text-xs rounded transition-all"
                >
                    {{
                        hasMoreHints
                            ? `AFFICHER UN INDICE (${HINTS.length - hintsShown} restant${HINTS.length - hintsShown > 1 ? "s" : ""})`
                            : "Plus d'indice disponible"
                    }}
                </button>
            </div>
        </div>

        <!-- IRM reconstituée : récapitulatif pédagogique -->
        <div
            v-else
            class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-4 scanline space-y-4"
        >
            <div class="flex items-center gap-2">
                <CheckCircle2 class="w-5 h-5 text-cyber-green" />
                <h3 class="font-cyber font-bold text-cyber-green text-lg">
                    IRM RECONSTITUÉE
                </h3>
            </div>

            <ol class="space-y-1 font-tech text-sm text-gray-300">
                <li v-for="slice in orderedSlices" :key="slice.label">
                    <span class="text-cyber-cyan font-bold"
                        >{{ slice.id }}. Coupe {{ slice.label }}</span
                    >
                    — {{ slice.level }}
                </li>
            </ol>

            <div class="bg-cyan-900/30 border border-cyan-500/50 rounded p-3">
                <div class="flex items-center gap-2 mb-1">
                    <BookOpen class="w-4 h-4 text-cyber-cyan" />
                    <span class="font-cyber font-bold text-cyber-cyan text-sm">
                        À RETENIR
                    </span>
                </div>
                <p class="font-tech text-xs text-gray-300 leading-relaxed">
                    {{ TAKEAWAY }}
                </p>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref, computed } from "vue";
import { Brain, Layers, Lightbulb, CheckCircle2, BookOpen } from "lucide-vue-next";
import GameRoom from "../GameRoom.vue";
import { createFireworks } from "../../utils/fireworks";
import { useToast } from "../../composables/useToast";
import { useGameState } from "../../composables/useGameState";

const ROOM_ID = "imaging";
const SLICE_COUNT = 4;

const emit = defineEmits(["exit-room", "room-completed"]);
const { showSuccess, showError } = useToast();
const { gameState, addError, addHint, completeRoom, PENALTY_PER_ERROR } =
    useGameState();

const roomData = {
    title: "SALLE D'IMAGERIE",
    subtitle: "IRM fantôme",
    description:
        "Le virus a mélangé les coupes d'une IRM cérébrale. Remettez les 4 coupes dans le bon ordre (de haut en bas du crâne) pour restaurer l'imagerie médicale.",
    objective: "Découvrir le rôle de l'imagerie médicale",
    icon: "scan",
    color: "#00ff88",
};

// Indices progressifs : chacun apporte un repère visuel nouveau (jamais affiché à l'écran).
const HINTS = [
    "Au sommet du crâne, la coupe passe au-dessus des ventricules : c'est la seule coupe sans cavité sombre au centre.",
    "La coupe la plus basse traverse la base du cerveau : c'est la seule où l'on voit le cervelet, la forme ovale claire en bas de l'image (l'arrière du crâne).",
    "Des deux coupes restantes, la plus basse montre déjà les scissures latérales (de Sylvius), les petites courbes sur les côtés : elle prend le n°3, l'autre le n°2.",
];

const TAKEAWAY =
    "L'IRM utilise un aimant très puissant et des ondes radio, sans rayons X. Elle produit des images du cerveau en fines coupes (virtuelles) que le radiologue lit dans l'ordre, comme les pages d'un livre, pour repérer et localiser précisément une tumeur ou un AVC.";

// id = position correcte (1 = sommet ... 4 = base). L'ordre d'affichage est mélangé
// et chaque coupe ne porte qu'un identifiant neutre (A à D).
const slices = ref([
    {
        id: 3,
        label: "A",
        level: "niveau médian : ventricules latéraux plus larges et scissures latérales (de Sylvius)",
        assignedNumber: null,
    },
    {
        id: 1,
        label: "B",
        level: "sommet du crâne (vertex) : seulement le cortex, sans ventricules",
        assignedNumber: null,
    },
    {
        id: 4,
        label: "C",
        level: "base du cerveau : lobes temporaux et cervelet, à l'arrière",
        assignedNumber: null,
    },
    {
        id: 2,
        label: "D",
        level: "niveau supérieur : apparition des ventricules latéraux (liquide cérébrospinal)",
        assignedNumber: null,
    },
]);

const puzzleSolved = ref(false);
const isCompleted = ref(false);
// Ordre déjà soumis et refusé : on n'autorise pas une nouvelle vérification identique
// (évite les doubles pénalités sur double clic / répétition de touche).
const lastWrongOrder = ref(null);

// Les indices déjà payés restent affichés gratuitement après être sorti / revenu dans la salle.
const hintsShown = ref(
    Math.min(HINTS.length, gameState.roomHints?.[ROOM_ID] || 0),
);
const hasMoreHints = computed(() => hintsShown.value < HINTS.length);

const orderKey = () => slices.value.map((s) => s.assignedNumber).join(",");

// Plus petit numéro (1..4) qui n'est attribué à aucune coupe, ou null si tous le sont.
const nextFreeNumber = computed(() => {
    for (let n = 1; n <= SLICE_COUNT; n++) {
        if (!slices.value.some((s) => s.assignedNumber === n)) return n;
    }
    return null;
});

const allNumbersAssigned = computed(() =>
    slices.value.every((slice) => slice.assignedNumber !== null),
);

const isLastWrongOrder = computed(
    () => allNumbersAssigned.value && lastWrongOrder.value === orderKey(),
);

const canCheck = computed(
    () =>
        !isCompleted.value &&
        allNumbersAssigned.value &&
        !isLastWrongOrder.value,
);

const statusText = computed(() => {
    if (nextFreeNumber.value === null)
        return "Toutes les coupes sont numérotées";
    return `Prochain numéro : ${nextFreeNumber.value}`;
});

const orderedSlices = computed(() =>
    [...slices.value].sort((a, b) => a.id - b.id),
);

const getSliceAriaLabel = (slice) => {
    const state = slice.assignedNumber
        ? `numéro ${slice.assignedNumber} (activer pour retirer ce numéro)`
        : "sans numéro";
    return `Coupe ${slice.label}, ${state}`;
};

const assignNumber = (index) => {
    if (puzzleSolved.value) return;
    const slice = slices.value[index];
    if (!slice) return;

    // Une coupe déjà numérotée libère son numéro, qui redevient attribuable.
    if (slice.assignedNumber) {
        slice.assignedNumber = null;
        return;
    }

    const n = nextFreeNumber.value;
    if (n !== null) slice.assignedNumber = n;
};

const resetNumbers = () => {
    if (puzzleSolved.value) return;
    slices.value.forEach((slice) => {
        slice.assignedNumber = null;
    });
};

const checkOrder = () => {
    if (!canCheck.value) return;

    const isCorrect = slices.value.every(
        (slice) => slice.assignedNumber === slice.id,
    );

    if (isCorrect) {
        isCompleted.value = true;
        puzzleSolved.value = true;

        // Complétion synchrone : aucun délai qui pourrait perdre l'emit si la salle est quittée.
        completeRoom(ROOM_ID);
        emit("room-completed", ROOM_ID);

        createFireworks(3000);
        showSuccess(
            "IRM RECONSTITUÉE",
            `Ordre correct : ${orderedSlices.value.map((s) => s.label).join(" → ")}. À retenir : l'IRM utilise un aimant et des ondes radio, sans rayons X, pour obtenir des images du cerveau en fines coupes, lues dans l'ordre.`,
            8000,
        );
    } else {
        lastWrongOrder.value = orderKey();
        addError(ROOM_ID);
        showError(
            "ORDRE INCORRECT",
            `L'ordre n'est pas correct. Cliquez sur une coupe pour retirer son numéro et réessayez. +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

const showHint = () => {
    if (!hasMoreHints.value || puzzleSolved.value) return;
    const alreadyPaid = gameState.roomHints?.[ROOM_ID] || 0;
    hintsShown.value++;
    if (hintsShown.value > alreadyPaid) addHint(ROOM_ID);
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
