<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Étape 1: Test d'acuité visuelle -->
        <div v-if="!step1Solved" class="space-y-8">
            <!-- Explication -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyan-500 rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="info" class="w-5 h-5 text-cyan-500"></i>
                    <h3 class="font-cyber font-bold text-cyan-500">
                        SYSTÈME DE DIAGNOSTIC VISUEL
                    </h3>
                </div>

                <div class="text-sm text-gray-300 mb-4">
                    Le système de diagnostic ophtalmologique a été compromis.
                    Les tests d'acuité visuelle sont corrompus et affichent des
                    caractères brouillés.
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div
                        class="bg-black/50 border border-green-500/50 rounded p-3 text-center"
                    >
                        <div class="text-green-400 font-bold mb-1">
                            VISION NORMALE
                        </div>
                        <div class="text-gray-400">10/10</div>
                        <div class="text-xs text-gray-500 mt-1">
                            Lecture facile
                        </div>
                    </div>
                    <div
                        class="bg-black/50 border border-yellow-500/50 rounded p-3 text-center"
                    >
                        <div class="text-yellow-400 font-bold mb-1">
                            MYOPIE LÉGÈRE
                        </div>
                        <div class="text-gray-400">7/10</div>
                        <div class="text-xs text-gray-500 mt-1">
                            Légèrement flou
                        </div>
                    </div>
                    <div
                        class="bg-black/50 border border-red-500/50 rounded p-3 text-center"
                    >
                        <div class="text-red-400 font-bold mb-1">
                            MYOPIE FORTE
                        </div>
                        <div class="text-gray-400">3/10</div>
                        <div class="text-xs text-gray-500 mt-1">Très flou</div>
                    </div>
                </div>
            </div>

            <!-- Test d'acuité -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="eye" class="w-5 h-5 text-cyber-blue"></i>
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 1: TEST D'ACUITÉ VISUELLE
                    </h3>
                </div>

                <div class="space-y-6">
                    <!-- Tableau de Snellen simulé -->
                    <div>
                        <div
                            class="text-sm font-tech text-gray-400 mb-4 text-center"
                        >
                            DÉCHIFFREZ LE CODE D'ACCÈS
                        </div>
                        <div
                            class="bg-white/5 border border-cyan-500/30 rounded-lg p-8"
                        >
                            <div class="space-y-4 text-center font-mono">
                                <!-- Ligne 1: Grande taille -->
                                <div
                                    class="text-6xl font-bold text-cyan-400 tracking-wider"
                                >
                                    E
                                </div>
                                <!-- Ligne 2: Moyenne taille -->
                                <div
                                    class="text-4xl font-bold text-cyan-400/90 tracking-wide"
                                >
                                    F P
                                </div>
                                <!-- Ligne 3: Petite taille avec flou léger -->
                                <div
                                    class="text-2xl font-bold text-cyan-400/70 tracking-wide"
                                    style="filter: blur(1px)"
                                >
                                    T O Z
                                </div>
                                <!-- Ligne 4: Plus petite avec flou moyen -->
                                <div
                                    class="text-xl font-bold text-cyan-400/60"
                                    style="filter: blur(1.5px)"
                                >
                                    L P E D
                                </div>
                                <!-- Ligne 5: Très petite avec flou fort (code secret) -->
                                <div
                                    class="text-lg font-bold text-cyan-400/50"
                                    style="filter: blur(2px)"
                                >
                                    P E C F D
                                </div>
                                <!-- Ligne 6: Minuscule avec flou très fort -->
                                <div
                                    class="text-base font-bold text-cyan-400/40"
                                    style="filter: blur(2.5px)"
                                >
                                    E D F C Z P
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Objectif -->
                    <div
                        class="bg-cyan-500/10 border border-cyan-500/50 rounded p-4"
                    >
                        <div class="text-cyan-400 font-bold text-sm mb-2">
                            🎯 OBJECTIF
                        </div>
                        <div class="text-gray-300 text-sm">
                            Lisez la
                            <span class="text-cyan-400 font-bold"
                                >5ème ligne</span
                            >
                            du tableau (ligne la plus floue avant la dernière).
                            Entrez les 5 lettres dans l'ordre.
                        </div>
                    </div>

                    <!-- Input du code -->
                    <div>
                        <label
                            class="block text-sm font-tech text-gray-300 mb-2"
                        >
                            CODE D'ACCÈS (5 lettres)
                        </label>
                        <input
                            v-model="visualCode"
                            type="text"
                            maxlength="5"
                            placeholder="Entrez les 5 lettres"
                            class="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-tech uppercase text-center text-2xl tracking-widest focus:outline-none focus:border-cyan-500 transition-all"
                            @input="visualCode = visualCode.toUpperCase()"
                        />
                    </div>

                    <!-- Bouton de validation -->
                    <button
                        @click="checkVisualCode"
                        :disabled="visualCode.length !== 5"
                        class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
                    >
                        VALIDER LE CODE
                    </button>
                </div>
            </div>
        </div>

        <!-- Étape 2: Test de daltonisme -->
        <div v-if="step1Solved && !step2Solved" class="space-y-8">
            <!-- Explication -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyan-500 rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="palette" class="w-5 h-5 text-cyan-500"></i>
                    <h3 class="font-cyber font-bold text-cyan-500">
                        TEST DE VISION DES COULEURS (ISHIHARA)
                    </h3>
                </div>

                <div class="text-sm text-gray-300">
                    Le module de détection des couleurs est désynchronisé.
                    Identifiez les chiffres cachés dans les patterns colorés
                    pour recalibrer le système.
                </div>
            </div>

            <!-- Test de daltonisme -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i
                        data-lucide="eye-off"
                        class="w-5 h-5 text-cyber-blue"
                    ></i>
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 2: IDENTIFICATION DES CHIFFRES
                    </h3>
                </div>

                <div class="space-y-6">
                    <!-- Planches de test -->
                    <div
                        class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
                    >
                        <!-- Planche 1 -->
                        <div class="text-center">
                            <div class="text-xs font-tech text-gray-400 mb-2">
                                PLANCHE 1
                            </div>
                            <div
                                class="w-48 h-48 mx-auto rounded-lg transition-all duration-300"
                                :class="{
                                    'ring-4 ring-green-500':
                                        validationResults.planche1 === true,
                                    'ring-4 ring-red-500':
                                        validationResults.planche1 === false,
                                }"
                            >
                                <img
                                    src="/42.png"
                                    alt="Test Ishihara 1"
                                    class="w-full h-full object-contain rounded-lg"
                                />
                            </div>
                            <input
                                v-model.number="colorTest1"
                                type="number"
                                min="0"
                                max="99"
                                placeholder="?"
                                class="mt-3 w-20 px-3 py-2 bg-black/50 border border-cyan-500/30 rounded text-white font-tech text-center text-xl focus:outline-none focus:border-cyan-500 transition-all"
                            />
                        </div>

                        <!-- Planche 2 -->
                        <div class="text-center">
                            <div class="text-xs font-tech text-gray-400 mb-2">
                                PLANCHE 2
                            </div>
                            <div
                                class="w-48 h-48 mx-auto rounded-lg transition-all duration-300"
                                :class="{
                                    'ring-4 ring-green-500':
                                        validationResults.planche2 === true,
                                    'ring-4 ring-red-500':
                                        validationResults.planche2 === false,
                                }"
                            >
                                <img
                                    src="/5.png"
                                    alt="Test Ishihara 2"
                                    class="w-full h-full object-contain rounded-lg"
                                />
                            </div>
                            <input
                                v-model.number="colorTest2"
                                type="number"
                                min="0"
                                max="99"
                                placeholder="?"
                                class="mt-3 w-20 px-3 py-2 bg-black/50 border border-cyan-500/30 rounded text-white font-tech text-center text-xl focus:outline-none focus:border-cyan-500 transition-all"
                            />
                        </div>

                        <!-- Planche 3 -->
                        <div class="text-center">
                            <div class="text-xs font-tech text-gray-400 mb-2">
                                PLANCHE 3
                            </div>
                            <div
                                class="w-48 h-48 mx-auto rounded-lg transition-all duration-300"
                                :class="{
                                    'ring-4 ring-green-500':
                                        validationResults.planche3 === true,
                                    'ring-4 ring-red-500':
                                        validationResults.planche3 === false,
                                }"
                            >
                                <img
                                    src="/6.png"
                                    alt="Test Ishihara 3"
                                    class="w-full h-full object-contain rounded-lg"
                                />
                            </div>
                            <input
                                v-model.number="colorTest3"
                                type="number"
                                min="0"
                                max="99"
                                placeholder="?"
                                class="mt-3 w-20 px-3 py-2 bg-black/50 border border-cyan-500/30 rounded text-white font-tech text-center text-xl focus:outline-none focus:border-cyan-500 transition-all"
                            />
                        </div>

                        <!-- Planche 4 -->
                        <div class="text-center">
                            <div class="text-xs font-tech text-gray-400 mb-2">
                                PLANCHE 4
                            </div>
                            <div
                                class="w-48 h-48 mx-auto rounded-lg transition-all duration-300"
                                :class="{
                                    'ring-4 ring-green-500':
                                        validationResults.planche4 === true,
                                    'ring-4 ring-red-500':
                                        validationResults.planche4 === false,
                                }"
                            >
                                <img
                                    src="/16.png"
                                    alt="Test Ishihara 4"
                                    class="w-full h-full object-contain rounded-lg"
                                />
                            </div>
                            <input
                                v-model.number="colorTest4"
                                type="number"
                                min="0"
                                max="99"
                                placeholder="?"
                                class="mt-3 w-20 px-3 py-2 bg-black/50 border border-cyan-500/30 rounded text-white font-tech text-center text-xl focus:outline-none focus:border-cyan-500 transition-all"
                            />
                        </div>

                        <!-- Planche 5 -->
                        <div class="text-center">
                            <div class="text-xs font-tech text-gray-400 mb-2">
                                PLANCHE 5
                            </div>
                            <div
                                class="w-48 h-48 mx-auto rounded-lg transition-all duration-300"
                                :class="{
                                    'ring-4 ring-green-500':
                                        validationResults.planche5 === true,
                                    'ring-4 ring-red-500':
                                        validationResults.planche5 === false,
                                }"
                            >
                                <img
                                    src="/45.png"
                                    alt="Test Ishihara 5"
                                    class="w-full h-full object-contain rounded-lg"
                                />
                            </div>
                            <input
                                v-model.number="colorTest5"
                                type="number"
                                min="0"
                                max="99"
                                placeholder="?"
                                class="mt-3 w-20 px-3 py-2 bg-black/50 border border-cyan-500/30 rounded text-white font-tech text-center text-xl focus:outline-none focus:border-cyan-500 transition-all"
                            />
                        </div>
                    </div>

                    <!-- Indice visuel -->
                    <div
                        class="bg-purple-500/10 border border-purple-500/50 rounded p-4"
                    >
                        <div class="text-purple-400 font-bold text-sm mb-2">
                            💡 ASTUCE
                        </div>
                        <div class="text-gray-300 text-xs">
                            Les chiffres sont formés par des points de couleur
                            différente dans le cercle. Concentrez-vous sur les
                            nuances de couleur pour les distinguer du fond.
                        </div>
                    </div>

                    <!-- Bouton de validation -->
                    <button
                        @click="checkColorTest"
                        :disabled="
                            !colorTest1 ||
                            !colorTest2 ||
                            !colorTest3 ||
                            !colorTest4 ||
                            !colorTest5
                        "
                        class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
                    >
                        VALIDER LES CHIFFRES
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
                            💡 Regardez attentivement la 5ème ligne (juste avant
                            la dernière)
                        </div>
                        <div v-if="hintsShown >= 2" class="fade-in">
                            💡 Les lettres sont légèrement floues mais restent
                            lisibles si vous vous concentrez
                        </div>
                        <div v-if="hintsShown >= 3" class="fade-in">
                            💡 Le code est :
                            <span class="text-cyber-green font-bold"
                                >PECFD</span
                            >
                        </div>
                    </div>

                    <!-- Indices pour l'étape 2 -->
                    <div v-if="step1Solved && !step2Solved">
                        <div v-if="hintsShown >= 2" class="fade-in">
                            💡 Les chiffres sont formés par des nuances de
                            couleur différentes du fond
                        </div>
                        <div v-if="hintsShown >= 3" class="fade-in">
                            💡 Regardez attentivement les nuances de couleur
                            pour distinguer les chiffres du fond
                        </div>
                        <div v-if="hintsShown >= 4" class="fade-in">
                            💡 Les réponses sont :
                            <span class="text-cyber-green font-bold"
                                >42, 5, 6, 16, 45</span
                            >
                        </div>
                    </div>
                </div>

                <button
                    @click="showHint"
                    v-if="hintsShown < 5"
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
    title: "SALLE DES YEUX",
    subtitle: "Diagnostic visuel corrompu",
    description:
        "Le système de diagnostic ophtalmologique a été compromis. Les tests d'acuité visuelle et de vision des couleurs sont corrompus. Recalibrez le système.",
    objective: "Comprendre l'importance des tests visuels en médecine",
    icon: "eye",
    color: "#22d3ee",
};

const step1Solved = ref(false);
const step2Solved = ref(false);
const visualCode = ref("");
const colorTest1 = ref(null);
const colorTest2 = ref(null);
const colorTest3 = ref(null);
const colorTest4 = ref(null);
const colorTest5 = ref(null);
const isCompleted = ref(false);
const hintsShown = ref(0);
const validationResults = ref({
    planche1: null,
    planche2: null,
    planche3: null,
    planche4: null,
    planche5: null,
});

const checkVisualCode = () => {
    const correctCode = "PECFD";

    if (visualCode.value.toUpperCase() === correctCode) {
        step1Solved.value = true;
        hintsShown.value = 0;

        showSuccess(
            "CODE CORRECT",
            "Excellent ! Vous avez déchiffré le code. Le test d'acuité visuelle est maintenant recalibré. Passez à l'étape 2 : test de vision des couleurs.",
        );
    } else {
        addError("eye");
        showError(
            "CODE INCORRECT",
            `Le code saisi ne correspond pas. Regardez attentivement la 5ème ligne ! +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

const checkColorTest = () => {
    const correctAnswers = [42, 5, 6, 16, 45];

    if (
        colorTest1.value === correctAnswers[0] &&
        colorTest2.value === correctAnswers[1] &&
        colorTest3.value === correctAnswers[2] &&
        colorTest4.value === correctAnswers[3] &&
        colorTest5.value === correctAnswers[4]
    ) {
        step2Solved.value = true;
        isCompleted.value = true;
        createFireworks(3000);

        showSuccess(
            "TEST RÉUSSI",
            "Parfait ! Vous avez identifié tous les chiffres. Le système de vision des couleurs est maintenant opérationnel.",
        );

        completeRoom("eye");
        emit("room-completed", "eye");
    } else {
        addError("eye");

        validationResults.value = {
            planche1: colorTest1.value === correctAnswers[0],
            planche2: colorTest2.value === correctAnswers[1],
            planche3: colorTest3.value === correctAnswers[2],
            planche4: colorTest4.value === correctAnswers[3],
            planche5: colorTest5.value === correctAnswers[4],
        };

        const correctCount = Object.values(validationResults.value).filter(
            (v) => v === true,
        ).length;

        showError(
            "RÉPONSES INCORRECTES",
            `${correctCount}/5 planches correctes. Regardez les bordures : vert = correct, rouge = incorrect. +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

const showHint = () => {
    hintsShown.value++;
    addHint("eye");
};
</script>

<style scoped>
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

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    appearance: none;
    margin: 0;
}

input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
}
</style>
