<template>
    <div
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
    >
        <div
            class="bg-gray-900/95 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-4 md:p-6 max-w-5xl w-full h-[90vh] flex flex-col scanline"
            role="dialog"
            aria-modal="true"
            aria-labelledby="final-score-title"
        >
            <!-- Header (fixe) -->
            <div class="text-center mb-3 md:mb-6 flex-shrink-0">
                <div class="flex items-center justify-center gap-3 mb-2 md:mb-4">
                    <Trophy class="w-6 h-6 md:w-8 md:h-8 text-cyber-blue flex-shrink-0" />
                    <h1
                        id="final-score-title"
                        class="text-2xl md:text-4xl font-cyber font-bold text-cyber-blue"
                    >
                        SCORE FINAL
                    </h1>
                </div>
                <div class="text-cyber-green font-tech text-base md:text-lg break-words">
                    Équipe : {{ result.teamName }}
                </div>
                <div
                    v-if="result.players.length"
                    class="text-gray-400 font-tech text-xs md:text-sm truncate"
                    :title="result.players.join(', ')"
                >
                    {{ result.players.length > 1 ? "Agents" : "Agent" }} :
                    {{ result.players.join(", ") }}
                </div>
            </div>

            <!-- Contenu scrollable -->
            <div class="flex-1 min-h-0 overflow-y-auto px-1 md:px-2 space-y-6 custom-scrollbar">
                <!-- Score principal -->
                <div class="text-center">
                    <div
                        class="text-5xl sm:text-6xl md:text-8xl font-cyber font-bold text-cyber-blue mb-3 md:mb-4"
                    >
                        {{ formatNote(result.score) }}/{{ MAX_SCORE }}
                    </div>
                    <div
                        class="text-xl md:text-2xl font-cyber font-bold mb-2"
                        :class="scoreColor"
                    >
                        {{ appreciation.label }} {{ appreciation.emoji }}
                    </div>
                    <div class="text-gray-300 font-tech text-sm md:text-base">
                        {{ appreciation.message }}
                    </div>
                </div>

                <!-- Sauvegarde du score -->
                <div
                    v-if="saveInfo"
                    class="rounded-lg border p-3 md:p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                    :class="saveInfo.boxClass"
                    role="status"
                    aria-live="polite"
                >
                    <div class="flex items-start gap-3 flex-1 min-w-0">
                        <component
                            :is="saveInfo.icon"
                            class="w-5 h-5 flex-shrink-0 mt-0.5"
                            :class="[saveInfo.textClass, { 'animate-spin': saveInfo.spin }]"
                        />
                        <div class="min-w-0">
                            <p
                                class="font-cyber font-bold text-sm"
                                :class="saveInfo.textClass"
                            >
                                {{ saveInfo.title }}
                            </p>
                            <p class="text-gray-300 font-tech text-xs md:text-sm">
                                {{ saveInfo.message }}
                            </p>
                        </div>
                    </div>
                    <button
                        v-if="saveInfo.canRetry"
                        type="button"
                        @click="requestSave"
                        :disabled="retryLocked"
                        class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-cyber-blue hover:bg-cyber-blue/80 disabled:opacity-60 disabled:cursor-wait text-black font-cyber font-bold rounded-lg transition-all text-xs md:text-sm flex-shrink-0"
                    >
                        <Save class="w-4 h-4 flex-shrink-0" />
                        SAUVEGARDER MON SCORE
                    </button>
                </div>

                <!-- Message de fin de mission -->
                <div class="text-center">
                    <div
                        class="bg-gray-800/50 border rounded-lg p-4 md:p-6"
                        :class="mission.borderClass"
                    >
                        <div
                            class="flex items-center justify-center gap-3 mb-4"
                        >
                            <div
                                class="w-3 h-3 rounded-full animate-pulse flex-shrink-0"
                                :class="mission.dotClass"
                            ></div>
                            <h2
                                class="text-base md:text-lg font-bold font-tech"
                                :class="mission.textClass"
                            >
                                {{ mission.status }}
                            </h2>
                        </div>

                        <div
                            class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed"
                        >
                            <p :class="mission.textClass">
                                <span class="font-bold">{{ mission.headline }}</span>
                            </p>

                            <p>{{ mission.body }}</p>

                            <div
                                class="rounded p-4 mt-4 text-left"
                                :class="mission.boxClass"
                            >
                                <p
                                    class="font-bold mb-2"
                                    :class="mission.textClass"
                                >
                                    STATUT DE LA MISSION :
                                </p>
                                <div class="space-y-2 text-xs">
                                    <div
                                        v-for="item in mission.checklist"
                                        :key="item.label"
                                        class="flex items-center gap-2"
                                    >
                                        <div
                                            class="w-2 h-2 rounded-full flex-shrink-0"
                                            :class="item.ok ? 'bg-cyber-green' : 'bg-yellow-400'"
                                        ></div>
                                        <span
                                            :class="item.ok ? 'text-cyber-green' : 'text-yellow-400'"
                                            >{{ item.label }}</span
                                        >
                                    </div>
                                </div>
                            </div>

                            <p
                                class="text-center font-bold mt-4"
                                :class="mission.textClass"
                            >
                                {{ mission.closing }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Détails des scores -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Score Rapidité -->
                    <div
                        class="bg-gray-800/50 border border-cyber-blue/30 rounded-lg p-4"
                    >
                        <div class="flex items-center gap-2 mb-3">
                            <Clock class="w-5 h-5 text-cyber-blue flex-shrink-0" />
                            <h3
                                class="font-cyber font-bold text-cyber-blue text-sm"
                            >
                                RAPIDITÉ
                            </h3>
                            <span
                                v-if="timeExceeded"
                                class="ml-auto px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-tech text-[10px] font-bold"
                            >
                                TEMPS DÉPASSÉ
                            </span>
                        </div>
                        <div
                            class="text-2xl md:text-3xl font-cyber font-bold text-cyber-blue mb-2"
                        >
                            {{ formatNote(result.timeScore) }}/{{ MAX_TIME_SCORE }}
                        </div>
                        <div class="text-xs text-gray-400 font-tech space-y-0.5">
                            <div>Temps total : {{ formatTime(result.duration) }}</div>
                            <div v-if="result.penaltyTime > 0">
                                ({{ formatTime(result.realTime) }} de jeu +
                                {{ formatTime(result.penaltyTime) }} de pénalités)
                            </div>
                        </div>
                    </div>

                    <!-- Score Précision -->
                    <div
                        class="bg-gray-800/50 border border-red-500/30 rounded-lg p-4"
                    >
                        <div class="flex items-center gap-2 mb-3">
                            <Target class="w-5 h-5 text-red-500 flex-shrink-0" />
                            <h3
                                class="font-cyber font-bold text-red-500 text-sm"
                            >
                                PRÉCISION
                            </h3>
                        </div>
                        <div
                            class="text-2xl md:text-3xl font-cyber font-bold text-red-500 mb-2"
                        >
                            {{ formatNote(result.errorScore) }}/{{ MAX_ERROR_SCORE }}
                        </div>
                        <div class="text-xs text-gray-400 font-tech">
                            Erreurs : {{ result.errors }}
                        </div>
                    </div>

                    <!-- Score Autonomie -->
                    <div
                        class="bg-gray-800/50 border border-yellow-500/30 rounded-lg p-4"
                    >
                        <div class="flex items-center gap-2 mb-3">
                            <Lightbulb class="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <h3
                                class="font-cyber font-bold text-yellow-500 text-sm"
                            >
                                AUTONOMIE
                            </h3>
                        </div>
                        <div
                            class="text-2xl md:text-3xl font-cyber font-bold text-yellow-500 mb-2"
                        >
                            {{ formatNote(result.hintScore) }}/{{ MAX_HINT_SCORE }}
                        </div>
                        <div class="text-xs text-gray-400 font-tech">
                            Indices : {{ result.hints }}
                        </div>
                    </div>
                </div>

                <!-- Statistiques par salle -->
                <div>
                    <h3
                        class="text-lg md:text-xl font-cyber font-bold text-white mb-4 flex items-center gap-2"
                    >
                        <BarChart3 class="w-5 h-5 text-cyber-green flex-shrink-0" />
                        STATISTIQUES PAR SALLE
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div
                            v-for="room in roomStats"
                            :key="room.id"
                            class="bg-gray-800/40 rounded-lg p-3 border-l-2"
                            :style="{ borderLeftColor: room.color }"
                        >
                            <div class="flex items-center justify-between gap-2 mb-2">
                                <span
                                    class="font-cyber font-bold text-gray-300 text-xs md:text-sm flex items-center gap-2 min-w-0"
                                >
                                    <component
                                        :is="room.icon"
                                        class="w-4 h-4 flex-shrink-0"
                                        :style="{ color: room.color }"
                                    />
                                    <span class="truncate">{{ room.title }}</span>
                                </span>
                                <span class="font-tech text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                                    <Timer class="w-3 h-3" />
                                    {{ formatTime(room.time) }}
                                </span>
                            </div>
                            <div class="flex gap-4 text-xs font-tech">
                                <span class="text-red-400 flex items-center gap-1">
                                    <XCircle class="w-3 h-3" />
                                    {{ plural(room.errors, "erreur") }}
                                </span>
                                <span class="text-yellow-400 flex items-center gap-1">
                                    <Lightbulb class="w-3 h-3" />
                                    {{ plural(room.hints, "indice") }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Débriefing pédagogique -->
                <div>
                    <h3
                        class="text-lg md:text-xl font-cyber font-bold text-white mb-2 flex items-center gap-2"
                    >
                        <GraduationCap class="w-5 h-5 text-cyber-blue flex-shrink-0" />
                        DÉBRIEFING DE MISSION
                    </h3>
                    <p class="text-gray-400 font-tech text-xs md:text-sm mb-4">
                        Ce que vous avez appris dans chaque salle, et comment
                        l'utiliser dans la vraie vie.
                    </p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <article
                            v-for="(room, index) in debriefing"
                            :key="room.id"
                            class="bg-gray-800/40 border border-gray-700 rounded-lg p-4"
                        >
                            <h4
                                class="font-cyber font-bold text-sm mb-3 flex items-center gap-2"
                                :style="{ color: room.color }"
                            >
                                <component :is="room.icon" class="w-4 h-4 flex-shrink-0" />
                                <span>{{ index + 1 }}. {{ room.title }}</span>
                            </h4>
                            <div class="space-y-2 text-xs md:text-sm font-tech leading-relaxed">
                                <p class="text-gray-300">
                                    <span class="flex items-center gap-1 text-cyber-blue font-bold mb-0.5">
                                        <BookOpen class="w-3.5 h-3.5 flex-shrink-0" />
                                        Ce que vous avez appris
                                    </span>
                                    {{ room.learned }}
                                </p>
                                <p class="text-gray-300">
                                    <span class="flex items-center gap-1 text-cyber-green font-bold mb-0.5">
                                        <ShieldCheck class="w-3.5 h-3.5 flex-shrink-0" />
                                        Dans la vraie vie
                                    </span>
                                    {{ room.realLife }}
                                </p>
                            </div>
                        </article>
                    </div>
                    <div
                        class="mt-3 bg-cyber-blue/10 border border-cyber-blue/30 rounded-lg p-4 text-xs md:text-sm font-tech text-gray-300 leading-relaxed"
                    >
                        <span class="font-cyber font-bold text-cyber-blue">À RETENIR :</span>
                        dans un hôpital connecté, la santé des patients dépend
                        aussi de la sécurité informatique. Mots de passe solides,
                        mises à jour, vigilance face à l'hameçonnage et respect du
                        secret médical protègent autant que les bons gestes
                        médicaux.
                    </div>
                </div>

                <!-- Barème explicatif -->
                <div
                    class="bg-gray-800/30 border border-gray-600 rounded-lg p-4"
                >
                    <h4 class="font-cyber font-bold text-gray-300 mb-3 text-sm">
                        BARÈME DE NOTATION
                    </h4>
                    <ul class="text-xs text-gray-400 font-tech space-y-1 mb-4">
                        <li>
                            <span class="text-cyber-blue font-bold">Rapidité /{{ MAX_TIME_SCORE }}</span> :
                            note pleine jusqu'à {{ TIME_FULL_SCORE / 60 }} min, puis
                            baisse jusqu'à 0 à {{ MISSION_DURATION / 60 }} min
                            (chaque erreur ajoute {{ PENALTY_PER_ERROR }} s).
                        </li>
                        <li>
                            <span class="text-red-500 font-bold">Précision /{{ MAX_ERROR_SCORE }}</span> :
                            −{{ formatDecimal(ERROR_POINT_PENALTY) }} point par erreur.
                        </li>
                        <li>
                            <span class="text-yellow-500 font-bold">Autonomie /{{ MAX_HINT_SCORE }}</span> :
                            −{{ formatDecimal(PENALTY_PER_HINT) }} point par indice.
                        </li>
                    </ul>
                    <div class="grid grid-cols-3 gap-3 md:gap-4 text-xs">
                        <div
                            v-for="tier in scale"
                            :key="tier.range"
                            class="text-center rounded py-1"
                            :class="{ 'bg-gray-700/60 ring-1 ring-gray-500': tier.current }"
                        >
                            <div class="font-cyber font-bold" :class="tier.colorClass">
                                {{ tier.range }}
                            </div>
                            <div class="text-gray-400">{{ tier.label }} {{ tier.emoji }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions (fixes en bas) -->
            <div
                class="grid grid-cols-2 grid-flow-row-dense sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3 pt-3 md:pt-4 border-t border-gray-700 flex-shrink-0 mt-3 md:mt-4"
            >
                <button
                    type="button"
                    @click="$emit('restart')"
                    class="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-6 py-2 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all text-xs sm:text-sm"
                >
                    <RotateCcw class="w-4 h-4 flex-shrink-0" />
                    RECOMMENCER
                </button>
                <button
                    type="button"
                    @click="generateDiploma"
                    :disabled="isGeneratingDiploma"
                    class="col-span-2 w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-6 py-2 bg-yellow-500 hover:bg-yellow-500/80 disabled:opacity-60 disabled:cursor-wait text-black font-cyber font-bold rounded-lg transition-all text-xs sm:text-sm"
                >
                    <Loader2 v-if="isGeneratingDiploma" class="w-4 h-4 flex-shrink-0 animate-spin" />
                    <Download v-else class="w-4 h-4 flex-shrink-0" />
                    {{ isGeneratingDiploma ? "GÉNÉRATION..." : `TÉLÉCHARGER ${diplomaWording.buttonLabel}` }}
                </button>
                <button
                    type="button"
                    @click="$emit('close')"
                    class="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-6 py-2 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 font-cyber font-bold rounded-lg transition-all text-xs sm:text-sm"
                >
                    <X class="w-4 h-4 flex-shrink-0" />
                    FERMER
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from "vue";
import {
    Trophy,
    Clock,
    Target,
    Lightbulb,
    BarChart3,
    BookOpen,
    GraduationCap,
    ShieldCheck,
    Timer,
    XCircle,
    Save,
    Download,
    RotateCcw,
    X,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    LogIn,
    ShieldAlert,
    Server,
    Dna,
    ScanLine,
    Heart,
    Settings,
    HeartPulse,
    Volume2,
    Eye,
} from "lucide-vue-next";
import { ROOMS_CONFIG } from "../config/roomsConfig";
import {
    computeScoreBreakdown,
    getAppreciation,
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
import { useToast } from "../composables/useToast";

const GAME_NAME = "Cyber-Hôpital – Mission Résilience";

const props = defineProps({
    // Instantané immuable construit par App.vue à la fin de la partie
    scoreData: {
        type: Object,
        required: true,
    },
    // 'pending' | 'saved' | 'failed' | 'unauthenticated' | 'devtools'
    saveStatus: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(["close", "restart", "retry-save"]);

const { showError } = useToast();

// ---------------------------------------------------------------------------
// Données normalisées (repli propre si un champ de l'instantané manque)
// ---------------------------------------------------------------------------
const firstNumber = (...values) => {
    for (const value of values) {
        if (value === undefined || value === null || value === "") continue;
        const n = Number(value);
        if (Number.isFinite(n)) return n;
    }
    return undefined;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const countersOf = (value) =>
    value && typeof value === "object" && !Array.isArray(value) ? value : {};

const result = computed(() => {
    const data = props.scoreData || {};
    const errors = Math.max(0, Math.round(firstNumber(data.errors) ?? 0));
    const hints = Math.max(0, Math.round(firstNumber(data.hints, data.hintsUsed) ?? 0));
    const penaltyTime = Math.max(0, firstNumber(data.penaltyTime) ?? errors * PENALTY_PER_ERROR);
    const realFromData = firstNumber(data.realTime, data.timer);
    const duration = Math.max(
        0,
        firstNumber(data.duration, data.totalTime) ?? (realFromData ?? 0) + penaltyTime,
    );
    const realTime = Math.max(0, realFromData ?? duration - penaltyTime);
    const breakdown = computeScoreBreakdown({ totalTime: duration, errors, hints });

    const players = Array.isArray(data.players)
        ? data.players
              .map((player) => (typeof player === "string" ? player : player?.name || ""))
              .map((name) => String(name).trim())
              .filter(Boolean)
        : [];

    return {
        score: clamp(firstNumber(data.score) ?? breakdown.total, 0, MAX_SCORE),
        timeScore: clamp(firstNumber(data.timeScore) ?? breakdown.timeScore, 0, MAX_TIME_SCORE),
        errorScore: clamp(firstNumber(data.errorScore) ?? breakdown.errorScore, 0, MAX_ERROR_SCORE),
        hintScore: clamp(firstNumber(data.hintScore) ?? breakdown.hintScore, 0, MAX_HINT_SCORE),
        duration,
        realTime,
        penaltyTime,
        errors,
        hints,
        completed: data.completed !== false,
        roomsCompleted: firstNumber(data.roomsCompleted) ?? ROOMS_CONFIG.length,
        teamName: String(data.teamName || "").trim() || "Équipe sans nom",
        players,
        roomTimes: countersOf(data.roomTimes),
        roomErrors: countersOf(data.roomErrors),
        roomHints: countersOf(data.roomHints),
    };
});

const appreciation = computed(() => getAppreciation(result.value.score));
const timeExceeded = computed(() => result.value.duration > MISSION_DURATION);

// ---------------------------------------------------------------------------
// Formatage
// ---------------------------------------------------------------------------
const formatTime = (seconds) => {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

// Note affichée au format "x.x" (ex. 13.5/20)
const formatNote = (value) => (Math.round((Number(value) || 0) * 10) / 10).toFixed(1);

const formatDecimal = (value) => String(value).replace(".", ",");

const plural = (count, word) => {
    const n = Number(count) || 0;
    return `${n} ${word}${n > 1 ? "s" : ""}`;
};

const scoreColor = computed(() => {
    const score = result.value.score;
    if (score >= 18) return "text-cyber-blue";
    if (score >= 16) return "text-cyber-green";
    if (score >= 14) return "text-yellow-500";
    if (score >= 12) return "text-orange-500";
    if (score >= 10) return "text-red-500";
    return "text-red-600";
});

// Barème (libellés issus de getAppreciation pour rester synchronisés)
const scale = computed(() =>
    [
        { range: "18-20", min: 18, max: Infinity, colorClass: "text-cyber-blue" },
        { range: "16-18", min: 16, max: 18, colorClass: "text-cyber-green" },
        { range: "14-16", min: 14, max: 16, colorClass: "text-yellow-500" },
        { range: "12-14", min: 12, max: 14, colorClass: "text-orange-500" },
        { range: "10-12", min: 10, max: 12, colorClass: "text-red-500" },
        { range: "0-10", min: 0, max: 10, colorClass: "text-red-600" },
    ].map((tier) => ({
        ...tier,
        ...getAppreciation(tier.min),
        current: result.value.score >= tier.min && result.value.score < tier.max,
    })),
);

// ---------------------------------------------------------------------------
// Sauvegarde du score
// ---------------------------------------------------------------------------
const saveInfo = computed(() => {
    switch (props.saveStatus) {
        // null : score restauré après un rechargement, envoi sur le point de démarrer
        case null:
        case "pending":
            return {
                icon: Loader2,
                spin: true,
                title: "SAUVEGARDE EN COURS...",
                message: "Enregistrement de votre score dans le classement.",
                boxClass: "bg-cyber-blue/10 border-cyber-blue/40",
                textClass: "text-cyber-blue",
            };
        case "saved":
            return {
                icon: CheckCircle2,
                title: "SCORE SAUVEGARDÉ",
                message: "Votre note est enregistrée : retrouvez-la dans SCORES > CLASSEMENT.",
                boxClass: "bg-cyber-green/10 border-cyber-green/40",
                textClass: "text-cyber-green",
            };
        case "failed":
            return {
                icon: AlertTriangle,
                title: "SAUVEGARDE ÉCHOUÉE",
                message: "Le score n'a pas pu être enregistré (serveur injoignable ?). Vous pouvez réessayer.",
                boxClass: "bg-red-500/10 border-red-500/40",
                textClass: "text-red-400",
                canRetry: true,
            };
        case "unauthenticated":
            return {
                icon: LogIn,
                title: "SCORE NON SAUVEGARDÉ",
                message: "Connectez-vous (ou créez un compte) pour enregistrer votre note dans le classement.",
                boxClass: "bg-yellow-500/10 border-yellow-500/40",
                textClass: "text-yellow-400",
                canRetry: true,
            };
        case "devtools":
            return {
                icon: ShieldAlert,
                title: "SCORE NON ENREGISTRÉ",
                message: "Partie jouée avec les outils de développement : elle ne compte pas dans le classement.",
                boxClass: "bg-gray-700/40 border-gray-500/40",
                textClass: "text-gray-300",
            };
        default:
            return null;
    }
});

// Anti double-clic : une seule demande tant que le statut n'a pas changé (ou 1,5 s au plus)
const retryLocked = ref(false);
let retryUnlockTimer = null;

const unlockRetry = () => {
    retryLocked.value = false;
    clearTimeout(retryUnlockTimer);
    retryUnlockTimer = null;
};

watch(() => props.saveStatus, unlockRetry);
onUnmounted(unlockRetry);

const requestSave = () => {
    if (retryLocked.value || props.saveStatus === "pending" || props.saveStatus === null) return;
    retryLocked.value = true;
    retryUnlockTimer = setTimeout(unlockRetry, 1500);
    emit("retry-save");
};

// ---------------------------------------------------------------------------
// Message de fin de mission (toutes les salles terminées = mission accomplie)
// ---------------------------------------------------------------------------
const mission = computed(() => {
    const { score, completed, players } = result.value;
    // Une équipe par défaut (liste des joueurs absente) : pluriel
    const agents = players.length === 1 ? "agent" : "agents";
    const roomCount = ROOMS_CONFIG.length;

    const checklist = completed
        ? [
              { label: "Cyberattaque repoussée", ok: true },
              { label: `${roomCount} salles sécurisées`, ok: true },
              { label: "Patients sauvés", ok: true },
          ]
        : [
              { label: `${result.value.roomsCompleted}/${roomCount} salles sécurisées`, ok: false },
          ];

    if (timeExceeded.value) {
        checklist.push({
            label: `Temps de mission dépassé (${MISSION_DURATION / 60} min) : note de rapidité à 0`,
            ok: false,
        });
    }

    const success = {
        borderClass: "border-cyber-green/30",
        dotClass: "bg-cyber-green",
        textClass: "text-cyber-green",
        boxClass: "bg-cyber-green/10 border border-cyber-green/30",
    };
    const narrow = {
        borderClass: "border-yellow-500/30",
        dotClass: "bg-yellow-400",
        textClass: "text-yellow-400",
        boxClass: "bg-yellow-500/10 border border-yellow-500/30",
    };

    if (!completed) {
        return {
            ...narrow,
            status: "MISSION INTERROMPUE",
            headline: `Mission interrompue, ${agents}.`,
            body: "Toutes les salles n'ont pas encore été sécurisées. Reprenez la mission pour terminer le travail !",
            checklist,
            closing: "Les patients comptent sur vous : retentez la mission.",
        };
    }

    if (score >= 14) {
        return {
            ...success,
            status: "MISSION ACCOMPLIE - CYBERATTAQUE REPOUSSÉE",
            headline: `Excellent travail, ${agents} !`,
            body: `Vous avez repoussé la cyberattaque et sécurisé les ${roomCount} salles de l'hôpital. Les patients ont été sauvés grâce à votre expertise.`,
            checklist,
            closing: `Mission accomplie avec succès, ${agents}. L'hôpital vous doit une fière chandelle !`,
        };
    }

    if (score >= 10) {
        return {
            ...success,
            status: "MISSION ACCOMPLIE - CYBERATTAQUE REPOUSSÉE",
            headline: `Mission réussie, ${agents} !`,
            body: "La cyberattaque est repoussée et les systèmes hospitaliers sont rétablis. Quelques minutes, erreurs ou indices vous ont coûté des points : vous pouvez encore progresser.",
            checklist,
            closing: "L'hôpital vous remercie. Visez une note encore meilleure la prochaine fois !",
        };
    }

    return {
        ...narrow,
        status: "MISSION ACCOMPLIE DE JUSTESSE",
        headline: `Mission accomplie, mais de justesse, ${agents}.`,
        body: `Les ${roomCount} salles sont sécurisées et les patients sont hors de danger, mais l'attaque a duré longtemps : le temps, les erreurs et les indices ont fait baisser votre note.`,
        checklist,
        closing: "Relisez le débriefing ci-dessous et retentez la mission pour décrocher une meilleure note !",
    };
});

// ---------------------------------------------------------------------------
// Salles : statistiques et débriefing (ordre et noms de roomsConfig)
// ---------------------------------------------------------------------------
const ROOM_ICONS = {
    server: Server,
    dna: Dna,
    "scan-line": ScanLine,
    heart: Heart,
    settings: Settings,
    "heart-pulse": HeartPulse,
    "volume-2": Volume2,
    eye: Eye,
    "shield-check": ShieldCheck,
};

const DEBRIEFING = {
    server: {
        learned:
            "Base64 est un encodage, pas un chiffrement : n'importe qui peut le décoder sans clé. Les données de santé doivent être réellement chiffrées (par exemple avec AES) et ne jamais apparaître en clair dans les journaux (logs).",
        realLife:
            "Un message « codé » n'est pas forcément protégé. Utilisez un mot de passe long et différent pour chaque compte, activez la double authentification et vérifiez le cadenas HTTPS avant de saisir des informations personnelles. Bonus : on peut donner son sang dès 18 ans, à partir de 50 kg.",
    },
    "dna-lab": {
        learned:
            "Les bases de l'ADN s'apparient toujours de la même façon (A avec T, C avec G) et l'information génétique se lit par codons de 3 bases, chacun correspondant à un acide aminé.",
        realLife:
            "Vos données génétiques sont uniques et définitives : contrairement à un mot de passe, impossible de les changer en cas de fuite. Réfléchissez avant d'envoyer votre ADN à un site de tests en ligne et vérifiez qui pourra accéder aux résultats.",
    },
    imaging: {
        learned:
            "L'IRM utilise un aimant puissant et des ondes radio, sans rayons X. Elle découpe le corps en fines coupes qu'il faut lire dans le bon ordre pour reconstituer l'organe.",
        realLife:
            "Une image médicale mélangée ou modifiée peut fausser un diagnostic : l'intégrité des données compte autant que leur confidentialité. Ne publiez jamais vos examens médicaux sur les réseaux sociaux et partagez-les via des outils sécurisés (par exemple Mon espace santé).",
    },
    heart: {
        learned:
            "Face à un arrêt cardiaque : alerter (15 ou 112), masser (mains au centre de la poitrine, 5 à 6 cm de profondeur, 100 à 120 compressions par minute) et défibriller avec un DAE.",
        realLife:
            "Chaque minute sans massage fait perdre environ 10 % de chances de survie. Repérez les défibrillateurs autour de vous : tout le monde a le droit de les utiliser, même sans formation. Une formation aux gestes qui sauvent (PSC1) ne dure qu'une journée.",
    },
    prosthesis: {
        learned:
            "En marchant, le genou fléchit d'environ 15 à 20° pendant l'appui et de 60 à 70° pendant l'oscillation. Les prothèses à microprocesseur mesurent ces angles en continu et ajustent leur résistance à chaque pas.",
        realLife:
            "Ces prothèses sont des objets connectés médicaux : un réglage piraté peut faire chuter le patient. Chez vous aussi, changez le mot de passe par défaut de vos objets connectés (box, caméra, montre) et installez leurs mises à jour.",
    },
    pathology: {
        learned:
            "Pour associer une maladie à son traitement, on repère l'organe ou la cible visée (artères, sucre sanguin, bronches, estomac…). Un traitement de fond contrôle une maladie chronique comme l'hypertension, le diabète ou l'asthme, sans la guérir.",
        realLife:
            "N'arrêtez ou ne modifiez jamais un traitement sans avis médical, ne partagez pas vos médicaments et méfiez-vous des « remèdes miracles » vendus en ligne. Les antibiotiques agissent contre les bactéries, pas contre les virus.",
    },
    audition: {
        learned:
            "Le stéthoscope sert à ausculter : un cœur normal bat régulièrement (60 à 100 fois par minute au repos), un sifflement à l'expiration (sibilant) signale des bronches rétrécies comme dans l'asthme, et les acouphènes sont des bruits perçus sans source extérieure.",
        realLife:
            "Les sons trop forts détruisent définitivement les cellules ciliées de l'oreille interne. Baissez le volume de votre casque, faites des pauses et portez des bouchons d'oreilles en concert ou en soirée.",
    },
    eye: {
        learned:
            "L'acuité visuelle se mesure ligne par ligne sur une échelle (Snellen, ou Monoyer en France : 10/10 = vision normale). Les planches d'Ishihara dépistent les troubles de la vision des couleurs, qui touchent environ 8 % des hommes et 0,5 % des femmes.",
        realLife:
            "Faites contrôler votre vue régulièrement et reposez vos yeux devant les écrans (règle 20-20-20 : toutes les 20 minutes, regardez à 6 mètres pendant 20 secondes). Quand vous créez une affiche ou un site, ne transmettez jamais une information uniquement par la couleur.",
    },
    final: {
        learned:
            "Un diagnostic se construit à partir des symptômes et des examens, et le traitement doit viser la bonne cause. Le dossier médical doit ensuite être protégé : chiffrement, sauvegarde et vérification de son intégrité.",
        realLife:
            "Les cyberattaques contre les hôpitaux commencent souvent par un e-mail piégé (hameçonnage). Vérifiez l'expéditeur, n'ouvrez pas un lien ou une pièce jointe inattendus, signalez les messages suspects et faites des sauvegardes régulières.",
    },
};

const roomStats = computed(() =>
    ROOMS_CONFIG.map((room) => ({
        id: room.id,
        title: room.title,
        color: room.color,
        icon: ROOM_ICONS[room.icon] || ShieldCheck,
        time: Number(result.value.roomTimes[room.id]) || 0,
        errors: Number(result.value.roomErrors[room.id]) || 0,
        hints: Number(result.value.roomHints[room.id]) || 0,
    })),
);

const debriefing = ROOMS_CONFIG.map((room) => ({
    id: room.id,
    title: room.title,
    color: room.color,
    icon: ROOM_ICONS[room.icon] || ShieldCheck,
    learned: DEBRIEFING[room.id]?.learned || room.objective || room.description || "",
    realLife:
        DEBRIEFING[room.id]?.realLife ||
        "Gardez les bons réflexes : protégez vos données de santé et vérifiez vos sources.",
}));

// ---------------------------------------------------------------------------
// Diplôme PDF (polices standard jsPDF : encodage WinAnsi uniquement)
// ---------------------------------------------------------------------------
const isGeneratingDiploma = ref(false);

const getDiplomaWording = (score) => {
    if (score >= 16) {
        return {
            title: "DIPLÔME D'HONNEUR",
            intro: "Ce diplôme certifie que l'équipe",
            sentence: "a brillamment mené à bien la mission avec la note de",
            closing: "Félicitations pour votre excellent travail et votre sens de la cybersécurité !",
            buttonLabel: "LE DIPLÔME",
            filePrefix: "diplome",
        };
    }
    if (score >= 10) {
        return {
            title: "DIPLÔME DE MISSION",
            intro: "Ce diplôme certifie que l'équipe",
            sentence: "a mené à bien la mission avec la note de",
            closing:
                score >= 14
                    ? "Bravo pour votre travail d'équipe et votre vigilance face aux cybermenaces !"
                    : "Mission réussie ! Avec un peu d'entraînement, vous ferez encore mieux.",
            buttonLabel: "LE DIPLÔME",
            filePrefix: "diplome",
        };
    }
    return {
        title: "ATTESTATION DE PARTICIPATION",
        intro: "Cette attestation certifie que l'équipe",
        sentence: `a terminé les ${ROOMS_CONFIG.length} salles de la mission avec la note de`,
        closing: "Merci pour votre engagement : retentez la mission pour améliorer votre note !",
        buttonLabel: "L'ATTESTATION",
        filePrefix: "attestation",
    };
};

const diplomaWording = computed(() => getDiplomaWording(result.value.score));

// Caractères WinAnsi au-delà de Latin-1 (gérés par les polices standard de jsPDF)
const WINANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";

const isPdfSafeChar = (char) => {
    const code = char.codePointAt(0);
    return (
        (code >= 0x20 && code <= 0x7e) ||
        (code >= 0xa0 && code <= 0xff) ||
        WINANSI_EXTRA.includes(char)
    );
};

// Garde les accents pris en charge, simplifie les autres (ğ → g) et retire émojis / symboles
const toPdfText = (value) => {
    let output = "";
    for (const char of String(value ?? "").normalize("NFC")) {
        if (isPdfSafeChar(char)) {
            output += char;
            continue;
        }
        const base = char.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (base && base !== char && [...base].every(isPdfSafeChar)) {
            output += base;
        } else if (/\s/.test(char)) {
            output += " ";
        }
    }
    return output.replace(/\s+/g, " ").trim();
};

// Tronque une ligne avec "…" pour qu'elle tienne dans maxWidth (police courante)
const truncateToWidth = (doc, text, maxWidth) => {
    if (doc.getTextWidth(text) <= maxWidth) return text;
    let truncated = text;
    while (truncated.length > 1 && doc.getTextWidth(`${truncated}…`) > maxWidth) {
        truncated = truncated.slice(0, -1);
    }
    return `${truncated.trimEnd()}…`;
};

// Réduit la taille de police puis passe sur plusieurs lignes si nécessaire
const fitText = (doc, text, maxWidth, { maxSize, minSize, maxLines }) => {
    for (let size = maxSize; size >= minSize; size -= 1) {
        doc.setFontSize(size);
        if (doc.getTextWidth(text) <= maxWidth) return { lines: [text], size };
    }
    doc.setFontSize(minSize);
    let lines = doc.splitTextToSize(text, maxWidth);
    if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        lines[maxLines - 1] = `${lines[maxLines - 1]}…`;
    }
    return { lines: lines.map((line) => truncateToWidth(doc, line, maxWidth)), size: minSize };
};

const toFileSlug = (value) =>
    String(value || "")
        .toLowerCase()
        .replace(/œ/g, "oe")
        .replace(/æ/g, "ae")
        .replace(/ß/g, "ss")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 40) || "equipe";

// Charge une image et lit ses dimensions naturelles (pour conserver ses proportions)
const loadImage = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
    const size = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => reject(new Error("Image illisible"));
        img.src = dataUrl;
    });
    return { dataUrl, ...size };
};

const generateDiploma = async () => {
    if (isGeneratingDiploma.value) return;
    isGeneratingDiploma.value = true;

    try {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
        const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm
        const centerX = pageWidth / 2;
        const textMaxWidth = pageWidth - 97; // ~200 mm, loin du cadre
        const data = result.value;
        const wording = diplomaWording.value;
        const blue = [0, 102, 204];

        // Couleur de fond
        doc.setFillColor(245, 245, 245);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        // Cadre officiel double (intérieur : 18 → pageHeight - 18)
        doc.setLineWidth(3);
        doc.setDrawColor(...blue);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
        doc.setLineWidth(1);
        doc.rect(18, 18, pageWidth - 36, pageHeight - 36);

        // Titre
        doc.setFont("helvetica", "bold");
        doc.setFontSize(30);
        doc.setTextColor(...blue);
        doc.text(wording.title, centerX, 38, { align: "center" });

        // Nom du jeu
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text("Escape Game Numérique", centerX, 49, { align: "center" });
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text(`« ${GAME_NAME} »`, centerX, 60, { align: "center" });

        // Ligne décorative supérieure
        doc.setLineWidth(0.5);
        doc.setDrawColor(...blue);
        doc.line(80, 67, pageWidth - 80, 67);

        // Texte officiel
        doc.setFont("helvetica", "normal");
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.text(wording.intro, centerX, 80, { align: "center" });

        // Nom de l'équipe (émojis retirés, taille adaptée, 2 lignes max)
        const teamName = toPdfText(data.teamName) || "Équipe sans nom";
        doc.setFont("times", "italic");
        doc.setTextColor(...blue);
        const team = fitText(doc, teamName, textMaxWidth, { maxSize: 26, minSize: 16, maxLines: 2 });
        doc.setFontSize(team.size);
        if (team.lines.length === 1) {
            doc.text(team.lines[0], centerX, 94, { align: "center" });
        } else {
            doc.text(team.lines[0], centerX, 88, { align: "center" });
            doc.text(team.lines[1], centerX, 95, { align: "center" });
        }

        // Ligne décorative sous le nom
        doc.setLineWidth(0.5);
        doc.line(centerX - 60, 100, centerX + 60, 100);

        // Membres de l'équipe
        const players = data.players.map(toPdfText).filter(Boolean);
        if (players.length) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(90, 90, 90);
            const label = `${players.length > 1 ? "Agents" : "Agent"} : ${players.join(", ")}`;
            doc.text(truncateToWidth(doc, label, textMaxWidth), centerX, 107, { align: "center" });
        }

        // Phrase adaptée à la note
        doc.setFont("helvetica", "normal");
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.text(wording.sentence, centerX, 119, { align: "center" });

        // Note
        doc.setFont("helvetica", "bold");
        doc.setFontSize(30);
        doc.setTextColor(...blue);
        doc.text(`${formatNote(data.score)}/${MAX_SCORE}`, centerX, 134, { align: "center" });

        // Appréciation (sans émoji : non pris en charge par les polices standard)
        doc.setFontSize(16);
        doc.text(toPdfText(appreciation.value.label), centerX, 145, { align: "center" });

        // Phrase de conclusion (s'arrête bien avant la signature)
        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(truncateToWidth(doc, wording.closing, 170), centerX, 154, { align: "center" });

        // Bas de page à gauche : résumé et date
        const dateStr = new Date().toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(
            `Temps : ${formatTime(data.duration)} · Erreurs : ${data.errors} · Indices : ${data.hints}`,
            30,
            pageHeight - 32,
        );
        doc.text(toPdfText(`Fait le ${dateStr}`), 30, pageHeight - 25);

        // Signature à droite : libellé au-dessus, image dans une boîte qui ne touche ni le texte ni le cadre
        const signatureCenterX = pageWidth - 65;
        doc.text("Le Directeur de l'Hôpital", signatureCenterX, pageHeight - 48, { align: "center" });

        try {
            const signature = await loadImage(`${import.meta.env.BASE_URL || "/"}Signature.png`);
            const boxTop = pageHeight - 45; // 165 mm
            const maxWidth = 40;
            const maxHeight = 23; // bas de l'image à 188 mm, cadre intérieur à 192 mm
            const ratio =
                signature.width > 0 && signature.height > 0
                    ? Math.min(maxWidth / signature.width, maxHeight / signature.height)
                    : 0;
            if (ratio > 0) {
                const width = signature.width * ratio;
                const height = signature.height * ratio;
                doc.addImage(
                    signature.dataUrl,
                    "PNG",
                    signatureCenterX - width / 2,
                    boxTop,
                    width,
                    height,
                );
            }
        } catch (error) {
            console.warn("Signature indisponible pour le diplôme:", error?.message || error);
        }

        doc.save(`${wording.filePrefix}_${toFileSlug(data.teamName)}.pdf`);
    } catch (error) {
        console.error("Erreur génération diplôme:", error);
        showError("ERREUR", "Impossible de générer le document PDF. Réessayez.");
    } finally {
        isGeneratingDiploma.value = false;
    }
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
    pointer-events: none;
}

@keyframes scan {
    0% {
        left: -100%;
    }
    100% {
        left: 100%;
    }
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.5);
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.5);
    border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.8);
}
</style>
