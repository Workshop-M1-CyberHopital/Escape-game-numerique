<template>
  <div 
    v-if="visible"
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div class="bg-gray-900/95 border-2 border-cyber-red rounded-lg max-w-4xl w-full relative overflow-hidden">
      <!-- Scanlines effect -->
      <div class="absolute inset-0 scanline opacity-20"></div>
      
      <!-- Header with agent info -->
      <div class="border-b border-cyber-red/50 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Agent Avatar -->
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-cyber-red to-red-700 rounded-full flex items-center justify-center border-2 border-cyber-red">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                </svg>
              </div>
              <!-- Status indicator -->
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-cyber-red rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            
            <!-- Agent Info -->
            <div>
              <h3 class="text-xl font-bold text-cyber-red font-tech">
                AGENT CYBER-001
              </h3>
              <p class="text-sm text-gray-300 font-tech">
                Unité de Diagnostic Médical - Salle des Pathologies
              </p>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-2 h-2 bg-cyber-red rounded-full animate-pulse"></div>
                <span class="text-xs text-cyber-red font-tech">ALERTE MÉDICALE - DIAGNOSTIC URGENT</span>
              </div>
            </div>
          </div>
          
          <!-- Close Button -->
          <button
            @click="handleClose"
            class="w-8 h-8 bg-cyber-red/20 border border-cyber-red/50 rounded-full flex items-center justify-center hover:bg-cyber-red/30 transition-all duration-300 hover:scale-110"
            title="Fermer et couper l'audio"
          >
            <svg class="w-4 h-4 text-cyber-red" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Message Content -->
      <div class="p-6">
        <div class="bg-gray-800/50 border border-cyber-red/30 rounded-lg p-6">
          <div class="flex items-start gap-4">
            <!-- Message bubble -->
            <div class="flex-1">
              <div class="text-cyber-red font-tech text-sm mb-2">
                [TRANSMISSION MÉDICALE URGENTE - NIVEAU CRITIQUE]
              </div>
              <div class="text-white font-tech leading-relaxed">
                <p class="mb-4">
                  <span class="text-cyber-red">Agents,</span> vous êtes dans la <span class="text-yellow-400">Salle des Pathologies.</span>
                </p>
                <p class="mb-4">
                  Le <span class="text-cyber-red">système de diagnostic est compromis.</span> Les <span class="text-yellow-400">traitements ont été mélangés</span> dans la base de données.
                </p>
                <p class="mb-4">
                  <span class="text-cyber-blue">Votre mission :</span> associer chaque pathologie à sa guérison correspondante.
                </p>
                <div class="bg-red-900/20 border border-cyber-red/50 rounded p-4 mb-4">
                  <div class="text-cyber-red font-bold text-sm mb-2">⚠️ RÈGLE CRITIQUE</div>
                  <div class="text-gray-300 text-sm">
                    <span class="text-red-400 font-bold">ZÉRO TOLÉRANCE :</span> Une erreur = recommencement total !
                  </div>
                </div>
                <p class="text-center text-cyber-red font-bold mt-4">
                  La vie des patients dépend de votre diagnostic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer with progress -->
      <div class="border-t border-cyber-red/50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-cyber-red rounded-full animate-pulse"></div>
            <span class="text-xs text-gray-400 font-tech">TRANSMISSION MÉDICALE ACTIVE</span>
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
        default: 45000 // 45 seconds
    }
})

const emit = defineEmits(['close'])

const timeRemaining = ref(props.duration)
let interval = null

const handleClose = () => {
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