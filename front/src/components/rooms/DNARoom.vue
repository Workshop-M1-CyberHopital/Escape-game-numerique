<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Énigme simplifiée -->
        <div v-if="!puzzleSolved" class="space-y-8">
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
                        RECONSTITUER LE BRIN COMPLÉMENTAIRE
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
                        💡 Utilisez les règles : A avec T, C avec G
                    </div>
                    <div v-if="hintsShown >= 2" class="fade-in">
                        💡 Le premier base "A" doit s'apparier avec "T"
                    </div>
                    <div v-if="hintsShown >= 3" class="fade-in">
                        💡 Réponse complète : T - G - A - T - G
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

        <!-- Message de succès -->
        <div v-if="isCompleted" class="mt-8">
            <div
                class="bg-cyber-green/20 backdrop-blur-md border-2 border-cyber-green rounded-lg p-6 text-center"
            >
                <div class="flex items-center justify-center gap-2 mb-4">
                    <i
                        data-lucide="check-circle"
                        class="w-8 h-8 text-cyber-green"
                    ></i>
                    <h3 class="text-2xl font-cyber font-bold text-cyber-green">
                        SALLE TERMINÉE !
                    </h3>
                </div>
                <p class="text-gray-300 mb-4">
                    Parfait ! Vous avez reconstitué la séquence ADN. Les données
                    biomédicales sont restaurées.
                </p>
                <button
                    @click="$emit('room-completed', 'dna')"
                    class="px-8 py-3 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all"
                >
                    CONTINUER VERS LA PROCHAINE SALLE
                </button>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref } from "vue";
import GameRoom from "../GameRoom.vue";

const emit = defineEmits(["exit-room", "room-completed"]);

const roomData = {
    title: "LABORATOIRE ADN",
    subtitle: "Les gènes brouillés",
    description:
        "Le virus a corrompu une séquence ADN. Utilisez les règles d'appariement (A↔T, C↔G) pour reconstituer le brin complémentaire.",
    objective: "Comprendre la logique de l'ADN et des données biomédicales",
    icon: "dna",
    color: "#a855f7",
};

const originalStrand = ["A", "C", "T", "A", "C"];
const correctStrand = ["T", "G", "A", "T", "G"];
const userStrand = ref([null, null, null, null, null]);
const selectedPosition = ref(null);
const availableBases = ["A", "T", "C", "G"];
const puzzleSolved = ref(false);
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
    userStrand.value = [null, null, null, null, null];
    selectedPosition.value = null;
};

const checkSequence = () => {
    const isCorrect = userStrand.value.every(
        (base, index) => base === correctStrand[index],
    );

    if (isCorrect) {
        puzzleSolved.value = true;
        isCompleted.value = true;
    } else {
        alert(
            "La séquence n'est pas correcte. Vérifiez les règles d'appariement !",
        );
    }
};

const showHint = () => {
    hintsShown.value++;
};
</script>
