<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Salle terminée : récapitulatif pédagogique -->
        <div v-if="isCompleted" class="space-y-8">
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-6 fade-in"
            >
                <div class="flex items-center gap-2 mb-4">
                    <CheckCircle2 class="w-6 h-6 text-cyber-green" />
                    <h3 class="font-cyber font-bold text-cyber-green">
                        SYSTÈME VISUEL RECALIBRÉ
                    </h3>
                </div>

                <p class="text-sm text-gray-300 mb-4">
                    Test d'acuité visuelle et test d'Ishihara validés : les
                    diagnostics ophtalmologiques de l'hôpital sont de nouveau
                    fiables.
                </p>

                <div
                    class="bg-cyan-500/10 border border-cyan-500/50 rounded p-4"
                >
                    <div
                        class="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2"
                    >
                        <BookOpen class="w-4 h-4" />
                        LE SAVIEZ-VOUS ?
                    </div>
                    <ul class="text-gray-300 text-sm space-y-2 list-disc pl-5">
                        <li>
                            <span class="text-cyan-400 font-bold">10/10</span>
                            correspond à une vision normale, mesurée un œil
                            après l'autre (échelle de Monoyer en France, le
                            « 20/20 » du tableau de Snellen).
                        </li>
                        <li>
                            Le
                            <span class="text-cyan-400 font-bold"
                                >daltonisme</span
                            >
                            touche environ 8&nbsp;% des hommes mais seulement 0,5&nbsp;%
                            des femmes en Europe : les gènes de la vision du
                            rouge et du vert sont portés par le chromosome X,
                            que les hommes n'ont qu'en un exemplaire. Les planches
                            d'Ishihara (1917) servent à le dépister : certains
                            métiers (pilote, conducteur de train, électricien…)
                            exigent une bonne vision des couleurs.
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Étape 1: Test d'acuité visuelle -->
        <div v-else-if="!step1Solved" class="space-y-8">
            <!-- Explication -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyan-500 rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Info class="w-5 h-5 text-cyan-500" />
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
                            ACUITÉ RÉDUITE
                        </div>
                        <div class="text-gray-400">7/10</div>
                        <div class="text-xs text-gray-500 mt-1">
                            Petites lettres floues
                        </div>
                    </div>
                    <div
                        class="bg-black/50 border border-red-500/50 rounded p-3 text-center"
                    >
                        <div class="text-red-400 font-bold mb-1">
                            ACUITÉ TRÈS RÉDUITE
                        </div>
                        <div class="text-gray-400">3/10</div>
                        <div class="text-xs text-gray-500 mt-1">
                            Seules les grandes lettres sont lisibles
                        </div>
                    </div>
                </div>
            </div>

            <!-- Test d'acuité -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Eye class="w-5 h-5 text-cyber-blue" />
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 1 : TEST D'ACUITÉ VISUELLE
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
                            class="bg-white/5 border border-cyan-500/30 rounded-lg p-4 sm:p-8"
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
                                >5e ligne</span
                            >
                            du tableau (l'avant-dernière ligne).
                            Entrez les 5 lettres dans l'ordre.
                        </div>
                    </div>

                    <!-- Saisie et validation du code (Entrée valide) -->
                    <form class="space-y-6" @submit.prevent="checkVisualCode">
                        <div>
                            <label
                                for="eye-visual-code"
                                class="block text-sm font-tech text-gray-300 mb-2"
                            >
                                CODE D'ACCÈS (5 lettres)
                            </label>
                            <input
                                id="eye-visual-code"
                                v-model="visualCode"
                                type="text"
                                maxlength="20"
                                autocomplete="off"
                                autocapitalize="characters"
                                spellcheck="false"
                                placeholder="Entrez les 5 lettres"
                                class="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-tech uppercase text-center text-2xl tracking-widest placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-cyan-500 transition-all"
                            />
                            <p
                                v-if="codeAlreadyRejected"
                                class="mt-2 text-xs font-tech text-red-400 text-center"
                            >
                                Ce code a déjà été refusé : modifiez-le avant de
                                valider à nouveau.
                            </p>
                            <p
                                v-else
                                class="mt-2 text-xs font-tech text-gray-500 text-center"
                            >
                                {{ normalizedCode.length }}/{{
                                    VISUAL_CODE.length
                                }}
                                lettres
                            </p>
                        </div>

                        <button
                            type="submit"
                            :disabled="!canSubmitCode"
                            class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
                        >
                            VALIDER LE CODE
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Étape 2: Test de daltonisme -->
        <div v-else class="space-y-8">
            <!-- Rappel pédagogique de l'étape 1 -->
            <div
                class="bg-cyan-500/10 border border-cyan-500/50 rounded-lg p-4 fade-in"
            >
                <div
                    class="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2"
                >
                    <BookOpen class="w-4 h-4" />
                    À RETENIR : L'ACUITÉ VISUELLE
                </div>
                <div class="text-gray-300 text-sm">
                    En France, l'acuité visuelle se note en dixièmes (échelle de
                    Monoyer, lue à 5 m, un œil après l'autre) :
                    <span class="text-cyan-400 font-bold">10/10</span>
                    correspond à une vision normale. Une myopie, une
                    hypermétropie ou un astigmatisme la font baisser ; des
                    lunettes ou des lentilles la corrigent.
                </div>
            </div>

            <!-- Explication -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyan-500 rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Palette class="w-5 h-5 text-cyan-500" />
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
                    <EyeOff class="w-5 h-5 text-cyber-blue" />
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 2 : IDENTIFICATION DES CHIFFRES
                    </h3>
                </div>

                <!-- Saisie et validation des planches (Entrée valide) -->
                <form class="space-y-6" @submit.prevent="checkColorTest">
                    <!-- Planches de test : taille fluide pour ne jamais déborder de leur colonne -->
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
                    >
                        <div
                            v-for="(plate, index) in PLATES"
                            :key="plate.id"
                            class="text-center min-w-0"
                        >
                            <label
                                :for="`eye-plate-${plate.id}`"
                                class="block text-xs font-tech text-gray-400 mb-2"
                            >
                                PLANCHE {{ plate.id }}
                            </label>
                            <div
                                class="w-full max-w-[12rem] aspect-square mx-auto rounded-lg transition-all duration-300"
                                :class="{
                                    'ring-4 ring-green-500':
                                        plateStatus(index) === true,
                                    'ring-4 ring-red-500':
                                        plateStatus(index) === false,
                                }"
                            >
                                <img
                                    :src="plate.src"
                                    :alt="`Planche d'Ishihara n°${plate.id}`"
                                    draggable="false"
                                    decoding="async"
                                    class="w-full h-full object-contain rounded-lg select-none"
                                />
                            </div>
                            <input
                                :id="`eye-plate-${plate.id}`"
                                v-model="plateAnswers[index]"
                                type="text"
                                inputmode="numeric"
                                maxlength="3"
                                autocomplete="off"
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
                            nuances de couleur pour les distinguer du fond. Si
                            quelqu'un ne voit rien sur une planche, c'est
                            peut-être un signe de daltonisme (seul un
                            ophtalmologiste ou un orthoptiste peut le confirmer,
                            un écran ne suffit pas) : demandez à vos coéquipiers
                            ou utilisez un indice.
                        </div>
                    </div>

                    <p
                        v-if="platesAlreadyRejected"
                        class="text-xs font-tech text-red-400 text-center"
                    >
                        Ces réponses ont déjà été refusées : modifiez au moins
                        une planche avant de valider à nouveau.
                    </p>

                    <button
                        type="submit"
                        :disabled="!canSubmitPlates"
                        class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
                    >
                        VALIDER LES CHIFFRES
                    </button>
                </form>
            </div>
        </div>

        <!-- Indices (par étape) -->
        <div v-if="!isCompleted" class="mt-8">
            <div
                class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-6"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Lightbulb class="w-5 h-5 text-yellow-500" />
                    <h4 class="font-cyber font-bold text-yellow-500">
                        INDICES · ÉTAPE {{ currentStep }}/2
                    </h4>
                </div>

                <div class="space-y-2 text-sm text-gray-300">
                    <div
                        v-for="(hint, index) in revealedHints"
                        :key="`${currentStep}-${index}`"
                        class="fade-in"
                    >
                        💡 {{ hint.text }}
                        <span
                            v-if="hint.answer"
                            class="text-cyber-green font-bold"
                            >{{ hint.answer }}</span
                        >
                    </div>
                </div>

                <button
                    type="button"
                    :disabled="!hasMoreHints"
                    class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 disabled:border-gray-600 disabled:text-gray-500 disabled:hover:bg-transparent disabled:cursor-not-allowed font-tech text-sm rounded transition-all"
                    @click="showHint"
                >
                    {{
                        hasMoreHints
                            ? `AFFICHER UN INDICE (${remainingHints} restant${remainingHints > 1 ? "s" : ""})`
                            : "Plus d'indice disponible"
                    }}
                </button>
            </div>
        </div>
    </GameRoom>
</template>

<script>
// Progression de la salle gardée au niveau du module : RETOUR démonte la salle, mais l'équipe
// retrouve son étape (et la répartition de ses indices déjà payés) en revenant. Une copie est
// conservée dans le localStorage pour survivre à un rechargement de la page.
const PROGRESS_STORAGE_KEY = "cyberhopital:eye-room:v1";
let memoryProgress = null;
</script>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import {
    Info,
    Eye,
    Palette,
    EyeOff,
    Lightbulb,
    CheckCircle2,
    BookOpen,
} from "lucide-vue-next";
import GameRoom from "../GameRoom.vue";
import { createFireworks } from "../../utils/fireworks";
import { useToast } from "../../composables/useToast";
import { useGameState } from "../../composables/useGameState";

const ROOM_ID = "eye";

const emit = defineEmits(["exit-room", "room-completed"]);
const { showSuccess, showError } = useToast();
const { gameState, addError, addHint, completeRoom, PENALTY_PER_ERROR } =
    useGameState();

const roomData = {
    title: "SALLE DES YEUX",
    subtitle: "Diagnostic visuel corrompu",
    description:
        "Le système de diagnostic ophtalmologique a été compromis. Les tests d'acuité visuelle et de vision des couleurs sont corrompus. Recalibrez le système.",
    objective: "Comprendre l'importance des tests visuels en médecine",
    icon: "eye",
    color: "#22d3ee",
};

// 5e ligne du tableau de Snellen
const VISUAL_CODE = "PECFD";

// Noms de fichiers neutres : l'URL d'une image ne doit pas donner la réponse.
const PLATES = [
    { id: 1, src: "/ishihara/plate-1.png", answer: 42 },
    { id: 2, src: "/ishihara/plate-2.png", answer: 5 },
    { id: 3, src: "/ishihara/plate-3.png", answer: 6 },
    { id: 4, src: "/ishihara/plate-4.png", answer: 16 },
    { id: 5, src: "/ishihara/plate-5.png", answer: 45 },
];

// Indices progressifs : chacun apporte une information absente de l'écran.
const STEP1_HINTS = [
    {
        text: "Comptez depuis le grand E : la 5e ligne est la seule de 5 lettres, juste au-dessus de celle de 6 lettres. Ce tableau n'utilise que les lettres C, D, E, F, L, O, P, T et Z.",
    },
    {
        text: "Floues, certaines lettres se ressemblent (C et O, E et F, D et O). Le code commence par « PE » et se termine par « D ».",
    },
    { text: "Le code est :", answer: VISUAL_CODE },
];

const STEP2_HINTS = [
    {
        text: "Les planches 1, 4 et 5 cachent un nombre à 2 chiffres, les planches 2 et 3 un seul chiffre. Suivez du regard les points d'une même teinte, sans vous fier à leur taille.",
    },
    {
        text: "Deux réponses pour vous aider :",
        answer: `planche 1 = ${PLATES[0].answer} · planche 4 = ${PLATES[3].answer}`,
    },
    {
        text: "Les réponses sont :",
        answer: PLATES.map((plate) => plate.answer).join(", "),
    },
];

// --- Normalisation des saisies (accents, casse, espaces et ponctuation ignorés) ---
const normalizeCode = (value) =>
    String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

// "42", " 42 ", "4 2" ou "042" → 42 ; saisie sans chiffre → null.
const normalizePlateAnswer = (value) => {
    const digits = String(value ?? "").replace(/\D/g, "");
    return digits === "" ? null : Number(digits);
};

// --- Progression persistée (rattachée à la partie en cours) ---
// gameId est conservé par la sauvegarde de partie : la progression survit à un rechargement de la page
const isFromCurrentGame = (record) => {
    if (!record || typeof record !== "object") return false;
    return (
        Boolean(gameState.gameId) &&
        record.gameId === gameState.gameId &&
        record.teamName === gameState.teamName
    );
};

const readProgress = () => {
    if (isFromCurrentGame(memoryProgress)) return memoryProgress;
    try {
        const stored = JSON.parse(
            localStorage.getItem(PROGRESS_STORAGE_KEY) || "null",
        );
        if (isFromCurrentGame(stored)) return stored;
    } catch {
        // Stockage indisponible ou corrompu : on repart de l'étape 1.
    }
    return null;
};

const savedProgress = readProgress();

const isCompleted = ref(gameState.completedRooms.includes(ROOM_ID));
const step1Solved = ref(isCompleted.value || savedProgress?.step1Solved === true);

// Indices déjà payés dans cette salle : ils restent affichés gratuitement.
const hintsPaid = ref(gameState.roomHints?.[ROOM_ID] || 0);
// Nombre d'indices payés pendant l'étape 1 (les suivants concernent l'étape 2).
// Sans sauvegarde, les premiers indices payés sont attribués à l'étape 1.
const step1HintsPaid = ref(
    Math.min(
        Number(savedProgress?.step1HintsPaid) || 0,
        hintsPaid.value,
        STEP1_HINTS.length,
    ),
);

const saveProgress = () => {
    const record = {
        gameId: gameState.gameId,
        teamName: gameState.teamName,
        savedAt: Date.now(),
        step1Solved: step1Solved.value,
        step1HintsPaid: step1HintsPaid.value,
    };
    memoryProgress = record;
    try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(record));
    } catch {
        // Stockage indisponible : la copie en mémoire suffit pour la session.
    }
};

// --- Anti double-clic : courte pause après une réponse refusée ---
const FEEDBACK_COOLDOWN_MS = 800;
const isFeedbackPending = ref(false);
let feedbackTimer = null;

const startFeedbackCooldown = () => {
    isFeedbackPending.value = true;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
        feedbackTimer = null;
        isFeedbackPending.value = false;
    }, FEEDBACK_COOLDOWN_MS);
};

onUnmounted(() => {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
});

// --- Étape 1 : acuité visuelle ---
const visualCode = ref("");
const lastRejectedCode = ref("");
const normalizedCode = computed(() => normalizeCode(visualCode.value));
const codeAlreadyRejected = computed(
    () =>
        normalizedCode.value !== "" &&
        normalizedCode.value === lastRejectedCode.value,
);
const canSubmitCode = computed(
    () =>
        !isCompleted.value &&
        !step1Solved.value &&
        !isFeedbackPending.value &&
        normalizedCode.value.length === VISUAL_CODE.length &&
        !codeAlreadyRejected.value,
);

const checkVisualCode = () => {
    if (!canSubmitCode.value) return;

    if (normalizedCode.value === VISUAL_CODE) {
        step1HintsPaid.value = Math.min(hintsPaid.value, STEP1_HINTS.length);
        step1Solved.value = true;
        saveProgress();

        showSuccess(
            "CODE CORRECT",
            "Excellent ! Vous avez déchiffré le code. Le test d'acuité visuelle est maintenant recalibré. Passez à l'étape 2 : test de vision des couleurs.",
            5000,
        );
        return;
    }

    lastRejectedCode.value = normalizedCode.value;
    startFeedbackCooldown();
    addError(ROOM_ID);
    showError(
        "CODE INCORRECT",
        `Le code saisi ne correspond pas. Regardez attentivement la 5e ligne ! +${PENALTY_PER_ERROR}s de pénalité`,
    );
};

// --- Étape 2 : planches d'Ishihara ---
const plateAnswers = ref(PLATES.map(() => ""));
// Résultat de la dernière vérification refusée, planche par planche ({ value, correct }).
const lastCheckedPlates = ref(PLATES.map(() => null));
const lastRejectedPlates = ref("");

const normalizedPlateAnswers = computed(() =>
    plateAnswers.value.map(normalizePlateAnswer),
);
const platesKey = computed(() => normalizedPlateAnswers.value.join(","));
const allPlatesFilled = computed(() =>
    normalizedPlateAnswers.value.every((value) => value !== null),
);
const platesAlreadyRejected = computed(
    () => allPlatesFilled.value && platesKey.value === lastRejectedPlates.value,
);
const canSubmitPlates = computed(
    () =>
        !isCompleted.value &&
        step1Solved.value &&
        !isFeedbackPending.value &&
        allPlatesFilled.value &&
        !platesAlreadyRejected.value,
);

// Bordure verte/rouge tant que la planche garde la valeur vérifiée.
const plateStatus = (index) => {
    const checked = lastCheckedPlates.value[index];
    if (!checked || checked.value !== normalizedPlateAnswers.value[index]) {
        return null;
    }
    return checked.correct;
};

const completeEyeRoom = () => {
    if (isCompleted.value) return;
    isCompleted.value = true;
    completeRoom(ROOM_ID);
    emit("room-completed", ROOM_ID);

    createFireworks(3000);
    showSuccess(
        "TEST RÉUSSI",
        "Parfait ! Vous avez identifié tous les chiffres : la vision des couleurs est recalibrée. Le saviez-vous ? En Europe, environ 8\u00a0% des hommes sont daltoniens.",
        6000,
    );
};

const checkColorTest = () => {
    if (!canSubmitPlates.value) return;

    const answers = normalizedPlateAnswers.value;
    const results = PLATES.map((plate, index) => answers[index] === plate.answer);

    if (results.every(Boolean)) {
        completeEyeRoom();
        return;
    }

    lastCheckedPlates.value = PLATES.map((_, index) => ({
        value: answers[index],
        correct: results[index],
    }));
    lastRejectedPlates.value = platesKey.value;
    startFeedbackCooldown();
    addError(ROOM_ID);

    const correctCount = results.filter(Boolean).length;
    showError(
        "RÉPONSES INCORRECTES",
        `${correctCount}/${PLATES.length} planches correctes. Regardez les bordures : vert = correct, rouge = incorrect. +${PENALTY_PER_ERROR}s de pénalité`,
    );
};

// --- Indices (un compteur payé global, réparti de façon déterministe entre les étapes) ---
const currentStep = computed(() => (step1Solved.value ? 2 : 1));
const currentStepHints = computed(() =>
    step1Solved.value ? STEP2_HINTS : STEP1_HINTS,
);
const revealedCount = computed(() => {
    const paidForStep = step1Solved.value
        ? hintsPaid.value - step1HintsPaid.value
        : hintsPaid.value;
    return Math.min(currentStepHints.value.length, Math.max(0, paidForStep));
});
const revealedHints = computed(() =>
    currentStepHints.value.slice(0, revealedCount.value),
);
const remainingHints = computed(
    () => currentStepHints.value.length - revealedCount.value,
);
const hasMoreHints = computed(
    () => !isCompleted.value && remainingHints.value > 0,
);

const showHint = () => {
    if (!hasMoreHints.value) return;
    addHint(ROOM_ID);
    hintsPaid.value++;
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
</style>
