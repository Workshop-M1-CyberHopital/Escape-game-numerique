<template>
  <div 
    v-if="visible"
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div class="bg-gray-900/95 border-2 border-purple-500 rounded-lg max-w-4xl w-full relative overflow-hidden">
      <!-- Scanlines effect -->
      <div class="absolute inset-0 scanline opacity-20"></div>
      
      <!-- Header with agent info -->
      <div class="border-b border-purple-500/50 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Agent Avatar -->
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center border-2 border-purple-500">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <!-- Status indicator -->
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            
            <!-- Agent Info -->
            <div>
              <h3 class="text-xl font-bold text-purple-400 font-tech">
                AGENT CYBER-001
              </h3>
              <p class="text-sm text-gray-300 font-tech">
                Unité de Cybersécurité Médicale - Mission Accomplie
              </p>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span class="text-xs text-purple-400 font-tech">MISSION RÉUSSIE - FÉLICITATIONS</span>
              </div>
            </div>
          </div>
          
          <!-- Close Button -->
          <button
            @click="handleClose"
            class="w-8 h-8 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all duration-300 hover:scale-110"
            title="Fermer et couper l'audio"
          >
            <svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Message Content -->
      <div class="p-6">
        <div class="bg-gray-800/50 border border-purple-500/30 rounded-lg p-6">
          <div class="space-y-4">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <h2 class="text-lg font-bold text-purple-400 font-tech">
                MISSION ACCOMPLIE - LABORATOIRE ADN
              </h2>
            </div>
            
            <div class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed">
              <p>
                <span class="text-purple-400 font-bold">Mission accomplie, agent !</span>
              </p>
              
              <p>
                Vous avez brillamment analysé les échantillons ADN et sécurisé les données génétiques critiques. Votre expertise en bio-informatique a permis de déchiffrer les séquences génétiques.
              </p>
              
              <p>
                <span class="text-purple-400 font-bold">Les informations sensibles sont maintenant protégées contre les intrusions malveillantes.</span>
              </p>
              
              <div class="bg-purple-500/10 border border-purple-500/30 rounded p-4 mt-4">
                <p class="text-purple-400 font-bold mb-2">STATUT DE LA MISSION :</p>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span class="text-purple-400">Données génétiques sécurisées à 100%</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span class="text-purple-400">Séquences ADN déchiffrées</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span class="text-purple-400">Intégrité des données rétablie</span>
                  </div>
                </div>
              </div>
              
              <p class="text-purple-400 font-bold">
                Vous pouvez maintenant passer à la mission suivante. D'autres défis vous attendent pour sécuriser complètement l'infrastructure médicale.
              </p>
              
              <p class="text-center text-purple-400 font-bold mt-4">
                Continuez votre excellent travail, agent. L'hôpital compte sur vous.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer with progress -->
      <div class="border-t border-purple-500/50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span class="text-xs text-gray-400 font-tech">MISSION ACCOMPLIE</span>
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
  }
})

const emit = defineEmits(['close'])

const timeRemaining = ref(38000) // 38 secondes
let timer = null

const handleClose = () => {
  emit('close')
}

onMounted(() => {
  if (props.visible) {
    timer = setInterval(() => {
      timeRemaining.value -= 100
      if (timeRemaining.value <= 0) {
        handleClose()
      }
    }, 100)
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.scanline {
  background: linear-gradient(transparent 50%, rgba(0, 255, 255, 0.03) 50%);
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
