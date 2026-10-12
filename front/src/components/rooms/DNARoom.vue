<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Étape 1: Reconstitution du brin complémentaire -->
        <div v-if="!step1Solved" class="space-y-8">
            <!-- Explication rapide -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Info class="w-5 h-5 shrink-0 text-cyber-purple" />
                    <h3 class="font-cyber font-bold text-cyber-purple">
                        RÈGLES D'APPARIEMENT ADN
                    </h3>
                </div>

                <div class="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
                    <div
                        v-for="pair in BASE_PAIRS"
                        :key="pair.label"
                        class="bg-black/50 border rounded p-3 sm:p-4 text-center"
                        :class="pair.border"
                    >
                        <div class="text-2xl sm:text-3xl font-bold mb-2">
                            <span :class="getBaseTextColor(pair.left)">{{
                                pair.left
                            }}</span>
                            <span class="text-gray-400"> ↔ </span>
                            <span :class="getBaseTextColor(pair.right)">{{
                                pair.right
                            }}</span>
                        </div>
                        <div class="text-xs text-gray-400">
                            {{ pair.label }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Puzzle simplifié -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Dna class="w-5 h-5 shrink-0 text-cyber-blue" />
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 1&nbsp;: RECONSTITUER LE BRIN COMPLÉMENTAIRE
                    </h3>
                </div>

                <div class="space-y-6">
                    <!-- Brin original -->
                    <div>
                        <div class="text-sm font-tech text-gray-400 mb-2">
                            BRIN ORIGINAL
                        </div>
                        <div class="flex justify-center gap-2 sm:gap-3">
                            <div
                                v-for="(base, index) in originalStrand"
                                :key="index"
                                :class="[STRAND_TILE, getBaseColor(base)]"
                            >
                                {{ base }}
                            </div>
                        </div>
                    </div>

                    <!-- Brin à compléter -->
                    <div>
                        <div class="text-sm font-tech text-gray-400 mb-2">
                            BRIN COMPLÉMENTAIRE (complétez)
                        </div>
                        <div class="flex justify-center gap-2 sm:gap-3 mb-4">
                            <button
                                v-for="(base, index) in userStrand"
                                :key="index"
                                type="button"
                                :class="getSlotClass(base, index)"
                                :aria-pressed="selectedPosition === index"
                                :aria-label="getSlotLabel(base, index)"
                                @click="selectPosition(index)"
                            >
                                {{ base || "?" }}
                            </button>
                        </div>

                        <!-- Sélecteur de bases -->
                        <div
                            v-if="selectedPosition !== null"
                            class="flex justify-center gap-2 sm:gap-3"
                        >
                            <button
                                v-for="base in availableBases"
                                :key="base"
                                type="button"
                                :title="BASE_NAMES[base]"
                                :aria-label="`Placer ${BASE_NAMES[base]} (${base}) en position ${selectedPosition + 1}`"
                                @click="placeBase(base)"
                                class="w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl transition-all hover:scale-110"
                                :class="getBaseColor(base)"
                            >
                                {{ base }}
                            </button>
                        </div>
                        <p
                            class="text-center text-sm text-gray-400 font-tech"
                            :class="selectedPosition !== null ? 'mt-3' : ''"
                        >
                            {{ selectorHelp }}
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button
                            type="button"
                            @click="resetStrand"
                            class="w-full sm:flex-1 px-3 sm:px-6 py-3 border border-cyber-red text-cyber-red hover:bg-cyber-red/10 font-cyber font-bold text-sm sm:text-base rounded-lg transition-all"
                        >
                            RÉINITIALISER
                        </button>
                        <button
                            type="button"
                            @click="checkSequence"
                            :disabled="!canCheckSequence"
                            class="w-full sm:flex-1 px-3 sm:px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-black font-cyber font-bold text-sm sm:text-base rounded-lg transition-all"
                        >
                            VÉRIFIER
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Étape 2: Traduction en acides aminés -->
        <div v-if="step1Solved && !step2Solved" class="space-y-8">
            <!-- Explication du code génétique -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Microscope class="w-5 h-5 shrink-0 text-cyber-purple" />
                    <h3 class="font-cyber font-bold text-cyber-purple">
                        CODE GÉNÉTIQUE
                    </h3>
                </div>

                <div class="text-sm text-gray-300 mb-4 space-y-2">
                    <p>
                        Chaque groupe de 3 bases (codon) code pour un acide
                        aminé, ou pour un signal «&nbsp;stop&nbsp;». Voici
                        quelques exemples&nbsp;:
                    </p>
                    <p class="text-xs text-gray-400">
                        Le brin que vous avez reconstitué joue le rôle de brin
                        codant&nbsp;: sa séquence est celle de l'ARN messager,
                        avec T à la place de U.
                    </p>
                </div>

                <div
                    class="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-lg mx-auto text-xs"
                >
                    <div
                        v-for="example in CODON_EXAMPLES"
                        :key="example.label"
                        class="bg-black/50 border border-gray-600 rounded p-2 text-center"
                    >
                        <div class="font-bold break-words">
                            <template
                                v-for="(codon, cIndex) in example.codons"
                                :key="codon"
                            >
                                <span v-if="cIndex" class="text-gray-500">
                                    /
                                </span>
                                <span class="whitespace-nowrap"
                                    ><span
                                        v-for="(base, bIndex) in codon"
                                        :key="bIndex"
                                        :class="getBaseTextColor(base)"
                                        >{{ base }}</span
                                    ></span
                                >
                            </template>
                        </div>
                        <div class="text-gray-400 font-tech">
                            {{ example.label }}
                        </div>
                    </div>
                </div>

                <!-- Table de correspondance simplifiée -->
                <div class="mt-6">
                    <div class="flex items-center gap-2 mb-3">
                        <BookOpen class="w-5 h-5 shrink-0 text-cyber-purple" />
                        <h4
                            class="font-cyber font-bold text-cyber-purple text-sm"
                        >
                            TABLE DES CODONS ADN → ACIDES AMINÉS
                        </h4>
                    </div>

                    <div
                        class="bg-black/30 border border-cyber-purple/30 rounded p-3 sm:p-4"
                    >
                        <div
                            class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs"
                        >
                            <div
                                v-for="entry in CODON_TABLE"
                                :key="entry.codon"
                                class="bg-gray-800/40 rounded p-2"
                            >
                                <div class="font-bold">
                                    <span
                                        v-for="(base, bIndex) in entry.codon"
                                        :key="bIndex"
                                        :class="getBaseTextColor(base)"
                                        >{{ base }}</span
                                    >
                                </div>
                                <div class="text-gray-300 font-tech break-words">
                                    {{ AMINO_ACID_LABELS[entry.value] }}
                                </div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-400 mt-3 text-center">
                            💡 Chaque codon ADN (3 bases) correspond à un acide
                            aminé spécifique
                        </div>
                    </div>
                </div>
            </div>

            <!-- Traduction de la séquence -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Zap class="w-5 h-5 shrink-0 text-cyber-blue" />
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 2&nbsp;: TRADUIRE EN ACIDES AMINÉS
                    </h3>
                </div>

                <div class="space-y-6">
                    <!-- Séquence ADN obtenue -->
                    <div>
                        <div class="text-sm font-tech text-gray-400 mb-2">
                            SÉQUENCE ADN RECONSTITUÉE
                        </div>
                        <div class="flex justify-center gap-2 sm:gap-3">
                            <div
                                v-for="(base, index) in correctStrand"
                                :key="index"
                                :class="[STRAND_TILE, getBaseColor(base)]"
                            >
                                {{ base }}
                            </div>
                        </div>
                    </div>

                    <!-- Codons -->
                    <div>
                        <div class="text-sm font-tech text-gray-400 mb-2">
                            CODONS (GROUPES DE 3 BASES)
                        </div>
                        <div
                            class="flex flex-wrap justify-center gap-4 sm:gap-6"
                        >
                            <div
                                v-for="(codon, cIndex) in codons"
                                :key="cIndex"
                                class="text-center"
                            >
                                <div class="flex gap-1 mb-2">
                                    <span
                                        v-for="(base, bIndex) in codon"
                                        :key="bIndex"
                                        class="w-9 h-9 sm:w-12 sm:h-12 rounded flex items-center justify-center font-bold text-base sm:text-lg"
                                        :class="getBaseColor(base)"
                                        >{{ base }}</span
                                    >
                                </div>
                                <div class="text-xs text-gray-400">
                                    {{ codon }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Acides aminés à sélectionner -->
                    <div>
                        <div class="text-sm font-tech text-gray-400 mb-2">
                            ACIDES AMINÉS CORRESPONDANTS
                        </div>
                        <div
                            class="flex flex-col sm:flex-row items-stretch sm:items-start justify-center gap-4 sm:gap-6 mb-4"
                        >
                            <div
                                v-for="(codon, cIndex) in codons"
                                :key="cIndex"
                                class="text-center w-full sm:w-auto"
                            >
                                <label
                                    :for="`dna-amino-acid-${cIndex}`"
                                    class="block text-xs text-gray-400 mb-2"
                                >
                                    {{ codon }} →
                                </label>
                                <select
                                    :id="`dna-amino-acid-${cIndex}`"
                                    v-model="aminoAnswers[cIndex]"
                                    class="w-full sm:w-48 px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-center focus:outline-none focus:border-cyber-blue transition-all"
                                >
                                    <option value="">Sélectionnez</option>
                                    <option
                                        v-for="amino in AMINO_ACIDS"
                                        :key="amino.value"
                                        :value="amino.value"
                                    >
                                        {{ amino.label }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Bouton de vérification -->
                    <div class="flex justify-center">
                        <button
                            type="button"
                            @click="checkAminoAcids"
                            :disabled="!canCheckAminoAcids"
                            class="w-full sm:w-auto px-3 sm:px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-black font-cyber font-bold text-sm sm:text-base rounded-lg transition-all"
                        >
                            VÉRIFIER LES ACIDES AMINÉS
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Salle terminée : à retenir -->
        <div
            v-if="step2Solved"
            class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-4 sm:p-6 scanline space-y-4"
        >
            <div class="flex items-center gap-2">
                <CheckCircle2 class="w-6 h-6 shrink-0 text-cyber-green" />
                <h3 class="font-cyber font-bold text-cyber-green">
                    SÉQUENCE DÉCODÉE
                </h3>
            </div>
            <p class="text-sm text-gray-300">
                {{ translationSummary }}&nbsp;: la sécurité biométrique est
                rétablie.
            </p>
            <div class="bg-black/40 border border-cyber-purple/40 rounded p-4">
                <div class="flex items-center gap-2 mb-2">
                    <GraduationCap class="w-5 h-5 shrink-0 text-cyber-purple" />
                    <h4 class="font-cyber font-bold text-cyber-purple text-sm">
                        À RETENIR
                    </h4>
                </div>
                <ul class="list-disc pl-5 space-y-1 text-sm text-gray-300">
                    <li>
                        Les deux brins de l'ADN sont complémentaires&nbsp;: A
                        s'apparie toujours avec T, et C avec G. Chaque brin sert
                        donc de modèle pour reconstruire l'autre.
                    </li>
                    <li>
                        Dans la cellule, l'ADN est d'abord transcrit en ARN
                        messager (où U remplace T), puis cet ARN est lu par
                        codons de 3 bases lors de la traduction&nbsp;: 64 codons
                        pour 20 acides aminés et 3 signaux «&nbsp;stop&nbsp;».
                    </li>
                </ul>
            </div>
        </div>

        <!-- Indices -->
        <div v-if="!isCompleted" class="mt-8">
            <div
                class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-4 sm:p-6"
            >
                <div class="flex items-center gap-2 mb-2">
                    <Lightbulb class="w-5 h-5 shrink-0 text-yellow-500" />
                    <h4 class="font-cyber font-bold text-yellow-500">
                        INDICES
                    </h4>
                    <span class="ml-auto text-xs font-tech text-gray-400">
                        {{ visibleHints.length }}/{{ MAX_HINTS_PER_STEP }}
                    </span>
                </div>
                <p class="text-xs font-tech text-gray-500 mb-4">
                    Un indice débloqué reste acquis et vaut pour les deux étapes
                    de la salle.
                </p>

                <div class="space-y-2 text-sm text-gray-300">
                    <div
                        v-for="(hint, index) in visibleHints"
                        :key="`${currentStep}-${index}`"
                        class="fade-in"
                    >
                        💡 {{ hint }}
                    </div>
                </div>

                <button
                    type="button"
                    @click="showHint"
                    :disabled="!canShowHint"
                    class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 disabled:border-gray-600 disabled:text-gray-500 disabled:hover:bg-transparent disabled:cursor-not-allowed font-tech text-sm rounded transition-all"
                >
                    {{
                        canShowHint
                            ? "AFFICHER UN INDICE"
                            : "PLUS D'INDICE DISPONIBLE"
                    }}
                </button>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
    Info,
    Dna,
    Microscope,
    BookOpen,
    Zap,
    Lightbulb,
    CheckCircle2,
    GraduationCap,
} from "lucide-vue-next";
import GameRoom from "../GameRoom.vue";
import { createFireworks } from "../../utils/fireworks";
import { useToast } from "../../composables/useToast";
import { useGameState } from "../../composables/useGameState";

const ROOM_ID = "dna-lab";
const MAX_HINTS_PER_STEP = 3;
// Délai pendant lequel le bouton de vérification reste bloqué après une erreur
const ERROR_COOLDOWN_MS = 1500;

const emit = defineEmits(["exit-room", "room-completed"]);
const { showSuccess, showError } = useToast();
const { gameState, addError, addHint, completeRoom, PENALTY_PER_ERROR } =
    useGameState();

const roomData = {
    title: "LABORATOIRE ADN",
    subtitle: "Les gènes brouillés",
    description:
        "Le virus a corrompu une séquence ADN. Utilisez les règles d'appariement (A↔T, C↔G) pour reconstituer le brin complémentaire, puis traduisez-le en acides aminés.",
    objective: "Comprendre la logique de l'ADN et des données biomédicales",
    icon: "dna",
    color: "#00ffff",
};

// --- Données du puzzle -------------------------------------------------------

const BASE_NAMES = {
    A: "Adénine",
    T: "Thymine",
    C: "Cytosine",
    G: "Guanine",
};

// Code couleur unique des bases, utilisé partout dans la salle
const BASE_TILE_COLORS = {
    A: "bg-red-500/20 border-2 border-red-500 text-red-500",
    T: "bg-blue-500/20 border-2 border-blue-500 text-blue-500",
    C: "bg-green-500/20 border-2 border-green-500 text-green-500",
    G: "bg-yellow-500/20 border-2 border-yellow-500 text-yellow-500",
};
const BASE_TEXT_COLORS = {
    A: "text-red-400",
    T: "text-blue-400",
    C: "text-green-400",
    G: "text-yellow-400",
};

const BASE_PAIRS = [
    {
        left: "A",
        right: "T",
        label: "Adénine avec Thymine",
        border: "border-red-500/50",
    },
    {
        left: "C",
        right: "G",
        label: "Cytosine avec Guanine",
        border: "border-green-500/50",
    },
];

const AMINO_ACIDS = [
    { value: "alanine", label: "Alanine" },
    { value: "valine", label: "Valine" },
    { value: "leucine", label: "Leucine" },
    { value: "isoleucine", label: "Isoleucine" },
    { value: "methionine", label: "Méthionine" },
    { value: "phenylalanine", label: "Phénylalanine" },
    { value: "tryptophan", label: "Tryptophane" },
    { value: "proline", label: "Proline" },
    { value: "glycine", label: "Glycine" },
    { value: "serine", label: "Sérine" },
    { value: "threonine", label: "Thréonine" },
    { value: "cysteine", label: "Cystéine" },
    { value: "tyrosine", label: "Tyrosine" },
    { value: "asparagine", label: "Asparagine" },
    { value: "glutamine", label: "Glutamine" },
    { value: "aspartic_acid", label: "Acide aspartique" },
    { value: "glutamic_acid", label: "Acide glutamique" },
    { value: "lysine", label: "Lysine" },
    { value: "arginine", label: "Arginine" },
    { value: "histidine", label: "Histidine" },
];
const AMINO_ACID_LABELS = Object.fromEntries(
    AMINO_ACIDS.map((amino) => [amino.value, amino.label]),
);

// Codons du brin codant (même séquence que l'ARNm, avec T au lieu de U)
const CODON_TABLE = [
    { codon: "GCT", value: "alanine" },
    { codon: "CTA", value: "leucine" },
    { codon: "ATT", value: "isoleucine" },
    { codon: "ATG", value: "methionine" },
    { codon: "TTT", value: "phenylalanine" },
    { codon: "TGG", value: "tryptophan" },
    { codon: "CCT", value: "proline" },
    { codon: "GGT", value: "glycine" },
    { codon: "TCT", value: "serine" },
    { codon: "GTA", value: "valine" },
    { codon: "ACT", value: "threonine" },
    { codon: "TGT", value: "cysteine" },
    { codon: "CAT", value: "histidine" },
    { codon: "CAA", value: "glutamine" },
    { codon: "AAT", value: "asparagine" },
    { codon: "AAA", value: "lysine" },
    { codon: "GAT", value: "aspartic_acid" },
    { codon: "GAA", value: "glutamic_acid" },
    { codon: "TAC", value: "tyrosine" },
    { codon: "CGT", value: "arginine" },
];

const CODON_EXAMPLES = [
    { codons: ["ATG"], label: "Méthionine (codon d'initiation)" },
    { codons: ["TAA", "TAG", "TGA"], label: "Stop (fin de la traduction)" },
    { codons: ["GCT"], label: "Alanine" },
];

const originalStrand = ["A", "T", "G", "C", "A", "T"];
const COMPLEMENT = { A: "T", T: "A", C: "G", G: "C" };
const correctStrand = originalStrand.map((base) => COMPLEMENT[base]);
// Codons lus sur le brin reconstitué : ["TAC", "GTA"]
const codons = [
    correctStrand.slice(0, 3).join(""),
    correctStrand.slice(3, 6).join(""),
];
const expectedAminoAcids = codons.map(
    (codon) => CODON_TABLE.find((entry) => entry.codon === codon)?.value,
);
const translationSummary = codons
    .map((codon, i) => `${codon} → ${AMINO_ACID_LABELS[expectedAminoAcids[i]]}`)
    .join(", ");
const availableBases = ["A", "T", "C", "G"];

// Classe commune des cases des brins (fluide pour tenir sur un écran de 375 px)
const STRAND_TILE =
    "flex-1 min-w-0 max-w-[4rem] aspect-square rounded-lg flex items-center justify-center font-bold text-xl sm:text-2xl";
const EMPTY_SLOT = "bg-gray-700/50 border-2 border-dashed border-gray-500";

// Espace insécable avant les deux-points (typographie française, évite un « : » seul en début de ligne)
const NBSP = "\u00a0";

const HINTS = {
    1: [
        `Procédez base par base${NBSP}: sous un A placez un T, sous un T un A, sous un C un G et sous un G un C.`,
        "Les trois premières bases du brin complémentaire sont T - A - C.",
        `Réponse complète${NBSP}: T - A - C - G - T - A`,
    ],
    2: [
        `Lisez la séquence reconstituée par groupes de 3 bases, puis cherchez chaque codon (${codons[0]}, puis ${codons[1]}) dans la table des codons ci-dessus.`,
        `Le premier codon, ${codons[0]}, code la ${AMINO_ACID_LABELS[expectedAminoAcids[0]].toLowerCase()}.`,
        `Réponses${NBSP}: ${translationSummary}`,
    ],
};
// Délai minimal entre deux indices payants (un double clic ne doit pas coûter 2 indices)
const HINT_CLICK_GUARD_MS = 800;

// --- État ---------------------------------------------------------------------

const userStrand = ref([null, null, null, null, null, null]);
const selectedPosition = ref(null);
const step1Solved = ref(false);
const step2Solved = ref(false);
const aminoAnswers = ref(["", ""]);
const isCompleted = ref(false);
const isOnCooldown = ref(false);
let cooldownTimer = null;

// Niveau d'aide payé dans cette salle (conservé après une sortie / un rechargement).
// Chaque étape affiche ses min(niveau, 3) premiers indices : un indice payé reste
// visible gratuitement, et chaque nouveau clic payant révèle un nouveau texte.
const hintLevel = ref(gameState.roomHints?.[ROOM_ID] || 0);

const currentStep = computed(() => (step1Solved.value ? 2 : 1));
const visibleHints = computed(() =>
    HINTS[currentStep.value].slice(
        0,
        Math.min(hintLevel.value, MAX_HINTS_PER_STEP),
    ),
);
const canShowHint = computed(
    () =>
        !isCompleted.value &&
        Math.min(hintLevel.value, MAX_HINTS_PER_STEP) <
            HINTS[currentStep.value].length,
);

const canCheckSequence = computed(
    () =>
        !step1Solved.value &&
        !isOnCooldown.value &&
        !userStrand.value.includes(null),
);
const canCheckAminoAcids = computed(
    () =>
        step1Solved.value &&
        !isCompleted.value &&
        !isOnCooldown.value &&
        aminoAnswers.value.every(Boolean),
);

const selectorHelp = computed(() => {
    if (selectedPosition.value !== null) {
        return `Position ${selectedPosition.value + 1}${NBSP}: choisissez sa base complémentaire (ou tapez A, T, C ou G).`;
    }
    if (userStrand.value.includes(null)) {
        return `Cliquez sur un «${NBSP}?${NBSP}» pour placer une base (ou tapez A, T, C ou G au clavier).`;
    }
    return `Toutes les cases sont remplies${NBSP}: cliquez sur une case pour la modifier, ou lancez la vérification.`;
});

// --- Affichage ----------------------------------------------------------------

const getBaseColor = (base) => BASE_TILE_COLORS[base] || "";
const getBaseTextColor = (base) => BASE_TEXT_COLORS[base] || "text-gray-400";

const getSlotClass = (base, index) => [
    STRAND_TILE,
    "cursor-pointer transition-all",
    base ? getBaseColor(base) : EMPTY_SLOT,
    selectedPosition.value === index
        ? "ring-4 ring-cyber-blue scale-110"
        : "hover:scale-105",
];

const getSlotLabel = (base, index) =>
    `Position ${index + 1} : ${base ? `${BASE_NAMES[base]} (${base})` : "vide"}${
        selectedPosition.value === index ? ", sélectionnée" : ""
    }`;

// --- Étape 1 ------------------------------------------------------------------

const findNextEmpty = (fromIndex) => {
    const length = userStrand.value.length;
    for (let offset = 1; offset <= length; offset++) {
        const index = (fromIndex + offset) % length;
        if (userStrand.value[index] === null) return index;
    }
    return null;
};

const selectPosition = (index) => {
    if (step1Solved.value) return;
    // Un second clic sur la case sélectionnée la désélectionne
    selectedPosition.value = selectedPosition.value === index ? null : index;
};

const placeBase = (base) => {
    const position = selectedPosition.value;
    if (position === null || step1Solved.value) return;
    userStrand.value[position] = base;
    // Passer automatiquement à la prochaine case vide (mise en évidence)
    selectedPosition.value = findNextEmpty(position);
};

const resetStrand = () => {
    if (step1Solved.value) return;
    userStrand.value = [null, null, null, null, null, null];
    selectedPosition.value = null;
};

const clearCooldown = () => {
    if (cooldownTimer) {
        clearTimeout(cooldownTimer);
        cooldownTimer = null;
    }
    isOnCooldown.value = false;
};

const startCooldown = () => {
    clearCooldown();
    isOnCooldown.value = true;
    cooldownTimer = setTimeout(() => {
        cooldownTimer = null;
        isOnCooldown.value = false;
    }, ERROR_COOLDOWN_MS);
};

const checkSequence = () => {
    if (!canCheckSequence.value) return;

    const isCorrect = userStrand.value.every(
        (base, index) => base === correctStrand[index],
    );

    if (isCorrect) {
        step1Solved.value = true;
        selectedPosition.value = null;
        clearCooldown();

        showSuccess(
            "ÉTAPE 1 RÉUSSIE",
            "La séquence est correcte : le brin complémentaire est reconstitué. Passez maintenant à l'étape 2 : la traduction en acides aminés.",
        );
    } else {
        addError(ROOM_ID);
        startCooldown();
        showError(
            "SÉQUENCE INCORRECTE",
            `La séquence n'est pas correcte. Vérifiez les règles d'appariement ! +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

// --- Étape 2 ------------------------------------------------------------------

const checkAminoAcids = () => {
    if (!canCheckAminoAcids.value) return;

    const isCorrect = expectedAminoAcids.every(
        (expected, index) => aminoAnswers.value[index] === expected,
    );

    if (isCorrect) {
        isCompleted.value = true;
        step2Solved.value = true;
        clearCooldown();

        completeRoom(ROOM_ID);
        emit("room-completed", ROOM_ID);

        createFireworks(3000);
        showSuccess(
            "MISSION ACCOMPLIE",
            `${translationSummary}. À retenir : A s'apparie avec T et C avec G, et l'information génétique se lit par codons de 3 bases.`,
            6000,
        );
    } else {
        addError(ROOM_ID);
        startCooldown();
        showError(
            "TRADUCTION INCORRECTE",
            `Les acides aminés ne correspondent pas. Vérifiez le code génétique ! +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

// --- Indices ------------------------------------------------------------------

let lastHintAt = 0;

const showHint = () => {
    if (!canShowHint.value) return;
    const now = Date.now();
    if (now - lastHintAt < HINT_CLICK_GUARD_MS) return;
    lastHintAt = now;
    hintLevel.value++;
    addHint(ROOM_ID);
};

// --- Clavier (étape 1) : A/T/C/G, flèches, retour arrière, Échap -------------

const isTypingTarget = (target) =>
    !!target &&
    (target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

const handleKeydown = (event) => {
    if (step1Solved.value || isCompleted.value) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (isTypingTarget(event.target)) return;

    const key = typeof event.key === "string" ? event.key : "";
    const base = key.toUpperCase();

    if (key.length === 1 && availableBases.includes(base)) {
        if (event.repeat) return;
        if (selectedPosition.value === null) {
            const firstEmpty = userStrand.value.indexOf(null);
            if (firstEmpty === -1) return;
            selectedPosition.value = firstEmpty;
        }
        event.preventDefault();
        placeBase(base);
        return;
    }

    const length = userStrand.value.length;

    if (selectedPosition.value === null) {
        if (key === "ArrowRight" || key === "ArrowLeft") {
            // Sans sélection, les flèches sélectionnent la première case vide (ou la première case)
            event.preventDefault();
            const firstEmpty = userStrand.value.indexOf(null);
            selectedPosition.value = firstEmpty === -1 ? 0 : firstEmpty;
        } else if (key === "Backspace") {
            // Sans sélection, retour arrière efface la dernière base placée
            let lastFilled = length - 1;
            while (lastFilled >= 0 && userStrand.value[lastFilled] === null) {
                lastFilled--;
            }
            if (lastFilled < 0) return;
            event.preventDefault();
            userStrand.value[lastFilled] = null;
            selectedPosition.value = lastFilled;
        }
        return;
    }

    if (key === "ArrowRight" || key === "ArrowLeft") {
        event.preventDefault();
        const delta = key === "ArrowRight" ? 1 : -1;
        selectedPosition.value =
            (selectedPosition.value + delta + length) % length;
    } else if (key === "Delete") {
        event.preventDefault();
        userStrand.value[selectedPosition.value] = null;
    } else if (key === "Backspace") {
        event.preventDefault();
        // Sur une case vide, retour arrière revient à la case précédente et l'efface
        if (
            userStrand.value[selectedPosition.value] === null &&
            selectedPosition.value > 0
        ) {
            selectedPosition.value--;
        }
        userStrand.value[selectedPosition.value] = null;
    } else if (key === "Escape") {
        selectedPosition.value = null;
    }
};

onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    clearCooldown();
});
</script>
