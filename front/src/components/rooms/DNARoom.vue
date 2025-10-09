<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Étape 1: Reconstitution du brin complémentaire -->
        <div v-if="!step1Solved" class="space-y-8">
            <!-- Explication rapide -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="info" class="w-5 h-5 text-cyber-purple"></i>
                    <h3 class="font-cyber font-bold text-cyber-purple">
                        RÈGLES D'APPARIEMENT ADN
                    </h3>
                </div>

                <div class="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div
                        class="bg-black/50 border border-red-500/50 rounded p-4 text-center"
                    >
                        <div class="text-3xl font-bold text-red-500 mb-2">
                            A ↔ T
                        </div>
                        <div class="text-xs text-gray-400">
                            Adénine avec Thymine
                        </div>
                    </div>
                    <div
                        class="bg-black/50 border border-green-500/50 rounded p-4 text-center"
                    >
                        <div class="text-3xl font-bold text-green-500 mb-2">
                            C ↔ G
                        </div>
                        <div class="text-xs text-gray-400">
                            Cytosine avec Guanine
                        </div>
                    </div>
                </div>
            </div>

            <!-- Puzzle simplifié -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="dna" class="w-5 h-5 text-cyber-blue"></i>
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 1: RECONSTITUER LE BRIN COMPLÉMENTAIRE
                    </h3>
                </div>

                <div class="space-y-6">
                    <!-- Brin original -->
                    <div>
                        <div class="text-sm font-tech text-gray-400 mb-2">
                            BRIN ORIGINAL
                        </div>
                        <div class="flex justify-center gap-3">
                            <div
                                v-for="(base, index) in originalStrand"
                                :key="index"
                                class="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-2xl"
                                :class="getBaseColor(base)"
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
                        <div class="flex justify-center gap-3 mb-4">
                            <div
                                v-for="(base, index) in userStrand"
                                :key="index"
                                class="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-2xl cursor-pointer transition-all hover:scale-105"
                                :class="
                                    base
                                        ? getBaseColor(base)
                                        : 'bg-gray-700/50 border-2 border-dashed border-gray-500'
                                "
                                @click="selectPosition(index)"
                            >
                                {{ base || "?" }}
                            </div>
                        </div>

                        <!-- Sélecteur de bases -->
                        <div
                            v-if="selectedPosition !== null"
                            class="flex justify-center gap-3"
                        >
                            <button
                                v-for="base in availableBases"
                                :key="base"
                                @click="placeBase(base)"
                                class="w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl transition-all hover:scale-110"
                                :class="getBaseColor(base)"
                            >
                                {{ base }}
                            </button>
                        </div>
                        <div
                            v-else
                            class="text-center text-sm text-gray-400 font-tech"
                        >
                            Cliquez sur un "?" pour placer une base
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-4">
                        <button
                            @click="resetStrand"
                            class="flex-1 px-6 py-3 border border-cyber-red text-cyber-red hover:bg-cyber-red/10 font-cyber font-bold rounded-lg transition-all"
                        >
                            RÉINITIALISER
                        </button>
                        <button
                            @click="checkSequence"
                            :disabled="userStrand.includes(null)"
                            class="flex-1 px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
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
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i
                        data-lucide="microscope"
                        class="w-5 h-5 text-cyber-purple"
                    ></i>
                    <h3 class="font-cyber font-bold text-cyber-purple">
                        CODE GÉNÉTIQUE
                    </h3>
                </div>

                <div class="text-sm text-gray-300 mb-4">
                    Chaque groupe de 3 bases (codon) code pour un acide aminé.
                    Voici quelques exemples :
                </div>

                <div class="grid grid-cols-3 gap-2 max-w-lg mx-auto text-xs">
                    <div
                        class="bg-black/50 border border-blue-500/50 rounded p-2 text-center"
                    >
                        <div class="text-blue-400 font-bold">ATG</div>
                        <div class="text-gray-400">Méthionine</div>
                    </div>
                    <div
                        class="bg-black/50 border border-green-500/50 rounded p-2 text-center"
                    >
                        <div class="text-green-400 font-bold">TAA/TAG/TGA</div>
                        <div class="text-gray-400">Stop</div>
                    </div>
                    <div
                        class="bg-black/50 border border-yellow-500/50 rounded p-2 text-center"
                    >
                        <div class="text-yellow-400 font-bold">GCT</div>
                        <div class="text-gray-400">Alanine</div>
                    </div>
                </div>

                <!-- Table de correspondance simplifiée -->
                <div class="mt-6">
                    <div class="flex items-center gap-2 mb-3">
                        <i
                            data-lucide="book-open"
                            class="w-5 h-5 text-cyber-purple"
                        ></i>
                        <h4
                            class="font-cyber font-bold text-cyber-purple text-sm"
                        >
                            TABLE DES CODONS ADN → ACIDES AMINÉS
                        </h4>
                    </div>

                    <div
                        class="bg-black/30 border border-cyber-purple/30 rounded p-4"
                    >
                        <div
                            class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs"
                        >
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">GCT</div>
                                <div class="text-gray-300">Alanine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">CTA</div>
                                <div class="text-gray-300">Leucine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">ATT</div>
                                <div class="text-gray-300">Isoleucine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">ATG</div>
                                <div class="text-gray-300">Méthionine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">TTT</div>
                                <div class="text-gray-300">Phénylalanine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">TGG</div>
                                <div class="text-gray-300">Tryptophane</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">CCT</div>
                                <div class="text-gray-300">Proline</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">GGT</div>
                                <div class="text-gray-300">Glycine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">TCT</div>
                                <div class="text-gray-300">Sérine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">GTA</div>
                                <div class="text-gray-300">Valine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">ACT</div>
                                <div class="text-gray-300">Thréonine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">TGT</div>
                                <div class="text-gray-300">Cystéine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">CAT</div>
                                <div class="text-gray-300">Histidine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">CAA</div>
                                <div class="text-gray-300">Glutamine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">AAT</div>
                                <div class="text-gray-300">Asparagine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">AAA</div>
                                <div class="text-gray-300">Lysine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">GAT</div>
                                <div class="text-gray-300">
                                    Acide aspartique
                                </div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">GAA</div>
                                <div class="text-gray-300">
                                    Acide glutamique
                                </div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">TAC</div>
                                <div class="text-gray-300">Tyrosine</div>
                            </div>
                            <div class="bg-gray-800/40 rounded p-2">
                                <div class="text-blue-400 font-bold">CGT</div>
                                <div class="text-gray-300">Arginine</div>
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
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="zap" class="w-5 h-5 text-cyber-blue"></i>
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 2: TRADUIRE EN ACIDES AMINÉS
                    </h3>
                </div>

                <div class="space-y-6">
                    <!-- Séquence ADN obtenue -->
                    <div>
                        <div class="text-sm font-tech text-gray-400 mb-2">
                            SÉQUENCE ADN RECONSTITUÉE
                        </div>
                        <div class="flex justify-center gap-3">
                            <div
                                v-for="(base, index) in correctStrand"
                                :key="index"
                                class="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-2xl"
                                :class="getBaseColor(base)"
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
                        <div class="flex justify-center gap-6">
                            <div class="text-center">
                                <div class="flex gap-1 mb-2">
                                    <span
                                        class="w-12 h-12 rounded flex items-center justify-center font-bold text-lg bg-red-500/20 border border-red-500 text-red-500"
                                        >T</span
                                    >
                                    <span
                                        class="w-12 h-12 rounded flex items-center justify-center font-bold text-lg bg-blue-500/20 border border-blue-500 text-blue-500"
                                        >A</span
                                    >
                                    <span
                                        class="w-12 h-12 rounded flex items-center justify-center font-bold text-lg bg-green-500/20 border border-green-500 text-green-500"
                                        >C</span
                                    >
                                </div>
                                <div class="text-xs text-gray-400">TAC</div>
                            </div>
                            <div class="text-center">
                                <div class="flex gap-1 mb-2">
                                    <span
                                        class="w-12 h-12 rounded flex items-center justify-center font-bold text-lg bg-yellow-500/20 border border-yellow-500 text-yellow-500"
                                        >G</span
                                    >
                                    <span
                                        class="w-12 h-12 rounded flex items-center justify-center font-bold text-lg bg-red-500/20 border border-red-500 text-red-500"
                                        >T</span
                                    >
                                    <span
                                        class="w-12 h-12 rounded flex items-center justify-center font-bold text-lg bg-blue-500/20 border border-blue-500 text-blue-500"
                                        >A</span
                                    >
                                </div>
                                <div class="text-xs text-gray-400">GTA</div>
                            </div>
                        </div>
                    </div>

                    <!-- Acides aminés à sélectionner -->
                    <div>
                        <div class="text-sm font-tech text-gray-400 mb-2">
                            ACIDES AMINÉS CORRESPONDANTS
                        </div>
                        <div class="flex justify-center gap-6 mb-4">
                            <div class="text-center">
                                <div class="text-xs text-gray-400 mb-2">
                                    TAC →
                                </div>
                                <select
                                    v-model="aminoAcid1"
                                    class="w-40 px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-center focus:outline-none focus:border-cyber-blue transition-all"
                                >
                                    <option value="">Sélectionnez</option>
                                    <option value="alanine">Alanine</option>
                                    <option value="valine">Valine</option>
                                    <option value="leucine">Leucine</option>
                                    <option value="isoleucine">
                                        Isoleucine
                                    </option>
                                    <option value="methionine">
                                        Méthionine
                                    </option>
                                    <option value="phenylalanine">
                                        Phénylalanine
                                    </option>
                                    <option value="tryptophan">
                                        Tryptophane
                                    </option>
                                    <option value="proline">Proline</option>
                                    <option value="glycine">Glycine</option>
                                    <option value="serine">Sérine</option>
                                    <option value="threonine">Thrénine</option>
                                    <option value="cysteine">Cystéine</option>
                                    <option value="tyrosine">Tyrosine</option>
                                    <option value="asparagine">
                                        Asparagine
                                    </option>
                                    <option value="glutamine">Glutamine</option>
                                    <option value="aspartic_acid">
                                        Acide aspartique
                                    </option>
                                    <option value="glutamic_acid">
                                        Acide glutamique
                                    </option>
                                    <option value="lysine">Lysine</option>
                                    <option value="arginine">Arginine</option>
                                    <option value="histidine">Histidine</option>
                                </select>
                            </div>
                            <div class="text-center">
                                <div class="text-xs text-gray-400 mb-2">
                                    GTA →
                                </div>
                                <select
                                    v-model="aminoAcid2"
                                    class="w-40 px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-center focus:outline-none focus:border-cyber-blue transition-all"
                                >
                                    <option value="">Sélectionnez</option>
                                    <option value="alanine">Alanine</option>
                                    <option value="valine">Valine</option>
                                    <option value="leucine">Leucine</option>
                                    <option value="isoleucine">
                                        Isoleucine
                                    </option>
                                    <option value="methionine">
                                        Méthionine
                                    </option>
                                    <option value="phenylalanine">
                                        Phénylalanine
                                    </option>
                                    <option value="tryptophan">
                                        Tryptophane
                                    </option>
                                    <option value="proline">Proline</option>
                                    <option value="glycine">Glycine</option>
                                    <option value="serine">Sérine</option>
                                    <option value="threonine">Thrénine</option>
                                    <option value="cysteine">Cystéine</option>
                                    <option value="tyrosine">Tyrosine</option>
                                    <option value="asparagine">
                                        Asparagine
                                    </option>
                                    <option value="glutamine">Glutamine</option>
                                    <option value="aspartic_acid">
                                        Acide aspartique
                                    </option>
                                    <option value="glutamic_acid">
                                        Acide glutamique
                                    </option>
                                    <option value="lysine">Lysine</option>
                                    <option value="arginine">Arginine</option>
                                    <option value="histidine">Histidine</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Bouton de vérification -->
                    <div class="flex justify-center">
                        <button
                            @click="checkAminoAcids"
                            :disabled="!aminoAcid1 || !aminoAcid2"
                            class="px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
                        >
                            VÉRIFIER LES ACIDES AMINÉS
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
                    <!-- Indices pour l'étape 1 -->
                    <div v-if="!step1Solved">
                        <div v-if="hintsShown >= 1" class="fade-in">
                            💡 Utilisez les règles : A avec T, C avec G
                        </div>
                        <div v-if="hintsShown >= 2" class="fade-in">
                            💡 Le premier base "A" doit s'apparier avec "T"
                        </div>
                        <div v-if="hintsShown >= 3" class="fade-in">
                            💡 Réponse complète : T - A - C - G - T - A
                        </div>
                    </div>

                    <!-- Indices pour l'étape 2 -->
                    <div v-if="step1Solved && !step2Solved">
                        <div v-if="hintsShown >= 1" class="fade-in">
                            💡 Chaque codon (3 bases) code pour un acide aminé
                        </div>
                        <div v-if="hintsShown >= 2" class="fade-in">
                            💡 TAC = Tyrosine, GTA = Valine
                        </div>
                        <div v-if="hintsShown >= 3" class="fade-in">
                            💡 Réponses : Tyrosine et Valine
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
    title: "LABORATOIRE ADN",
    subtitle: "Les gènes brouillés",
    description:
        "Le virus a corrompu une séquence ADN. Utilisez les règles d'appariement (A↔T, C↔G) pour reconstituer le brin complémentaire.",
    objective: "Comprendre la logique de l'ADN et des données biomédicales",
    icon: "dna",
    color: "#00ffff",
};

const originalStrand = ["A", "T", "G", "C", "A", "T"];
const correctStrand = ["T", "A", "C", "G", "T", "A"];
const userStrand = ref([null, null, null, null, null, null]);
const selectedPosition = ref(null);
const availableBases = ["A", "T", "C", "G"];
const step1Solved = ref(false);
const step2Solved = ref(false);
const aminoAcid1 = ref("");
const aminoAcid2 = ref("");
const isCompleted = ref(false);
const hintsShown = ref(0);

const getBaseColor = (base) => {
    const colors = {
        A: "bg-red-500/20 border-2 border-red-500 text-red-500",
        T: "bg-blue-500/20 border-2 border-blue-500 text-blue-500",
        C: "bg-green-500/20 border-2 border-green-500 text-green-500",
        G: "bg-yellow-500/20 border-2 border-yellow-500 text-yellow-500",
    };
    return colors[base] || "";
};

const selectPosition = (index) => {
    selectedPosition.value = index;
};

const placeBase = (base) => {
    if (selectedPosition.value !== null) {
        userStrand.value[selectedPosition.value] = base;
        selectedPosition.value = null;
    }
};

const resetStrand = () => {
    userStrand.value = [null, null, null, null, null, null];
    selectedPosition.value = null;
};

const checkSequence = () => {
    const isCorrect = userStrand.value.every(
        (base, index) => base === correctStrand[index],
    );

    if (isCorrect) {
        step1Solved.value = true;
        hintsShown.value = 0; // Réinitialiser les indices pour l'étape suivante

        showSuccess(
            "ÉTAPE 1 RÉUSSIE",
            "La séquence est correcte. Vous avez réussi à reconstituer le brin complémentaire. Passez maintenant à l'étape 2 : la traduction en acides aminés.",
        );
    } else {
        addError("dna-lab");
        showError(
            "SÉQUENCE INCORRECTE",
            `La séquence n'est pas correcte. Vérifiez les règles d'appariement ! +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

const checkAminoAcids = () => {
    const correctAminoAcids = ["tyrosine", "valine"];
    const userAmino1 = aminoAcid1.value;
    const userAmino2 = aminoAcid2.value;

    const isCorrect1 = userAmino1 === correctAminoAcids[0];
    const isCorrect2 = userAmino2 === correctAminoAcids[1];

    if (isCorrect1 && isCorrect2) {
        step2Solved.value = true;
        isCompleted.value = true;
        createFireworks(3000);

        showSuccess(
            "MISSION ACCOMPLIE",
            "Excellent ! Vous avez traduit la séquence ADN en acides aminés. La sécurité biométrique est maintenant rétablie.",
        );

        // Petit délai pour permettre au briefing de fin de s'afficher
        setTimeout(() => {
            completeRoom("dna-lab");
            emit("room-completed", "dna-lab");
        }, 300);
    } else {
        addError("dna-lab");
        showError(
            "TRADUCTION INCORRECTE",
            `Les acides aminés ne correspondent pas. Vérifiez le code génétique ! +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

const showHint = () => {
    hintsShown.value++;
    addHint("dna-lab");
};
</script>
