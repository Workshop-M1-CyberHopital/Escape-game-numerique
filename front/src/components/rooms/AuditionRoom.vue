<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <div class="space-y-6">
            <!-- Instructions simplifiées -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-8 scanline text-center"
            >
                <div class="flex items-center justify-center gap-3 mb-6">
                    <i data-lucide="volume-2" class="w-8 h-8 text-cyber-purple"></i>
                    <h3 class="font-cyber font-bold text-cyber-purple text-2xl">
                        RÉPARATION AUDIO SIMPLE
                    </h3>
                </div>
                <p class="text-gray-300 mb-8 text-lg">
                    Écoutez le son et ajustez le volume pour le restaurer !
                </p>
                
                <!-- Activation audio simple -->
                <div v-if="!audioContext" class="bg-cyber-purple/20 border border-cyber-purple/50 rounded-lg p-6 mb-8">
                    <button
                        @click="activateAudio"
                        class="bg-cyber-purple hover:bg-cyber-purple/80 text-white px-10 py-5 rounded-lg font-bold text-xl transition-colors duration-300 flex items-center gap-4 mx-auto"
                    >
                        <i data-lucide="volume-2" class="w-8 h-8"></i>
                        ACTIVER L'AUDIO
                    </button>
                </div>
            </div>

            <!-- Contrôle audio simple -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-8 scanline"
            >
            <div class="text-center mb-8">
                <h3 class="text-cyber-purple font-bold text-2xl mb-6">
                    VOLUME AUDIO
                </h3>
                
                <!-- Contrôle de volume simple -->
                <div class="max-w-lg mx-auto">
                    <div class="mb-6">
                        <input
                            v-model="audioVolume"
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            class="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            style="background: linear-gradient(to right, #8b5cf6 0%, #8b5cf6 var(--value, 50%), #374151 var(--value, 50%), #374151 100%);"
                            :style="{ '--value': audioVolume + '%' }"
                        />
                    </div>
                    <div class="text-cyber-purple font-bold text-2xl">
                        {{ audioVolume }}%
                    </div>
                </div>
            </div>
            
            <!-- Boutons de contrôle -->
            <div class="flex items-center justify-center gap-8">
                <button
                    @click="playTestSound"
                    class="bg-cyber-purple hover:bg-cyber-purple/80 text-white px-10 py-5 rounded-lg font-bold text-xl transition-colors duration-300 flex items-center gap-4"
                >
                    <i data-lucide="play" class="w-6 h-6"></i>
                    ÉCOUTER
                </button>
                <button
                    @click="validateAudio"
                    class="bg-cyber-green hover:bg-cyber-green/80 text-white px-10 py-5 rounded-lg font-bold text-xl transition-colors duration-300 flex items-center gap-4"
                >
                    <i data-lucide="check" class="w-6 h-6"></i>
                    VALIDER
                </button>
            </div>
        </div>

            <!-- Progression -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-yellow rounded-lg p-6 scanline"
            >
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i data-lucide="target" class="w-5 h-5 text-cyber-yellow"></i>
                        <span class="text-cyber-yellow font-bold">PROGRESSION</span>
                    </div>
                    <div class="text-cyber-yellow font-bold">
                        {{ audioVolume }}% / 100%
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
                        💡 Le volume doit être ajusté pour être audible mais pas trop fort.
                    </div>
                    <div v-if="hintsShown >= 2" class="fade-in">
                        💡 Le volume optimal se situe dans une plage spécifique.
                    </div>
                    <div v-if="hintsShown >= 3" class="fade-in">
                        💡 Réponse : Ajustez le volume entre 
                        <span class="text-cyber-green font-bold">80% et 100%</span> pour réussir !
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
import { ref, onMounted, onUnmounted } from 'vue'
import GameRoom from '../GameRoom.vue'
import { useGameState } from '../../composables/useGameState'
import { useToast } from '../../composables/useToast'

const emit = defineEmits(['exit-room', 'room-completed'])
const { completeRoom, addError, addHint } = useGameState()
const { showSuccess, showError, showWarning, showInfo } = useToast()

const roomData = {
    title: "SALLE DE L'AUDITION",
    subtitle: "Réparation du système audio ORL",
    description:
        "Le virus a corrompu le système audio ORL. Réparez-le en ajustant le volume.",
    objective: "Comprendre la logique de l'ADN et des données biomédicales",
    icon: "volume-2",
    color: "#8b5cf6",
};

// Variables réactives
const audioVolume = ref(50)
const audioContext = ref(null)
const isCompleted = ref(false)
const errors = ref(0)
const hintsShown = ref(0)

// AudioContext et oscillateurs
let oscillators = {}

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
        showSuccess(
            "AUDIO ACTIVÉ",
            "L'audio est maintenant activé. Vous pouvez tester le son."
        )
    } catch (error) {
        console.error('Erreur activation audio:', error)
        showError(
            "ERREUR D'ACTIVATION",
            "Impossible d'activer l'audio. Vérifiez les permissions du navigateur."
        )
    }
}

// Jouer un son de test simple
const playTestSound = async () => {
    try {
        await initAudioContext()
        
        // Arrêter tous les oscillateurs existants
        Object.values(oscillators).forEach(osc => {
            if (osc) {
                osc.stop()
                osc.disconnect()
            }
        })
        oscillators = {}
        
        // Créer un son simple basé sur le volume
        const oscillator = audioContext.value.createOscillator()
        const gainNode = audioContext.value.createGain()
        
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(440, audioContext.value.currentTime) // La note A4
        gainNode.gain.setValueAtTime(audioVolume.value / 100 * 0.3, audioContext.value.currentTime)
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.value.destination)
        
        oscillator.start()
        oscillator.stop(audioContext.value.currentTime + 1) // 1 seconde
    } catch (error) {
        console.error('Erreur audio:', error)
        showError(
            "ERREUR AUDIO",
            "Impossible de jouer l'audio. Vérifiez les permissions du navigateur."
        )
    }
}

// Valider l'audio
const validateAudio = () => {
    // Le volume doit être entre 80 et 100 pour réussir
    const targetMin = 80
    const targetMax = 100
    
    if (audioVolume.value >= targetMin && audioVolume.value <= targetMax) {
        // Succès !
        playSuccessSound()
        showSuccess(
            "AUDIO CORRECT !",
            `Excellent ! Volume optimal à ${audioVolume.value}%.`
        )
        
        setTimeout(() => {
            isCompleted.value = true
            completeRoom('audition')
            emit('room-completed', 'audition')
        }, 2000)
    } else {
        // Erreur
        playErrorSound()
        errors.value++
        addError('audition')
        showError(
            "VOLUME INCORRECT !",
            `Volume ${audioVolume.value}% incorrect. Le volume doit être entre 80% et 100%.`
        )
        
        setTimeout(() => {
            resetAudio()
        }, 3000)
    }
}

// Jouer un son de succès
const playSuccessSound = async () => {
    try {
        await initAudioContext()
        const oscillator = audioContext.value.createOscillator()
        const gainNode = audioContext.value.createGain()
        
        oscillator.frequency.setValueAtTime(800, audioContext.value.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.value.currentTime + 0.5)
        gainNode.gain.setValueAtTime(0.3, audioContext.value.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.5)
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.value.destination)
        
        oscillator.start()
        oscillator.stop(audioContext.value.currentTime + 0.5)
    } catch (error) {
        console.error('Erreur son succès:', error)
    }
}

// Jouer un son d'erreur
const playErrorSound = async () => {
    try {
        await initAudioContext()
        const oscillator = audioContext.value.createOscillator()
        const gainNode = audioContext.value.createGain()
        
        oscillator.frequency.setValueAtTime(200, audioContext.value.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.value.currentTime + 0.3)
        gainNode.gain.setValueAtTime(0.2, audioContext.value.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + 0.3)
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.value.destination)
        
        oscillator.start()
        oscillator.stop(audioContext.value.currentTime + 0.3)
    } catch (error) {
        console.error('Erreur son erreur:', error)
    }
}

// Réinitialiser l'audio
const resetAudio = () => {
    audioVolume.value = 50 // Remettre à 50%
    showInfo(
        "AUDIO RÉINITIALISÉ",
        "Le volume a été remis à 50%. Ajustez-le entre 80% et 100% pour réussir."
    )
}

// Fonction pour afficher un indice
const showHint = () => {
    hintsShown.value++
    addHint("audition")
}

onMounted(() => {
    showInfo(
        "RÉPARATION AUDIO SIMPLE",
        "Ajustez le volume pour restaurer l'audio. Une erreur vous obligera à recommencer !"
    )
})

onUnmounted(() => {
    // Nettoyer l'audio
    Object.values(oscillators).forEach(osc => {
        if (osc) {
            osc.stop()
            osc.disconnect()
        }
    })
    oscillators = {}
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