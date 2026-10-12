<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <div class="space-y-6">
            <!-- Instructions du mini-jeu -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-4 sm:p-8 scanline text-center"
            >
                <div class="flex items-center justify-center gap-3 mb-6">
                    <Activity class="w-8 h-8 shrink-0 text-cyber-purple" />
                    <h3 class="font-cyber font-bold text-cyber-purple text-xl sm:text-2xl">
                        DIAGNOSTIC AUDITIF INTERACTIF
                    </h3>
                </div>
                <p class="text-gray-300 text-base sm:text-lg" :class="{ 'mb-8': !audioReady && !isCompleted }">
                    Écoutez les {{ totalTests }} sons du patient et identifiez chacun d'eux pour poser le diagnostic.
                </p>

                <!-- Activation audio -->
                <div
                    v-if="!audioReady && !isCompleted"
                    class="bg-cyber-purple/20 border border-cyber-purple/50 rounded-lg p-4 sm:p-6"
                >
                    <button
                        type="button"
                        @click="activateAudio"
                        class="bg-cyber-purple hover:bg-cyber-purple/80 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-lg font-bold text-lg sm:text-xl transition-colors duration-300 flex items-center gap-4 mx-auto"
                    >
                        <Volume2 class="w-8 h-8 shrink-0" />
                        DÉMARRER LE DIAGNOSTIC
                    </button>
                    <p class="text-gray-400 text-sm mt-4">
                        Activez le son de votre appareil (un casque est idéal, à volume modéré).
                    </p>
                </div>
            </div>

            <!-- Mini-jeu d'identification des sons -->
            <div v-if="audioReady && !isCompleted" class="space-y-6">
                <!-- Progression du diagnostic -->
                <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-yellow rounded-lg p-4 sm:p-6 scanline">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <div class="flex items-center gap-3">
                            <Target class="w-5 h-5 shrink-0 text-cyber-yellow" />
                            <span class="text-cyber-yellow font-bold">PROGRESSION</span>
                        </div>
                        <div class="text-cyber-yellow font-bold whitespace-nowrap">
                            TEST {{ currentTest + 1 }} / {{ totalTests }}
                        </div>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-3">
                        <div
                            class="bg-cyber-yellow h-3 rounded-full transition-all duration-500"
                            :style="{ width: progressPercent + '%' }"
                        ></div>
                    </div>
                </div>

                <!-- Interface du test -->
                <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-4 sm:p-8 scanline">
                    <div class="text-center mb-8">
                        <h3 class="text-cyber-purple font-bold text-xl sm:text-2xl mb-4">
                            {{ currentTestData.title }}
                        </h3>
                        <p class="text-gray-300 mb-6">
                            {{ currentTestData.description }}
                        </p>

                        <!-- Visualisation audio -->
                        <div class="mb-8" aria-hidden="true">
                            <div class="flex justify-center items-end gap-1 sm:gap-2 h-32">
                                <div
                                    v-for="(bar, index) in audioBars"
                                    :key="index"
                                    class="bg-cyber-purple rounded-t transition-all duration-100"
                                    :style="{
                                        height: bar + '%',
                                        width: '8px',
                                        opacity: isPlaying ? 1 : 0.3
                                    }"
                                ></div>
                            </div>
                        </div>
                    </div>

                    <!-- Bouton d'écoute -->
                    <div class="flex items-center justify-center mb-8">
                        <button
                            ref="playButton"
                            type="button"
                            @click="playTestSound"
                            :disabled="isPlaying"
                            class="bg-cyber-purple hover:bg-cyber-purple/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 sm:px-10 py-4 sm:py-5 rounded-lg font-bold text-lg sm:text-xl transition-colors duration-300 flex items-center gap-4"
                        >
                            <Play class="w-6 h-6 shrink-0" />
                            {{ isPlaying ? 'EN COURS...' : hasPlayed ? 'RÉÉCOUTER LE SON' : 'ÉCOUTER LE SON' }}
                        </button>
                    </div>

                    <p v-if="!hasPlayed" class="text-center text-sm text-gray-400 mb-4">
                        Écoutez le son avant de choisir une réponse.
                    </p>

                    <!-- Options de réponse -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            v-for="(option, index) in currentTestData.options"
                            :key="currentTest + '-' + index"
                            type="button"
                            @click="selectAnswer(index)"
                            :disabled="!canAnswer"
                            :class="[
                                'p-4 sm:p-6 rounded-lg border-2 transition-all duration-300 font-bold text-base sm:text-lg text-left',
                                getOptionClass(index)
                            ]"
                        >
                            <div class="flex items-center gap-3">
                                <component :is="option.icon" class="w-6 h-6 shrink-0" />
                                <span>{{ option.text }}</span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Résultat du test -->
                <div
                    v-if="showResults"
                    role="status"
                    class="bg-gray-800/60 backdrop-blur-md border-2 rounded-lg p-4 sm:p-6 scanline"
                    :class="isCurrentCorrect ? 'border-cyber-green' : 'border-red-500'"
                >
                    <div class="text-center">
                        <div class="flex items-center justify-center gap-3 mb-4">
                            <CheckCircle v-if="isCurrentCorrect" class="w-8 h-8 shrink-0 text-cyber-green" />
                            <XCircle v-else class="w-8 h-8 shrink-0 text-red-500" />
                            <h3
                                class="font-bold text-xl sm:text-2xl"
                                :class="isCurrentCorrect ? 'text-cyber-green' : 'text-red-500'"
                            >
                                {{ isCurrentCorrect ? 'RÉPONSE CORRECTE !' : 'RÉPONSE INCORRECTE' }}
                            </h3>
                        </div>
                        <p class="text-gray-300" :class="{ 'mb-6': isCurrentCorrect }">
                            {{
                                isCurrentCorrect
                                    ? currentTestData.result
                                    : "Ce n'est pas le bon diagnostic. Patientez quelques secondes, réécoutez le son puis réessayez."
                            }}
                        </p>
                        <button
                            v-if="isCurrentCorrect"
                            type="button"
                            @click="nextTest"
                            class="bg-cyber-green hover:bg-cyber-green/80 text-black px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-300"
                        >
                            TEST SUIVANT
                        </button>
                    </div>
                </div>
            </div>

            <!-- Diagnostic terminé -->
            <div
                v-if="isCompleted"
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-4 sm:p-8 scanline"
            >
                <div class="flex items-center justify-center gap-3 mb-4">
                    <CheckCircle class="w-8 h-8 shrink-0 text-cyber-green" />
                    <h3 class="font-cyber font-bold text-cyber-green text-xl sm:text-2xl text-center">
                        DIAGNOSTIC AUDITIF TERMINÉ
                    </h3>
                </div>
                <p v-if="completedThisVisit" class="text-center text-gray-300 mb-6">
                    {{ firstTryCount }} son{{ firstTryCount > 1 ? 's' : '' }} sur {{ totalTests }}
                    identifié{{ firstTryCount > 1 ? 's' : '' }} du premier coup.
                </p>

                <ul class="space-y-3 mb-6">
                    <li
                        v-for="test in TESTS"
                        :key="test.soundType"
                        class="flex items-start gap-3 bg-gray-700/30 rounded-lg p-3"
                    >
                        <component :is="test.options[test.correctAnswer].icon" class="w-5 h-5 shrink-0 mt-0.5 text-cyber-green" />
                        <div>
                            <div class="font-bold text-cyber-green">
                                {{ test.title }} → {{ test.options[test.correctAnswer].text }}
                            </div>
                            <div class="text-sm text-gray-300">{{ test.result }}</div>
                        </div>
                    </li>
                </ul>

                <div class="bg-cyber-purple/10 border border-cyber-purple/50 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <BookOpen class="w-5 h-5 shrink-0 text-cyber-purple" />
                        <h4 class="font-cyber font-bold text-cyber-purple">À RETENIR</h4>
                    </div>
                    <ul class="space-y-2 text-sm text-gray-300 list-disc pl-5">
                        <li>
                            Le stéthoscope sert à <strong>ausculter</strong> : au repos, un cœur normal bat
                            de façon régulière, 60 à 100 fois par minute.
                        </li>
                        <li>
                            Un sifflement pendant l'expiration (<strong>sibilant</strong>) signale des bronches
                            rétrécies, comme lors d'une crise d'asthme.
                        </li>
                        <li>
                            Les <strong>acouphènes</strong> sont souvent causés par des sons trop forts, qui
                            peuvent détruire définitivement les cellules ciliées de l'oreille interne : baissez
                            le volume du casque, faites des pauses et portez des bouchons d'oreilles en concert.
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Indices -->
            <div
                v-if="!isCompleted"
                class="bg-gray-800/60 backdrop-blur-md border-2 border-yellow-500 rounded-lg p-4 sm:p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <Lightbulb class="w-5 h-5 shrink-0 text-yellow-500" />
                    <h4 class="font-cyber font-bold text-yellow-500">
                        INDICES — TEST {{ currentTest + 1 }}
                    </h4>
                </div>

                <div class="space-y-2 text-sm text-gray-300">
                    <div
                        v-for="(hint, index) in currentHints"
                        :key="currentTest + '-' + index"
                        class="fade-in"
                    >
                        💡 {{ hint }}
                    </div>
                    <p v-if="hintsShown > 0" class="text-xs text-gray-500">
                        Chaque indice débloqué s'applique aux {{ totalTests }} tests.
                    </p>
                </div>

                <button
                    type="button"
                    @click="showHint"
                    :disabled="!canShowHint"
                    class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent font-tech text-sm rounded transition-all"
                >
                    {{ canShowHint ? 'AFFICHER UN INDICE' : "PLUS D'INDICE DISPONIBLE" }}
                </button>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
    Activity,
    BookOpen,
    CheckCircle,
    Heart,
    Lightbulb,
    Play,
    Target,
    Volume2,
    VolumeX,
    Wind,
    XCircle,
    Zap,
} from 'lucide-vue-next'
import GameRoom from '../GameRoom.vue'
import { createFireworks } from '../../utils/fireworks'
import { useGameState } from '../../composables/useGameState'
import { useToast } from '../../composables/useToast'
import { useAudio } from '../../composables/useAudio'

const ROOM_ID = 'audition'
const ANSWER_COOLDOWN_MS = 3000
const HEARTBEAT_SRC = '/battement_de_coeur.mp3'
const BAR_COUNT = 20
const IDLE_BAR_HEIGHT = 8

const emit = defineEmits(['exit-room', 'room-completed'])
const { gameState, completeRoom, addError, addHint, PENALTY_PER_ERROR } = useGameState()
const { showSuccess, showError, showInfo } = useToast()
const { audioState } = useAudio()

const roomData = {
    title: "SALLE DE L'AUDITION",
    subtitle: "Diagnostic auditif interactif",
    description: "Identifiez trois sons médicaux : les battements du cœur, la respiration et un son perçu par l'oreille du patient.",
    objective: "Reconnaître des sons médicaux et comprendre les troubles auditifs",
    icon: "volume-2",
    color: "#8b5cf6",
}

// Données des tests (non réactives : contiennent des composants d'icônes).
// hints[n] = indice de niveau n+1 ; le dernier niveau donne la réponse.
const TESTS = [
    {
        title: "Test 1 : Battements cardiaques",
        description: "Écoutez le cœur du patient au stéthoscope : les battements sont-ils normaux ou irréguliers ?",
        soundType: "heartbeat",
        duration: 6.2,
        correctAnswer: 0,
        options: [
            { text: "Battements normaux", icon: Heart },
            { text: "Battements irréguliers", icon: Activity },
        ],
        hints: [
            "Comptez les battements : au repos, un cœur normal bat 60 à 100 fois par minute, à intervalles réguliers, avec un double bruit « boum-boum ».",
            "Solution du test 1 : environ un battement par seconde, parfaitement régulier → « Battements normaux ».",
        ],
        result: "Rythme régulier d'environ 65 battements par minute, avec le double bruit « boum-boum » de la fermeture des valves : c'est un cœur normal.",
    },
    {
        title: "Test 2 : Respiration",
        description: "Écoutez les poumons du patient pendant deux cycles respiratoires : la respiration est-elle normale ou sifflante ?",
        soundType: "breathing",
        duration: 6.5,
        correctAnswer: 1,
        options: [
            { text: "Respiration normale", icon: Wind },
            { text: "Respiration sifflante", icon: Zap },
        ],
        hints: [
            "Une respiration normale ne produit qu'un souffle doux. Si vous entendez une note musicale aiguë, surtout pendant l'expiration, les bronches sont rétrécies.",
            "Solution du test 2 : on entend un sifflement musical à chaque expiration → « Respiration sifflante ».",
        ],
        result: "Ce sifflement musical, plus fort à l'expiration, s'appelle un sibilant : l'air passe dans des bronches rétrécies, comme lors d'une crise d'asthme.",
    },
    {
        title: "Test 3 : Sons de l'oreille",
        description: "Le patient entend ce son en permanence, même dans une pièce silencieuse. De quoi s'agit-il ?",
        soundType: "ear",
        duration: 4,
        correctAnswer: 0,
        options: [
            { text: "Acouphène (sifflement dans l'oreille)", icon: VolumeX },
            { text: "Audition normale", icon: Volume2 },
        ],
        hints: [
            "Aucune source extérieure ne produit ce son : il est perçu uniquement par le patient. Entendre un sifflement permanent dans le silence n'est pas normal.",
            "Solution du test 3 : un sifflement aigu permanent, sans source extérieure → « Acouphène ».",
        ],
        result: "C'est un acouphène : un son perçu sans aucune source extérieure, souvent lié à une exposition à des sons trop forts (concerts, casque à fond).",
    },
]
const MAX_HINT_LEVEL = Math.max(...TESTS.map((t) => t.hints.length))

// État réactif
const audioReady = ref(false)
const currentTest = ref(0)
const selectedAnswer = ref(null)
const hasPlayed = ref(false)
const showResults = ref(false)
const isPlaying = ref(false)
const isCompleted = ref(gameState.completedRooms.includes(ROOM_ID))
const completedThisVisit = ref(false)
const firstTryResults = ref([]) // index du test -> réussi du premier coup ?
const audioBars = ref(Array(BAR_COUNT).fill(IDLE_BAR_HEIGHT))
const playButton = ref(null) // bouton d'écoute (focus clavier au test suivant)
// Indices déjà payés dans cette salle : réaffichés gratuitement
const hintsShown = ref(Math.min(gameState.roomHints[ROOM_ID] || 0, MAX_HINT_LEVEL))

// État audio (non réactif)
let audioCtx = null
let masterGain = null
let heartbeatAudio = null
let currentVoice = null
let barsInterval = null
let playTimer = null
let resetTimer = null
let playToken = 0
let isUnmounted = false
const timers = new Set()

// Valeurs calculées
const totalTests = TESTS.length
const currentTestData = computed(() => TESTS[currentTest.value])
const isCurrentCorrect = computed(
    () => showResults.value && selectedAnswer.value === currentTestData.value.correctAnswer
)
const canAnswer = computed(() => hasPlayed.value && !showResults.value && !isCompleted.value)
const progressPercent = computed(() => {
    if (isCompleted.value) return 100
    const done = currentTest.value + (isCurrentCorrect.value ? 1 : 0)
    return Math.round((done / totalTests) * 100)
})
const firstTryCount = computed(() => firstTryResults.value.filter(Boolean).length)
const currentHints = computed(() => currentTestData.value.hints.slice(0, hintsShown.value))
const canShowHint = computed(() => !isCompleted.value && hintsShown.value < MAX_HINT_LEVEL)

const getOptionClass = (index) => {
    if (showResults.value && selectedAnswer.value === index) {
        return index === currentTestData.value.correctAnswer
            ? 'border-cyber-green bg-cyber-green/20 text-cyber-green cursor-default'
            : 'border-red-500 bg-red-500/20 text-red-400 cursor-not-allowed'
    }
    return canAnswer.value
        ? 'border-gray-600 text-gray-300 hover:border-cyber-purple hover:text-cyber-purple cursor-pointer'
        : 'border-gray-600 text-gray-300 opacity-50 cursor-not-allowed'
}

// Timers suivis pour être tous annulés au démontage
const later = (fn, ms) => {
    const id = setTimeout(() => {
        timers.delete(id)
        fn()
    }, ms)
    timers.add(id)
    return id
}
const cancel = (id) => {
    if (id !== null && id !== undefined) {
        clearTimeout(id)
        timers.delete(id)
    }
}

// --- Audio ---------------------------------------------------------------

const getVolume = () => (audioState.isMuted ? 0 : audioState.volume)

const updateMasterVolume = () => {
    if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(getVolume(), audioCtx.currentTime)
    }
    if (heartbeatAudio) {
        heartbeatAudio.muted = audioState.isMuted
        heartbeatAudio.volume = Math.min(1, getVolume() * 0.8)
    }
}

// Synchronisation avec les contrôles audio globaux (volume / muet)
watch(() => [audioState.volume, audioState.isMuted], updateMasterVolume)

const initAudioContext = async () => {
    if (!audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) throw new Error('Web Audio API non disponible')
        audioCtx = new AudioCtx()
        masterGain = audioCtx.createGain()
        masterGain.connect(audioCtx.destination)
        updateMasterVolume()
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume()
    }
}

const activateAudio = async () => {
    try {
        await initAudioContext()
    } catch (error) {
        if (isUnmounted) return
        console.error('Erreur activation audio:', error)
        showError(
            "ERREUR D'ACTIVATION",
            "Impossible d'activer l'audio. Vérifiez les permissions du navigateur. Les indices peuvent vous aider."
        )
    }
    // Le diagnostic reste accessible même sans audio (aucun blocage de la partie)
    if (!isUnmounted) audioReady.value = true
}

const startBars = () => {
    stopBars()
    barsInterval = setInterval(() => {
        audioBars.value = audioBars.value.map(() => 10 + Math.random() * 90)
    }, 100)
}

const stopBars = () => {
    if (barsInterval) {
        clearInterval(barsInterval)
        barsInterval = null
    }
    audioBars.value = Array(BAR_COUNT).fill(IDLE_BAR_HEIGHT)
}

// Une "voix" regroupe tous les nœuds d'un son pour pouvoir tout arrêter d'un coup
const createVoice = () => {
    const output = audioCtx.createGain()
    output.connect(masterGain)
    currentVoice = { output, sources: [] }
    return currentVoice
}

const stopVoice = (voice) => {
    if (!voice) return
    voice.sources.forEach((source) => {
        try { source.stop() } catch { /* déjà arrêté */ }
        try { source.disconnect() } catch { /* déjà déconnecté */ }
    })
    voice.sources = []
    try { voice.output.disconnect() } catch { /* déjà déconnecté */ }
}

// Arrête tout son en cours (synthèse + MP3) et invalide les timers de lecture
const stopAllSounds = () => {
    playToken++
    cancel(playTimer)
    playTimer = null
    stopBars()
    stopVoice(currentVoice)
    currentVoice = null
    if (heartbeatAudio) {
        heartbeatAudio.pause()
        heartbeatAudio = null
    }
    isPlaying.value = false
}

// Applique une enveloppe [[t, valeur], ...] (rampes linéaires) à partir de t0
const applyEnvelope = (param, t0, points) => {
    points.forEach(([dt, value], i) => {
        if (i === 0) param.setValueAtTime(value, t0 + dt)
        else param.linearRampToValueAtTime(value, t0 + dt)
    })
}

const playTestSound = async () => {
    if (isPlaying.value || isCompleted.value) return
    isPlaying.value = true
    const token = ++playToken
    const test = currentTestData.value

    try {
        await initAudioContext()
    } catch (error) {
        // Lecture annulée entre-temps (test suivant, sortie de la salle...) : aucun message
        if (token !== playToken || isUnmounted) return
        console.error('Erreur audio:', error)
        showError("ERREUR AUDIO", "Impossible de jouer le son. Utilisez les indices pour vous aider.")
        isPlaying.value = false
        hasPlayed.value = true
        return
    }
    // Lecture annulée pendant l'initialisation (test suivant, sortie de la salle...)
    if (token !== playToken || isUnmounted) return

    hasPlayed.value = true
    startBars()
    playTimer = later(() => {
        playTimer = null
        if (token === playToken) stopAllSounds()
    }, test.duration * 1000)

    try {
        switch (test.soundType) {
            case 'heartbeat':
                await playHeartbeatSound(token)
                break
            case 'breathing':
                playBreathingSound(test.duration)
                break
            case 'ear':
                playEarSound(test.duration)
                break
        }
    } catch (error) {
        // Une lecture interrompue volontairement (pause pendant le chargement) n'est pas une erreur
        if (token !== playToken || isUnmounted) return
        console.error('Erreur audio:', error)
        showError("ERREUR AUDIO", "Impossible de jouer le son. Utilisez les indices pour vous aider.")
        stopAllSounds()
    }
}

// Test 1 : battements cardiaques (enregistrement réel, ~65 battements/min)
const playHeartbeatSound = async (token) => {
    const audio = new Audio(HEARTBEAT_SRC)
    heartbeatAudio = audio
    audio.muted = audioState.isMuted
    audio.volume = Math.min(1, getVolume() * 0.8)
    await audio.play()
    // Lecture arrêtée pendant le chargement : on coupe immédiatement
    if (token !== playToken || heartbeatAudio !== audio) {
        audio.pause()
    }
}

// Test 2 : respiration sifflante (souffle + sibilant musical, 2 cycles complets)
const playBreathingSound = (duration) => {
    const ctx = audioCtx
    const voice = createVoice()
    const start = ctx.currentTime + 0.05
    const CYCLE = 3.2 // inspiration 1.2 s, pause 0.2 s, expiration 1.6 s, silence 0.2 s
    const cycles = Math.max(1, Math.floor((duration - 0.1) / CYCLE))
    const end = start + cycles * CYCLE

    // Bruit blanc en boucle -> souffle respiratoire
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true

    const breathFilter = ctx.createBiquadFilter()
    breathFilter.type = 'bandpass'
    breathFilter.frequency.setValueAtTime(900, start)
    breathFilter.Q.setValueAtTime(0.7, start)
    const breathGain = ctx.createGain()
    breathGain.gain.setValueAtTime(0, ctx.currentTime)

    // Sibilant : deux notes musicales (composante tonale du sifflement)
    const wheezeGain = ctx.createGain()
    wheezeGain.gain.setValueAtTime(0, ctx.currentTime)
    const tones = [
        { ratio: 1, level: 1 },
        { ratio: 1.5, level: 0.4 },
    ].map(({ ratio, level }) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        const toneGain = ctx.createGain()
        toneGain.gain.setValueAtTime(level, ctx.currentTime)
        osc.connect(toneGain)
        toneGain.connect(wheezeGain)
        return { osc, ratio }
    })

    for (let c = 0; c < cycles; c++) {
        const t0 = start + c * CYCLE
        // Souffle : inspiration puis expiration
        applyEnvelope(breathGain.gain, t0, [
            [0, 0], [0.4, 0.6], [1.1, 0.5], [1.2, 0],
            [1.4, 0], [1.7, 0.5], [2.7, 0.45], [3.0, 0],
        ])
        // Sifflement : léger à l'inspiration, net pendant toute l'expiration
        applyEnvelope(wheezeGain.gain, t0, [
            [0, 0], [0.6, 0.04], [1.2, 0],
            [1.4, 0], [1.8, 0.12], [2.7, 0.1], [3.0, 0],
        ])
        // Hauteur du sifflement : légère descente pendant l'expiration
        tones.forEach(({ osc, ratio }) => {
            applyEnvelope(osc.frequency, t0, [
                [0, 500 * ratio], [1.2, 500 * ratio],
                [1.4, 540 * ratio], [3.0, 450 * ratio],
            ])
        })
    }

    noise.connect(breathFilter)
    breathFilter.connect(breathGain)
    breathGain.connect(voice.output)
    wheezeGain.connect(voice.output)

    noise.start(start)
    noise.stop(end)
    voice.sources.push(noise)
    tones.forEach(({ osc }) => {
        osc.start(start)
        osc.stop(end)
        voice.sources.push(osc)
    })
}

// Test 3 : acouphène (sifflement aigu permanent autour de 8 kHz)
const playEarSound = (duration) => {
    const ctx = audioCtx
    const voice = createVoice()
    const start = ctx.currentTime + 0.05
    const end = start + duration - 0.2

    // Enveloppe globale : fondu d'entrée et de sortie (volume volontairement modéré)
    const envelope = ctx.createGain()
    applyEnvelope(envelope.gain, start, [[0, 0], [0.5, 1], [duration - 0.6, 1], [duration - 0.2, 0]])
    envelope.connect(voice.output)

    // Très légère modulation de fréquence (3-5 Hz), commune aux trois sinus
    const lfo = ctx.createOscillator()
    lfo.frequency.setValueAtTime(0.3 + Math.random() * 0.2, start)
    const lfoDepth = ctx.createGain()
    lfoDepth.gain.setValueAtTime(3 + Math.random() * 2, start)
    lfo.connect(lfoDepth)

    const partials = [
        { frequency: 8000, amplitude: 0.15 }, // tonalité principale
        { frequency: 8005, amplitude: 0.12 }, // battement lent avec la principale
        { frequency: 12000, amplitude: 0.04 }, // harmonique plus aiguë
    ]
    partials.forEach(({ frequency, amplitude }) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(frequency, start)
        lfoDepth.connect(osc.frequency)
        const gain = ctx.createGain()
        gain.gain.setValueAtTime(amplitude, start)
        osc.connect(gain)
        gain.connect(envelope)
        osc.start(start)
        osc.stop(end)
        voice.sources.push(osc)
    })

    lfo.start(start)
    lfo.stop(end)
    voice.sources.push(lfo)
}

// --- Logique du jeu --------------------------------------------------------

const selectAnswer = (answerIndex) => {
    if (!canAnswer.value) return

    const testIndex = currentTest.value
    const test = TESTS[testIndex]
    const isCorrect = answerIndex === test.correctAnswer

    selectedAnswer.value = answerIndex
    showResults.value = true
    if (firstTryResults.value[testIndex] === undefined) {
        firstTryResults.value[testIndex] = isCorrect
    }

    if (isCorrect) {
        if (testIndex === totalTests - 1) {
            finishDiagnostic()
        } else {
            showSuccess("RÉPONSE CORRECTE !", test.result)
        }
        return
    }

    addError(ROOM_ID)
    showError(
        "RÉPONSE INCORRECTE",
        `Réécoutez le son et réessayez. +${PENALTY_PER_ERROR}s de pénalité`
    )
    // Délai avant un nouvel essai : les réponses restent désactivées pendant ce temps
    cancel(resetTimer)
    resetTimer = later(() => {
        resetTimer = null
        if (isCompleted.value || currentTest.value !== testIndex || selectedAnswer.value !== answerIndex) return
        selectedAnswer.value = null
        showResults.value = false
        // Il faut réécouter le son, sauf s'il est justement en cours de lecture
        hasPlayed.value = isPlaying.value
    }, ANSWER_COOLDOWN_MS)
}

const nextTest = () => {
    if (isCompleted.value || !isCurrentCorrect.value || currentTest.value >= totalTests - 1) return
    stopAllSounds()
    cancel(resetTimer)
    resetTimer = null
    currentTest.value++
    selectedAnswer.value = null
    hasPlayed.value = false
    showResults.value = false
    // Le bouton "TEST SUIVANT" disparaît : on place le focus sur le bouton d'écoute (clavier)
    nextTick(() => {
        if (!isUnmounted) playButton.value?.focus()
    })
}

const finishDiagnostic = () => {
    if (isCompleted.value) return
    isCompleted.value = true
    completedThisVisit.value = true
    stopAllSounds()
    cancel(resetTimer)
    resetTimer = null

    completeRoom(ROOM_ID)
    emit('room-completed', ROOM_ID)

    // La salle se ferme aussitôt : le toast porte l'explication du dernier son
    createFireworks(3000)
    showSuccess(
        "DIAGNOSTIC TERMINÉ !",
        `${TESTS[totalTests - 1].result} Bilan : ${firstTryCount.value}/${totalTests} sons identifiés du premier coup.`,
        7000
    )
}

// Indices : un niveau débloqué s'applique aux 3 tests (dernier niveau = solution)
const showHint = () => {
    if (!canShowHint.value) return
    const alreadyPaid = gameState.roomHints[ROOM_ID] || 0
    hintsShown.value++
    if (hintsShown.value > alreadyPaid) {
        addHint(ROOM_ID)
    }
}

onMounted(() => {
    if (isCompleted.value) return
    showInfo(
        "DIAGNOSTIC AUDITIF INTERACTIF",
        "Écoutez attentivement chaque son et identifiez sa nature pour diagnostiquer le patient."
    )
})

onUnmounted(() => {
    isUnmounted = true
    stopAllSounds()
    timers.forEach((id) => clearTimeout(id))
    timers.clear()
    if (masterGain) {
        try { masterGain.disconnect() } catch { /* déjà déconnecté */ }
        masterGain = null
    }
    if (audioCtx) {
        const closing = audioCtx.close()
        if (closing && typeof closing.catch === 'function') closing.catch(() => {})
        audioCtx = null
    }
})
</script>

<style scoped>
.fade-in {
    animation: fadeIn 0.5s ease-in-out;
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
