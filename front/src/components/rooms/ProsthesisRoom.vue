<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Étape 1: Calibration des angles -->
        <div v-if="!step1Solved" class="space-y-8">
            <!-- Explication du système -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-orange-500 rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Info class="w-5 h-5 text-orange-500 shrink-0" />
                    <h3 class="font-cyber font-bold text-orange-500">
                        SYSTÈME DE CALIBRATION ORTHOPÉDIQUE
                    </h3>
                </div>

                <div class="text-sm text-gray-300 mb-4">
                    Les prothèses de genou connectées (genoux à
                    microprocesseur) mesurent l'angle du genou en continu et
                    ajustent leur résistance à chaque phase du pas. Pour les
                    régler, il faut connaître les amplitudes de référence d'un
                    genou :
                </div>

                <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div
                        v-for="zone in kneeZones"
                        :key="zone.name"
                        :class="[zone.border, zone.wide ? 'col-span-2 lg:col-span-1' : '']"
                        class="bg-black/50 border rounded p-3 text-center"
                    >
                        <div :class="zone.color" class="font-bold mb-1">
                            {{ zone.name }}
                        </div>
                        <div class="text-gray-400">{{ zone.range }}</div>
                        <div class="text-xs text-gray-500 mt-1">
                            {{ zone.usage }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calibration des angles -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Settings class="w-5 h-5 text-cyber-blue shrink-0" />
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 1 : CALIBRER LA PROTHÈSE DE GENOU
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
                                class="relative w-56 h-56 sm:w-64 sm:h-64 bg-black/50 border border-cyber-blue/30 rounded-lg"
                            >
                                <svg
                                    viewBox="0 0 200 200"
                                    class="w-full h-full"
                                    role="img"
                                    :aria-label="`Flexion du genou : ${currentAngle} degrés`"
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

                                    <!-- Graduations (0° à droite, 90° en haut, 180° à gauche) -->
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

                                    <!-- Arc matérialisant l'angle mesuré -->
                                    <path
                                        v-if="currentAngle > 0"
                                        :d="angleArcPath"
                                        fill="none"
                                        stroke="#06b6d4"
                                        stroke-opacity="0.5"
                                        stroke-width="2"
                                    />

                                    <!-- Ligne de référence (fixe) -->
                                    <line
                                        x1="100"
                                        y1="100"
                                        x2="180"
                                        y2="100"
                                        stroke="#10b981"
                                        stroke-width="3"
                                    />

                                    <!-- Ligne mobile (angle actuel), même repère que les graduations -->
                                    <line
                                        x1="100"
                                        y1="100"
                                        :x2="needleEnd.x"
                                        :y2="needleEnd.y"
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
                                :max="MAX_KNEE_ANGLE"
                                step="1"
                                aria-label="Angle de flexion du genou"
                                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                @keydown.enter.prevent="submitOnEnter($event, checkAngle)"
                            />
                            <div
                                class="flex justify-between text-xs text-gray-400 mt-2"
                            >
                                <span>0° (Extension)</span>
                                <span>{{ MAX_KNEE_ANGLE / 2 }}°</span>
                                <span>{{ MAX_KNEE_ANGLE }}°</span>
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
                            Le patient reprend la
                            <span class="text-cyber-blue font-bold"
                                >marche sur terrain plat</span
                            >. Programmez la
                            <span class="text-cyber-blue font-bold"
                                >flexion maximale</span
                            >
                            que son genou doit atteindre au cours d'un pas.
                        </div>
                    </div>

                    <!-- Bouton de validation -->
                    <button
                        @click="checkAngle"
                        :disabled="isLocked"
                        class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                class="bg-gray-800/60 backdrop-blur-md border-2 border-orange-500 rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Zap class="w-5 h-5 text-orange-500 shrink-0" />
                    <h3 class="font-cyber font-bold text-orange-500">
                        SYNCHRONISATION DES ARTICULATIONS
                    </h3>
                </div>

                <div class="text-sm text-gray-300">
                    Le système orthopédique pilote simultanément les trois
                    articulations motorisées de la jambe : hanche, genou et
                    cheville. L'attaque a corrompu ses consignes : il
                    n'acceptera une configuration que si elle respecte ses
                    règles de sécurité internes.
                </div>
            </div>

            <!-- Interface de synchronisation -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Activity class="w-5 h-5 text-cyber-blue shrink-0" />
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        ÉTAPE 2 : RÉALIGNER LES ARTICULATIONS
                    </h3>
                </div>

                <div class="space-y-6">
                    <!-- Contraintes -->
                    <div
                        class="bg-purple-500/10 border border-purple-500/50 rounded p-4"
                    >
                        <div class="text-purple-400 font-bold text-sm mb-2">
                            📋 RÈGLES DE SÉCURITÉ DU CONTRÔLEUR
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
                                • La somme totale des angles doit être de
                                <span class="text-cyan-400 font-bold"
                                    >180°</span
                                >
                                (±10°)
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
                                aria-label="Angle de la hanche"
                                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                @keydown.enter.prevent="submitOnEnter($event, checkJoints)"
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
                                aria-label="Angle du genou"
                                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                @keydown.enter.prevent="submitOnEnter($event, checkJoints)"
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
                                aria-label="Angle de la cheville"
                                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                @keydown.enter.prevent="submitOnEnter($event, checkJoints)"
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
                                isHipAboveKnee
                                    ? 'text-green-400'
                                    : 'text-red-400'
                            "
                            class="bg-gray-800/50 rounded p-2"
                        >
                            <span class="font-bold">Hanche > Genou :</span>
                            {{ isHipAboveKnee ? "✓" : "✗" }}
                        </div>
                        <div
                            :class="
                                isKneeAboveAnkle
                                    ? 'text-green-400'
                                    : 'text-red-400'
                            "
                            class="bg-gray-800/50 rounded p-2"
                        >
                            <span class="font-bold">Genou > Cheville :</span>
                            {{ isKneeAboveAnkle ? "✓" : "✗" }}
                        </div>
                        <div
                            :class="
                                isDifferenceRangeValid
                                    ? 'text-green-400'
                                    : 'text-red-400'
                            "
                            class="bg-gray-800/50 rounded p-2 col-span-2 md:col-span-1"
                        >
                            <span class="font-bold">Écarts 20-40° :</span>
                            {{ isDifferenceRangeValid ? "✓" : "✗" }}
                        </div>
                        <div
                            :class="
                                isTotalSumValid
                                    ? 'text-green-400'
                                    : 'text-red-400'
                            "
                            class="bg-gray-800/50 rounded p-2 col-span-2 md:col-span-3"
                        >
                            <span class="font-bold">Somme totale :</span>
                            {{ totalSum }}° / 180° (±10°)
                            {{ isTotalSumValid ? "✓" : "✗" }}
                        </div>
                    </div>

                    <!-- Bouton de validation -->
                    <button
                        @click="checkJoints"
                        :disabled="isLocked"
                        class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        SYNCHRONISER LES ARTICULATIONS
                    </button>
                </div>
            </div>
        </div>

        <!-- Salle terminée : message pédagogique -->
        <div v-if="step2Solved" class="space-y-8">
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <CircleCheck class="w-5 h-5 text-cyber-green shrink-0" />
                    <h3 class="font-cyber font-bold text-cyber-green">
                        SYSTÈME ORTHOPÉDIQUE RÉTABLI
                    </h3>
                </div>

                <p class="text-sm text-gray-300 mb-4">
                    La prothèse est calibrée et ses articulations sont
                    synchronisées : le patient peut reprendre sa rééducation en
                    toute sécurité.
                </p>

                <div
                    class="bg-black/40 border border-cyber-green/40 rounded p-4"
                >
                    <div
                        class="flex items-center gap-2 text-cyber-green font-bold text-sm mb-2"
                    >
                        <GraduationCap class="w-4 h-4 shrink-0" />
                        À RETENIR
                    </div>
                    <ul class="text-gray-300 text-sm space-y-2 list-disc pl-5">
                        <li>
                            En marchant sur terrain plat, le genou fléchit
                            d'environ 15 à 20° pendant l'appui pour amortir le
                            poids du corps, puis de 60 à 70° pendant
                            l'oscillation pour que le pied ne heurte pas le sol.
                            Monter un escalier ou se lever d'une chaise demande
                            90° ou plus.
                        </li>
                        <li>
                            Les genoux de prothèse à microprocesseur mesurent
                            cet angle en continu et ajustent leur résistance à
                            chaque pas.
                        </li>
                        <li>
                            Souvent réglés sans fil depuis une application, ce
                            sont des objets connectés médicaux : leurs
                            paramètres doivent être protégés (accès
                            authentifié, mises à jour vérifiées), car un réglage
                            piraté peut faire chuter le patient.
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Indices -->
        <div v-if="!step2Solved" class="mt-8">
            <div
                class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-4 sm:p-6"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Lightbulb class="w-5 h-5 text-yellow-500 shrink-0" />
                    <h4 class="font-cyber font-bold text-yellow-500">
                        INDICES
                    </h4>
                </div>

                <div class="space-y-2 text-sm text-gray-300">
                    <!-- Indices pour l'étape 1 -->
                    <template v-if="!step1Solved">
                        <div v-if="step1HintsShown >= 1" class="fade-in">
                            💡 Au cours d'un pas, le talon se pose jambe tendue
                            (extension), le pied reste ensuite au sol (appui),
                            puis la jambe passe en l'air vers l'avant
                            (oscillation). Les escaliers, la chaise et la
                            flexion complète ne font pas partie de la marche sur
                            terrain plat.
                        </div>
                        <div v-if="step1HintsShown >= 2" class="fade-in">
                            💡 C'est pendant l'oscillation, pied en l'air, que
                            le genou se plie le plus au cours d'un pas : sinon
                            le pied accrocherait le sol.
                        </div>
                        <div v-if="step1HintsShown >= 3" class="fade-in">
                            💡 Réglez le genou à
                            <span class="text-cyber-green font-bold">65°</span>
                            (toute valeur entre 60° et 70° est acceptée).
                        </div>
                    </template>

                    <!-- Indices pour l'étape 2 -->
                    <template v-else>
                        <div v-if="step2HintsShown >= 1" class="fade-in">
                            💡 La hanche doit avoir le plus grand angle des
                            trois articulations, autour de 90°.
                        </div>
                        <div v-if="step2HintsShown >= 2" class="fade-in">
                            💡 Avec deux écarts identiques, la somme vaut 3 ×
                            l'angle du genou : pour 180°, réglez le genou à
                            60°.
                        </div>
                        <div v-if="step2HintsShown >= 3" class="fade-in">
                            💡 Solution :
                            <span class="text-cyber-green font-bold"
                                >Hanche 90° → Genou 60° → Cheville 30°</span
                            >
                            (90 + 60 + 30 = 180°, écarts de 30°)
                        </div>
                    </template>

                    <div v-if="hintsShown === 0" class="text-gray-500 italic">
                        Aucun indice affiché pour cette étape.
                    </div>
                </div>

                <button
                    @click="showHint"
                    :disabled="!canShowHint"
                    class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-tech text-sm rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                    {{
                        canShowHint
                            ? `AFFICHER UN INDICE (${hintsShown + 1}/${MAX_HINTS_PER_STEP})`
                            : "PLUS D'INDICE DISPONIBLE"
                    }}
                </button>
            </div>
        </div>
    </GameRoom>
</template>

<script>
// Progression locale de la salle (étape 1 résolue + indices payés pendant l'étape 1).
// Gardée hors du composant pour survivre à un RETOUR, et copiée en sessionStorage.
// Liée à la partie en cours via gameKey (gameId + équipe, conservés par la sauvegarde
// de partie) : la copie d'une autre partie est ignorée et la salle retombe alors sur
// la répartition déterministe des indices (voir plus bas).
const PROGRESS_STORAGE_KEY = "cyberhopital:prosthesis-progress:v1";
let memoryProgress = null;
</script>

<script setup>
import { ref, computed, onUnmounted } from "vue";
import {
    Info,
    Settings,
    Zap,
    Activity,
    Lightbulb,
    CircleCheck,
    GraduationCap,
} from "lucide-vue-next";
import GameRoom from "../GameRoom.vue";
import { createFireworks } from "../../utils/fireworks";
import { useToast } from "../../composables/useToast";
import { useGameState } from "../../composables/useGameState";

const ROOM_ID = "prosthesis";

const emit = defineEmits(["exit-room", "room-completed"]);
const { showSuccess, showError } = useToast();
const { gameState, addError, addHint, completeRoom, PENALTY_PER_ERROR } =
    useGameState();

const roomData = {
    title: "SALLE DES PROTHÈSES",
    subtitle: "Système orthopédique désynchronisé",
    description:
        "Le système orthopédique numérique de l'hôpital ne répond plus : les données des prothèses connectées sont désynchronisées. Réalignez les articulations virtuelles.",
    objective: "Comprendre la biomécanique et les technologies IoT médicales",
    icon: "settings",
    color: "#f97316",
};

// Amplitudes de référence du genou (degrés de flexion)
const kneeZones = [
    {
        name: "EXTENSION",
        range: "0° - 10°",
        usage: "Jambe tendue : debout, talon qui se pose au sol",
        color: "text-green-400",
        border: "border-green-500/50",
    },
    {
        name: "APPUI",
        range: "15° - 20°",
        usage: "Pied au sol : le genou fléchit un peu pour amortir le poids du corps",
        color: "text-cyan-400",
        border: "border-cyan-500/50",
    },
    {
        name: "OSCILLATION",
        range: "60° - 70°",
        usage: "Pied en l'air vers l'avant : le genou se plie pour que le pied passe sans accrocher",
        color: "text-blue-400",
        border: "border-blue-500/50",
    },
    {
        name: "ESCALIERS / CHAISE",
        range: "90° - 120°",
        usage: "Monter une marche, s'asseoir, se relever",
        color: "text-pink-400",
        border: "border-pink-500/50",
    },
    {
        name: "FLEXION COMPLÈTE",
        range: "130° - 140°",
        usage: "Genou plié au maximum : talon ramené vers la fesse",
        color: "text-purple-400",
        border: "border-purple-500/50",
        wide: true,
    },
];

// Étape 1 : flexion maximale du genou pendant un pas (phase d'oscillation, 60-70°)
const STEP1_TARGET = 65;
const STEP1_TOLERANCE = 5;
const MAX_KNEE_ANGLE = 150;

const MAX_HINTS_PER_STEP = 3;
const ERROR_COOLDOWN_MS = 1000;
const STEP_TRANSITION_LOCK_MS = 600;

// --- Progression sauvegardée (liée à la partie en cours) ---
const getGameKey = () =>
    `${gameState.gameId ?? ""}|${gameState.teamName ?? ""}`;

const loadProgress = () => {
    let saved = memoryProgress;
    try {
        const raw = sessionStorage.getItem(PROGRESS_STORAGE_KEY);
        if (raw) saved = JSON.parse(raw);
    } catch {
        // Stockage indisponible : on se contente de la copie en mémoire
    }
    return saved && saved.gameKey === getGameKey() ? saved : null;
};

const saveProgress = (progress) => {
    memoryProgress = { gameKey: getGameKey(), ...progress };
    try {
        sessionStorage.setItem(
            PROGRESS_STORAGE_KEY,
            JSON.stringify(memoryProgress),
        );
    } catch {
        // Stockage indisponible : la copie en mémoire suffit
    }
};

const clearProgress = () => {
    memoryProgress = null;
    try {
        sessionStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
        // Rien à faire
    }
};

const alreadyCompleted = gameState.completedRooms.includes(ROOM_ID);
const savedProgress = alreadyCompleted ? null : loadProgress();
const initialPaidHints = gameState.roomHints?.[ROOM_ID] || 0;

// --- État de la salle ---
// Sans progression sauvegardée : plus de 3 indices payés implique que l'étape 1
// était résolue (elle n'en propose que 3), les 3 premiers lui appartiennent.
const step1Solved = ref(
    alreadyCompleted ||
        Boolean(savedProgress?.step1Solved) ||
        initialPaidHints > MAX_HINTS_PER_STEP,
);
const step2Solved = ref(alreadyCompleted);
const isCompleted = ref(alreadyCompleted);
const currentAngle = ref(90);
const hipAngle = ref(50);
const kneeAngle = ref(40);
const ankleAngle = ref(25);

// Verrou anti double-clic / répétition de touche pendant le retour d'une tentative
const isLocked = ref(false);
let lockTimer = null;

const lockValidation = (duration) => {
    if (lockTimer) clearTimeout(lockTimer);
    isLocked.value = true;
    lockTimer = setTimeout(() => {
        lockTimer = null;
        isLocked.value = false;
    }, duration);
};

onUnmounted(() => {
    if (lockTimer) {
        clearTimeout(lockTimer);
        lockTimer = null;
    }
});

const submitOnEnter = (event, action) => {
    if (event.repeat) return;
    action();
};

// --- Cadran : 0° à droite, 90° en haut, 180° à gauche (comme les graduations) ---
const toRadians = (degrees) => (degrees * Math.PI) / 180;

const needleEnd = computed(() => ({
    x: 100 + 80 * Math.cos(toRadians(currentAngle.value)),
    y: 100 - 80 * Math.sin(toRadians(currentAngle.value)),
}));

const angleArcPath = computed(() => {
    const radius = 30;
    const endX = 100 + radius * Math.cos(toRadians(currentAngle.value));
    const endY = 100 - radius * Math.sin(toRadians(currentAngle.value));
    return `M ${100 + radius} 100 A ${radius} ${radius} 0 0 0 ${endX} ${endY}`;
});

// --- Indices ---
// gameState.roomHints[ROOM_ID] = indices déjà payés dans cette salle (toutes visites).
// Répartition déterministe : les indices payés avant la résolution de l'étape 1
// (au plus 3) appartiennent à l'étape 1, les suivants à l'étape 2.
const paidHints = ref(initialPaidHints);
const step1HintCount = ref(
    savedProgress?.step1Solved
        ? Math.min(
              Math.max(0, Number(savedProgress.step1HintCount) || 0),
              MAX_HINTS_PER_STEP,
          )
        : step1Solved.value
          ? Math.min(initialPaidHints, MAX_HINTS_PER_STEP)
          : 0,
);

const step1HintsShown = computed(() =>
    Math.min(paidHints.value, MAX_HINTS_PER_STEP),
);
const step2HintsShown = computed(() =>
    Math.min(
        Math.max(paidHints.value - step1HintCount.value, 0),
        MAX_HINTS_PER_STEP,
    ),
);
const hintsShown = computed(() =>
    step1Solved.value ? step2HintsShown.value : step1HintsShown.value,
);
const canShowHint = computed(
    () => !step2Solved.value && hintsShown.value < MAX_HINTS_PER_STEP,
);

const showHint = () => {
    if (!canShowHint.value) return;
    paidHints.value++;
    addHint(ROOM_ID);
};

// --- Étape 1 ---
const checkAngle = () => {
    if (step1Solved.value || isLocked.value) return;

    if (Math.abs(currentAngle.value - STEP1_TARGET) <= STEP1_TOLERANCE) {
        step1HintCount.value = step1HintsShown.value;
        step1Solved.value = true;
        saveProgress({
            step1Solved: true,
            step1HintCount: step1HintCount.value,
        });
        // Évite qu'un double-clic valide aussitôt l'étape 2
        lockValidation(STEP_TRANSITION_LOCK_MS);

        showSuccess(
            "CALIBRATION RÉUSSIE",
            "Excellent ! Pendant l'oscillation, le genou fléchit d'environ 60 à 70° pour que le pied passe sans accrocher le sol. Passez à l'étape 2 : synchronisation des articulations.",
            6000,
        );
    } else {
        lockValidation(ERROR_COOLDOWN_MS);
        addError(ROOM_ID);
        showError(
            "CALIBRATION INCORRECTE",
            `Ce réglage ne correspond pas à la flexion maximale d'un pas sur terrain plat. Réessayez ! +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

// --- Étape 2 ---
const totalSum = computed(
    () => hipAngle.value + kneeAngle.value + ankleAngle.value,
);
const isHipAboveKnee = computed(() => hipAngle.value > kneeAngle.value);
const isKneeAboveAnkle = computed(() => kneeAngle.value > ankleAngle.value);
const isDifferenceRangeValid = computed(() => {
    const hipKneeDiff = hipAngle.value - kneeAngle.value;
    const kneeAnkleDiff = kneeAngle.value - ankleAngle.value;
    return (
        hipKneeDiff >= 20 &&
        hipKneeDiff <= 40 &&
        kneeAnkleDiff >= 20 &&
        kneeAnkleDiff <= 40
    );
});
const isTotalSumValid = computed(
    () => totalSum.value >= 170 && totalSum.value <= 190,
);

const finishRoom = () => {
    if (isCompleted.value) return;
    isCompleted.value = true;
    step2Solved.value = true;
    clearProgress();

    // Synchrone : un RETOUR immédiat ne doit pas perdre l'événement
    completeRoom(ROOM_ID);
    emit("room-completed", ROOM_ID);

    // App quitte la salle dès l'événement : le message à retenir passe aussi par le toast
    createFireworks(3000);
    showSuccess(
        "SYNCHRONISATION RÉUSSIE",
        "Le système orthopédique est opérationnel. À retenir : une prothèse connectée est un objet médical, ses réglages doivent donc être protégés, car un réglage piraté peut faire chuter le patient.",
        7000,
    );
};

const checkJoints = () => {
    if (
        !step1Solved.value ||
        step2Solved.value ||
        isCompleted.value ||
        isLocked.value
    ) {
        return;
    }

    if (
        isHipAboveKnee.value &&
        isKneeAboveAnkle.value &&
        isDifferenceRangeValid.value &&
        isTotalSumValid.value
    ) {
        finishRoom();
        return;
    }

    lockValidation(ERROR_COOLDOWN_MS);
    addError(ROOM_ID);

    const problems = [];
    if (!isHipAboveKnee.value)
        problems.push("la hanche doit avoir un angle supérieur au genou");
    if (!isKneeAboveAnkle.value)
        problems.push("le genou doit avoir un angle supérieur à la cheville");
    if (!isDifferenceRangeValid.value)
        problems.push("chaque écart doit être compris entre 20° et 40°");
    if (!isTotalSumValid.value)
        problems.push("la somme doit être de 180° (±10°)");

    showError(
        "SYNCHRONISATION INCORRECTE",
        `Règles du contrôleur non respectées : ${problems.join(" ; ")}. +${PENALTY_PER_ERROR}s de pénalité`,
    );
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
