<template>
  <div 
    v-if="visible"
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div class="bg-gray-900/95 border-2 border-cyber-purple rounded-lg max-w-4xl w-full relative overflow-hidden">
      <!-- Scanlines effect -->
      <div class="absolute inset-0 scanline opacity-20"></div>
      
      <!-- Header with agent info -->
      <div class="border-b border-cyber-purple/50 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Agent Avatar -->
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-cyber-purple to-purple-700 rounded-full flex items-center justify-center border-2 border-cyber-purple">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                </svg>
              </div>
              <!-- Status indicator -->
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-cyber-purple rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            
            <!-- Agent Info -->
            <div>
              <h3 class="text-xl font-bold text-cyber-purple font-tech">
                AGENT CYBER-001
              </h3>
              <p class="text-sm text-gray-300 font-tech">
                Unité de Cybersécurité Médicale - Laboratoire ADN
              </p>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-2 h-2 bg-cyber-purple rounded-full animate-pulse"></div>
                <span class="text-xs text-cyber-purple font-tech">ALERTE GÉNÉTIQUE - TRANSMISSION URGENTE</span>
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
        <div class="bg-gray-800/50 border border-cyber-purple/30 rounded-lg p-6">
          <div class="space-y-4">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-3 h-3 bg-cyber-purple rounded-full animate-pulse"></div>
              <h2 class="text-lg font-bold text-cyber-purple font-tech">
                MISSION CRITIQUE - LABORATOIRE ADN
              </h2>
            </div>
            
            <div class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed">
              <p>
                <span class="text-cyber-purple font-bold">Agent,</span> nous avons une situation critique dans le laboratoire ADN.
              </p>
              
              <p>
                Les systèmes de sécurité biométrique ont été compromis par des hackers. Notre base de données génétique, qui contient les profils ADN de tous les citoyens, est en danger.
              </p>
              
              <p>
                <span class="text-cyber-purple font-bold">Votre mission :</span> reconstituer les séquences ADN corrompues pour rétablir la sécurité du système.
              </p>
              
              <div class="bg-cyber-purple/10 border border-cyber-purple/30 rounded p-4 mt-4">
                <p class="text-cyber-purple font-bold mb-2">RÈGLES D'APPARIEMENT :</p>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-red-400">A</span>
                    <span>↔</span>
                    <span class="text-red-400">T</span>
                    <span class="text-gray-400">(Adénine-Thymine)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-green-400">C</span>
                    <span>↔</span>
                    <span class="text-green-400">G</span>
                    <span class="text-gray-400">(Cytosine-Guanine)</span>
                  </div>
                </div>
              </div>
              
              <p class="text-cyber-purple font-bold">
                Le sort de notre infrastructure génétique dépend de vous. Commencez la reconstruction immédiatement.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer with progress -->
      <div class="border-t border-cyber-purple/50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-cyber-purple rounded-full animate-pulse"></div>
            <span class="text-xs text-gray-400 font-tech">TRANSMISSION ACTIVE</span>
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

const timeRemaining = ref(45000) // 45 secondes
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