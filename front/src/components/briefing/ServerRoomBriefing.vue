<template>
  <div 
    v-if="visible"
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div class="bg-gray-900/95 border-2 border-red-500 rounded-lg max-w-4xl w-full relative overflow-hidden">
      <!-- Scanlines effect -->
      <div class="absolute inset-0 scanline opacity-20"></div>
      
      <!-- Header with agent info -->
      <div class="border-b border-red-500/50 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Agent Avatar -->
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border-2 border-red-500">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                </svg>
              </div>
              <!-- Status indicator -->
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            
            <!-- Agent Info -->
            <div>
              <h3 class="text-xl font-bold text-red-400 font-tech">
                AGENT CYBER-001
              </h3>
              <p class="text-sm text-gray-300 font-tech">
                Unité de Cybersécurité Médicale - Salle du Serveur
              </p>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span class="text-xs text-red-400 font-tech">ALERTE SÉCURITÉ - TRANSMISSION URGENTE</span>
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
        <div class="bg-gray-800/50 border border-red-500/30 rounded-lg p-6">
          <div class="flex items-start gap-4">
            <!-- Message bubble -->
            <div class="flex-1">
              <div class="text-red-400 font-tech text-sm mb-2">
                [TRANSMISSION URGENTE - NIVEAU SÉCURITÉ MAXIMUM]
              </div>
              <div class="text-white font-tech leading-relaxed">
                <p class="mb-4">
                  <span class="text-red-400">Agent,</span> vous êtes maintenant dans la <span class="text-yellow-400">Salle du Serveur principal.</span>
                </p>
                <p class="mb-4">
                  Le <span class="text-red-400">système de sécurité a été complètement piraté.</span> Nos enregistrements de sécurité montrent des <span class="text-yellow-400">intrusions multiples</span> dans les dernières 24 heures.
                </p>
                <p class="mb-4">
                  <span class="text-cyber-blue">Votre mission :</span> décoder les messages de sécurité corrompus pour restaurer la protection du réseau hospitalier.
                </p>
                <div class="bg-red-900/20 border border-red-500/50 rounded p-4 mb-4">
                  <div class="text-red-400 font-bold text-sm mb-2">⚠️ ALERTE CRITIQUE</div>
                  <div class="text-gray-300 text-sm">
                    Les messages sont brouillés et illisibles. Vous devrez les reconstituer pour comprendre comment les pirates ont réussi à s'introduire.
                  </div>
                </div>
                <p class="mb-4">
                  <span class="text-yellow-400">Attention :</span> chaque minute compte. Plus vous tardez, plus le <span class="text-red-400">virus informatique</span> se propage dans les autres systèmes.
                </p>
                <p class="mb-4">
                  Commencez par analyser les <span class="text-cyber-blue">messages brouillés.</span> Cherchez les motifs et les séquences qui se répètent.
                </p>
                <p class="mb-4">
                  Une fois la sécurité restaurée, vous pourrez accéder aux autres zones critiques du réseau.
                </p>
                <p class="text-center text-red-400 font-bold mt-6">
                  Bon courage, agent. La sécurité des données médicales dépend de votre réussite.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer with progress -->
      <div class="border-t border-red-500/50 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span class="text-xs text-gray-400 font-tech">TRANSMISSION URGENTE ACTIVE</span>
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
    default: 55000 // 55 seconds
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
    rgba(255, 0, 0, 0.03) 50%
  );
  background-size: 100% 4px;
  animation: scanline 0.1s linear infinite;
}

@keyframes scanline {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}
</style>
