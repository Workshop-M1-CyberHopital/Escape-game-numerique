<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <div class="space-y-6">
            <!-- Instructions du mini-jeu -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-8 scanline text-center"
            >
                <div class="flex items-center justify-center gap-3 mb-6">
                    <i data-lucide="activity" class="w-8 h-8 text-cyber-purple"></i>
                    <h3 class="font-cyber font-bold text-cyber-purple text-2xl">
                        DIAGNOSTIC AUDITIF INTERACTIF
                    </h3>
                </div>
                <p class="text-gray-300 mb-8 text-lg">
                    Testez l'audition du patient en identifiant les sons corrects !
                </p>
                
                <!-- Activation audio -->
                <div v-if="!audioContext" class="bg-cyber-purple/20 border border-cyber-purple/50 rounded-lg p-6 mb-8">
                    <button
                        @click="activateAudio"
                        class="bg-cyber-purple hover:bg-cyber-purple/80 text-white px-10 py-5 rounded-lg font-bold text-xl transition-colors duration-300 flex items-center gap-4 mx-auto"
                    >
                        <i data-lucide="volume-2" class="w-8 h-8"></i>
                        DÉMARRER LE DIAGNOSTIC
                    </button>
                </div>
            </div>

            <!-- Mini-jeu d'audiogramme -->
            <div v-if="audioContext" class="space-y-6">
                <!-- Progression du test -->
                <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-yellow rounded-lg p-6 scanline">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <i data-lucide="target" class="w-5 h-5 text-cyber-yellow"></i>
                            <span class="text-cyber-yellow font-bold">PROGRESSION DU TEST</span>
                        </div>
                        <div class="text-cyber-yellow font-bold">
                            {{ currentTest + 1 }} / {{ totalTests }}
                        </div>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-3">
                        <div 
                            class="bg-cyber-yellow h-3 rounded-full transition-all duration-500"
                            :style="{ width: ((currentTest + 1) / totalTests * 100) + '%' }"
                        ></div>
                    </div>
                </div>

                <!-- Interface du test -->
                <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-8 scanline">
                    <div class="text-center mb-8">
                        <h3 class="text-cyber-purple font-bold text-2xl mb-4">
                            {{ testData[currentTest]?.title }}
                        </h3>
                        <p class="text-gray-300 mb-6">
                            {{ testData[currentTest]?.description }}
                        </p>
                        
                        <!-- Visualisation audio -->
                        <div class="mb-8">
                            <div class="flex justify-center items-end gap-2 h-32">
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
                    
                    <!-- Boutons de contrôle -->
                    <div class="flex items-center justify-center gap-8 mb-8">
                        <button
                            @click="playTestSound"
                            :disabled="isPlaying"
                            class="bg-cyber-purple hover:bg-cyber-purple/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-10 py-5 rounded-lg font-bold text-xl transition-colors duration-300 flex items-center gap-4"
                        >
                            <i data-lucide="play" class="w-6 h-6"></i>
                            {{ isPlaying ? 'EN COURS...' : 'ÉCOUTER LE SON' }}
                        </button>
                    </div>

                    <!-- Options de réponse -->
                    <div class="grid grid-cols-2 gap-4">
                        <button
                            v-for="(option, index) in testData[currentTest]?.options"
                            :key="index"
                            @click="selectAnswer(index)"
                            :disabled="!hasPlayed"
                            :class="[
                                'p-6 rounded-lg border-2 transition-all duration-300 font-bold text-lg',
                                selectedAnswer === index 
                                    ? 'border-cyber-green bg-cyber-green/20 text-cyber-green' 
                                    : 'border-gray-600 hover:border-cyber-purple text-gray-300 hover:text-cyber-purple',
                                !hasPlayed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            ]"
                        >
                            <div class="flex items-center gap-3">
                                <i :data-lucide="option.icon" class="w-6 h-6"></i>
                                {{ option.text }}
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Résultats du test -->
                <div v-if="showResults" class="bg-gray-800/60 backdrop-blur-md border-2 rounded-lg p-6 scanline" 
                     :class="selectedAnswer === testData[currentTest]?.correctAnswer ? 'border-cyber-green' : 'border-red-500'">
                    <div class="text-center">
                        <div class="flex items-center justify-center gap-3 mb-4">
                            <i :data-lucide="selectedAnswer === testData[currentTest]?.correctAnswer ? 'check-circle' : 'x-circle'" 
                               :class="selectedAnswer === testData[currentTest]?.correctAnswer ? 'w-8 h-8 text-cyber-green' : 'w-8 h-8 text-red-500'"></i>
                            <h3 :class="selectedAnswer === testData[currentTest]?.correctAnswer ? 'text-cyber-green font-bold text-2xl' : 'text-red-500 font-bold text-2xl'">
                                {{ selectedAnswer === testData[currentTest]?.correctAnswer ? 'RÉPONSE CORRECTE !' : 'RÉPONSE INCORRECTE' }}
                            </h3>
                        </div>
                        <p class="text-gray-300 mb-6">
                            {{ selectedAnswer === testData[currentTest]?.correctAnswer ? testData[currentTest]?.result : 'Vous devez avoir la bonne réponse pour continuer. Réécoutez le son et réessayez.' }}
                        </p>
                        <button
                            v-if="selectedAnswer === testData[currentTest]?.correctAnswer"
                            @click="nextTest"
                            class="bg-cyber-green hover:bg-cyber-green/80 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-300"
                        >
                            {{ currentTest < totalTests - 1 ? 'TEST SUIVANT' : 'TERMINER LE DIAGNOSTIC' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Indices -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-yellow-500 rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="lightbulb" class="w-5 h-5 text-yellow-500"></i>
                    <h4 class="font-cyber font-bold text-yellow-500">INDICES</h4>
                </div>

                <div class="space-y-2 text-sm text-gray-300">
                    <div v-if="hintsShown >= 1" class="fade-in">
                        💡 Écoutez attentivement chaque son avant de répondre.
                    </div>
                    <div v-if="hintsShown >= 2" class="fade-in">
                        💡 Les sons médicaux ont des caractéristiques spécifiques (rythme, fréquence, intensité).
                    </div>
                    <div v-if="hintsShown >= 3" class="fade-in">
                        💡 Concentrez-vous sur le rythme et la régularité des sons.
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import GameRoom from '../GameRoom.vue'
import { createFireworks } from '../../utils/fireworks'
import { useGameState } from '../../composables/useGameState'
import { useToast } from '../../composables/useToast'
import { useAudio } from '../../composables/useAudio'

const emit = defineEmits(['exit-room', 'room-completed'])
const { completeRoom, addError, addHint, PENALTY_PER_ERROR } = useGameState()
const { showSuccess, showError, showWarning, showInfo } = useToast()
const { audioState } = useAudio()

const roomData = {
    title: "SALLE DE L'AUDITION",
    subtitle: "Diagnostic auditif interactif",
    description: "Testez l'audition du patient en identifiant les sons médicaux corrects.",
    objective: "Identifier les sons médicaux pour diagnostiquer l'audition",
    icon: "volume-2",
    color: "#8b5cf6",
};

// Variables réactives
const audioContext = ref(null)
const currentTest = ref(0)
const selectedAnswer = ref(null)
const hasPlayed = ref(false)
const showResults = ref(false)
const isPlaying = ref(false)
const hintsShown = ref(0)
const correctAnswers = ref(0)
const masterGainNode = ref(null)
const currentAudioElement = ref(null) // Ajouter une référence pour l'élément audio en cours

// Données des tests d'audiogramme
const testData = ref([
    {
        title: "Test 1: Battements cardiaques",
        description: "Écoutez ce son et identifiez s'il s'agit de battements cardiaques normaux ou anormaux.",
        soundType: "heartbeat",
        correctAnswer: 0,
        options: [
            { text: "Battements normaux", icon: "heart" },
            { text: "Battements irréguliers", icon: "activity" }
        ],
        result: "Excellent ! Vous avez identifié correctement les battements cardiaques normaux."
    },
    {
        title: "Test 2: Respiration",
        description: "Identifiez le type de respiration que vous entendez.",
        soundType: "breathing",
        correctAnswer: 1,
        options: [
            { text: "Respiration normale", icon: "wind" },
            { text: "Respiration sifflante", icon: "zap" }
        ],
        result: "Parfait ! Vous avez détecté la respiration sifflante, signe d'un problème respiratoire."
    },
    {
        title: "Test 3: Sons de l'oreille",
        description: "Écoutez attentivement et déterminez la nature de ce son auditif.",
        soundType: "ear",
        correctAnswer: 0,
        options: [
            { text: "Acouphènes (bourdonnement)", icon: "volume-x" },
            { text: "Son normal", icon: "volume-2" }
        ],
        result: "Bravo ! Vous avez identifié les acouphènes, un symptôme important à traiter."
    }
])

// Variables calculées
const totalTests = computed(() => testData.value.length)
const audioBars = ref(Array(20).fill(0))

// Initialiser l'AudioContext
const initAudioContext = async () => {
    if (!audioContext.value) {
        audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
        
        // Créer un gain node principal pour contrôler le volume global
        masterGainNode.value = audioContext.value.createGain()
        masterGainNode.value.connect(audioContext.value.destination)
        
        // Appliquer le volume initial et l'état mute
        updateMasterVolume()
    }
    if (audioContext.value.state === 'suspended') {
        await audioContext.value.resume()
    }
}

// Fonction pour mettre à jour le volume principal
const updateMasterVolume = () => {
    if (masterGainNode.value) {
        if (audioState.isMuted) {
            masterGainNode.value.gain.setValueAtTime(0, audioContext.value.currentTime)
        } else {
            masterGainNode.value.gain.setValueAtTime(audioState.volume, audioContext.value.currentTime)
        }
    }
    
    // Mettre à jour aussi l'élément audio HTML s'il existe
    if (currentAudioElement.value) {
        if (audioState.isMuted) {
            currentAudioElement.value.volume = 0
        } else {
            currentAudioElement.value.volume = audioState.volume * 0.8
        }
    }
}

// Watcher pour synchroniser le volume avec AudioControls
watch(() => audioState.volume, () => {
    updateMasterVolume()
})

// Watcher pour synchroniser le mute avec AudioControls
watch(() => audioState.isMuted, () => {
    updateMasterVolume()
})

// Activer l'audio
const activateAudio = async () => {
    try {
        await initAudioContext()
    } catch (error) {
        console.error('Erreur activation audio:', error)
        showError(
            "ERREUR D'ACTIVATION",
            "Impossible d'activer l'audio. Vérifiez les permissions du navigateur."
        )
    }
}

// Générer des barres audio animées
const animateAudioBars = () => {
    const interval = setInterval(() => {
        if (isPlaying.value) {
            audioBars.value = audioBars.value.map(() => Math.random() * 100)
        } else {
            clearInterval(interval)
        }
    }, 100)
}

// Jouer un son de test selon le type
const playTestSound = async () => {
    try {
        await initAudioContext()
        isPlaying.value = true
        hasPlayed.value = true
        animateAudioBars()
        
        const currentTestData = testData.value[currentTest.value]
        const duration = 3 // 3 secondes
        
        console.log('Jouer son:', currentTestData.soundType) // Debug
        
        // Créer des sons différents selon le type de test
        switch (currentTestData.soundType) {
            case 'heartbeat':
                playHeartbeatSound(duration)
                break
            case 'breathing':
                playBreathingSound(duration)
                break
            case 'ear':
                playEarSound(duration)
                break
        }
        
        setTimeout(() => {
            isPlaying.value = false
        }, duration * 1000)
        
    } catch (error) {
        console.error('Erreur audio:', error)
        showError("ERREUR AUDIO", "Impossible de jouer l'audio.")
        isPlaying.value = false
    }
}

// Son de battements cardiaques
const playHeartbeatSound = async (duration) => {
    try {
        // Créer un élément audio pour jouer le MP3
        const audio = new Audio('/battement_de_coeur.mp3')
        currentAudioElement.value = audio // Stocker la référence
        
        // Appliquer le volume et l'état mute
        if (audioState.isMuted) {
            audio.volume = 0
        } else {
            audio.volume = audioState.volume * 0.8
        }
        
        audio.loop = true // Boucle pour la durée du test
        
        // Jouer l'audio
        await audio.play()
        
        // Arrêter après la durée spécifiée
        setTimeout(() => {
            audio.pause()
            audio.currentTime = 0
            currentAudioElement.value = null // Nettoyer la référence
        }, duration * 1000)
        
    } catch (error) {
        console.error('Erreur lecture MP3:', error)
        showError("ERREUR AUDIO", "Impossible de jouer le fichier audio.")
        currentAudioElement.value = null
    }
}

// Son de respiration sifflante
const playBreathingSound = async (duration) => {
    const breathCycles = Math.floor(duration * 0.6)
    
    for (let i = 0; i < breathCycles; i++) {
        const cycleStart = audioContext.value.currentTime + i * 1.6
        
        // Créer du bruit blanc pour chaque cycle
        const bufferSize = audioContext.value.sampleRate * 1.6
        const noiseBuffer = audioContext.value.createBuffer(1, bufferSize, audioContext.value.sampleRate)
        const output = noiseBuffer.getChannelData(0)
        
        // Générer du bruit blanc
        for (let j = 0; j < bufferSize; j++) {
            output[j] = Math.random() * 2 - 1
        }
        
        const noiseSource = audioContext.value.createBufferSource()
        noiseSource.buffer = noiseBuffer
        
        // Filtre passe-bande pour le sifflement (1500-4000 Hz)
        const bandpass = audioContext.value.createBiquadFilter()
        bandpass.type = 'bandpass'
        bandpass.frequency.setValueAtTime(2500, cycleStart)
        bandpass.Q.setValueAtTime(3, cycleStart) // Q élevé pour un son sifflant
        
        // Gain pour contrôler l'enveloppe
        const gainNode = audioContext.value.createGain()
        gainNode.gain.setValueAtTime(0, cycleStart)
        
        // Inspiration (2 secondes) - montée progressive
        gainNode.gain.linearRampToValueAtTime(0.4, cycleStart + 0.3)
        gainNode.gain.linearRampToValueAtTime(0.5, cycleStart + 1.0)
        gainNode.gain.linearRampToValueAtTime(0.3, cycleStart + 2.0)
        
        // Pause (0.3 secondes)
        gainNode.gain.setValueAtTime(0.05, cycleStart + 2.0)
        gainNode.gain.setValueAtTime(0.05, cycleStart + 2.3)
        
        // Expiration (1.3 secondes) - descente progressive
        gainNode.gain.linearRampToValueAtTime(0.45, cycleStart + 2.5)
        gainNode.gain.linearRampToValueAtTime(0.35, cycleStart + 3.2)
        gainNode.gain.linearRampToValueAtTime(0, cycleStart + 3.6)
        
        // Variation de la fréquence du filtre pour plus de réalisme
        bandpass.frequency.linearRampToValueAtTime(2800, cycleStart + 1.0) // Inspiration
        bandpass.frequency.linearRampToValueAtTime(2200, cycleStart + 3.6) // Expiration
        
        // Connexions
        noiseSource.connect(bandpass)
        bandpass.connect(gainNode)
        gainNode.connect(masterGainNode.value)
        
        noiseSource.start(cycleStart)
        noiseSource.stop(cycleStart + 1.6)
    }
}

// Son d'acouphènes
const playEarSound = async (duration) => {
    // S'assurer que currentAudioElement est null pour ce test (pas de MP3)
    currentAudioElement.value = null
    
    const oscillators = []
    const gainNodes = []
    
    // Plusieurs fréquences pour un acouphène plus réaliste
    const frequencies = [
        8000,  // Tonalité principale
        8005,  // Légère variation pour créer un "battement"
        12000  // Harmonique plus aiguë
    ]
    const amplitudes = [0.4, 0.35, 0.15]
    
    for (let i = 0; i < frequencies.length; i++) {
        const osc = audioContext.value.createOscillator()
        const gain = audioContext.value.createGain()
        
        osc.type = 'sine'
        osc.frequency.setValueAtTime(frequencies[i], audioContext.value.currentTime)
        
        // Fade in progressif
        gain.gain.setValueAtTime(0, audioContext.value.currentTime)
        gain.gain.linearRampToValueAtTime(
            amplitudes[i], 
            audioContext.value.currentTime + 0.5
        )
        
        // Modulation TRÈS subtile de la fréquence (tremolo léger)
        const lfoFreq = 0.3 + Math.random() * 0.2 // Entre 0.3 et 0.5 Hz
        const lfoDepth = 3 + Math.random() * 2 // Variation de 3-5 Hz seulement
        
        for (let j = 0; j < duration * 10; j++) {
            const time = audioContext.value.currentTime + j * 0.1
            const modulation = Math.sin(time * lfoFreq * 2 * Math.PI) * lfoDepth
            osc.frequency.setValueAtTime(frequencies[i] + modulation, time)
        }
        
        osc.connect(gain)
        gain.connect(masterGainNode.value)
        
        oscillators.push(osc)
        gainNodes.push(gain)
    }
    
    // Démarrer tous les oscillateurs
    oscillators.forEach(osc => {
        osc.start()
        osc.stop(audioContext.value.currentTime + duration)
    })
}

// Sélectionner une réponse
const selectAnswer = (answerIndex) => {
    if (!hasPlayed.value) return
    
    selectedAnswer.value = answerIndex
    showResults.value = true
    
    const currentTestData = testData.value[currentTest.value]
    const isCorrect = answerIndex === currentTestData.correctAnswer
    
    if (isCorrect) {
        correctAnswers.value++
        showSuccess("RÉPONSE CORRECTE !", currentTestData.result)
    } else {
        // Ajouter une pénalité pour la mauvaise réponse
        addError('audition')
        showError("RÉPONSE INCORRECTE", `Vous devez avoir la bonne réponse pour continuer. Réécoutez le son et réessayez. +${PENALTY_PER_ERROR}s de pénalité`)
        // Réinitialiser pour permettre une nouvelle tentative
        setTimeout(() => {
            selectedAnswer.value = null
            hasPlayed.value = false
            showResults.value = false
        }, 3000)
    }
}

// Passer au test suivant
const nextTest = () => {
    if (currentTest.value < totalTests.value - 1) {
        currentTest.value++
        selectedAnswer.value = null
        hasPlayed.value = false
        showResults.value = false
    } else {
        // Terminer le diagnostic
        const successRate = (correctAnswers.value / totalTests.value) * 100
        
        if (successRate >= 66) { // 2/3 ou plus
            createFireworks(3000)
            showSuccess(
                "DIAGNOSTIC TERMINÉ !",
                `Excellent diagnostic ! ${Math.round(successRate)}% de réussite.`
            )
            // Petit délai pour permettre au briefing de fin de s'afficher
            setTimeout(() => {
                completeRoom('audition')
                emit('room-completed', 'audition')
            }, 300)
        } else {
            showError(
                "DIAGNOSTIC INCOMPLET",
                `Seulement ${Math.round(successRate)}% de réussite. Recommencez le diagnostic.`
            )
            setTimeout(() => {
                resetDiagnostic()
            }, 3000)
        }
    }
}

// Réinitialiser le diagnostic
const resetDiagnostic = () => {
    currentTest.value = 0
    selectedAnswer.value = null
    hasPlayed.value = false
    showResults.value = false
    correctAnswers.value = 0
}

// Fonction pour afficher un indice
const showHint = () => {
    hintsShown.value++
    addHint("audition")
}

onMounted(() => {
    showInfo(
        "DIAGNOSTIC AUDITIF INTERACTIF",
        "Écoutez attentivement chaque son et identifiez sa nature pour diagnostiquer l'audition du patient."
    )
})

onUnmounted(() => {
    // Nettoyer l'audio
    if (currentAudioElement.value) {
        currentAudioElement.value.pause()
        currentAudioElement.value = null
    }
    if (masterGainNode.value) {
        masterGainNode.value.disconnect()
        masterGainNode.value = null
    }
    if (audioContext.value) {
        audioContext.value.close()
    }
})
</script>

<style scoped>
.slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
}

.slider::-webkit-slider-track {
    background: #374151;
    height: 8px;
    border-radius: 4px;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: #8b5cf6;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 0 0 1px #8b5cf6;
}

.slider::-webkit-slider-thumb:hover {
    background: #7c3aed;
    transform: scale(1.1);
}

.slider::-moz-range-track {
    background: #374151;
    height: 8px;
    border-radius: 4px;
    border: none;
}

.slider::-moz-range-thumb {
    background: #8b5cf6;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 0 0 1px #8b5cf6;
}

.slider::-moz-range-thumb:hover {
    background: #7c3aed;
    transform: scale(1.1);
}

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