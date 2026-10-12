<template>
    <div class="min-h-screen bg-gray-900 relative">
        <!-- Header avec compte à rebours et compteurs -->
        <header
            class="bg-gray-800/90 backdrop-blur-md border-b-2 border-cyber-blue px-3 py-3 sm:p-4"
        >
            <div
                class="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2"
            >
                <div class="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button
                        type="button"
                        @click="$emit('exit-room')"
                        class="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 font-tech text-sm rounded transition-all"
                    >
                        <ArrowLeft class="w-4 h-4" />
                        RETOUR
                    </button>
                    <div
                        class="hidden sm:block truncate text-cyber-blue font-cyber font-bold text-lg"
                    >
                        {{ roomData.title }}
                    </div>
                </div>

                <!-- Statistiques compactes (cliquables) -->
                <button
                    type="button"
                    @click="toggleStatsMenu"
                    :aria-expanded="isStatsExpanded"
                    aria-controls="room-stats-panel"
                    title="Afficher le détail des statistiques"
                    class="ml-auto flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-700/50 hover:bg-gray-600/50 border rounded-lg transition-all cursor-pointer"
                    :class="
                        isCritical
                            ? 'border-cyber-red/70 hover:border-cyber-red'
                            : 'border-gray-600 hover:border-cyber-blue'
                    "
                >
                    <div class="flex flex-col items-start leading-tight">
                        <span
                            class="text-[10px] font-tech whitespace-nowrap"
                            :class="isOvertime ? 'text-cyber-red' : 'text-gray-400'"
                        >
                            {{ countdownLabel }}
                        </span>
                        <span
                            class="font-tech font-bold tabular-nums whitespace-nowrap"
                            :class="countdownValueClass"
                        >
                            {{ countdownValue }}
                        </span>
                    </div>
                    <div class="flex items-center gap-1 sm:gap-2" title="Erreurs">
                        <span class="text-gray-400" aria-hidden="true">❌</span>
                        <span class="sr-only">Erreurs :</span>
                        <span class="font-tech text-red-500 font-bold">
                            {{ gameState.errors }}
                        </span>
                    </div>
                    <div
                        class="flex items-center gap-1 sm:gap-2"
                        title="Indices utilisés"
                    >
                        <span class="text-gray-400" aria-hidden="true">💡</span>
                        <span class="sr-only">Indices :</span>
                        <span class="font-tech text-yellow-500 font-bold">
                            {{ gameState.hintsUsed }}
                        </span>
                    </div>
                    <ChevronUp
                        v-if="isStatsExpanded"
                        class="w-4 h-4 text-cyber-blue shrink-0"
                    />
                    <ChevronDown v-else class="w-4 h-4 text-cyber-blue shrink-0" />
                </button>
            </div>
        </header>

        <!-- Menu détaillé des statistiques -->
        <transition name="expand">
            <div
                v-if="isStatsExpanded"
                id="room-stats-panel"
                class="bg-gray-800/95 backdrop-blur-md border-b-2 border-cyber-blue p-3 sm:p-4"
            >
                <div class="max-w-7xl mx-auto">
                    <div
                        class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"
                    >
                        <!-- Compte à rebours de la mission -->
                        <div
                            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 rounded-lg p-3 sm:p-4"
                            :class="
                                isCritical
                                    ? 'bg-cyber-red/10 border border-cyber-red/40'
                                    : 'bg-gray-700/30'
                            "
                        >
                            <div class="flex items-center gap-2">
                                <Hourglass
                                    class="w-5 h-5 shrink-0"
                                    :class="isCritical ? 'text-cyber-red' : 'text-cyber-blue'"
                                />
                                <span class="font-tech text-sm text-gray-400">{{
                                    isOvertime ? "Temps dépassé" : "Temps restant"
                                }}</span>
                            </div>
                            <span
                                class="font-cyber text-lg font-bold tabular-nums"
                                :class="countdownValueClass"
                            >
                                {{ countdownValue }}
                            </span>
                        </div>

                        <!-- Temps écoulé -->
                        <div
                            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-gray-700/30 rounded-lg p-3 sm:p-4"
                        >
                            <div class="flex items-center gap-2">
                                <Clock class="w-5 h-5 text-cyber-blue shrink-0" />
                                <span class="font-tech text-sm text-gray-400"
                                    >Temps écoulé</span
                                >
                            </div>
                            <span
                                class="font-cyber text-lg text-cyber-blue font-bold tabular-nums"
                            >
                                {{ formatTime(gameState.timer) }}
                            </span>
                        </div>

                        <!-- Erreurs détaillé -->
                        <div
                            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-gray-700/30 rounded-lg p-3 sm:p-4"
                        >
                            <div class="flex items-center gap-2">
                                <XCircle class="w-5 h-5 text-red-500 shrink-0" />
                                <span class="font-tech text-sm text-gray-400"
                                    >Erreurs</span
                                >
                            </div>
                            <span
                                class="font-cyber text-lg text-red-500 font-bold"
                            >
                                {{ gameState.errors }}
                            </span>
                        </div>

                        <!-- Indices détaillé -->
                        <div
                            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 bg-gray-700/30 rounded-lg p-3 sm:p-4"
                        >
                            <div class="flex items-center gap-2">
                                <Lightbulb class="w-5 h-5 text-yellow-500 shrink-0" />
                                <span class="font-tech text-sm text-gray-400"
                                    >Indices utilisés</span
                                >
                            </div>
                            <span
                                class="font-cyber text-lg text-yellow-500 font-bold"
                            >
                                {{ gameState.hintsUsed }}
                            </span>
                        </div>

                        <!-- Équipe -->
                        <div
                            class="col-span-2 lg:col-span-1 flex items-center justify-between gap-2 bg-gray-700/30 rounded-lg p-3 sm:p-4"
                        >
                            <div class="flex items-center gap-2">
                                <Users class="w-5 h-5 text-cyber-green shrink-0" />
                                <span class="font-tech text-sm text-gray-400"
                                    >Équipe</span
                                >
                            </div>
                            <span
                                class="font-tech text-sm text-cyber-green truncate max-w-[60%]"
                                :title="gameState.teamName"
                            >
                                {{ gameState.teamName }}
                            </span>
                        </div>
                    </div>

                    <!-- Pénalités et temps total (si pénalités > 0) -->
                    <div
                        v-if="gameState.penaltyTime > 0"
                        class="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                    >
                        <div
                            class="flex items-center justify-between bg-orange-900/20 border border-orange-500/30 rounded-lg p-3 sm:p-4"
                        >
                            <div class="flex items-center gap-2">
                                <AlertTriangle class="w-5 h-5 text-orange-500" />
                                <span class="font-tech text-sm text-gray-400"
                                    >Pénalités</span
                                >
                            </div>
                            <span
                                class="font-cyber text-lg text-orange-500 font-bold"
                            >
                                +{{ formatTime(gameState.penaltyTime) }}
                            </span>
                        </div>

                        <div
                            class="flex items-center justify-between bg-cyber-red/20 border border-cyber-red/30 rounded-lg p-3 sm:p-4"
                        >
                            <div class="flex items-center gap-2">
                                <Timer class="w-5 h-5 text-cyber-red" />
                                <span
                                    class="font-tech text-sm text-gray-300 font-bold"
                                    >Temps total</span
                                >
                            </div>
                            <span
                                class="font-cyber text-xl text-cyber-red font-bold"
                            >
                                {{ formatTime(getTotalTime()) }}
                            </span>
                        </div>
                    </div>

                    <!-- Règles de la note -->
                    <p class="mt-3 text-xs font-tech text-gray-400 leading-relaxed">
                        Note sur {{ MAX_SCORE }} : rapidité {{ MAX_TIME_SCORE }} pts
                        (pleine jusqu'à {{ fullScoreMinutes }} min, nulle à
                        {{ missionMinutes }} min), erreurs {{ MAX_ERROR_SCORE }} pts
                        (chaque erreur retire {{ errorPointPenalty }} pt et ajoute
                        {{ PENALTY_PER_ERROR }} s au temps), indices
                        {{ MAX_HINT_SCORE }} pts (chaque indice retire
                        {{ PENALTY_PER_HINT }} pt).
                    </p>

                    <!-- Détails par salle (si salles complétées) -->
                    <div
                        v-if="gameState.completedRooms.length > 0"
                        class="mt-4"
                    >
                        <div
                            class="text-xs font-tech text-gray-400 mb-3 font-bold"
                        >
                            DÉTAILS PAR SALLE
                        </div>
                        <div
                            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                        >
                            <div
                                v-for="room in gameState.completedRooms"
                                :key="room"
                                class="bg-gray-800/40 rounded-lg p-3"
                            >
                                <div
                                    class="flex items-center justify-between mb-2"
                                >
                                    <span
                                        class="text-xs font-tech text-gray-300 font-bold"
                                    >
                                        {{ getRoomName(room) }}
                                    </span>
                                    <span
                                        class="text-xs font-tech text-gray-500"
                                    >
                                        {{
                                            formatTime(
                                                gameState.roomTimes[room] || 0,
                                            )
                                        }}
                                    </span>
                                </div>
                                <div class="flex gap-3 text-xs">
                                    <span class="text-red-400">
                                        ❌ {{ gameState.roomErrors[room] || 0 }}
                                    </span>
                                    <span class="text-yellow-400">
                                        💡 {{ gameState.roomHints[room] || 0 }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Contenu de la salle (marge basse : le panneau audio fixe, en bas à gauche, ne masque jamais
             les derniers champs ou boutons de la salle une fois la page défilée jusqu'en bas) -->
        <main class="p-4 pb-24 sm:p-8 sm:pb-56 2xl:pb-8">
            <div class="max-w-6xl mx-auto">
                <!-- Description de la salle -->
                <div class="mb-6 sm:mb-8">
                    <div
                        class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-4 sm:p-6 scanline"
                    >
                        <div class="flex items-start gap-3 sm:gap-4">
                            <div
                                class="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-lg flex items-center justify-center"
                                :style="`background-color: ${roomData.color}20; border: 2px solid ${roomData.color};`"
                            >
                                <component
                                    :is="getIconComponent(roomData.icon)"
                                    class="w-6 h-6 sm:w-8 sm:h-8"
                                    :style="`color: ${roomData.color};`"
                                />
                            </div>
                            <div class="flex-1 min-w-0">
                                <h1
                                    class="text-xl sm:text-3xl font-cyber font-bold mb-2 break-words"
                                    :style="`color: ${roomData.color};`"
                                >
                                    {{ roomData.title }}
                                </h1>
                                <p
                                    class="text-base sm:text-lg font-tech text-gray-400 mb-3"
                                >
                                    {{ roomData.subtitle }}
                                </p>
                                <p
                                    class="text-sm sm:text-base text-gray-300 leading-relaxed mb-4"
                                >
                                    {{ roomData.description }}
                                </p>
                                <div class="flex flex-wrap items-center gap-2">
                                    <span
                                        class="px-3 py-1 border border-cyber-blue text-cyber-blue font-tech text-sm rounded"
                                    >
                                        OBJECTIF
                                    </span>
                                    <span class="text-sm text-gray-400">{{
                                        roomData.objective
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenu spécifique de la salle -->
                <slot></slot>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useGameState } from "../composables/useGameState";
import {
    MISSION_DURATION,
    TIME_FULL_SCORE,
    PENALTY_PER_ERROR,
    PENALTY_PER_HINT,
    ERROR_POINT_PENALTY,
    MAX_TIME_SCORE,
    MAX_ERROR_SCORE,
    MAX_HINT_SCORE,
    MAX_SCORE,
} from "../utils/scoring";
import {
    ArrowLeft,
    Clock,
    Hourglass,
    XCircle,
    Lightbulb,
    Users,
    AlertTriangle,
    Timer,
    ChevronDown,
    ChevronUp,
    Server,
    Dna,
    ScanLine,
    Heart,
    Volume2,
    HeartPulse,
    Settings,
    Eye,
    ShieldCheck,
} from "lucide-vue-next";

defineProps({
    roomData: {
        type: Object,
        required: true,
    },
});

defineEmits(["exit-room"]);

const gameStateApi = useGameState();
const { gameState, formatTime, getTotalTime } = gameStateApi;

// Seuil sous lequel le compte à rebours passe au rouge (10 minutes)
const CRITICAL_TIME = 10 * 60;

// Temps restant de la mission (négatif = temps dépassé)
const remainingTime = computed(() =>
    typeof gameStateApi.getRemainingTime === "function"
        ? gameStateApi.getRemainingTime()
        : MISSION_DURATION - getTotalTime(),
);
const isOvertime = computed(() => remainingTime.value <= 0);
const isCritical = computed(() => remainingTime.value < CRITICAL_TIME);

// Format mm:ss (les minutes peuvent dépasser 59 : 60:00 au départ)
const formatClock = (seconds) => {
    const s = Math.floor(Math.abs(Number(seconds) || 0));
    const minutes = Math.floor(s / 60);
    const secs = s % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const countdownLabel = computed(() =>
    isOvertime.value ? "TEMPS DÉPASSÉ" : "TEMPS RESTANT",
);
const countdownValue = computed(() =>
    isOvertime.value
        ? `+${formatClock(remainingTime.value)}`
        : formatClock(remainingTime.value),
);
const countdownValueClass = computed(() =>
    isCritical.value ? "text-cyber-red" : "text-cyber-blue",
);

const missionMinutes = Math.round(MISSION_DURATION / 60);
const fullScoreMinutes = Math.round(TIME_FULL_SCORE / 60);
const errorPointPenalty = ERROR_POINT_PENALTY.toLocaleString("fr-FR");

// État du menu des statistiques
const isStatsExpanded = ref(false);

const toggleStatsMenu = () => {
    isStatsExpanded.value = !isStatsExpanded.value;
};

const getRoomName = (roomId) => {
    const names = {
        server: "SERVEUR",
        "dna-lab": "LAB ADN",
        imaging: "IMAGERIE",
        heart: "CŒUR",
        prosthesis: "PROTHÈSES",
        pathology: "PATHOLOGIE",
        audition: "AUDITION",
        eye: "YEUX",
        final: "SALLE FINALE",
    };
    return names[roomId] || roomId;
};

// Mapping des icônes
const iconMap = {
    server: Server,
    dna: Dna,
    "scan-line": ScanLine,
    scan: ScanLine,
    heart: Heart,
    "volume-2": Volume2,
    "heart-pulse": HeartPulse,
    settings: Settings,
    eye: Eye,
    "shield-check": ShieldCheck,
};

// Fonction pour obtenir le composant d'icône
const getIconComponent = (iconName) => {
    return iconMap[iconName] || Server;
};
</script>

<style scoped>
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

/* Animation pour le menu des statistiques */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
    max-height: 1200px;
    opacity: 1;
}
</style>
