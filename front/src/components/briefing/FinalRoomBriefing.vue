<template>
  <div 
    v-if="visible"
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div class="bg-gray-900/95 border-2 border-cyber-green rounded-lg max-w-4xl w-full relative overflow-hidden">
      <!-- Scanlines effect -->
      <div class="absolute inset-0 scanline opacity-20"></div>
      
      <!-- Header with agent info -->
      <div class="border-b border-cyber-green/50 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Agent Avatar -->
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-cyber-green to-cyber-blue rounded-full flex items-center justify-center border-2 border-cyber-green">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                </svg>
              </div>
              <!-- Status indicator -->
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-cyber-green rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            
            <!-- Agent Info -->
            <div>
              <h3 class="text-xl font-bold text-cyber-green font-tech">
                AGENT CYBER-001
              </h3>
              <p class="text-sm text-gray-300 font-tech">
                Unité de Diagnostic Médical - Salle de Fin
              </p>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                <span class="text-xs text-cyber-green font-tech">MISSION FINALE - DIAGNOSTIC CRITIQUE</span>
              </div>
            </div>
          </div>
          
          <!-- Close Button -->
          <button
            @click="handleClose"
            class="w-8 h-8 bg-cyber-green/20 border border-cyber-green/50 rounded-full flex items-center justify-center hover:bg-cyber-green/30 transition-all duration-300 hover:scale-110"
            title="Fermer et couper l'audio"
          >
            <svg class="w-4 h-4 text-cyber-green" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Message Content -->
      <div class="p-6">
        <div class="bg-gray-800/50 border border-cyber-green/30 rounded-lg p-6">
          <div class="flex items-start gap-4">
            <!-- Message bubble -->
            <div class="flex-1">
              <div class="text-cyber-green font-tech text-sm mb-2">
                [TRANSMISSION FINALE - DIAGNOSTIC URGENT]
              </div>
              <div class="text-white font-tech leading-relaxed">
                <p class="mb-4">
                  <span class="text-cyber-green">Félicitations,</span> vous avez réussi à résoudre la <span class="text-yellow-400">cyberattaque</span> et restaurer tous les systèmes.
                </p>
                <p class="mb-4">
                  Cependant, un <span class="text-red-400">patient en état critique</span> nécessite un diagnostic urgent. <span class="text-yellow-400">Marie Dubois, 34 ans</span> présente des symptômes graves.
                </p>
                <p class="mb-4">
                  <span class="text-cyber-blue">Votre mission finale :</span> analyser la fiche patient, poser le bon diagnostic et administrer le traitement approprié.
                </p>
                <div class="bg-red-900/20 border border-red-500/50 rounded p-4 mb-4">
                  <div class="text-red-400 font-bold text-sm mb-2">⚠️ PATIENT CRITIQUE</div>
                  <div class="text-gray-300 text-sm">
                    Symptômes : fièvre élevée, difficultés respiratoires, toux persistante. Analyses : leucocytes élevés, CRP positive, saturation basse.
                  </div>
                </div>
                <p class="mb-4">
                  <span class="text-yellow-400">Attention :</span> une erreur de diagnostic ou de traitement ajoutera une pénalité à votre score. Soyez précis et méthodique.
                </p>
                <p class="mb-4">
                  Une fois le diagnostic posé et le traitement administré, vous devrez sécuriser le dossier patient dans le coffre-fort numérique.
                </p>
                <p class="text-center text-cyber-green font-bold mt-6">
                  Bon courage, agents. La vie de ce patient dépend de votre diagnostic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer with progress -->
      <div class="border-t border-cyber-green/50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
            <span class="text-xs text-gray-400 font-tech">TRANSMISSION FINALE ACTIVE</span>
          </div>
          <div class="text-xs text-gray-500 font-tech">
            [AUTO-CLOSE IN {{ Math.ceil(timeRemaining / 1000) }}s]
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 33000 // 33 seconds
  }
})

const emit = defineEmits(['close'])

const timeRemaining = ref(props.duration)
let interval = null

const handleClose = () => {
  // Arrêter l'audio et fermer le popup
  emit('close')
}

onMounted(() => {
  if (props.visible) {
    // Start countdown
    interval = setInterval(() => {
      timeRemaining.value -= 1000
      if (timeRemaining.value <= 0) {
        emit('close')
      }
    }, 1000)
  }
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<style scoped>
.scanline {
  background: linear-gradient(
    transparent 50%,
    rgba(0, 255, 0, 0.03) 50%
  );
  background-size: 100% 4px;
  animation: scanline 0.1s linear infinite;
  pointer-events: none;
}

/* S'assurer que les boutons sont cliquables */
button {
  pointer-events: auto !important;
  position: relative;
  z-index: 10;
}

@keyframes scanline {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}
</style>