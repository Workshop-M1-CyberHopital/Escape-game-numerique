<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <div class="space-y-6">
            <!-- Instructions de la salle finale -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-4 sm:p-8 scanline text-center"
            >
                <div class="flex items-center justify-center gap-3 mb-6">
                    <ShieldCheck class="w-8 h-8 shrink-0 text-cyber-green" />
                    <h3 class="font-cyber font-bold text-cyber-green text-xl sm:text-2xl">
                        DIAGNOSTIC FINAL - PATIENTE CRITIQUE
                    </h3>
                </div>
                <p class="text-gray-300 mb-6 text-base sm:text-lg">
                    Diagnostiquez cette patiente en état critique, choisissez son traitement, puis sécurisez son dossier médical.
                </p>

                <!-- Progression -->
                <ol class="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-4 text-sm font-tech">
                    <li
                        v-for="(step, index) in progressSteps"
                        :key="step.label"
                        :class="[
                            'flex items-center justify-center gap-2 px-3 py-2 rounded border',
                            step.done
                                ? 'border-cyber-green text-cyber-green bg-cyber-green/10'
                                : step.active
                                    ? 'border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10'
                                    : 'border-gray-600 text-gray-500'
                        ]"
                    >
                        <CheckCircle v-if="step.done" class="w-4 h-4 shrink-0" />
                        <span v-else class="font-bold">{{ index + 1 }}.</span>
                        <span>{{ step.label }}</span>
                    </li>
                </ol>
            </div>

            <!-- Fiche patient -->
            <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-4 sm:p-8 scanline">
                <div class="flex items-center gap-3 mb-6">
                    <User class="w-6 h-6 shrink-0 text-cyber-blue" />
                    <h3 class="text-cyber-blue font-bold text-xl">FICHE PATIENT</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Informations patient -->
                    <div class="space-y-4">
                        <div class="bg-gray-700/50 rounded-lg p-4">
                            <h4 class="text-cyber-blue font-bold mb-3">Informations</h4>
                            <div class="space-y-2 text-sm">
                                <div><span class="text-gray-400">Nom :</span> <span class="text-white">Marie Dubois</span></div>
                                <div><span class="text-gray-400">Âge :</span> <span class="text-white">34 ans</span></div>
                                <div><span class="text-gray-400">Sexe :</span> <span class="text-white">F</span></div>
                                <div><span class="text-gray-400">Admission :</span> <span class="text-white">Urgences</span></div>
                            </div>
                        </div>

                        <!-- Symptômes -->
                        <div class="bg-gray-700/50 rounded-lg p-4">
                            <h4 class="text-cyber-blue font-bold mb-3">Symptômes et examen clinique</h4>
                            <div class="space-y-2 text-sm">
                                <div
                                    v-for="symptom in SYMPTOMS"
                                    :key="symptom.text"
                                    class="flex items-start gap-2"
                                >
                                    <component :is="symptom.icon" class="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                                    <span class="text-white">{{ symptom.text }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Analyses sanguines et constantes -->
                    <div class="space-y-4">
                        <div class="bg-gray-700/50 rounded-lg p-4">
                            <h4 class="text-cyber-blue font-bold mb-3">Analyses et constantes</h4>
                            <div class="space-y-3 text-sm">
                                <div
                                    v-for="lab in LAB_RESULTS"
                                    :key="lab.label"
                                    class="flex justify-between items-start gap-3"
                                >
                                    <div>
                                        <div class="text-gray-400">{{ lab.label }}</div>
                                        <div class="text-xs text-gray-500">Normale : {{ lab.normal }}</div>
                                    </div>
                                    <span class="text-red-400 font-bold text-right whitespace-nowrap">{{ lab.value }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Antécédents -->
                        <div class="bg-gray-700/50 rounded-lg p-4">
                            <h4 class="text-cyber-blue font-bold mb-3">Antécédents</h4>
                            <div class="space-y-2 text-sm text-white">
                                <div>• Asthme depuis l'enfance (bien contrôlé)</div>
                                <div>• Aucune allergie connue</div>
                                <div>• Non-fumeuse</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Diagnostic et traitement -->
            <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-4 sm:p-8 scanline">
                <div class="flex items-center gap-3 mb-6">
                    <Stethoscope class="w-6 h-6 shrink-0 text-cyber-purple" />
                    <h3 class="text-cyber-purple font-bold text-xl">DIAGNOSTIC ET TRAITEMENT</h3>
                </div>

                <!-- Options de diagnostic -->
                <div class="mb-8">
                    <h4 class="text-white font-bold mb-4">Quel est le diagnostic le plus probable ?</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            v-for="(diagnosis, index) in DIAGNOSES"
                            :key="diagnosis.name"
                            type="button"
                            @click="selectDiagnosis(index)"
                            :disabled="diagnosisDone"
                            :aria-pressed="selectedDiagnosis === index"
                            :class="[
                                'p-4 rounded-lg border-2 transition-all duration-300 font-bold text-left',
                                selectedDiagnosis === index
                                    ? 'border-cyber-green bg-cyber-green/20 text-cyber-green'
                                    : 'border-gray-600 hover:border-cyber-purple text-gray-300 hover:text-cyber-purple',
                                diagnosisDone ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            ]"
                        >
                            <div class="flex items-center gap-3">
                                <component :is="diagnosis.icon" class="w-5 h-5 shrink-0" />
                                <div>
                                    <div class="font-bold">{{ diagnosis.name }}</div>
                                    <div class="text-sm opacity-80">{{ diagnosis.description }}</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Options de traitement -->
                <div v-if="selectedDiagnosis !== null" class="mb-8">
                    <h4 class="text-white font-bold mb-4">Quel traitement administrer ?</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            v-for="(treatment, index) in TREATMENTS"
                            :key="treatment.name"
                            type="button"
                            @click="selectTreatment(index)"
                            :disabled="diagnosisDone"
                            :aria-pressed="selectedTreatment === index"
                            :class="[
                                'p-4 rounded-lg border-2 transition-all duration-300 font-bold text-left',
                                selectedTreatment === index
                                    ? 'border-cyber-green bg-cyber-green/20 text-cyber-green'
                                    : 'border-gray-600 hover:border-cyber-purple text-gray-300 hover:text-cyber-purple',
                                diagnosisDone ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            ]"
                        >
                            <div class="flex items-center gap-3">
                                <component :is="treatment.icon" class="w-5 h-5 shrink-0" />
                                <div>
                                    <div class="font-bold">{{ treatment.name }}</div>
                                    <div class="text-sm opacity-80">{{ treatment.description }}</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Diagnostic validé -->
                <div
                    v-if="diagnosisDone"
                    class="flex items-center justify-center gap-2 text-center text-cyber-green font-bold"
                >
                    <CheckCircle class="w-5 h-5 shrink-0" />
                    <span>DIAGNOSTIC VALIDÉ : pneumonie bactérienne, antibiotiques + oxygène</span>
                </div>

                <!-- Bouton de validation -->
                <div
                    v-else-if="selectedDiagnosis !== null && selectedTreatment !== null"
                    class="text-center"
                >
                    <button
                        type="button"
                        @click="validateDiagnosis"
                        :disabled="!canValidateDiagnosis"
                        class="w-full sm:w-auto bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-black px-6 sm:px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-300"
                    >
                        {{ diagnosisPairTried ? 'COMBINAISON DÉJÀ ESSAYÉE' : 'VALIDER LE DIAGNOSTIC' }}
                    </button>
                    <p v-if="diagnosisPairTried" class="mt-3 text-sm text-red-400" role="status">
                        Le diagnostic ou le traitement n'est pas correct : relisez la fiche patient et modifiez votre choix.
                    </p>
                </div>
            </div>

            <!-- Sécurisation du dossier -->
            <div
                v-if="diagnosisDone"
                ref="securitySection"
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-yellow rounded-lg p-4 sm:p-8 scanline"
            >
                <div class="flex items-center gap-3 mb-6">
                    <Shield class="w-6 h-6 shrink-0 text-cyber-yellow" />
                    <h3 class="text-cyber-yellow font-bold text-xl">SÉCURISATION DU DOSSIER</h3>
                </div>

                <p class="text-gray-300 mb-2">
                    Marie est traitée, mais les pirates rôdent encore : son dossier médical doit être mis à l'abri
                    dans le coffre-fort numérique.
                </p>
                <p class="text-gray-300 mb-6">
                    Parmi ces 8 actions, sélectionnez les
                    <span class="text-cyber-yellow font-bold">{{ REQUIRED_MEASURES }} mesures</span>
                    qui protègent vraiment le dossier, puis validez.
                </p>

                <div
                    v-if="!securityDone"
                    class="mb-4 text-sm font-tech"
                    :class="selectedMeasures.length > REQUIRED_MEASURES ? 'text-red-400' : 'text-gray-400'"
                    aria-live="polite"
                >
                    Mesures sélectionnées : {{ selectedMeasures.length }}/{{ REQUIRED_MEASURES }}
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        v-for="measure in SECURITY_MEASURES"
                        :key="measure.id"
                        type="button"
                        @click="toggleMeasure(measure.id)"
                        :disabled="securityDone"
                        :aria-pressed="isMeasureSelected(measure.id)"
                        :class="['p-4 rounded-lg border-2 transition-all duration-300 text-left', getMeasureClass(measure)]"
                    >
                        <div class="flex items-start gap-3">
                            <component :is="getMeasureStateIcon(measure)" class="w-5 h-5 shrink-0 mt-0.5" />
                            <div class="min-w-0">
                                <div class="flex items-center gap-2 font-bold">
                                    <component :is="measure.icon" class="w-4 h-4 shrink-0" />
                                    <span>{{ measure.name }}</span>
                                </div>
                                <div class="text-sm opacity-80 mt-1">{{ measure.description }}</div>
                                <div v-if="securityDone" class="text-sm mt-2 text-gray-200">
                                    {{ measure.correct ? '✔' : '✖' }} {{ measure.why }}
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                <!-- Sécurisation validée -->
                <div
                    v-if="securityDone"
                    class="flex items-center justify-center gap-2 text-center text-cyber-green font-bold mt-6"
                >
                    <CheckCircle class="w-5 h-5 shrink-0" />
                    <span>LES 4 BONNES MESURES SONT EN PLACE</span>
                </div>

                <!-- Bouton de validation -->
                <div v-else class="text-center mt-6">
                    <button
                        type="button"
                        @click="validateSecurity"
                        :disabled="!canValidateSecurity"
                        class="w-full sm:w-auto bg-cyber-yellow hover:bg-cyber-yellow/80 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-black px-6 sm:px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-300"
                    >
                        {{ securityButtonLabel }}
                    </button>
                    <p v-if="measuresTried" class="mt-3 text-sm text-red-400" role="status">
                        Cette combinaison met encore le dossier en danger : modifiez votre sélection.
                    </p>
                </div>
            </div>

            <!-- Bilan et fin de mission -->
            <div
                v-if="securityDone"
                ref="completionSection"
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-4 sm:p-8 scanline"
            >
                <div class="flex items-center justify-center gap-3 mb-6">
                    <ShieldCheck class="w-8 h-8 shrink-0 text-cyber-green" />
                    <h3 class="font-cyber font-bold text-cyber-green text-xl sm:text-2xl text-center">
                        PATIENTE SAUVÉE, DOSSIER PROTÉGÉ
                    </h3>
                </div>

                <div class="bg-cyber-purple/10 border border-cyber-purple/50 rounded-lg p-4 mb-6">
                    <div class="flex items-center gap-2 mb-3">
                        <BookOpen class="w-5 h-5 shrink-0 text-cyber-purple" />
                        <h4 class="font-cyber font-bold text-cyber-purple">À RETENIR</h4>
                    </div>
                    <ul class="space-y-2 text-sm text-gray-300 list-disc pl-5">
                        <li>
                            Fièvre, toux grasse, crépitants et procalcitonine élevée orientent vers une
                            <strong>pneumonie bactérienne</strong>. Les antibiotiques soignent les infections
                            bactériennes, mais ne servent à rien contre les virus (grippe, COVID-19).
                        </li>
                        <li>
                            Un dossier médical contient des <strong>données de santé</strong>, protégées par le
                            secret médical et le RGPD : il doit rester confidentiel, intact et disponible.
                        </li>
                        <li>
                            Ces réflexes valent aussi pour vous : mot de passe personnel et jamais partagé,
                            double authentification activée, sauvegardes régulières, et pas de raccourci
                            « pour aller plus vite » au détriment de la sécurité.
                        </li>
                    </ul>
                </div>

                <div class="text-center">
                    <button
                        type="button"
                        @click="completeFinalRoom"
                        :disabled="isCompleted"
                        class="w-full sm:w-auto bg-cyber-green hover:bg-cyber-green/80 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-cyber-green text-black px-6 sm:px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-300"
                    >
                        {{ completionButtonLabel }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Section Indices -->
        <div v-if="hintPhase" class="mt-8">
            <div class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-4 sm:p-6">
                <div class="flex items-center gap-2 mb-4">
                    <Lightbulb class="w-5 h-5 shrink-0 text-yellow-500" />
                    <h4 class="font-cyber font-bold text-yellow-500">
                        INDICES — {{ hintPhase === 'diagnosis' ? 'DIAGNOSTIC' : 'SÉCURISATION' }}
                    </h4>
                </div>

                <div class="space-y-2 text-sm text-gray-300">
                    <div
                        v-for="(hint, index) in currentHints"
                        :key="hintPhase + '-' + index"
                        class="fade-in"
                    >
                        💡 {{ hint.text }}
                        <span v-if="hint.answer" class="text-cyber-green font-bold">{{ hint.answer }}</span>
                    </div>
                </div>

                <button
                    type="button"
                    @click="showHint"
                    :disabled="!canShowHint"
                    class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent font-tech text-sm rounded transition-all"
                >
                    {{ hintButtonLabel }}
                </button>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import {
    Activity,
    Biohazard,
    BookOpen,
    Bug,
    CheckCircle,
    DatabaseBackup,
    Droplets,
    Ear,
    HeartPulse,
    KeyRound,
    Lightbulb,
    Lock,
    Mail,
    Pill,
    Share2,
    Shield,
    ShieldCheck,
    ShieldOff,
    Square,
    SquareCheckBig,
    Stethoscope,
    Syringe,
    Thermometer,
    Usb,
    User,
    UserCheck,
    Wind,
    XCircle,
} from 'lucide-vue-next'
import GameRoom from '../GameRoom.vue'
import { createFireworks } from '../../utils/fireworks'
import { useGameState } from '../../composables/useGameState'
import { useToast } from '../../composables/useToast'

const ROOM_ID = 'final'
const REQUIRED_MEASURES = 4

const emit = defineEmits(['exit-room', 'room-completed'])

const { gameState, completeRoom, addError, addHint, PENALTY_PER_ERROR } = useGameState()
const { showSuccess, showError } = useToast()

const roomData = {
    title: "SALLE DE FIN",
    subtitle: "Diagnostic final - Patiente critique",
    description: "Diagnostiquez cette patiente en état critique, choisissez son traitement, puis sécurisez son dossier médical.",
    objective: "Diagnostiquer la patiente et sécuriser son dossier médical",
    icon: "shield-check",
    color: "#10b981",
};

// --- Données (non réactives : elles contiennent des composants d'icônes) ---

const SYMPTOMS = [
    { icon: Thermometer, text: "Fièvre : 39,2 °C" },
    { icon: HeartPulse, text: "Tachycardie : 120 battements/min" },
    { icon: Wind, text: "Dyspnée (difficulté à respirer)" },
    { icon: Droplets, text: "Toux grasse avec expectorations purulentes" },
    { icon: Ear, text: "Crépitants à l'auscultation (base du poumon droit)" },
]

const LAB_RESULTS = [
    { label: "Leucocytes", value: "15,2 G/L (↑)", normal: "4 à 10 G/L" },
    { label: "CRP", value: "85 mg/L (↑)", normal: "< 5 mg/L" },
    { label: "Procalcitonine", value: "2,1 ng/mL (↑)", normal: "< 0,1 ng/mL" },
    { label: "Saturation en oxygène (SpO₂)", value: "92 % (↓)", normal: "≥ 95 %" },
]

const DIAGNOSES = [
    { name: "Pneumonie bactérienne", description: "Infection des alvéoles pulmonaires par une bactérie", icon: Bug, correct: true },
    { name: "Grippe", description: "Infection virale saisonnière (virus influenza)", icon: Thermometer, correct: false },
    { name: "Asthme aigu", description: "Crise sévère : les bronches se contractent et se rétrécissent", icon: Wind, correct: false },
    { name: "COVID-19", description: "Infection virale respiratoire (virus SARS-CoV-2)", icon: Biohazard, correct: false },
]

const TREATMENTS = [
    { name: "Antibiotiques + Oxygène", description: "Éliminent les bactéries et compensent le manque d'oxygène", icon: Pill, correct: true },
    { name: "Antiviraux", description: "Freinent la multiplication de certains virus", icon: Syringe, correct: false },
    { name: "Bronchodilatateurs", description: "Dilatent les bronches pendant une crise d'asthme", icon: Wind, correct: false },
    { name: "Corticoïdes seuls", description: "Anti-inflammatoires puissants", icon: Activity, correct: false },
]

// 8 actions proposées : 4 mesures de protection et 4 pièges (ordre fixe, mélangé)
const SECURITY_MEASURES = [
    {
        id: "encrypt",
        name: "Chiffrer le dossier",
        description: "Rendre le fichier illisible sans la clé de déchiffrement.",
        why: "Même volé, un dossier chiffré reste illisible pour le pirate.",
        icon: Lock,
        correct: true,
    },
    {
        id: "email",
        name: "Envoyer le dossier par e-mail non chiffré",
        description: "Le médecin traitant le recevra tout de suite.",
        why: "Un e-mail non chiffré peut être intercepté ou partir chez le mauvais destinataire : on utilise une messagerie de santé sécurisée.",
        icon: Mail,
        correct: false,
    },
    {
        id: "mfa",
        name: "Activer l'authentification forte (2FA)",
        description: "Mot de passe + second facteur (code temporaire, carte professionnelle).",
        why: "Un mot de passe volé ne suffit plus pour ouvrir une session.",
        icon: KeyRound,
        correct: true,
    },
    {
        id: "usb",
        name: "Copier le dossier sur une clé USB personnelle",
        description: "Pratique pour le relire tranquillement chez soi.",
        why: "Une clé USB se perd, se vole et peut transporter des virus : les données de santé restent dans le système de l'hôpital.",
        icon: Usb,
        correct: false,
    },
    {
        id: "least-privilege",
        name: "Restreindre l'accès aux soignants concernés",
        description: "Seule l'équipe qui soigne la patiente peut ouvrir son dossier.",
        why: "Principe du moindre privilège : chacun n'accède qu'à ce dont il a besoin, et chaque consultation est tracée.",
        icon: UserCheck,
        correct: true,
    },
    {
        id: "password",
        name: "Partager le mot de passe de session",
        description: "Toute l'équipe de garde pourra se connecter sans attendre.",
        why: "Un mot de passe est strictement personnel : partagé, il finit par fuiter et on ne sait plus qui a fait quoi.",
        icon: Share2,
        correct: false,
    },
    {
        id: "antivirus",
        name: "Désactiver l'antivirus pour aller plus vite",
        description: "L'antivirus ralentit l'ouverture des dossiers patients.",
        why: "Sans antivirus, le poste devient une porte ouverte aux logiciels malveillants comme les rançongiciels.",
        icon: ShieldOff,
        correct: false,
    },
    {
        id: "backup",
        name: "Faire une sauvegarde chiffrée hors ligne",
        description: "Garder une copie protégée, déconnectée du réseau.",
        why: "Une copie déconnectée échappe aux rançongiciels et permet de tout restaurer après une attaque.",
        icon: DatabaseBackup,
        correct: true,
    },
]

const MEASURES_BY_ID = Object.fromEntries(SECURITY_MEASURES.map((m) => [m.id, m]))
const CORRECT_MEASURE_IDS = SECURITY_MEASURES.filter((m) => m.correct).map((m) => m.id)

// Indices par étape (le dernier indice de chaque étape donne la solution)
const DIAGNOSIS_HINTS = [
    { text: "Fièvre à 39,2 °C, toux grasse et crépitants à l'auscultation : l'infection touche le poumon lui-même. Une crise d'asthme seule ne donne pas une telle fièvre." },
    { text: "Leucocytes, CRP et surtout procalcitonine élevés : ce profil oriente vers une infection bactérienne plutôt que virale (grippe, COVID-19)." },
    { text: "Le diagnostic correct est :", answer: "Pneumonie bactérienne" },
    { text: "Les antibiotiques éliminent les bactéries (ils sont inutiles contre les virus) et la saturation à 92 % impose de l'oxygène :", answer: "Antibiotiques + Oxygène" },
]

const SECURITY_HINTS = [
    { text: "Un dossier médical doit rester confidentiel (lu seulement par les bons soignants), intact (non modifié) et disponible (jamais perdu). Gardez les actions qui servent ces objectifs." },
    { text: "Rejetez les « raccourcis » : envoyer ou copier le dossier hors d'un système protégé, partager un accès ou couper une protection pour gagner du temps, c'est ouvrir la porte aux pirates." },
    { text: "Les 4 bonnes mesures :", answer: "chiffrer le dossier, authentification forte (2FA), accès réservé aux soignants concernés, sauvegarde chiffrée hors ligne." },
]

// --- État ---

// Salle déjà terminée (ex. retour dans la salle) : on affiche directement l'état résolu
const alreadyCompleted = gameState.completedRooms.includes(ROOM_ID)
const CORRECT_DIAGNOSIS = DIAGNOSES.findIndex((d) => d.correct)
const CORRECT_TREATMENT = TREATMENTS.findIndex((t) => t.correct)

const selectedDiagnosis = ref(alreadyCompleted ? CORRECT_DIAGNOSIS : null)
const selectedTreatment = ref(alreadyCompleted ? CORRECT_TREATMENT : null)
const diagnosisDone = ref(alreadyCompleted)
const failedDiagnosisPairs = ref([])

const selectedMeasures = ref(alreadyCompleted ? [...CORRECT_MEASURE_IDS] : [])
const securityDone = ref(alreadyCompleted)
const failedMeasureSets = ref([])

const isCompleted = ref(alreadyCompleted)
const completedThisVisit = ref(false)

const securitySection = ref(null)
const completionSection = ref(null)

// Indices : chaque étape a son propre compteur. Les indices payés lors d'une visite précédente
// (gameState.roomHints.final) sont réaffichés gratuitement dans chaque étape (même nombre, plafonné),
// et chaque clic suivant révèle un nouvel indice de l'étape en cours et coûte 1 indice.
const paidBeforeVisit = gameState.roomHints[ROOM_ID] || 0
const diagnosisHintsShown = ref(Math.min(paidBeforeVisit, DIAGNOSIS_HINTS.length))
const securityHintsShown = ref(Math.min(paidBeforeVisit, SECURITY_HINTS.length))

// --- Valeurs calculées ---

const progressSteps = computed(() => [
    { label: "Diagnostic et traitement", done: diagnosisDone.value, active: !diagnosisDone.value },
    { label: "Sécurisation du dossier", done: securityDone.value, active: diagnosisDone.value && !securityDone.value },
    { label: "Fin de mission", done: isCompleted.value, active: securityDone.value && !isCompleted.value },
])

const diagnosisPairKey = computed(() => `${selectedDiagnosis.value}:${selectedTreatment.value}`)
const diagnosisPairTried = computed(() => failedDiagnosisPairs.value.includes(diagnosisPairKey.value))
const canValidateDiagnosis = computed(() =>
    !diagnosisDone.value &&
    selectedDiagnosis.value !== null &&
    selectedTreatment.value !== null &&
    !diagnosisPairTried.value
)

const measuresKey = computed(() => [...selectedMeasures.value].sort().join('|'))
const measuresTried = computed(() => failedMeasureSets.value.includes(measuresKey.value))
const canValidateSecurity = computed(() =>
    diagnosisDone.value &&
    !securityDone.value &&
    selectedMeasures.value.length === REQUIRED_MEASURES &&
    !measuresTried.value
)

const securityButtonLabel = computed(() => {
    const count = selectedMeasures.value.length
    if (count < REQUIRED_MEASURES) {
        const missing = REQUIRED_MEASURES - count
        return `SÉLECTIONNEZ ENCORE ${missing} MESURE${missing > 1 ? 'S' : ''} (${count}/${REQUIRED_MEASURES})`
    }
    if (count > REQUIRED_MEASURES) {
        const extra = count - REQUIRED_MEASURES
        return `RETIREZ ${extra} MESURE${extra > 1 ? 'S' : ''} (${count}/${REQUIRED_MEASURES})`
    }
    if (measuresTried.value) return 'COMBINAISON DÉJÀ ESSAYÉE'
    return 'VALIDER LA SÉCURISATION'
})

const completionButtonLabel = computed(() => {
    if (!isCompleted.value) return '🎉 MISSION ACCOMPLIE - SAUVEGARDER LE DOSSIER'
    return completedThisVisit.value ? '✅ DOSSIER SAUVEGARDÉ - MISSION ACCOMPLIE' : '✅ MISSION DÉJÀ ACCOMPLIE'
})

const hintPhase = computed(() => {
    if (isCompleted.value) return null
    if (!diagnosisDone.value) return 'diagnosis'
    if (!securityDone.value) return 'security'
    return null
})

const currentHints = computed(() => {
    if (hintPhase.value === 'diagnosis') return DIAGNOSIS_HINTS.slice(0, diagnosisHintsShown.value)
    if (hintPhase.value === 'security') return SECURITY_HINTS.slice(0, securityHintsShown.value)
    return []
})

const canShowHint = computed(() => {
    if (hintPhase.value === 'diagnosis') return diagnosisHintsShown.value < DIAGNOSIS_HINTS.length
    if (hintPhase.value === 'security') return securityHintsShown.value < SECURITY_HINTS.length
    return false
})

const hintButtonLabel = computed(() => {
    if (!canShowHint.value) return "PLUS D'INDICE DISPONIBLE"
    const total = hintPhase.value === 'diagnosis' ? DIAGNOSIS_HINTS.length : SECURITY_HINTS.length
    const shown = hintPhase.value === 'diagnosis' ? diagnosisHintsShown.value : securityHintsShown.value
    const remaining = total - shown
    return `AFFICHER UN INDICE (${remaining} restant${remaining > 1 ? 's' : ''})`
})

// --- Utilitaires ---

const scrollToSection = async (sectionRef) => {
    await nextTick()
    sectionRef.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
}

const isMeasureSelected = (id) => selectedMeasures.value.includes(id)

const getMeasureClass = (measure) => {
    if (securityDone.value) {
        return measure.correct
            ? 'border-cyber-green bg-cyber-green/10 text-cyber-green cursor-default'
            : 'border-red-500/60 bg-red-500/10 text-red-300 cursor-default'
    }
    return isMeasureSelected(measure.id)
        ? 'border-cyber-yellow bg-cyber-yellow/15 text-cyber-yellow cursor-pointer'
        : 'border-gray-600 text-gray-300 hover:border-cyber-yellow hover:text-cyber-yellow cursor-pointer'
}

const getMeasureStateIcon = (measure) => {
    if (securityDone.value) return measure.correct ? CheckCircle : XCircle
    return isMeasureSelected(measure.id) ? SquareCheckBig : Square
}

// --- Étape 1 : diagnostic et traitement ---

const selectDiagnosis = (index) => {
    if (diagnosisDone.value) return
    selectedDiagnosis.value = index
}

const selectTreatment = (index) => {
    if (diagnosisDone.value) return
    selectedTreatment.value = index
}

const validateDiagnosis = () => {
    // Bloque les doubles clics : une combinaison déjà refusée ne peut pas être revalidée
    if (!canValidateDiagnosis.value) return

    const diagnosisCorrect = DIAGNOSES[selectedDiagnosis.value].correct
    const treatmentCorrect = TREATMENTS[selectedTreatment.value].correct

    if (diagnosisCorrect && treatmentCorrect) {
        diagnosisDone.value = true
        showSuccess(
            "DIAGNOSTIC CORRECT !",
            "Excellent ! Vous avez diagnostiqué une pneumonie bactérienne et prescrit le bon traitement."
        )
        scrollToSection(securitySection)
    } else {
        failedDiagnosisPairs.value = [...failedDiagnosisPairs.value, diagnosisPairKey.value]
        addError(ROOM_ID)
        showError(
            "DIAGNOSTIC INCORRECT",
            `Le diagnostic ou le traitement n'est pas correct. +${PENALTY_PER_ERROR}s de pénalité`
        )
    }
}

// --- Étape 2 : sécurisation du dossier ---

const toggleMeasure = (id) => {
    if (securityDone.value) return
    selectedMeasures.value = isMeasureSelected(id)
        ? selectedMeasures.value.filter((m) => m !== id)
        : [...selectedMeasures.value, id]
}

const validateSecurity = () => {
    if (!canValidateSecurity.value) return

    const correctCount = selectedMeasures.value.filter((id) => MEASURES_BY_ID[id]?.correct).length

    if (correctCount === REQUIRED_MEASURES) {
        securityDone.value = true
        showSuccess(
            "DOSSIER SÉCURISÉ !",
            "Les 4 bonnes mesures sont en place. Lisez le bilan, puis terminez la mission."
        )
        scrollToSection(completionSection)
        return
    }

    failedMeasureSets.value = [...failedMeasureSets.value, measuresKey.value]
    addError(ROOM_ID)
    const feedback = correctCount === 0
        ? "Aucune de vos 4 mesures ne protège le dossier."
        : correctCount === 1
            ? "Une seule de vos 4 mesures protège réellement le dossier."
            : `Seulement ${correctCount} de vos 4 mesures protègent réellement le dossier.`
    showError("DOSSIER EN DANGER", `${feedback} +${PENALTY_PER_ERROR}s de pénalité`)
}

// --- Fin de la salle (une seule fois) ---

const completeFinalRoom = () => {
    if (isCompleted.value || !securityDone.value) return
    isCompleted.value = true
    completedThisVisit.value = true

    completeRoom(ROOM_ID)
    emit('room-completed', ROOM_ID)

    createFireworks(3000)
    showSuccess(
        "MISSION ACCOMPLIE !",
        "Félicitations ! Vous avez sauvé la patiente et sécurisé ses données. La cyberattaque est définitivement vaincue !"
    )
}

// --- Indices ---

const showHint = () => {
    if (!canShowHint.value) return
    if (hintPhase.value === 'diagnosis') {
        diagnosisHintsShown.value++
    } else {
        securityHintsShown.value++
    }
    addHint(ROOM_ID)
}
</script>

<style scoped>
.font-cyber {
    font-family: "Orbitron", sans-serif;
}

.font-tech {
    font-family: "Courier New", monospace;
}

.fade-in {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
