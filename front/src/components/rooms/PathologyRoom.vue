<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Instructions -->
        <div
            class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline"
        >
            <div class="flex items-center gap-2 mb-4">
                <i data-lucide="heart-pulse" class="w-5 h-5 text-cyber-red"></i>
                <h3 class="font-cyber font-bold text-cyber-red">
                    DIAGNOSTIC MÉDICAL URGENT
                </h3>
            </div>
            <p class="text-gray-300 mb-4">
                Glissez chaque pathologie vers sa guérison correspondante. 
                <span class="text-cyber-red font-bold">ATTENTION :</span> 
                Une erreur vous obligera à recommencer !
            </p>
        </div>

        <!-- Zone de jeu principale - Layout côte à côte -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 pb-8">
            <!-- Pathologies à gauche -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-6">
                    <i data-lucide="alert-triangle" class="w-5 h-5 text-cyber-blue"></i>
                    <h4 class="font-cyber font-bold text-cyber-blue">
                        PATHOLOGIES
                    </h4>
                </div>
                
                <div class="space-y-4">
                    <div
                        v-for="(pathology, index) in pathologies"
                        :key="`pathology-${index}`"
                        class="pathology-card bg-gray-700/50 border-2 border-cyber-blue/50 rounded-lg p-4 cursor-move transition-all duration-300 hover:border-cyber-blue hover:bg-cyber-blue/10"
                        :class="{
                            'border-cyber-green bg-cyber-green/10': pathology.matched,
                            'border-cyber-red bg-cyber-red/10': pathology.error,
                            'opacity-50': pathology.matched
                        }"
                        :draggable="!pathology.matched"
                        @dragstart="handleDragStart($event, index, 'pathology')"
                        @dragend="handleDragEnd"
                    >
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-cyber-blue/20 flex items-center justify-center">
                                <span class="text-cyber-blue font-bold text-sm">{{ index + 1 }}</span>
                            </div>
                            <div class="flex-1">
                                <h5 class="font-bold text-white mb-1">{{ pathology.name }}</h5>
                                <p class="text-sm text-gray-400">{{ pathology.description }}</p>
                            </div>
                            <div v-if="pathology.matched" class="text-cyber-green">
                                <i data-lucide="check" class="w-5 h-5"></i>
                            </div>
                            <div v-if="pathology.error" class="text-cyber-red">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </div>
                            <div v-if="!pathology.matched" class="text-gray-400">
                                <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Guérisons à droite -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-6">
                    <i data-lucide="heart" class="w-5 h-5 text-cyber-green"></i>
                    <h4 class="font-cyber font-bold text-cyber-green">
                        GUÉRISONS
                    </h4>
                </div>
                
                <div class="space-y-4">
                    <div
                        v-for="(cure, index) in shuffledCures"
                        :key="`cure-${index}`"
                        class="cure-card bg-gray-700/50 border-2 border-cyber-green/50 rounded-lg p-4 transition-all duration-300"
                        :class="{
                            'border-cyber-blue bg-cyber-blue/10': cure.matched,
                            'border-cyber-red bg-cyber-red/10': cure.error,
                            'border-dashed border-cyber-green/30': !cure.matched && !cure.error
                        }"
                        @dragover="handleDragOver"
                        @drop="handleDrop($event, index)"
                        @dragenter="handleDragEnter"
                        @dragleave="handleDragLeave"
                    >
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-cyber-green/20 flex items-center justify-center">
                                <span class="text-cyber-green font-bold text-sm">{{ String.fromCharCode(65 + index) }}</span>
                            </div>
                            <div class="flex-1">
                                <h5 class="font-bold text-white mb-1">{{ cure.name }}</h5>
                                <p class="text-sm text-gray-400">{{ cure.description }}</p>
                            </div>
                            <div v-if="cure.matched" class="text-cyber-blue">
                                <i data-lucide="check" class="w-5 h-5"></i>
                            </div>
                            <div v-if="cure.error" class="text-cyber-red">
                                <i data-lucide="x" class="w-5 h-5"></i>
                            </div>
                            <div v-if="!cure.matched && !cure.error" class="text-gray-400">
                                <i data-lucide="plus" class="w-4 h-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Progression -->
        <div
            class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-yellow rounded-lg p-6 scanline"
        >
            <div class="flex items-center gap-2 mb-4">
                <i data-lucide="target" class="w-5 h-5 text-cyber-yellow"></i>
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
                    <div class="text-2xl font-bold text-cyber-red">{{ errors }}</div>
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


    </GameRoom>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import GameRoom from '../GameRoom.vue'
import { useGameState } from '../../composables/useGameState'
import { useToast } from '../../composables/useToast'

const emit = defineEmits(['exit-room', 'room-completed'])
const { completeRoom, addError } = useGameState()
const { showSuccess, showError, showWarning, showInfo } = useToast()

const roomData = {
    title: "SALLE DES PATHOLOGIES",
    subtitle: "Diagnostic médical",
    description:
        "Le virus a mélangé les pathologies et les guérisons. Remettez les pathologies vers leurs guérisons correspondantes.",
    icon: "heart-pulse",
    color: "#ff0055",
};


// État du jeu
const correctMatches = ref(0)
const errors = ref(0)
const isCompleted = ref(false)

// État du drag & drop
const draggedItem = ref(null)
const draggedType = ref(null)

// Données des pathologies et guérisons
const pathologies = ref([
    {
        id: 1,
        name: "Hypertension artérielle",
        description: "Pression artérielle élevée",
        correctCureId: 1,
        matched: false,
        error: false
    },
    {
        id: 2,
        name: "Diabète de type 2",
        description: "Taux de sucre élevé dans le sang",
        correctCureId: 2,
        matched: false,
        error: false
    },
    {
        id: 3,
        name: "Asthme",
        description: "Inflammation des voies respiratoires",
        correctCureId: 3,
        matched: false,
        error: false
    },
    {
        id: 4,
        name: "Migraine",
        description: "Maux de tête intenses et récurrents",
        correctCureId: 4,
        matched: false,
        error: false
    },
    {
        id: 5,
        name: "Gastrite",
        description: "Inflammation de la muqueuse gastrique",
        correctCureId: 5,
        matched: false,
        error: false
    }
])

const cures = ref([
    {
        id: 1,
        name: "Inhibiteurs de l'ECA",
        description: "Médicaments pour réduire la pression artérielle",
        matched: false,
        error: false
    },
    {
        id: 2,
        name: "Métformine",
        description: "Médicament antidiabétique oral",
        matched: false,
        error: false
    },
    {
        id: 3,
        name: "Bronchodilatateurs",
        description: "Médicaments pour dilater les bronches",
        matched: false,
        error: false
    },
    {
        id: 4,
        name: "Triptans",
        description: "Médicaments spécifiques contre la migraine",
        matched: false,
        error: false
    },
    {
        id: 5,
        name: "Inhibiteurs de la pompe à protons",
        description: "Médicaments pour réduire l'acidité gastrique",
        matched: false,
        error: false
    }
])

// Guérisons mélangées (référence stable)
const shuffledCures = ref([])

// Gestion du drag & drop
const handleDragStart = (event, index, type) => {
    draggedItem.value = index
    draggedType.value = type
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', event.target.outerHTML)
}

const handleDragEnd = () => {
    draggedItem.value = null
    draggedType.value = null
}

const handleDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
}

const handleDragEnter = (event) => {
    event.preventDefault()
    if (draggedType.value === 'pathology') {
        event.target.classList.add('border-cyber-yellow', 'bg-cyber-yellow/10')
    }
}

const handleDragLeave = (event) => {
    event.target.classList.remove('border-cyber-yellow', 'bg-cyber-yellow/10')
}

const handleDrop = (event, cureIndex) => {
    event.preventDefault()
    event.target.classList.remove('border-cyber-yellow', 'bg-cyber-yellow/10')
    
    if (draggedType.value === 'pathology' && draggedItem.value !== null) {
        const pathologyIndex = draggedItem.value
        const pathology = pathologies.value[pathologyIndex]
        const cure = shuffledCures.value[cureIndex]
        
        // Vérifier si la correspondance est correcte
        const isCorrect = pathology.correctCureId === cure.id
        
        if (isCorrect) {
            // Marquer comme correct
            pathology.matched = true
            cure.matched = true
            correctMatches.value++
            
            // Toast de succès
            showSuccess(
                "DIAGNOSTIC CORRECT !",
                `Excellent ! ${pathology.name} → ${cure.name}`
            )
            
            // Vérifier si toutes les correspondances sont faites
            if (correctMatches.value === pathologies.value.length) {
                setTimeout(() => {
                    showSuccess(
                        "DIAGNOSTIC MÉDICAL TERMINÉ !",
                        "Félicitations ! Vous avez correctement diagnostiqué toutes les pathologies."
                    )
                    isCompleted.value = true
                    completeRoom('pathology')
                    emit('room-completed', 'pathology')
                }, 2000)
            }
        } else {
            // Marquer l'erreur
            pathology.error = true
            cure.error = true
            errors.value++
            addError('pathology')
            
            // Toast d'erreur
            showError(
                "ERREUR DE DIAGNOSTIC !",
                "Correspondance incorrecte. Le jeu va se réinitialiser automatiquement."
            )
            
            // Reset automatique après 3 secondes
            setTimeout(() => {
                resetGame()
            }, 3000)
        }
    }
}

// Réinitialiser la sélection (plus utilisé, gardé pour compatibilité)
const resetSelection = () => {
    resetGame()
}

// Réinitialiser complètement le jeu
const resetGame = () => {
    console.log('🔄 Reset du jeu - Recommencement total')
    
    correctMatches.value = 0
    errors.value = 0
    isCompleted.value = false
    
    // Réinitialiser toutes les pathologies
    pathologies.value.forEach(p => {
        p.matched = false
        p.error = false
    })
    
    // Réinitialiser toutes les guérisons
    shuffledCures.value.forEach(c => {
        c.matched = false
        c.error = false
    })
    
    // Mélanger à nouveau les guérisons
    shuffledCures.value = [...cures.value].sort(() => Math.random() - 0.5)
    
    // Mélanger aussi les pathologies
    pathologies.value = [...pathologies.value].sort(() => Math.random() - 0.5)
}

onMounted(() => {
    // Mélanger les pathologies au démarrage
    pathologies.value = [...pathologies.value].sort(() => Math.random() - 0.5)
    
    // Mélanger les guérisons au démarrage
    shuffledCures.value = [...cures.value].sort(() => Math.random() - 0.5)
})
</script>

<style scoped>
.pathology-card {
    transition: all 0.3s ease;
}

.pathology-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 85, 0.2);
}

.cure-card {
    transition: all 0.3s ease;
}

.cure-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 255, 85, 0.2);
}

/* Styles pour le drag & drop */
[draggable="true"] {
    cursor: move;
}

.cure-card.drag-over {
    border-color: #ffd700 !important;
    background-color: rgba(255, 215, 0, 0.1) !important;
}
</style>