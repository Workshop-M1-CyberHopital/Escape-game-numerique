<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <div class="space-y-6">
            <!-- Instructions de la salle finale -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-8 scanline text-center"
            >
                <div class="flex items-center justify-center gap-3 mb-6">
                    <i data-lucide="shield-check" class="w-8 h-8 text-cyber-green"></i>
                    <h3 class="font-cyber font-bold text-cyber-green text-2xl">
                        DIAGNOSTIC FINAL - PATIENT CRITIQUE
                    </h3>
                </div>
                <p class="text-gray-300 mb-8 text-lg">
                    La cyberattaque est résolue ! Diagnostiquez et traitez ce patient en état critique.
                </p>
            </div>

            <!-- Fiche patient -->
            <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-8 scanline">
                <div class="flex items-center gap-3 mb-6">
                    <i data-lucide="user" class="w-6 h-6 text-cyber-blue"></i>
                    <h3 class="text-cyber-blue font-bold text-xl">FICHE PATIENT</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Informations patient -->
                    <div class="space-y-4">
                        <div class="bg-gray-700/50 rounded-lg p-4">
                            <h4 class="text-cyber-blue font-bold mb-3">Informations</h4>
                            <div class="space-y-2 text-sm">
                                <div><span class="text-gray-400">Nom:</span> <span class="text-white">Marie Dubois</span></div>
                                <div><span class="text-gray-400">Âge:</span> <span class="text-white">34 ans</span></div>
                                <div><span class="text-gray-400">Sexe:</span> <span class="text-white">F</span></div>
                                <div><span class="text-gray-400">Admission:</span> <span class="text-white">Urgences</span></div>
                            </div>
                        </div>
                        
                        <!-- Symptômes -->
                        <div class="bg-gray-700/50 rounded-lg p-4">
                            <h4 class="text-cyber-blue font-bold mb-3">Symptômes</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="thermometer" class="w-4 h-4 text-red-400"></i>
                                    <span class="text-white">Fièvre: 39.2°C</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="heart" class="w-4 h-4 text-red-400"></i>
                                    <span class="text-white">Tachycardie: 120 bpm</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="wind" class="w-4 h-4 text-red-400"></i>
                                    <span class="text-white">Dyspnée (difficulté respiratoire)</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="zap" class="w-4 h-4 text-red-400"></i>
                                    <span class="text-white">Toux sèche persistante</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Analyses sanguines -->
                    <div class="space-y-4">
                        <div class="bg-gray-700/50 rounded-lg p-4">
                            <h4 class="text-cyber-blue font-bold mb-3">Analyses sanguines</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Leucocytes:</span>
                                    <span class="text-red-400 font-bold">15.2 (↑)</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">CRP:</span>
                                    <span class="text-red-400 font-bold">85 mg/L (↑)</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Procalcitonine:</span>
                                    <span class="text-red-400 font-bold">2.1 ng/mL (↑)</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Oxygénation:</span>
                                    <span class="text-red-400 font-bold">92% (↓)</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Antécédents -->
                        <div class="bg-gray-700/50 rounded-lg p-4">
                            <h4 class="text-cyber-blue font-bold mb-3">Antécédents</h4>
                            <div class="space-y-2 text-sm text-white">
                                <div>• Asthme depuis l'enfance</div>
                                <div>• Aucune allergie connue</div>
                                <div>• Non-fumeuse</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Diagnostic et traitement -->
            <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-purple rounded-lg p-8 scanline">
                <div class="flex items-center gap-3 mb-6">
                    <i data-lucide="stethoscope" class="w-6 h-6 text-cyber-purple"></i>
                    <h3 class="text-cyber-purple font-bold text-xl">DIAGNOSTIC ET TRAITEMENT</h3>
                </div>
                
                <!-- Options de diagnostic -->
                <div class="mb-8">
                    <h4 class="text-white font-bold mb-4">Quel est le diagnostic le plus probable ?</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            v-for="(diagnosis, index) in diagnoses"
                            :key="index"
                            @click="selectDiagnosis(index)"
                            :disabled="isCompleted"
                            :class="[
                                'p-4 rounded-lg border-2 transition-all duration-300 font-bold text-left',
                                selectedDiagnosis === index 
                                    ? 'border-cyber-green bg-cyber-green/20 text-cyber-green' 
                                    : 'border-gray-600 hover:border-cyber-purple text-gray-300 hover:text-cyber-purple',
                                isCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            ]"
                        >
                            <div class="flex items-center gap-3">
                                <i :data-lucide="diagnosis.icon" class="w-5 h-5"></i>
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
                            v-for="(treatment, index) in treatments"
                            :key="index"
                            @click="selectTreatment(index)"
                            :disabled="isCompleted"
                            :class="[
                                'p-4 rounded-lg border-2 transition-all duration-300 font-bold text-left',
                                selectedTreatment === index 
                                    ? 'border-cyber-green bg-cyber-green/20 text-cyber-green' 
                                    : 'border-gray-600 hover:border-cyber-purple text-gray-300 hover:text-cyber-purple',
                                isCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            ]"
                        >
                            <div class="flex items-center gap-3">
                                <i :data-lucide="treatment.icon" class="w-5 h-5"></i>
                                <div>
                                    <div class="font-bold">{{ treatment.name }}</div>
                                    <div class="text-sm opacity-80">{{ treatment.description }}</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Bouton de validation -->
                <div v-if="selectedDiagnosis !== null && selectedTreatment !== null" class="text-center">
                    <button
                        @click="validateDiagnosis"
                        :disabled="isCompleted"
                        class="bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-300"
                    >
                        {{ isCompleted ? 'DIAGNOSTIC TERMINÉ' : 'VALIDER LE DIAGNOSTIC' }}
                    </button>
                </div>
            </div>

            <!-- Sécurisation du dossier -->
            <div v-if="isCompleted" class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-yellow rounded-lg p-8 scanline">
                <div class="flex items-center gap-3 mb-6">
                    <i data-lucide="shield" class="w-6 h-6 text-cyber-yellow"></i>
                    <h3 class="text-cyber-yellow font-bold text-xl">SÉCURISATION DU DOSSIER</h3>
                </div>
                
                <p class="text-gray-300 mb-6">
                    Le patient est maintenant traité ! Il faut sécuriser son dossier médical dans le coffre-fort numérique.
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        v-for="(step, index) in securitySteps"
                        :key="index"
                        @click="completeSecurityStep(index)"
                        :disabled="step.completed"
                        :class="[
                            'p-4 rounded-lg border-2 transition-all duration-300 font-bold text-center',
                            step.completed 
                                ? 'border-cyber-green bg-cyber-green/20 text-cyber-green' 
                                : 'border-cyber-yellow hover:border-cyber-yellow/80 text-cyber-yellow hover:bg-cyber-yellow/10',
                            step.completed ? 'cursor-default' : 'cursor-pointer'
                        ]"
                    >
                        <div class="flex items-center justify-center gap-2">
                            <i :data-lucide="step.completed ? 'check-circle' : step.icon" class="w-5 h-5"></i>
                            <span>{{ step.name }}</span>
                        </div>
                    </button>
                </div>
                
                <div v-if="allSecurityStepsCompleted" class="text-center mt-6">
                    <button
                        @click="completeFinalRoom"
                        class="bg-cyber-green hover:bg-cyber-green/80 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors duration-300"
                    >
                        🎉 MISSION ACCOMPLIE - SAUVEGARDER LE DOSSIER
                    </button>
                </div>
            </div>
        </div>

        <!-- Section Indices -->
        <div class="mt-8">
            <div class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-6">
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="lightbulb" class="w-5 h-5 text-yellow-500"></i>
                    <h4 class="font-cyber font-bold text-yellow-500">INDICES</h4>
                </div>

                <div class="space-y-2 text-sm text-gray-300">
                    <!-- Indices pour le diagnostic -->
                    <div v-if="!isCompleted">
                        <div v-if="hintsShown >= 1" class="fade-in">
                            💡 Analysez les symptômes : fièvre, difficultés respiratoires, toux
                        </div>
                        <div v-if="hintsShown >= 2" class="fade-in">
                            💡 Regardez les analyses : leucocytes élevés, CRP positive, saturation basse
                        </div>
                        <div v-if="hintsShown >= 3" class="fade-in">
                            💡 Le diagnostic correct est :
                            <span class="text-cyber-green font-bold">Pneumonie bactérienne</span>
                        </div>
                    </div>

                    <!-- Indices pour le traitement -->
                    <div v-if="!isCompleted">
                        <div v-if="hintsShown >= 4" class="fade-in">
                            💡 Pour une pneumonie bactérienne, le traitement principal est :
                            <span class="text-cyber-green font-bold">Antibiotiques</span>
                        </div>
                        <div v-if="hintsShown >= 5" class="fade-in">
                            💡 En cas de difficultés respiratoires, ajoutez :
                            <span class="text-cyber-green font-bold">Oxygénothérapie</span>
                        </div>
                    </div>

                    <!-- Indices pour la sécurisation -->
                    <div v-if="isCompleted && !allSecurityStepsCompleted">
                        <div v-if="hintsShown >= 6" class="fade-in">
                            💡 Sécurisez le dossier avec un chiffrement fort
                        </div>
                        <div v-if="hintsShown >= 7" class="fade-in">
                            💡 Sauvegardez dans le cloud pour éviter la perte de données
                        </div>
                        <div v-if="hintsShown >= 8" class="fade-in">
                            💡 Vérifiez la conformité RGPD pour protéger les données personnelles
                        </div>
                    </div>
                </div>

                <button
                    @click="showHint"
                    v-if="hintsShown < 8"
                    class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-tech text-sm rounded transition-all"
                >
                    AFFICHER UN INDICE
                </button>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref, computed } from 'vue'
import GameRoom from '../GameRoom.vue'
import { createFireworks } from '../../utils/fireworks'
import { useGameState } from '../../composables/useGameState'
import { useToast } from '../../composables/useToast'

const emit = defineEmits(['exit-room', 'room-completed'])

const { completeRoom, addError, addHint, PENALTY_PER_ERROR } = useGameState()
const { showSuccess, showError, showWarning, showInfo } = useToast()

const roomData = {
    title: "SALLE DE FIN",
    subtitle: "Diagnostic final - Patient critique",
    description: "La cyberattaque est résolue ! Diagnostiquez et traitez ce patient en état critique, puis sécurisez son dossier.",
    objective: "Diagnostiquer, traiter et sécuriser le dossier patient",
    icon: "shield-check",
    color: "#10b981",
};

// Variables réactives
const selectedDiagnosis = ref(null)
const selectedTreatment = ref(null)
const isCompleted = ref(false)
const securitySteps = ref([
    { name: "Chiffrer le dossier", icon: "lock", completed: false },
    { name: "Sauvegarder en cloud", icon: "cloud", completed: false },
    { name: "Vérifier l'intégrité", icon: "shield-check", completed: false }
])

// Données du diagnostic
const diagnoses = ref([
    {
        name: "Pneumonie bactérienne",
        description: "Infection pulmonaire avec fièvre et toux",
        icon: "lungs",
        correct: true
    },
    {
        name: "Grippe",
        description: "Infection virale saisonnière",
        icon: "virus",
        correct: false
    },
    {
        name: "Asthme aigu",
        description: "Crise d'asthme sévère",
        icon: "wind",
        correct: false
    },
    {
        name: "COVID-19",
        description: "Infection virale respiratoire",
        icon: "shield-alert",
        correct: false
    }
])

const treatments = ref([
    {
        name: "Antibiotiques + Oxygène",
        description: "Traitement standard pneumonie",
        icon: "pill",
        correct: true
    },
    {
        name: "Antiviraux",
        description: "Pour infection virale",
        icon: "syringe",
        correct: false
    },
    {
        name: "Bronchodilatateurs",
        description: "Pour crise d'asthme",
        icon: "wind",
        correct: false
    },
    {
        name: "Corticoïdes",
        description: "Anti-inflammatoires",
        icon: "activity",
        correct: false
    }
])

// Variables calculées
const allSecurityStepsCompleted = computed(() => 
    securitySteps.value.every(step => step.completed)
)

// Variables pour les indices
const hintsShown = ref(0)

// Sélectionner un diagnostic
const selectDiagnosis = (index) => {
    if (isCompleted.value) return
    selectedDiagnosis.value = index
}

// Sélectionner un traitement
const selectTreatment = (index) => {
    if (isCompleted.value) return
    selectedTreatment.value = index
}

// Valider le diagnostic
const validateDiagnosis = () => {
    if (isCompleted.value) return
    
    const diagnosisCorrect = diagnoses.value[selectedDiagnosis.value].correct
    const treatmentCorrect = treatments.value[selectedTreatment.value].correct
    
    if (diagnosisCorrect && treatmentCorrect) {
        showSuccess(
            "DIAGNOSTIC CORRECT !",
            "Excellent ! Vous avez diagnostiqué une pneumonie bactérienne et prescrit le bon traitement."
        )
        isCompleted.value = true
    } else {
        addError('final')
        showError(
            "DIAGNOSTIC INCORRECT",
            `Le diagnostic ou le traitement n'est pas correct. +${PENALTY_PER_ERROR}s de pénalité`
        )
        
        // Réinitialiser pour permettre une nouvelle tentative
        setTimeout(() => {
            selectedDiagnosis.value = null
            selectedTreatment.value = null
        }, 3000)
    }
}

// Compléter une étape de sécurité
const completeSecurityStep = (index) => {
    if (securitySteps.value[index].completed) return
    
    securitySteps.value[index].completed = true
    showSuccess(
        "ÉTAPE COMPLÉTÉE",
        `"${securitySteps.value[index].name}" a été effectué avec succès.`
    )
}

// Terminer la salle finale
const completeFinalRoom = () => {
    createFireworks(3000)
    
    showSuccess(
        "MISSION ACCOMPLIE !",
        "Félicitations ! Vous avez sauvé le patient et sécurisé ses données. La cyberattaque est définitivement vaincue !"
    )
    
    setTimeout(() => {
        completeRoom('final')
        emit('room-completed', 'final')
    }, 2000)
}

// Afficher un indice
const showHint = () => {
    if (hintsShown.value < 8) {
        hintsShown.value++
        addHint('final')
    }
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
