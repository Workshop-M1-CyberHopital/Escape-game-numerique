<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Instructions -->
        <div
            class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-4 sm:p-6 scanline"
        >
            <div class="flex items-center gap-2 mb-4">
                <HeartPulse class="w-5 h-5 text-cyber-red shrink-0" />
                <h3 class="font-cyber font-bold text-cyber-red">
                    DIAGNOSTIC MÉDICAL URGENT
                </h3>
            </div>
            <p class="text-gray-300 mb-3">
                Associez chaque pathologie à son traitement : glissez-la sur le
                bon traitement, ou sélectionnez-la (clic, toucher, ou Tab puis
                Entrée au clavier) puis choisissez son traitement.
                <span class="text-cyber-red font-bold">ATTENTION :</span>
                une erreur (+{{ PENALTY_PER_ERROR }} s de pénalité) vous
                obligera à tout recommencer !
            </p>
            <p
                role="status"
                aria-live="polite"
                class="text-sm font-tech"
                :class="statusClass"
            >
                {{ statusMessage }}
            </p>
        </div>

        <!-- Zone de jeu principale - Layout côte à côte -->
        <div
            class="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 pb-8"
            @keydown.esc="clearSelection"
        >
            <!-- Pathologies à gauche -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-6">
                    <AlertTriangle class="w-5 h-5 text-cyber-blue shrink-0" />
                    <h4 class="font-cyber font-bold text-cyber-blue">
                        PATHOLOGIES
                    </h4>
                </div>

                <div class="space-y-4">
                    <div
                        v-for="(pathology, index) in pathologies"
                        :key="`pathology-${pathology.id}`"
                        role="button"
                        :tabindex="pathology.matched ? -1 : 0"
                        :aria-pressed="selectedPathologyId === pathology.id ? 'true' : 'false'"
                        :aria-disabled="pathology.matched || isLocked ? 'true' : 'false'"
                        class="pathology-card border-2 rounded-lg p-3 sm:p-4 transition-all duration-300 select-none"
                        :class="{
                            'border-cyber-green bg-cyber-green/10 opacity-50 is-matched': pathology.matched,
                            'border-cyber-red bg-cyber-red/10': !pathology.matched && pathology.error,
                            'border-cyber-blue/50 bg-gray-700/50': !pathology.matched && !pathology.error,
                            'cursor-pointer hover:border-cyber-blue hover:bg-cyber-blue/10': !pathology.matched && !isLocked,
                            'is-selected': selectedPathologyId === pathology.id,
                            'is-dragging': draggedPathologyId === pathology.id,
                            'is-locked': isLocked && !pathology.matched
                        }"
                        :draggable="!pathology.matched && !isLocked"
                        @click="selectPathology(pathology)"
                        @keydown.enter.prevent="onCardKey($event, () => selectPathology(pathology))"
                        @keydown.space.prevent="onCardKey($event, () => selectPathology(pathology))"
                        @dragstart="handleDragStart($event, pathology)"
                        @dragend="handleDragEnd"
                    >
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 shrink-0 rounded-full bg-cyber-blue/20 flex items-center justify-center">
                                <span class="text-cyber-blue font-bold text-sm">{{ index + 1 }}</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h5 class="font-bold text-white mb-1 break-words hyphens-auto">{{ pathology.name }}</h5>
                                <p class="text-sm text-gray-400 break-words">{{ pathology.description }}</p>
                            </div>
                            <div v-if="pathology.matched" class="text-cyber-green shrink-0">
                                <Check class="w-5 h-5" />
                            </div>
                            <div v-else-if="pathology.error" class="text-cyber-red shrink-0">
                                <X class="w-5 h-5" />
                            </div>
                            <div v-else class="text-gray-400 shrink-0">
                                <GripVertical class="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Traitements à droite -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2" :class="selectedPathology ? 'mb-2' : 'mb-6'">
                    <Pill class="w-5 h-5 text-cyber-green shrink-0" />
                    <h4 class="font-cyber font-bold text-cyber-green">
                        TRAITEMENTS
                    </h4>
                </div>
                <p
                    v-if="selectedPathology"
                    class="text-xs font-tech text-cyber-yellow mb-4 break-words"
                >
                    Traitement pour : <span class="font-bold">{{ selectedPathology.name }}</span>
                </p>

                <div class="space-y-4">
                    <div
                        v-for="(cure, index) in shuffledCures"
                        :key="`cure-${cure.id}`"
                        role="button"
                        :tabindex="cure.matched ? -1 : 0"
                        :aria-disabled="cure.matched || isLocked ? 'true' : 'false'"
                        class="cure-card border-2 rounded-lg p-3 sm:p-4 transition-all duration-300 select-none"
                        :class="{
                            'border-cyber-blue bg-cyber-blue/10 is-matched': cure.matched,
                            'border-cyber-red bg-cyber-red/10': !cure.matched && cure.error,
                            'border-dashed border-cyber-green/50 bg-gray-700/50': !cure.matched && !cure.error,
                            'cursor-pointer': !cure.matched && !isLocked,
                            'can-drop': isTargetable(cure),
                            'drag-over': dragOverCureId === cure.id,
                            'is-locked': isLocked && !cure.matched
                        }"
                        @click="placeOnCure(cure)"
                        @keydown.enter.prevent="onCardKey($event, () => placeOnCure(cure))"
                        @keydown.space.prevent="onCardKey($event, () => placeOnCure(cure))"
                        @dragenter="handleDragEnter($event, cure)"
                        @dragover="handleDragOver($event, cure)"
                        @dragleave="handleDragLeave($event, cure)"
                        @drop="handleDrop($event, cure)"
                    >
                        <!-- pointer-events-none : seule la carte reçoit les événements de drag (pas de clignotement sur les enfants) -->
                        <div class="flex items-center gap-3 pointer-events-none">
                            <div class="w-8 h-8 shrink-0 rounded-full bg-cyber-green/20 flex items-center justify-center">
                                <span class="text-cyber-green font-bold text-sm">{{ String.fromCharCode(65 + index) }}</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <h5 class="font-bold text-white mb-1 break-words hyphens-auto">{{ cure.name }}</h5>
                                <p class="text-sm text-gray-400 break-words">{{ cure.description }}</p>
                            </div>
                            <div v-if="cure.matched" class="text-cyber-blue shrink-0">
                                <Check class="w-5 h-5" />
                            </div>
                            <div v-else-if="cure.error" class="text-cyber-red shrink-0">
                                <X class="w-5 h-5" />
                            </div>
                            <div v-else class="text-gray-400 shrink-0">
                                <Plus class="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Progression -->
        <div
            class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-yellow rounded-lg p-4 sm:p-6 scanline"
        >
            <div class="flex items-center gap-2 mb-4">
                <Target class="w-5 h-5 text-cyber-yellow shrink-0" />
                <h4 class="font-cyber font-bold text-cyber-yellow">
                    PROGRESSION DU DIAGNOSTIC
                </h4>
            </div>

            <div class="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                    <div class="text-2xl font-bold text-cyber-green">{{ correctMatches }}</div>
                    <div class="text-sm text-gray-400">Diagnostics corrects</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-cyber-red">{{ roomErrors }}</div>
                    <div class="text-sm text-gray-400">Erreurs commises</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-cyber-blue">{{ pathologies.length }}</div>
                    <div class="text-sm text-gray-400">Total à traiter</div>
                </div>
            </div>

            <!-- Barre de progression -->
            <div class="bg-gray-700 rounded-full h-3">
                <div
                    class="bg-gradient-to-r from-cyber-blue to-cyber-green h-3 rounded-full transition-all duration-500"
                    :style="{ width: `${(correctMatches / pathologies.length) * 100}%` }"
                ></div>
            </div>
        </div>

        <!-- Indices + À retenir -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <!-- Indices -->
            <div
                class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-4"
            >
                <div class="flex items-center gap-2 mb-3">
                    <Lightbulb class="w-4 h-4 text-yellow-500 shrink-0" />
                    <h4 class="font-cyber font-bold text-yellow-500 text-sm">
                        INDICES ({{ hintsShown }}/{{ HINTS.length }})
                    </h4>
                </div>

                <ul class="space-y-2 text-sm text-gray-300">
                    <li
                        v-for="(hint, i) in revealedHints"
                        :key="`hint-${i}`"
                        class="fade-in"
                    >
                        💡 {{ hint }}
                    </li>
                    <li v-if="hintsShown === 0" class="text-gray-500 italic">
                        Besoin d'aide ? Chaque indice utilisé fait baisser votre note finale.
                    </li>
                </ul>

                <button
                    type="button"
                    :disabled="!canShowHint"
                    class="mt-3 px-3 py-1 border font-tech text-xs rounded transition-all"
                    :class="canShowHint
                        ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10'
                        : 'border-gray-600 text-gray-500 cursor-not-allowed'"
                    @click="showHint"
                >
                    {{ canShowHint ? 'AFFICHER UN INDICE' : "PLUS D'INDICE DISPONIBLE" }}
                </button>
            </div>

            <!-- À retenir -->
            <div
                class="bg-gray-800/40 backdrop-blur-md border border-cyber-green/50 rounded-lg p-4"
            >
                <div class="flex items-center gap-2 mb-3">
                    <BookOpen class="w-4 h-4 text-cyber-green shrink-0" />
                    <h4 class="font-cyber font-bold text-cyber-green text-sm">
                        À RETENIR
                    </h4>
                </div>
                <p class="text-sm text-gray-300 mb-3">{{ KEY_TAKEAWAY }}</p>
                <ul class="space-y-2 text-sm text-gray-300">
                    <li
                        v-for="pathology in matchedPathologies"
                        :key="`fact-${pathology.id}`"
                        class="fade-in break-words"
                    >
                        <span class="text-cyber-green font-bold">
                            {{ pathology.name }} → {{ treatmentName(pathology.correctCureId) }} :
                        </span>
                        {{ pathology.fact }}
                    </li>
                </ul>
                <p
                    v-if="matchedPathologies.length === 0"
                    class="text-xs text-gray-500 italic"
                >
                    Chaque bon diagnostic débloque une fiche explicative.
                </p>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import {
    HeartPulse,
    AlertTriangle,
    Pill,
    Check,
    X,
    GripVertical,
    Plus,
    Target,
    Lightbulb,
    BookOpen,
} from 'lucide-vue-next'
import GameRoom from '../GameRoom.vue'
import { createFireworks } from '../../utils/fireworks'
import { useGameState } from '../../composables/useGameState'
import { useToast } from '../../composables/useToast'

const ROOM_ID = 'pathology'
const RESET_DELAY = 3000 // ms avant la réinitialisation après une erreur

const emit = defineEmits(['exit-room', 'room-completed'])
const { gameState, completeRoom, addError, addHint, PENALTY_PER_ERROR } = useGameState()
const { showSuccess, showError } = useToast()

const roomData = {
    title: "SALLE DES PATHOLOGIES",
    subtitle: "Diagnostic médical",
    description:
        "Le virus a mélangé les pathologies et leurs traitements. Associez chaque pathologie au traitement adapté pour rétablir le système de diagnostic.",
    objective: "Associer chaque pathologie à son traitement",
    icon: "heart-pulse",
    color: "#ff0055",
};

// Données de référence (jamais modifiées : le plateau est reconstruit à partir d'elles)
const PATHOLOGY_DATA = [
    {
        id: 1,
        name: "Hypertension artérielle",
        description: "Pression du sang trop élevée dans les artères",
        correctCureId: 1,
        fact: "Les IEC empêchent la formation de l'angiotensine II : les artères se relâchent et la tension baisse. L'hypertension ne donne souvent aucun symptôme, d'où l'importance de mesurer régulièrement sa tension.",
    },
    {
        id: 2,
        name: "Diabète de type 2",
        description: "Taux de sucre trop élevé dans le sang",
        correctCureId: 2,
        fact: "La metformine est le médicament de première intention du diabète de type 2, toujours associée à une alimentation équilibrée et à une activité physique régulière.",
    },
    {
        id: 3,
        name: "Asthme",
        description: "Inflammation chronique des bronches, qui se resserrent lors des crises",
        correctCureId: 3,
        fact: "Un bronchodilatateur inhalé d'action rapide soulage la crise en quelques minutes ; un traitement de fond (corticoïdes inhalés) calme l'inflammation au quotidien.",
    },
    {
        id: 4,
        name: "Migraine",
        description: "Maux de tête intenses et récurrents",
        correctCureId: 4,
        fact: "Les triptans se prennent dès le début du mal de tête : ils soulagent la crise mais n'empêchent pas les suivantes. Manque de sommeil, repas sautés ou stress peuvent déclencher une crise.",
    },
    {
        id: 5,
        name: "Gastrite",
        description: "Inflammation de la muqueuse de l'estomac",
        correctCureId: 5,
        fact: "Les IPP réduisent l'acidité de l'estomac pour laisser la muqueuse cicatriser. Une gastrite est souvent due à la bactérie Helicobacter pylori ou aux anti-inflammatoires (ibuprofène, aspirine).",
    },
]

const TREATMENT_DATA = [
    {
        id: 1,
        name: "Inhibiteurs de l'enzyme de conversion (IEC)",
        description: "Relâchent les artères en empêchant la fabrication d'une hormone qui les resserre (l'angiotensine II)",
    },
    {
        id: 2,
        name: "Metformine",
        description: "Freine la production de sucre par le foie et aide l'insuline à agir",
    },
    {
        id: 3,
        name: "Bronchodilatateurs",
        description: "Inhalés, ils relâchent les muscles qui entourent les bronches",
    },
    {
        id: 4,
        name: "Triptans",
        description: "Agissent sur les récepteurs de la sérotonine pour stopper une crise de maux de tête",
    },
    {
        id: 5,
        name: "Inhibiteurs de la pompe à protons (IPP)",
        description: "Bloquent la « pompe » qui fabrique l'acide dans l'estomac",
    },
]

const KEY_TAKEAWAY =
    "Un traitement de fond contrôle une maladie chronique (hypertension, diabète, asthme…) sans la guérir : on ne l'arrête jamais sans l'avis d'un médecin."

const HINTS = [
    "Repérez l'organe ou la cible de chaque traitement (artères, sucre, bronches, sérotonine, estomac), puis cherchez la pathologie qui touche le même organe.",
    "Asthme → Bronchodilatateurs, et Gastrite → Inhibiteurs de la pompe à protons (IPP).",
    "Hypertension → Inhibiteurs de l'enzyme de conversion (IEC), Diabète de type 2 → Metformine, Migraine → Triptans.",
]

// Mélange de Fisher-Yates (le tri par Math.random() est biaisé)
const shuffle = (items) => {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

// État du plateau
const pathologies = ref([])
const shuffledCures = ref([])
const isCompleted = ref(false)
const isResetting = ref(false)
let resetTimer = null

// Sélection au clic / toucher / clavier
const selectedPathologyId = ref(null)
const needsSelection = ref(false)

// État du drag & drop (on stocke l'id, jamais l'index : l'ordre change à chaque réinitialisation)
const draggedPathologyId = ref(null)
const dragOverCureId = ref(null)

// Indices déjà payés dans cette salle : réaffichés gratuitement
const hintsShown = ref(Math.min(HINTS.length, gameState.roomHints?.[ROOM_ID] || 0))

const buildBoard = () => {
    const newPathologies = shuffle(PATHOLOGY_DATA).map((p) => ({ ...p, matched: false, error: false }))
    let newCures
    do {
        newCures = shuffle(TREATMENT_DATA).map((c) => ({ ...c, matched: false, error: false }))
        // Évite un plateau où chaque ligne est déjà alignée sur sa solution
    } while (newCures.every((c, i) => newPathologies[i].correctCureId === c.id))
    pathologies.value = newPathologies
    shuffledCures.value = newCures
}

buildBoard()

const isLocked = computed(() => isResetting.value || isCompleted.value)
const correctMatches = computed(() => pathologies.value.filter((p) => p.matched).length)
const matchedPathologies = computed(() => pathologies.value.filter((p) => p.matched))
const roomErrors = computed(() => gameState.roomErrors?.[ROOM_ID] || 0)
const selectedPathology = computed(
    () => pathologies.value.find((p) => p.id === selectedPathologyId.value) || null,
)
const revealedHints = computed(() => HINTS.slice(0, hintsShown.value))
const canShowHint = computed(() => hintsShown.value < HINTS.length && !isCompleted.value)

const statusMessage = computed(() => {
    if (isCompleted.value) return "Diagnostic terminé : toutes les pathologies ont leur traitement."
    if (isResetting.value) return "Erreur de diagnostic : réinitialisation du plateau en cours…"
    if (selectedPathology.value) {
        return `Pathologie sélectionnée : « ${selectedPathology.value.name} ». Choisissez maintenant son traitement dans la colonne TRAITEMENTS.`
    }
    if (needsSelection.value) return "Sélectionnez d'abord une pathologie dans la colonne PATHOLOGIES."
    return "Glissez une pathologie sur un traitement, ou sélectionnez-la puis choisissez son traitement."
})

const statusClass = computed(() => {
    if (isCompleted.value) return 'text-cyber-green'
    if (isResetting.value) return 'text-cyber-red'
    if (selectedPathology.value || needsSelection.value) return 'text-cyber-yellow'
    return 'text-gray-400'
})

const treatmentName = (cureId) => TREATMENT_DATA.find((c) => c.id === cureId)?.name || ''

const isTargetable = (cure) =>
    !cure.matched &&
    !isLocked.value &&
    (selectedPathologyId.value !== null || draggedPathologyId.value !== null)

const clearSelection = () => {
    selectedPathologyId.value = null
}

// Entrée / Espace sur une carte : on ignore la répétition automatique de la touche
const onCardKey = (event, action) => {
    if (event.repeat) return
    action()
}

// Logique commune au drag & drop et au clic : une seule source de vérité
const tryMatch = (pathologyId, cureId) => {
    if (isLocked.value) return
    const pathology = pathologies.value.find((p) => p.id === pathologyId)
    const cure = shuffledCures.value.find((c) => c.id === cureId)
    if (!pathology || !cure || pathology.matched || cure.matched) return

    selectedPathologyId.value = null
    needsSelection.value = false

    if (pathology.correctCureId === cure.id) {
        pathology.matched = true
        cure.matched = true

        if (correctMatches.value === pathologies.value.length) {
            finishRoom()
        } else {
            showSuccess("DIAGNOSTIC CORRECT !", `Excellent ! ${pathology.name} → ${cure.name}`)
        }
        return
    }

    // Mauvaise association : on verrouille le plateau jusqu'à la réinitialisation
    pathology.error = true
    cure.error = true
    isResetting.value = true
    addError(ROOM_ID)
    showError(
        "ERREUR DE DIAGNOSTIC !",
        `Ce traitement ne soigne pas cette pathologie. Le plateau va être réinitialisé. +${PENALTY_PER_ERROR}s de pénalité`,
    )
    clearResetTimer()
    resetTimer = setTimeout(() => {
        resetTimer = null
        resetBoard()
    }, RESET_DELAY)
}

const finishRoom = () => {
    if (isCompleted.value) return
    isCompleted.value = true
    selectedPathologyId.value = null
    dragOverCureId.value = null

    completeRoom(ROOM_ID)
    emit('room-completed', ROOM_ID)

    createFireworks(3000)
    showSuccess(
        "DIAGNOSTIC MÉDICAL TERMINÉ !",
        "Les 5 pathologies ont leur traitement. À retenir : un traitement de fond contrôle une maladie chronique, il ne la guérit pas.",
        6000,
    )
}

// --- Sélection au clic / toucher / clavier ---
const selectPathology = (pathology) => {
    if (isLocked.value || pathology.matched) return
    needsSelection.value = false
    selectedPathologyId.value = selectedPathologyId.value === pathology.id ? null : pathology.id
}

const placeOnCure = (cure) => {
    if (isLocked.value || cure.matched) return
    if (selectedPathologyId.value === null) {
        needsSelection.value = true
        return
    }
    tryMatch(selectedPathologyId.value, cure.id)
}

// --- Drag & drop HTML5 ---
const handleDragStart = (event, pathology) => {
    if (isLocked.value || pathology.matched) {
        event.preventDefault()
        return
    }
    draggedPathologyId.value = pathology.id
    selectedPathologyId.value = null
    needsSelection.value = false
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        // Firefox exige des données pour démarrer le drag
        event.dataTransfer.setData('text/plain', String(pathology.id))
    }
}

const handleDragEnd = () => {
    draggedPathologyId.value = null
    dragOverCureId.value = null
}

const canDropOn = (cure) => draggedPathologyId.value !== null && !cure.matched && !isLocked.value

const handleDragEnter = (event, cure) => {
    if (!canDropOn(cure)) return
    event.preventDefault()
    dragOverCureId.value = cure.id
}

const handleDragOver = (event, cure) => {
    // Sans preventDefault, le dépôt est refusé (curseur "interdit")
    if (!canDropOn(cure)) return
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    dragOverCureId.value = cure.id
}

const handleDragLeave = (event, cure) => {
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) return
    if (dragOverCureId.value === cure.id) dragOverCureId.value = null
}

const handleDrop = (event, cure) => {
    event.preventDefault()
    dragOverCureId.value = null
    const pathologyId = draggedPathologyId.value
    draggedPathologyId.value = null
    if (pathologyId === null) return
    tryMatch(pathologyId, cure.id)
}

// --- Indices ---
const showHint = () => {
    if (!canShowHint.value) return
    hintsShown.value++
    // On ne paie que les indices au-delà de ceux déjà achetés dans cette salle
    if (hintsShown.value > (gameState.roomHints?.[ROOM_ID] || 0)) {
        addHint(ROOM_ID)
    }
}

// --- Réinitialisation ---
const clearResetTimer = () => {
    if (resetTimer) {
        clearTimeout(resetTimer)
        resetTimer = null
    }
}

const resetBoard = () => {
    clearResetTimer()
    selectedPathologyId.value = null
    needsSelection.value = false
    dragOverCureId.value = null
    buildBoard()
    isResetting.value = false
}

onUnmounted(() => {
    clearResetTimer()
})
</script>

<style scoped>
.pathology-card,
.cure-card {
    transition: all 0.3s ease;
}

.pathology-card:not(.is-matched):not(.is-locked):hover,
.cure-card:not(.is-matched):not(.is-locked):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 85, 0.2);
}

.pathology-card:focus-visible,
.cure-card:focus-visible {
    outline: 2px solid #00ffff;
    outline-offset: 2px;
}

/* Styles pour le drag & drop */
.pathology-card[draggable="true"] {
    cursor: grab;
}

.pathology-card[draggable="true"]:active {
    cursor: grabbing;
}

.pathology-card.is-selected {
    border-color: #ffd60a !important;
    background-color: rgba(255, 214, 10, 0.12) !important;
    box-shadow: 0 0 0 2px rgba(255, 214, 10, 0.35) !important;
}

.pathology-card.is-dragging {
    opacity: 0.6;
}

.is-locked {
    cursor: not-allowed !important;
}

.cure-card.can-drop {
    border-color: rgba(255, 214, 10, 0.6) !important;
}

/* Déclaré après .can-drop pour l'emporter */
.cure-card.drag-over {
    border-color: #ffd60a !important;
    border-style: solid !important;
    background-color: rgba(255, 214, 10, 0.15) !important;
}

.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
