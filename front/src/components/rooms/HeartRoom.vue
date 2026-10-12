<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Simulation RCP -->
        <div v-if="!puzzleSolved" class="space-y-8">
            <!-- Moniteur cardiaque -->
            <div
                class="bg-gray-900/80 backdrop-blur-md border-2 border-gray-600 rounded-lg p-4 sm:p-6 scanline"
            >
                <div
                    class="flex flex-wrap items-center justify-between gap-2 mb-4"
                >
                    <div class="flex items-center gap-2">
                        <Monitor class="w-5 h-5 text-cyber-blue shrink-0" />
                        <h3
                            class="font-cyber font-bold text-cyber-blue text-sm sm:text-base"
                        >
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
                        class="bg-black border-2 border-gray-600 rounded-lg p-3 sm:p-4"
                    >
                        <div class="flex items-center justify-between mb-3">
                            <div class="text-xs text-green-400 font-tech">
                                ECG LEAD II
                            </div>
                            <div class="text-xs text-gray-400 font-tech">
                                {{ isRunning ? "MCE : 100/min" : "FC : --- BPM" }}
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
                                        id="heart-ecg-grid"
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
                                    fill="url(#heart-ecg-grid)"
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
                        class="bg-gray-800/50 border border-gray-600 rounded-lg p-3 sm:p-4"
                    >
                        <div
                            class="flex flex-wrap items-center justify-between gap-2 mb-3"
                        >
                            <div class="text-sm text-cyber-blue font-tech">
                                PRESSION THORACIQUE
                            </div>
                            <div class="text-xs text-gray-400 font-tech">
                                Temps minimum restant :
                                {{ minimumRemainingSeconds }}s
                            </div>
                        </div>

                        <!-- Progress Bar Central -->
                        <div class="mb-6">
                            <div class="flex items-center justify-between mb-3">
                                <span
                                    class="text-base sm:text-lg text-gray-300 font-tech font-bold"
                                    >PROGRESSION RCP</span
                                >
                                <div class="flex items-center gap-2">
                                    <span
                                        class="text-2xl text-cyber-blue font-bold"
                                    >
                                        {{ correctCompressions }}/{{
                                            requiredCompressions
                                        }}
                                    </span>
                                    <div class="text-xs text-gray-400">
                                        {{ progressPercent }}%
                                    </div>
                                </div>
                            </div>
                            <div
                                class="w-full bg-gray-700 rounded-full h-4 border-2 border-gray-600 overflow-hidden shadow-inner"
                            >
                                <div
                                    class="h-full bg-gradient-to-r from-cyber-red via-red-400 to-red-300 transition-all duration-500 ease-out relative"
                                    :style="{ width: `${progressPercent}%` }"
                                >
                                    <!-- Effet de brillance sur la barre de progression -->
                                    <div
                                        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
                                    ></div>
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
                                            'bg-green-400 shadow-lg shadow-green-400/50':
                                                i <= performanceDots,
                                            'bg-gray-600': i > performanceDots,
                                        }"
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <!-- Feedback Status Central -->
                        <div class="mb-4">
                            <!-- Clés distinctes (chaînes) : la clé change à chaque compression pour rejouer
                                 le flash, sans jamais entrer en collision avec la branche v-else -->
                            <div
                                v-if="isRunning"
                                :key="`feedback-${feedbackKey}`"
                                class="text-center p-3 sm:p-4 rounded-lg border-2"
                                :class="{
                                    'border-green-500 bg-green-500/10 text-green-400 success-flash':
                                        lastCompressionSuccess === true,
                                    'border-red-500 bg-red-500/10 text-red-400 error-flash':
                                        lastCompressionSuccess === false,
                                    'border-gray-500 bg-gray-500/10 text-gray-400':
                                        lastCompressionSuccess === null,
                                }"
                            >
                                <div
                                    class="flex items-center justify-center gap-2 mb-2"
                                >
                                    <CheckCircle
                                        v-if="lastCompressionSuccess === true"
                                        class="w-6 h-6 text-green-400 shrink-0"
                                    />
                                    <XCircle
                                        v-else-if="lastCompressionSuccess === false"
                                        class="w-6 h-6 text-red-400 shrink-0"
                                    />
                                    <Heart
                                        v-else
                                        class="w-6 h-6 text-gray-400 shrink-0"
                                    />
                                    <span class="font-bold text-base sm:text-lg">
                                        {{
                                            lastCompressionSuccess === true
                                                ? "COMPRESSION CORRECTE"
                                                : lastCompressionSuccess === false
                                                  ? "RYTHME INCORRECT"
                                                  : "SUIVEZ LE RYTHME"
                                        }}
                                    </span>
                                </div>
                                <div class="text-sm">
                                    {{
                                        lastCompressionSuccess === true
                                            ? `+1 compression (${correctCompressions}/${requiredCompressions})`
                                            : lastCompressionSuccess === false
                                              ? "Continuez ! Appuyez quand le curseur est dans la zone rouge"
                                              : "Appuyez quand le curseur blanc traverse la zone rouge"
                                    }}
                                </div>
                            </div>
                            <div
                                v-else
                                key="feedback-idle"
                                class="text-center p-3 sm:p-4 rounded-lg border-2 border-gray-600 bg-gray-700/20 text-gray-400 text-sm"
                            >
                                Lancez le métronome avec
                                <span class="text-green-400 font-bold"
                                    >DÉBUT RCP</span
                                >, puis réalisez
                                {{ requiredCompressions }} compressions en
                                rythme.
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
                                    <!-- Le cœur bat au rythme du métronome : il est le plus gros au milieu du cycle -->
                                    <span
                                        class="inline-flex"
                                        :class="{
                                            'compression-pulse': isCompressing,
                                        }"
                                    >
                                        <Heart
                                            class="w-12 h-12 text-cyber-red"
                                            :class="{ heartbeat: isRunning }"
                                        />
                                    </span>

                                    <!-- Compression depth indicator -->
                                    <div
                                        v-if="isCompressing"
                                        class="absolute -bottom-3 left-1/2 transform -translate-x-1/2"
                                    >
                                        <div
                                            class="w-2 h-6 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"
                                        ></div>
                                    </div>

                                    <!-- Success/Error overlay : une seule impulsion par compression
                                         (clé par pression), pour ne pas masquer le cœur en continu -->
                                    <div
                                        v-if="lastCompressionSuccess !== null"
                                        :key="`ping-${feedbackKey}`"
                                        class="absolute inset-0 flex items-center justify-center pointer-events-none"
                                    >
                                        <div
                                            class="w-16 h-16 rounded-full flex items-center justify-center text-white feedback-ping"
                                            :class="
                                                lastCompressionSuccess === true
                                                    ? 'bg-green-500/80'
                                                    : 'bg-red-500/80'
                                            "
                                        >
                                            <Check
                                                v-if="lastCompressionSuccess === true"
                                                class="w-8 h-8"
                                            />
                                            <X v-else class="w-8 h-8" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Rhythm synchronizer -->
                            <div
                                ref="syncPanel"
                                class="bg-gray-900/50 border border-gray-600 rounded p-3 sm:p-4"
                            >
                                <div
                                    class="text-xs text-gray-400 font-tech mb-3 text-center"
                                >
                                    SYNCHRONISEUR RYTHMIQUE
                                </div>
                                <!-- La barre représente un cycle de 600 ms ; la zone rouge correspond exactement
                                     à la fenêtre acceptée (de 150 à 450 ms après chaque battement). -->
                                <div
                                    class="relative w-full max-w-xs h-8 mx-auto bg-gray-700 rounded-full overflow-hidden border border-gray-600"
                                >
                                    <!-- Remplissage bleu : avancement dans le cycle (sans transition) -->
                                    <div
                                        class="absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-cyber-blue/30 to-blue-400/40"
                                        :style="{
                                            transform: `scaleX(${beatProgress / 100})`,
                                        }"
                                    ></div>

                                    <!-- Zone rouge de tolérance = fenêtre de timing réelle -->
                                    <div
                                        class="absolute inset-y-0 z-10 rounded-full border"
                                        :class="
                                            isInBeatWindow
                                                ? 'bg-red-500/60 border-red-300 shadow-lg shadow-red-400/50'
                                                : 'bg-red-500/25 border-red-400/50'
                                        "
                                        :style="{
                                            left: `${zoneLeftPercent}%`,
                                            width: `${zoneWidthPercent}%`,
                                        }"
                                    ></div>

                                    <!-- Repère du moment idéal (milieu du cycle) -->
                                    <div
                                        class="absolute inset-y-0 left-1/2 z-10 flex items-center -translate-x-1/2"
                                    >
                                        <div
                                            class="w-3 h-3 bg-cyber-red rounded-full border-2 border-white shadow-lg transition-transform duration-100"
                                            :class="{
                                                'scale-150': isInBeatWindow,
                                            }"
                                        ></div>
                                    </div>

                                    <!-- Curseur : position exacte dans le cycle -->
                                    <div
                                        class="absolute inset-y-0 z-20 w-1 -ml-0.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                                        :style="{ left: `${beatProgress}%` }"
                                    ></div>
                                </div>
                                <div
                                    class="text-xs text-gray-500 mt-3 text-center font-tech"
                                >
                                    <span class="text-cyber-blue font-bold"
                                        >Appuyez sur ESPACE, ENTRÉE ou le bouton
                                        COMPRESSER</span
                                    >
                                    <span class="text-cyber-red font-bold">
                                        quand le curseur blanc traverse la zone
                                        rouge</span
                                    >
                                    <span class="block mt-1 text-gray-500"
                                        >Une manette ou un bouton USB fonctionne
                                        aussi. Une seule compression compte par
                                        cycle.</span
                                    >
                                </div>

                                <!-- Bouton tactile / souris -->
                                <button
                                    v-if="isRunning"
                                    ref="compressButton"
                                    type="button"
                                    class="compress-button mt-4 w-full px-3 py-5 sm:py-6 bg-cyber-red hover:bg-red-500 active:scale-95 text-white font-cyber font-bold text-lg sm:text-2xl rounded-lg transition-transform border-2 border-red-400 shadow-lg shadow-cyber-red/30 select-none flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3"
                                    @pointerdown.prevent="handleCompressPointer"
                                    @contextmenu.prevent
                                >
                                    <span class="flex items-center gap-2">
                                        <HeartPulse
                                            class="w-6 h-6 sm:w-7 sm:h-7 shrink-0"
                                        />
                                        COMPRESSER
                                    </span>
                                    <span
                                        class="text-sm sm:text-base font-tech opacity-80"
                                        >{{ correctCompressions }}/{{
                                            requiredCompressions
                                        }}</span
                                    >
                                </button>

                                <!-- Rythme visuel -->
                                <div class="mt-3 flex justify-center">
                                    <div class="flex gap-1">
                                        <div
                                            v-for="i in 4"
                                            :key="i"
                                            class="w-2 h-2 rounded-full transition-all duration-200"
                                            :class="{
                                                'bg-cyber-blue animate-pulse':
                                                    isBeating && i % 2 === 0,
                                                'bg-gray-500':
                                                    !isBeating || i % 2 === 1,
                                            }"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Contrôles médicaux -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            v-if="!isRunning"
                            type="button"
                            @click="startSimulation"
                            class="px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-cyber font-bold rounded-lg transition-all border border-green-500 shadow-lg hover:shadow-green-500/25"
                        >
                            <Play class="w-4 h-4 inline mr-2" />
                            DÉBUT RCP
                        </button>
                        <button
                            v-else
                            type="button"
                            @click="stopSimulation"
                            class="px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-cyber font-bold rounded-lg transition-all border border-red-500 shadow-lg hover:shadow-red-500/25"
                        >
                            <Square class="w-4 h-4 inline mr-2" />
                            ARRÊT URGENT
                        </button>
                        <button
                            type="button"
                            @click="resetSimulation"
                            class="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-cyber rounded-lg transition-all border border-gray-500 shadow-lg hover:shadow-gray-500/25"
                        >
                            <RotateCcw class="w-4 h-4 inline mr-2" />
                            RESET
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Patient stabilisé : récapitulatif pédagogique -->
        <div
            v-else
            class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-4 sm:p-6 scanline space-y-4 fade-in"
        >
            <div class="flex items-center gap-2">
                <CheckCircle class="w-6 h-6 text-cyber-green shrink-0" />
                <h3
                    class="font-cyber font-bold text-cyber-green text-lg sm:text-xl"
                >
                    PATIENT STABILISÉ
                </h3>
            </div>
            <p class="text-gray-300 text-sm sm:text-base">
                {{ requiredCompressions }} compressions au bon rythme : le sang a
                continué d'irriguer le cerveau jusqu'au choc du défibrillateur.
            </p>
            <div
                class="bg-gray-900/60 border border-cyber-blue/40 rounded-lg p-4"
            >
                <div class="flex items-center gap-2 mb-3">
                    <BookOpen class="w-4 h-4 text-cyber-blue shrink-0" />
                    <span class="font-cyber font-bold text-cyber-blue text-sm">
                        À RETENIR
                    </span>
                </div>
                <ul class="space-y-2 text-sm text-gray-300">
                    <li class="flex items-start gap-2">
                        <Phone class="w-4 h-4 text-cyber-blue shrink-0 mt-0.5" />
                        <span
                            ><strong class="text-white">Alerter :</strong> appelez
                            le 15 (SAMU) ou le 112.</span
                        >
                    </li>
                    <li class="flex items-start gap-2">
                        <HeartPulse
                            class="w-4 h-4 text-cyber-red shrink-0 mt-0.5"
                        />
                        <span
                            ><strong class="text-white">Masser :</strong> mains au
                            centre de la poitrine, bras tendus, enfoncez de 5 à
                            6 cm, 100 à 120 fois par minute, en laissant la
                            poitrine remonter entre chaque compression.</span
                        >
                    </li>
                    <li class="flex items-start gap-2">
                        <Zap class="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <span
                            ><strong class="text-white">Défibriller :</strong>
                            faites apporter un DAE (défibrillateur automatisé
                            externe), allumez-le et suivez ses instructions
                            vocales. Ne vous arrêtez qu'à l'arrivée des
                            secours.</span
                        >
                    </li>
                </ul>
                <p class="mt-3 text-xs text-gray-400">
                    Le saviez-vous ? En France, tout le monde peut utiliser un DAE,
                    même sans formation, et chaque minute sans massage fait perdre
                    environ 10 % de chances de survie.
                </p>
            </div>
        </div>

        <!-- Indices -->
        <div class="mt-8">
            <div
                class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-4 sm:p-6"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Lightbulb class="w-5 h-5 text-yellow-500" />
                    <h4 class="font-cyber font-bold text-yellow-500">INDICES</h4>
                </div>

                <div class="space-y-2 text-sm text-gray-300" aria-live="polite">
                    <div
                        v-for="(hint, i) in HINTS.slice(0, hintsShown)"
                        :key="i"
                        class="fade-in"
                    >
                        💡 {{ hint }}
                    </div>
                </div>

                <button
                    v-if="!puzzleSolved"
                    type="button"
                    @click="showHint"
                    :disabled="!hasMoreHints"
                    class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 disabled:border-gray-600 disabled:text-gray-500 disabled:hover:bg-transparent disabled:cursor-not-allowed font-tech text-sm rounded transition-all"
                >
                    {{
                        hasMoreHints
                            ? `AFFICHER UN INDICE (${HINTS.length - hintsShown} restant${HINTS.length - hintsShown > 1 ? "s" : ""})`
                            : "Plus d'indice disponible"
                    }}
                </button>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import {
    BookOpen,
    Check,
    CheckCircle,
    Heart,
    HeartPulse,
    Lightbulb,
    Monitor,
    Phone,
    Play,
    RotateCcw,
    Square,
    X,
    XCircle,
    Zap,
} from "lucide-vue-next";
import GameRoom from "../GameRoom.vue";
import { createFireworks } from "../../utils/fireworks";
import { useToast } from "../../composables/useToast";
import { useGameState } from "../../composables/useGameState";

const ROOM_ID = "heart";

const emit = defineEmits(["exit-room", "room-completed"]);
const { showSuccess, showError } = useToast();
const { gameState, addError, addHint, completeRoom, PENALTY_PER_ERROR } =
    useGameState();

const roomData = {
    title: "SALLE DU CŒUR",
    subtitle: "Arrêt cardiaque simulé",
    description:
        "Un patient fait un arrêt cardiaque ! Les secours (15 ou 112) sont prévenus et quelqu'un est parti chercher le défibrillateur (DAE). En attendant, réalisez 30 compressions thoraciques en rythme : le métronome bat à 100 compressions par minute (la recommandation est de 100 à 120 par minute).",
    objective: "Apprendre les gestes de premiers secours",
    icon: "heart",
    color: "#ff00ff",
};

const HINTS = [
    "Le massage cardiaque se pratique à 100-120 compressions par minute. Ici, le métronome bat à 100/min : une compression toutes les 0,6 seconde.",
    "Appuyez quand le curseur blanc traverse la zone rouge : elle couvre toute la moitié centrale de chaque cycle de 0,6 s (de 0,15 s à 0,45 s).",
    "Une seule compression compte par cycle : inutile de marteler la touche, et une pression hors de la zone rouge coûte une pénalité. Attendez le cycle suivant.",
    "Le cœur grossit et le pic de l'ECG apparaît pile au milieu de la zone rouge : appuyez à cet instant. Pour garder le rythme, pensez à « Stayin' Alive » des Bee Gees (environ 100 battements par minute).",
];

const requiredCompressions = 30;

// Rythme : 100 compressions/min = un battement toutes les 600 ms
const beatInterval = 600;
// Fenêtre acceptée : ±150 ms autour du milieu du cycle, soit de 150 à 450 ms après chaque battement
const beatWindow = 150;
const WINDOW_START = beatInterval / 2 - beatWindow;
const WINDOW_END = beatInterval / 2 + beatWindow;
// La zone rouge du synchroniseur est dessinée à partir de la même fenêtre (25 % → 75 % de la barre)
const zoneLeftPercent = (WINDOW_START / beatInterval) * 100;
const zoneWidthPercent = ((WINDOW_END - WINDOW_START) / beatInterval) * 100;
// Durée du « pic » ECG / des points de rythme, centrés sur le moment idéal (milieu de la zone rouge) :
// tous les repères visuels (curseur, cœur, ECG, points) désignent le même instant
const BEAT_FLASH_DURATION = 150;
const BEAT_FLASH_START = beatInterval / 2 - BEAT_FLASH_DURATION / 2;
const BEAT_FLASH_END = beatInterval / 2 + BEAT_FLASH_DURATION / 2;
const COMPRESS_ANIMATION_DURATION = 200;
const FEEDBACK_DURATION = 1000;

const correctCompressions = ref(0);
const puzzleSolved = ref(false);
// Garde : la salle ne peut être validée qu'une seule fois (touche répétée, manette, timers tardifs…)
const isCompleted = ref(false);
// Les indices déjà payés (même lors d'une visite précédente) sont réaffichés gratuitement
const hintsShown = ref(
    Math.min(HINTS.length, gameState.roomHints?.[ROOM_ID] || 0),
);
const hasMoreHints = computed(() => hintsShown.value < HINTS.length);
const isRunning = ref(false);
const isCompressing = ref(false);
const isBeating = ref(false);
const beatProgress = ref(0);
const isInBeatWindow = ref(false);
const lastCompressionSuccess = ref(null);
// Change à chaque compression pour rejouer l'animation de flash du bloc de statut
const feedbackKey = ref(0);
const compressButton = ref(null);
const syncPanel = ref(null);

const progressPercent = computed(() =>
    Math.round((correctCompressions.value / requiredCompressions) * 100),
);
const performanceDots = computed(() =>
    Math.ceil((correctCompressions.value / requiredCompressions) * 5),
);
const minimumRemainingSeconds = computed(() =>
    Math.ceil(
        ((requiredCompressions - correctCompressions.value) * beatInterval) /
            1000,
    ),
);

let simulationStart = 0;
let lastJudgedBeat = -1;
let animationFrameId = null;
let compressTimer = null;
let feedbackTimer = null;
let lastGamepadPressed = false;
let gamepadAvailable = true;
// Dernier mode d'interaction : un bouton focalisé au clavier (Tab) doit pouvoir réagir à Entrée/Espace,
// alors qu'un bouton resté focalisé après un clic souris ne doit pas voler les compressions.
let lastInteraction = "keyboard";

// Le temps est calculé depuis une origine fixe : pas de dérive, le rythme reste exactement à 100/min
const getElapsed = (now) => Math.max(0, now - simulationStart);
const getPhase = (now) => getElapsed(now) % beatInterval;
const getBeatIndex = (now) => Math.floor(getElapsed(now) / beatInterval);
const isInWindow = (phase) => phase >= WINDOW_START && phase <= WINDOW_END;

const cancelLoop = () => {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
};

const clearFeedbackTimers = () => {
    clearTimeout(compressTimer);
    compressTimer = null;
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
};

// Gamepad API : absente hors contexte sécurisé (http://IP) ou bloquée par une Permissions-Policy
const isAnyGamepadButtonPressed = () => {
    if (!gamepadAvailable) return false;
    if (
        typeof navigator === "undefined" ||
        typeof navigator.getGamepads !== "function"
    ) {
        gamepadAvailable = false;
        return false;
    }
    let gamepads;
    try {
        gamepads = navigator.getGamepads() || [];
    } catch {
        gamepadAvailable = false;
        return false;
    }
    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad?.buttons?.some((button) => button.pressed)) return true;
    }
    return false;
};

// Une fenêtre modale (briefing, profil…) est ouverte par-dessus la salle : aucune compression
const isModalOpen = () => !!document.querySelector('[aria-modal="true"]');

// Front montant sur l'ensemble des manettes : maintenir un bouton ne compte qu'une fois
const pollGamepads = () => {
    const pressed = isAnyGamepadButtonPressed();
    if (pressed && !lastGamepadPressed && !isModalOpen()) triggerCompression();
    lastGamepadPressed = pressed;
};

const tick = () => {
    animationFrameId = null;
    if (!isRunning.value) return;

    const phase = getPhase(performance.now());
    beatProgress.value = (phase / beatInterval) * 100;
    isInBeatWindow.value = isInWindow(phase);
    isBeating.value = phase >= BEAT_FLASH_START && phase < BEAT_FLASH_END;

    pollGamepads();

    if (isRunning.value) animationFrameId = requestAnimationFrame(tick);
};

const startSimulation = async () => {
    if (isRunning.value || isCompleted.value) return;

    // Le bouton DÉBUT RCP disparaît : on évite qu'un élément garde le focus et capte Espace/Entrée
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }

    correctCompressions.value = 0;
    lastCompressionSuccess.value = null;
    lastJudgedBeat = -1;
    // Un bouton de manette déjà enfoncé au démarrage ne compte pas comme compression
    lastGamepadPressed = isAnyGamepadButtonPressed();
    simulationStart = performance.now();
    isRunning.value = true;
    animationFrameId = requestAnimationFrame(tick);

    await nextTick();
    syncPanel.value?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
};

const stopSimulation = () => {
    isRunning.value = false;
    cancelLoop();
    clearFeedbackTimers();
    isCompressing.value = false;
    isBeating.value = false;
    beatProgress.value = 0;
    isInBeatWindow.value = false;
    lastCompressionSuccess.value = null;
};

const resetSimulation = () => {
    stopSimulation();
    correctCompressions.value = 0;
};

const completeSimulation = () => {
    if (isCompleted.value) return;
    isCompleted.value = true;
    stopSimulation();
    puzzleSolved.value = true;

    // Synchrone et une seule fois (contrat des salles)
    completeRoom(ROOM_ID);
    emit("room-completed", ROOM_ID);

    // App quitte la salle dès l'événement : le message à retenir passe aussi par le toast
    createFireworks(3000);
    showSuccess(
        "PATIENT SAUVÉ !",
        "Massage réussi : le sang a irrigué le cerveau jusqu'au choc du défibrillateur. À retenir : appeler le 15 ou le 112, masser (5 à 6 cm, 100 à 120 par minute), défibriller avec un DAE.",
        7000,
    );
};

const triggerCompression = () => {
    if (!isRunning.value || isCompleted.value) return;

    const now = performance.now();
    const beat = getBeatIndex(now);
    // Une seule compression évaluée par battement : marteler la touche ne rapporte rien
    if (beat === lastJudgedBeat) return;
    lastJudgedBeat = beat;

    const isCorrectTiming = isInWindow(getPhase(now));

    isCompressing.value = true;
    clearTimeout(compressTimer);
    compressTimer = setTimeout(() => {
        compressTimer = null;
        isCompressing.value = false;
    }, COMPRESS_ANIMATION_DURATION);

    lastCompressionSuccess.value = isCorrectTiming;
    feedbackKey.value++;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
        feedbackTimer = null;
        lastCompressionSuccess.value = null;
    }, FEEDBACK_DURATION);

    if (isCorrectTiming) {
        correctCompressions.value++;
        if (correctCompressions.value >= requiredCompressions) {
            completeSimulation();
        }
    } else {
        addError(ROOM_ID);
        showError(
            "RYTHME INCORRECT",
            `Compression hors de la zone rouge. Continuez ! +${PENALTY_PER_ERROR}s de pénalité`,
            3000,
        );
    }
};

const handleCompressPointer = (event) => {
    // Souris : bouton principal uniquement (le tactile et le stylet arrivent avec button = 0)
    if (event.pointerType === "mouse" && event.button !== 0) return;
    triggerCompression();
};

const showHint = () => {
    if (puzzleSolved.value || !hasMoreHints.value) return;
    hintsShown.value++;
    const alreadyPaid = gameState.roomHints?.[ROOM_ID] || 0;
    if (hintsShown.value > alreadyPaid) addHint(ROOM_ID);

    // Pendant le massage, le bouton (même activé au clavier) ne doit pas garder le focus :
    // sinon l'Espace suivant, destiné à une compression, achèterait un autre indice
    if (isRunning.value && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
};

const TEXT_ENTRY_SELECTOR =
    'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const MODAL_SELECTOR = '[role="dialog"], [aria-modal="true"]';
const CONTROL_SELECTOR =
    'button, a[href], summary, [role="button"], [role="link"]';

const isCompressionKey = (event) =>
    event.code === "Space" ||
    event.code === "Enter" ||
    event.code === "NumpadEnter" ||
    event.key === " " ||
    event.key === "Enter";

// Compression uniquement sur keydown (jamais keyup), sans répétition automatique
const handleKeyDown = (event) => {
    if (event.key === "Tab") {
        lastInteraction = "keyboard";
        return;
    }
    if (!isRunning.value || isCompleted.value) return;
    if (!isCompressionKey(event)) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const target = event.target instanceof Element ? event.target : null;
    // Saisie de texte ou fenêtre modale (même si le focus est resté hors de la modale) : on ne capture rien
    if (target?.closest(TEXT_ENTRY_SELECTOR) || target?.closest(MODAL_SELECTOR)) {
        return;
    }
    if (isModalOpen()) return;
    const control = target?.closest(CONTROL_SELECTOR);
    const isOtherControl = !!control && control !== compressButton.value;
    // Bouton atteint au clavier (ARRÊT URGENT, RESET, RETOUR…) : il réagit normalement
    if (isOtherControl && lastInteraction === "keyboard") return;

    // Évite le défilement de la page et l'activation d'un bouton resté focalisé après un clic
    event.preventDefault();
    if (isOtherControl) control.blur();
    if (event.repeat) return;

    triggerCompression();
};

const handlePointerDown = () => {
    lastInteraction = "pointer";
};

onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown, true);
});

onUnmounted(() => {
    stopSimulation();
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("pointerdown", handlePointerDown, true);
});
</script>

<style scoped>
/* Animations de feedback (restaurées) */
@keyframes heartbeat {
    0%,
    100% {
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
    0%,
    100% {
        background-color: rgba(34, 197, 94, 0.1);
        border-color: rgb(34, 197, 94);
    }
    50% {
        background-color: rgba(34, 197, 94, 0.3);
        border-color: rgb(34, 197, 94);
    }
}

@keyframes errorFlash {
    0%,
    100% {
        background-color: rgba(239, 68, 68, 0.1);
        border-color: rgb(239, 68, 68);
    }
    50% {
        background-color: rgba(239, 68, 68, 0.3);
        border-color: rgb(239, 68, 68);
    }
}

/* Même période que le métronome (600 ms) : le cœur est le plus gros au milieu du cycle */
.heartbeat {
    animation: heartbeat 0.6s ease-in-out infinite;
}

.compression-pulse {
    animation: compressionPulse 0.2s ease-in-out;
}

/* Pastille ✓ / ✗ : une impulsion unique qui s'efface (le cœur reste visible ensuite) */
@keyframes feedbackPing {
    0% {
        transform: scale(1);
        opacity: 0.9;
    }
    100% {
        transform: scale(1.8);
        opacity: 0;
    }
}

.feedback-ping {
    animation: feedbackPing 0.6s cubic-bezier(0, 0, 0.2, 1) forwards;
}

.success-flash {
    animation: successFlash 0.5s ease-in-out;
}

.error-flash {
    animation: errorFlash 0.5s ease-in-out;
}

/* Bouton tactile : pas de zoom au double-tap, pas de surbrillance ni de menu contextuel */
.compress-button {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
}
</style>
