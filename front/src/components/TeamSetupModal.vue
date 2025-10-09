<template>
  <div 
    v-if="visible"
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
  >
    <div class="bg-gray-900/95 border-2 border-cyber-red rounded-lg max-w-2xl w-full relative overflow-hidden">
      <!-- Scanlines effect -->
      <div class="absolute inset-0 scanline opacity-20 pointer-events-none"></div>
      
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
      <div class="p-4">
        <div class="bg-gray-800/50 border border-cyber-red/30 rounded-lg p-4">
          <div class="text-cyber-red font-tech text-sm mb-4">
            [CONFIGURATION D'ÉQUIPE - MISSION RÉSILIENCE]
          </div>
          
          <!-- Layout en deux colonnes -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Colonne gauche : Configuration équipe -->
            <div class="space-y-4">
              <!-- Team Name Input -->
              <div>
                <label class="block text-cyber-red font-tech font-bold text-sm mb-2">
                  NOM DE L'ÉQUIPE
                </label>
                <input
                  v-model="teamName"
                  type="text"
                  placeholder="Entrez le nom de votre équipe..."
                  class="w-full px-3 py-2 bg-gray-900 border border-cyber-red/50 rounded text-white font-tech text-sm focus:border-cyber-red focus:outline-none transition-all pointer-events-auto"
                />
              </div>
              
              <!-- Players Section -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-cyber-red font-tech font-bold text-sm">
                    MEMBRES DE L'ÉQUIPE
                  </label>
                  <button
                    @click="addPlayer"
                    class="px-2 py-1 bg-cyber-red/20 border border-cyber-red text-cyber-red font-tech text-xs rounded hover:bg-cyber-red/30 transition-all pointer-events-auto"
                  >
                    + AJOUTER
                  </button>
                </div>
                
                <div class="space-y-2">
                  <div
                    v-for="(player, index) in players"
                    :key="index"
                    class="flex items-center gap-2"
                  >
                    <!-- Premier joueur (connecté) - bloqué -->
                    <div v-if="index === 0 && connectedPlayerName" class="flex-1 relative">
                      <input
                        v-model="players[index]"
                        type="text"
                        :placeholder="`Joueur ${index + 1}...`"
                        readonly
                        class="w-full px-2 py-1 bg-gray-800 border border-cyber-green/50 rounded text-cyber-green font-tech text-xs cursor-not-allowed"
                      />
                      <div class="absolute -top-1 -right-1 w-2 h-2 bg-cyber-green rounded-full border border-gray-900 animate-pulse"></div>
                      <div class="absolute top-0 right-0 text-xs text-cyber-green font-bold">CONNECTÉ</div>
                    </div>
                    <!-- Autres joueurs - éditables -->
                    <div v-else class="flex-1">
                      <input
                        v-model="players[index]"
                        type="text"
                        :placeholder="`Joueur ${index + 1}...`"
                        class="w-full px-2 py-1 bg-gray-900 border border-cyber-red/50 rounded text-white font-tech text-xs focus:border-cyber-red focus:outline-none transition-all"
                      />
                    </div>
                    
                    <button
                      @click="removePlayer(index)"
                      :disabled="players.length <= 1 || (index === 0 && connectedPlayerName)"
                      :class="[
                        'w-6 h-6 border rounded flex items-center justify-center transition-all',
                        (players.length <= 1 || (index === 0 && connectedPlayerName))
                          ? 'bg-gray-600/20 border-gray-500 text-gray-400 cursor-not-allowed'
                          : 'bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30'
                      ]"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Colonne droite : Instructions et Auth -->
            <div class="space-y-4">
              <!-- Instructions -->
              <div class="bg-red-900/20 border border-red-500/50 rounded p-3">
                <div class="text-red-400 font-bold text-xs mb-2">⚠️ INSTRUCTIONS</div>
                <div class="text-gray-300 text-xs mb-2">
                  Configurez votre équipe de cybersécurité. Chaque membre aura un rôle crucial dans la mission.
                </div>
                <div v-if="connectedPlayerName" class="text-cyber-green text-xs font-tech">
                  🔒 Le joueur 1 est verrouillé avec votre pseudo connecté : <span class="font-bold">{{ connectedPlayerName }}</span>
                </div>
              </div>

              <!-- Section d'incitation à l'authentification -->
              <div v-if="!isAuthenticated" class="bg-gradient-to-r from-cyber-blue/10 to-cyber-red/10 border border-cyber-blue/50 rounded p-3">
                <div class="text-center">
                  <div class="w-8 h-8 bg-gradient-to-br from-cyber-blue to-cyber-red rounded-full flex items-center justify-center border-2 border-cyber-blue mx-auto mb-2">
                    <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                    </svg>
                  </div>
                  <h4 class="text-cyber-blue font-tech font-bold text-xs mb-2">
                    🚀 DÉBLOQUEZ VOS STATISTIQUES
                  </h4>
                  <div class="text-gray-300 text-xs mb-3">
                    <div class="flex items-center justify-center gap-1 mb-1">
                      <span class="text-cyber-green">✓</span> Suivi performances
                    </div>
                    <div class="flex items-center justify-center gap-1 mb-1">
                      <span class="text-cyber-green">✓</span> Historique parties
                    </div>
                    <div class="flex items-center justify-center gap-1 mb-1">
                      <span class="text-cyber-green">✓</span> Classement & Badges
                    </div>
                  </div>
                  
                  <!-- Boutons d'action -->
                  <div class="space-y-2">
                    <button
                      @click="handleOpenAuth"
                      class="w-full px-3 py-2 bg-gradient-to-r from-cyber-blue to-cyber-red hover:from-cyber-blue/80 hover:to-cyber-red/80 text-white font-tech font-bold text-xs rounded transition-all duration-300 hover:scale-105 flex items-center justify-center gap-1"
                    >
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                      </svg>
                      S'INSCRIRE
                    </button>
                    
                    <button
                      @click="handleClose"
                      class="w-full px-3 py-2 bg-gray-600/50 hover:bg-gray-600 text-gray-300 font-tech text-xs rounded transition-all border border-gray-500"
                    >
                      CONTINUER SANS COMPTE
                    </button>
                  </div>
                </div>
              </div>

              <!-- Section utilisateur connecté -->
              <div v-else class="bg-gradient-to-r from-cyber-green/10 to-cyber-blue/10 border border-cyber-green/50 rounded p-3">
                <div class="text-center">
                  <div class="w-6 h-6 bg-cyber-green rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                    </svg>
                  </div>
                  <div class="text-cyber-green font-tech font-bold text-xs mb-1">
                    ✅ CONNECTÉ : {{ user?.username?.toUpperCase() || 'UTILISATEUR' }}
                  </div>
                  <div class="text-gray-300 text-xs">
                    Statistiques sauvegardées
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer with action buttons -->
      <div class="border-t border-cyber-red/50 p-4">
        <div class="flex gap-3 justify-end">
          <button
            @click="handleClose"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-tech text-sm rounded transition-all"
          >
            ANNULER
          </button>
          <button
            @click="handleStartGame"
            :disabled="!canStart"
            :class="[
              'px-4 py-2 font-tech text-sm rounded transition-all',
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
import { ref, computed, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  connectedPlayerName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'start-game', 'open-auth'])

// Utiliser le composable d'authentification
const { isAuthenticated, user } = useAuth()

const teamName = ref('')
const players = ref([props.connectedPlayerName || ''])

// Watcher pour mettre à jour le premier joueur quand le pseudo connecté change
watch(() => props.connectedPlayerName, (newName) => {
  if (newName && players.value.length > 0) {
    players.value[0] = newName
  }
}, { immediate: true })

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

const handleOpenAuth = () => {
  emit('open-auth')
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
