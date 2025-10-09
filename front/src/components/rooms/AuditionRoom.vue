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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import GameRoom from '../GameRoom.vue'
import { useGameState } from '../../composables/useGameState'
import { useToast } from '../../composables/useToast'

const emit = defineEmits(['exit-room', 'room-completed'])
const { completeRoom, addError, addHint } = useGameState()
const { showSuccess, showError, showWarning, showInfo } = useToast()

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
    }
    if (audioContext.value.state === 'suspended') {
        await audioContext.value.resume()
    }
}

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
    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(80, audioContext.value.currentTime) // Fréquence légèrement plus haute
    gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
    
    // Créer un rythme de battements avec volume plus fort
    for (let i = 0; i < duration * 1.2; i++) {
        const time = audioContext.value.currentTime + i * 0.8
        gainNode.gain.setValueAtTime(0.6, time) // Volume augmenté
        gainNode.gain.setValueAtTime(0.2, time + 0.1)
    }
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    oscillator.start()
    oscillator.stop(audioContext.value.currentTime + duration)
}

// Son de respiration
const playBreathingSound = async (duration) => {
    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()
    
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(200, audioContext.value.currentTime)
    gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
    
    // Créer un son sifflant
    for (let i = 0; i < duration * 2; i++) {
        const time = audioContext.value.currentTime + i * 0.5
        oscillator.frequency.setValueAtTime(180 + Math.random() * 40, time)
        gainNode.gain.setValueAtTime(0.2 + Math.random() * 0.1, time)
    }
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    oscillator.start()
    oscillator.stop(audioContext.value.currentTime + duration)
}

// Son d'acouphènes
const playEarSound = async (duration) => {
    const oscillator = audioContext.value.createOscillator()
    const gainNode = audioContext.value.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(8000, audioContext.value.currentTime) // Fréquence aiguë
    gainNode.gain.setValueAtTime(0, audioContext.value.currentTime)
    
    // Variation de fréquence pour simuler les acouphènes
    for (let i = 0; i < duration * 10; i++) {
        const time = audioContext.value.currentTime + i * 0.1
        oscillator.frequency.setValueAtTime(7500 + Math.random() * 1000, time)
        gainNode.gain.setValueAtTime(0.15, time)
    }
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.value.destination)
    
    oscillator.start()
    oscillator.stop(audioContext.value.currentTime + duration)
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
        showError("RÉPONSE INCORRECTE", "Vous devez avoir la bonne réponse pour continuer. Réécoutez le son et réessayez.")
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
            showSuccess(
                "DIAGNOSTIC TERMINÉ !",
                `Excellent diagnostic ! ${Math.round(successRate)}% de réussite.`
            )
            setTimeout(() => {
                completeRoom('audition')
                emit('room-completed', 'audition')
            }, 2000)
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