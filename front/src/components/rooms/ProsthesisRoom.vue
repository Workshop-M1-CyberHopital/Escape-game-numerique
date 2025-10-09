<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Étape 1: Calibration des angles -->
        <div v-if="!step1Solved" class="space-y-8">
            <!-- Explication du système -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-orange-500 rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="info" class="w-5 h-5 text-orange-500"></i>
                    <h3 class="font-cyber font-bold text-orange-500">
                        SYSTÈME DE CALIBRATION ORTHOPÉDIQUE
                    </h3>
                </div>

                <div class="text-sm text-gray-300 mb-4">
                    Les prothèses de genou connectées nécessitent une
                    calibration précise des angles articulaires pour fonctionner
                    correctement.
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div
                        class="bg-black/50 border border-green-500/50 rounded p-3 text-center"
                    >
                        <div class="text-green-400 font-bold mb-1">
                            EXTENSION
                        </div>
                        <div class="text-gray-400">0° - 10°</div>
                        <div class="text-xs text-gray-500 mt-1">
                            Jambe droite
                        </div>
                    </div>
                    <div
                        class="bg-black/50 border border-blue-500/50 rounded p-3 text-center"
                    >
                        <div class="text-blue-400 font-bold mb-1">
                            FLEXION NORMALE
                        </div>
                        <div class="text-gray-400">90° - 120°</div>
                        <div class="text-xs text-gray-500 mt-1">
                            Marche standard
                        </div>
                    </div>
                    <div
                        class="bg-black/50 border border-purple-500/50 rounded p-3 text-center"
                    >
                        <div class="text-purple-400 font-bold mb-1">
                            FLEXION COMPLÈTE
                        </div>
                        <div class="text-gray-400">130° - 140°</div>
                        <div class="text-xs text-gray-500 mt-1">
                            S'asseoir/se lever
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calibration des angles -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i
                        data-lucide="settings"
                        class="w-5 h-5 text-cyber-blue"
                    ></i>
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 1: CALIBRER LA PROTHÈSE DE GENOU
                    </h3>
                </div>

                <div class="space-y-6">
                    <!-- Visualisation de l'angle -->
                    <div>
                        <div class="text-sm font-tech text-gray-400 mb-4">
                            ANGLE ACTUEL DE LA PROTHÈSE
                        </div>
                        <div class="flex justify-center mb-6">
                            <div
                                class="relative w-64 h-64 bg-black/50 border border-cyber-blue/30 rounded-lg"
                            >
                                <svg
                                    viewBox="0 0 200 200"
                                    class="w-full h-full"
                                >
                                    <!-- Cercle de référence -->
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke="#334155"
                                        stroke-width="2"
                                    />

                                    <!-- Graduations -->
                                    <text
                                        x="180"
                                        y="105"
                                        fill="#6b7280"
                                        font-size="10"
                                    >
                                        0°
                                    </text>
                                    <text
                                        x="95"
                                        y="30"
                                        fill="#6b7280"
                                        font-size="10"
                                    >
                                        90°
                                    </text>
                                    <text
                                        x="10"
                                        y="105"
                                        fill="#6b7280"
                                        font-size="10"
                                    >
                                        180°
                                    </text>

                                    <!-- Ligne de référence (fixe) -->
                                    <line
                                        x1="100"
                                        y1="100"
                                        x2="180"
                                        y2="100"
                                        stroke="#10b981"
                                        stroke-width="3"
                                    />

                                    <!-- Ligne mobile (angle actuel) -->
                                    <line
                                        x1="100"
                                        y1="100"
                                        :x2="
                                            100 +
                                            80 *
                                                Math.cos(
                                                    ((currentAngle - 90) *
                                                        Math.PI) /
                                                        180,
                                                )
                                        "
                                        :y2="
                                            100 +
                                            80 *
                                                Math.sin(
                                                    ((currentAngle - 90) *
                                                        Math.PI) /
                                                        180,
                                                )
                                        "
                                        stroke="#06b6d4"
                                        stroke-width="3"
                                    />

                                    <!-- Point central -->
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="5"
                                        fill="#06b6d4"
                                    />
                                </svg>

                                <!-- Affichage de l'angle -->
                                <div
                                    class="absolute bottom-4 left-0 right-0 text-center"
                                >
                                    <div
                                        class="text-3xl font-cyber font-bold text-cyber-blue"
                                    >
                                        {{ currentAngle }}°
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Slider de contrôle -->
                        <div class="max-w-md mx-auto">
                            <input
                                type="range"
                                v-model.number="currentAngle"
                                min="0"
                                max="180"
                                step="1"
                                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div
                                class="flex justify-between text-xs text-gray-400 mt-2"
                            >
                                <span>0° (Extension)</span>
                                <span>90°</span>
                                <span>180°</span>
                            </div>
                        </div>
                    </div>

                    <!-- Objectif de calibration -->
                    <div
                        class="bg-orange-500/10 border border-orange-500/50 rounded p-4"
                    >
                        <div class="text-orange-400 font-bold text-sm mb-2">
                            🎯 OBJECTIF DE CALIBRATION
                        </div>
                        <div class="text-gray-300 text-sm">
                            Réglez l'angle de flexion optimal pour la marche
                            standard :
                            <span class="text-cyber-blue font-bold">110°</span>
                        </div>
                    </div>

                    <!-- Bouton de validation -->
                    <button
                        @click="checkAngle"
                        class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all"
                    >
                        VALIDER LA CALIBRATION
                    </button>
                </div>
            </div>
        </div>

        <!-- Étape 2: Synchronisation multi-articulations -->
        <div v-if="step1Solved && !step2Solved" class="space-y-8">
            <!-- Explication -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-orange-500 rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="zap" class="w-5 h-5 text-orange-500"></i>
                    <h3 class="font-cyber font-bold text-orange-500">
                        SYNCHRONISATION DES ARTICULATIONS
                    </h3>
                </div>

                <div class="text-sm text-gray-300">
                    Le système orthopédique contrôle plusieurs articulations
                    simultanément. Vous devez les réaligner selon les
                    contraintes biomécaniques.
                </div>
            </div>

            <!-- Interface de synchronisation -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i
                        data-lucide="activity"
                        class="w-5 h-5 text-cyber-blue"
                    ></i>
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 2: RÉALIGNER LES ARTICULATIONS
                    </h3>
                </div>

                <div class="space-y-6">
                    <!-- Contraintes -->
                    <div
                        class="bg-purple-500/10 border border-purple-500/50 rounded p-4"
                    >
                        <div class="text-purple-400 font-bold text-sm mb-2">
                            📋 CONTRAINTES BIOMÉCANIQUES
                        </div>
                        <div class="text-gray-300 text-xs space-y-1">
                            <div>
                                • La
                                <span class="text-blue-400 font-bold"
                                    >hanche</span
                                >
                                doit être à un angle supérieur au
                                <span class="text-green-400 font-bold"
                                    >genou</span
                                >
                            </div>
                            <div>
                                • Le
                                <span class="text-green-400 font-bold"
                                    >genou</span
                                >
                                doit être à un angle supérieur à la
                                <span class="text-yellow-400 font-bold"
                                    >cheville</span
                                >
                            </div>
                            <div>
                                • La différence entre deux articulations
                                adjacentes doit être d'au moins
                                <span class="text-orange-400 font-bold"
                                    >20°</span
                                >
                                et au maximum
                                <span class="text-orange-400 font-bold"
                                    >40°</span
                                >
                            </div>
                            <div>
                                • La somme totale des angles doit être
                                exactement
                                <span class="text-cyan-400 font-bold"
                                    >180°</span
                                >
                                (±10°)
                            </div>
                            <div>
                                • Position cible :
                                <span class="text-pink-400 font-bold"
                                    >Posture assise ergonomique</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Articulations -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Hanche -->
                        <div
                            class="bg-black/30 border border-blue-500/50 rounded p-4"
                        >
                            <div class="text-center mb-3">
                                <div
                                    class="text-blue-400 font-bold text-sm mb-1"
                                >
                                    HANCHE
                                </div>
                                <div
                                    class="text-3xl font-cyber text-blue-400 font-bold"
                                >
                                    {{ hipAngle }}°
                                </div>
                            </div>
                            <input
                                type="range"
                                v-model.number="hipAngle"
                                min="0"
                                max="120"
                                step="5"
                                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div
                                class="flex justify-between text-xs text-gray-500 mt-1"
                            >
                                <span>0°</span>
                                <span>120°</span>
                            </div>
                        </div>

                        <!-- Genou -->
                        <div
                            class="bg-black/30 border border-green-500/50 rounded p-4"
                        >
                            <div class="text-center mb-3">
                                <div
                                    class="text-green-400 font-bold text-sm mb-1"
                                >
                                    GENOU
                                </div>
                                <div
                                    class="text-3xl font-cyber text-green-400 font-bold"
                                >
                                    {{ kneeAngle }}°
                                </div>
                            </div>
                            <input
                                type="range"
                                v-model.number="kneeAngle"
                                min="0"
                                max="90"
                                step="5"
                                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div
                                class="flex justify-between text-xs text-gray-500 mt-1"
                            >
                                <span>0°</span>
                                <span>90°</span>
                            </div>
                        </div>

                        <!-- Cheville -->
                        <div
                            class="bg-black/30 border border-yellow-500/50 rounded p-4"
                        >
                            <div class="text-center mb-3">
                                <div
                                    class="text-yellow-400 font-bold text-sm mb-1"
                                >
                                    CHEVILLE
                                </div>
                                <div
                                    class="text-3xl font-cyber text-yellow-400 font-bold"
                                >
                                    {{ ankleAngle }}°
                                </div>
                            </div>
                            <input
                                type="range"
                                v-model.number="ankleAngle"
                                min="0"
                                max="50"
                                step="5"
                                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div
                                class="flex justify-between text-xs text-gray-500 mt-1"
                            >
                                <span>0°</span>
                                <span>50°</span>
                            </div>
                        </div>
                    </div>

                    <!-- Validation visuelle -->
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div
                            :class="
                                hipAngle > kneeAngle
                                    ? 'text-green-400'
                                    : 'text-red-400'
                            "
                            class="bg-gray-800/50 rounded p-2"
                        >
                            <span class="font-bold">Hanche > Genou:</span>
                            {{ hipAngle > kneeAngle ? "✓" : "✗" }}
                        </div>
                        <div
                            :class="
                                kneeAngle > ankleAngle
                                    ? 'text-green-400'
                                    : 'text-red-400'
                            "
                            class="bg-gray-800/50 rounded p-2"
                        >
                            <span class="font-bold">Genou > Cheville:</span>
                            {{ kneeAngle > ankleAngle ? "✓" : "✗" }}
                        </div>
                        <div
                            :class="
                                checkDifferenceRange()
                                    ? 'text-green-400'
                                    : 'text-red-400'
                            "
                            class="bg-gray-800/50 rounded p-2"
                        >
                            <span class="font-bold">Écart 20-40°:</span>
                            {{ checkDifferenceRange() ? "✓" : "✗" }}
                        </div>
                        <div
                            :class="
                                checkTotalSum()
                                    ? 'text-green-400'
                                    : 'text-red-400'
                            "
                            class="bg-gray-800/50 rounded p-2 col-span-2 md:col-span-3"
                        >
                            <span class="font-bold">Somme totale:</span>
                            {{ hipAngle + kneeAngle + ankleAngle }}° / 180°
                            (±10°)
                            {{ checkTotalSum() ? "✓" : "✗" }}
                        </div>
                    </div>

                    <!-- Bouton de validation -->
                    <button
                        @click="checkJoints"
                        class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all"
                    >
                        SYNCHRONISER LES ARTICULATIONS
                    </button>
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
                    <!-- Indices pour l'étape 1 -->
                    <div v-if="!step1Solved">
                        <div v-if="hintsShown >= 1" class="fade-in">
                            💡 L'angle optimal se situe dans la zone de flexion
                            normale (90° - 120°)
                        </div>
                        <div v-if="hintsShown >= 2" class="fade-in">
                            💡 Pour la marche, l'angle est proche du milieu de
                            cette plage
                        </div>
                        <div v-if="hintsShown >= 3" class="fade-in">
                            💡 L'angle exact est :
                            <span class="text-cyber-green font-bold">110°</span>
                        </div>
                    </div>

                    <!-- Indices pour l'étape 2 -->
                    <div v-if="step1Solved && !step2Solved">
                        <div v-if="hintsShown >= 1" class="fade-in">
                            💡 Commencez par régler la hanche à l'angle le plus
                            élevé
                        </div>
                        <div v-if="hintsShown >= 2" class="fade-in">
                            💡 La somme doit faire 180° (±10°) et les écarts
                            doivent être entre 20° et 40°
                        </div>
                        <div v-if="hintsShown >= 3" class="fade-in">
                            💡 Solution : Hanche 90° → Genou 60° → Cheville 30°
                            (90+60+30=180, écarts de 30°)
                        </div>
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
import { ref } from "vue";
import GameRoom from "../GameRoom.vue";
import { createFireworks } from "../../utils/fireworks";
import { useToast } from "../../composables/useToast";
import { useGameState } from "../../composables/useGameState";

const emit = defineEmits(["exit-room", "room-completed"]);
const { showSuccess, showError } = useToast();
const { addError, addHint, completeRoom, PENALTY_PER_ERROR } = useGameState();

const roomData = {
    title: "SALLE DES PROTHÈSES",
    subtitle: "Système orthopédique désynchronisé",
    description:
        "Le système orthopédique numérique de l'hôpital ne répond plus : les données des prothèses connectées sont désynchronisées. Réalignez les articulations virtuelles.",
    objective: "Comprendre la biomécanique et les technologies IoT médicales",
    icon: "settings",
    color: "#f97316",
};

const step1Solved = ref(false);
const step2Solved = ref(false);
const currentAngle = ref(90);
const hipAngle = ref(50);
const kneeAngle = ref(40);
const ankleAngle = ref(25);
const isCompleted = ref(false);
const hintsShown = ref(0);

const checkAngle = () => {
    const targetAngle = 110;
    const tolerance = 2;

    if (Math.abs(currentAngle.value - targetAngle) <= tolerance) {
        step1Solved.value = true;
        hintsShown.value = 0;

        showSuccess(
            "CALIBRATION RÉUSSIE",
            "Excellent ! La prothèse est maintenant calibrée à l'angle optimal. Passez à l'étape 2 : synchronisation des articulations.",
        );
    } else {
        addError("prosthesis");
        showError(
            "CALIBRATION INCORRECTE",
            `L'angle n'est pas optimal pour la marche. Réessayez ! +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

const checkDifferenceRange = () => {
    const hipKneeDiff = hipAngle.value - kneeAngle.value;
    const kneeAnkleDiff = kneeAngle.value - ankleAngle.value;
    return (
        hipKneeDiff >= 20 &&
        hipKneeDiff <= 40 &&
        kneeAnkleDiff >= 20 &&
        kneeAnkleDiff <= 40
    );
};

const checkTotalSum = () => {
    const totalSum = hipAngle.value + kneeAngle.value + ankleAngle.value;
    return totalSum >= 170 && totalSum <= 190;
};

const checkJoints = () => {
    const isHipGreaterThanKnee = hipAngle.value > kneeAngle.value;
    const isKneeGreaterThanAnkle = kneeAngle.value > ankleAngle.value;
    const isDifferenceRangeValid = checkDifferenceRange();
    const isTotalSumValid = checkTotalSum();

    if (
        isHipGreaterThanKnee &&
        isKneeGreaterThanAnkle &&
        isDifferenceRangeValid &&
        isTotalSumValid
    ) {
        step2Solved.value = true;
        isCompleted.value = true;
        createFireworks(3000);

        showSuccess(
            "SYNCHRONISATION RÉUSSIE",
            "Excellent ! Toutes les articulations sont maintenant synchronisées. Le système orthopédique est opérationnel.",
        );

        // Petit délai pour permettre au briefing de fin de s'afficher
        setTimeout(() => {
            completeRoom("prosthesis");
            emit("room-completed", "prosthesis");
        }, 300);
    } else {
        addError("prosthesis");

        let errorMsg =
            "Les contraintes biomécaniques ne sont pas respectées : ";
        if (!isHipGreaterThanKnee) errorMsg += "Hanche doit être > Genou. ";
        if (!isKneeGreaterThanAnkle) errorMsg += "Genou doit être > Cheville. ";
        if (!isDifferenceRangeValid)
            errorMsg += "Écart doit être entre 20° et 40°. ";
        if (!isTotalSumValid)
            errorMsg += "Somme totale doit être 180° (±10°). ";

        showError(
            "SYNCHRONISATION INCORRECTE",
            `${errorMsg}+${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

const showHint = () => {
    hintsShown.value++;
    addHint("prosthesis");
};
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    background: #06b6d4;
    cursor: pointer;
    border-radius: 50%;
}

input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #06b6d4;
    cursor: pointer;
    border-radius: 50%;
    border: none;
}

.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
