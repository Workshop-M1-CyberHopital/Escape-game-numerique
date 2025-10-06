<template>
  <div 
    v-if="visible"
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  >
    <div class="bg-gray-900/95 border-2 border-cyber-red rounded-lg max-w-2xl w-full relative overflow-hidden">
      <!-- Scanlines effect -->
      <div class="absolute inset-0 scanline opacity-20"></div>
      
      <!-- Header -->
      <div class="border-b border-cyber-red/50 p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Agent Avatar -->
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border-2 border-cyber-red">
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
                COMMANDANT CYBER-001
              </h3>
              <p class="text-sm text-gray-300 font-tech">
                Centre de Commandement - Configuration d'Équipe
              </p>
              <div class="flex items-center gap-2 mt-1">
                <div class="w-2 h-2 bg-cyber-red rounded-full animate-pulse"></div>
                <span class="text-xs text-cyber-red font-tech">CONFIGURATION D'ÉQUIPE REQUISE</span>
              </div>
            </div>
          </div>
          
          <!-- Close Button -->
          <button
            @click="handleClose"
            class="w-8 h-8 bg-cyber-red/20 border border-cyber-red/50 rounded-full flex items-center justify-center hover:bg-cyber-red/30 transition-all duration-300 hover:scale-110"
            title="Fermer"
          >
            <svg class="w-4 h-4 text-cyber-red" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        <div class="bg-gray-800/50 border border-cyber-red/30 rounded-lg p-6">
          <div class="text-cyber-red font-tech text-sm mb-4">
            [CONFIGURATION D'ÉQUIPE - MISSION RÉSILIENCE]
          </div>
          
          <!-- Team Name Input -->
          <div class="mb-6">
            <label class="block text-cyber-red font-tech font-bold text-sm mb-2">
              NOM DE L'ÉQUIPE
            </label>
            <input
              v-model="teamName"
              type="text"
              placeholder="Entrez le nom de votre équipe..."
              class="w-full px-4 py-3 bg-gray-900 border border-cyber-red/50 rounded-lg text-white font-tech focus:border-cyber-red focus:outline-none transition-all"
            />
          </div>
          
          <!-- Players Section -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <label class="text-cyber-red font-tech font-bold text-sm">
                MEMBRES DE L'ÉQUIPE
              </label>
              <button
                @click="addPlayer"
                class="px-3 py-1 bg-cyber-red/20 border border-cyber-red text-cyber-red font-tech text-xs rounded hover:bg-cyber-red/30 transition-all"
              >
                + AJOUTER
              </button>
            </div>
            
            <div class="space-y-3">
              <div
                v-for="(player, index) in players"
                :key="index"
                class="flex items-center gap-3"
              >
                <input
                  v-model="players[index]"
                  type="text"
                  :placeholder="`Joueur ${index + 1}...`"
                  class="flex-1 px-3 py-2 bg-gray-900 border border-cyber-red/50 rounded text-white font-tech text-sm focus:border-cyber-red focus:outline-none transition-all"
                />
                <button
                  @click="removePlayer(index)"
                  :disabled="players.length <= 1"
                  :class="[
                    'w-8 h-8 border rounded flex items-center justify-center transition-all',
                    players.length <= 1 
                      ? 'bg-gray-600/20 border-gray-500 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30'
                  ]"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Instructions -->
          <div class="bg-red-900/20 border border-red-500/50 rounded p-4 mb-6">
            <div class="text-red-400 font-bold text-sm mb-2">⚠️ INSTRUCTIONS</div>
            <div class="text-gray-300 text-sm">
              Configurez votre équipe de cybersécurité. Chaque membre aura un rôle crucial dans la mission de restauration des systèmes hospitaliers.
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer with action buttons -->
      <div class="border-t border-cyber-red/50 p-6">
        <div class="flex gap-4 justify-end">
          <button
            @click="handleClose"
            class="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-tech rounded-lg transition-all"
          >
            ANNULER
          </button>
          <button
            @click="handleStartGame"
            :disabled="!canStart"
            :class="[
              'px-6 py-3 font-tech rounded-lg transition-all',
              canStart 
                ? 'bg-cyber-red hover:bg-cyber-red/80 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            ]"
          >
            LANCER LA MISSION
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'start-game'])

const teamName = ref('')
const players = ref([''])

const canStart = computed(() => {
  return teamName.value.trim() !== '' && 
         players.value.some(player => player.trim() !== '')
})

const addPlayer = () => {
  if (players.value.length < 6) {
    players.value.push('')
  }
}

const removePlayer = (index) => {
  if (players.value.length > 1) {
    players.value.splice(index, 1)
  }
}

const handleClose = () => {
  emit('close')
}

const handleStartGame = () => {
  if (canStart.value) {
    const teamData = {
      name: teamName.value.trim(),
      players: players.value.filter(player => player.trim() !== '')
    }
    emit('start-game', teamData)
  }
}
</script>

<style scoped>
.scanline {
  background: linear-gradient(
    transparent 50%,
    rgba(239, 68, 68, 0.03) 50%
  );
  background-size: 100% 4px;
  animation: scanline 0.1s linear infinite;
}

@keyframes scanline {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}
</style>
