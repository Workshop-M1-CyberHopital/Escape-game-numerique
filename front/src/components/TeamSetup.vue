<template>
  <section class="team-setup-section px-4 py-20 max-w-2xl mx-auto">
    <div class="bg-gray-900/80 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-8 scanline">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-lg bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center">
          <Users class="w-6 h-6 text-cyan-500" />
        </div>
        <div>
          <h3 class="text-2xl font-cyber font-bold text-cyan-500">
            Configuration de l'Équipe
          </h3>
          <p class="text-sm font-tech text-gray-400">
            Unité Spéciale de Cybersécurité Médicale
          </p>
        </div>
      </div>
      
      <div class="space-y-6">
        <!-- Team Name -->
        <div>
          <label class="block text-sm font-tech text-gray-300 mb-2">Nom de l'Équipe</label>
          <input 
            v-model="teamName"
            type="text" 
            placeholder="Ex: Cyber Medics Alpha" 
            class="w-full px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>
        
        <!-- Players -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-tech text-gray-300">Membres de l'Équipe (1-4 joueurs)</label>
            <button 
              @click="addPlayer" 
              v-if="players.length < 4"
              class="px-3 py-1 border border-cyan-500/30 text-cyber-blue hover:bg-cyan-500/10 font-tech text-sm rounded transition-all flex items-center gap-2"
            >
              <UserPlus class="w-4 h-4" />
              Ajouter
            </button>
          </div>
          <div class="space-y-3">
            <div 
              v-for="(player, index) in players" 
              :key="index"
              :class="['flex gap-2', player.entering ? 'player-entry' : '']"
            >
              <input 
                v-model="player.name"
                type="text" 
                :placeholder="`Joueur ${index + 1}`" 
                class="flex-1 px-4 py-3 bg-black/50 border border-cyan-500/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyan-500 transition-all"
              />
              <button 
                v-if="players.length > 1"
                @click="removePlayer(index)"
                class="px-4 py-3 bg-transparent hover:bg-red-400/10 text-red-400 hover:text-red-300 rounded-lg transition-all"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Stats -->
        <div class="pt-4 border-t border-gray-700">
          <div class="grid grid-cols-2 gap-4 text-xs font-tech text-gray-400">
            <div>
              <span class="text-cyan-500">●</span> Joueurs: <span>{{ players.length }}/{{ players.length }}</span>
            </div>
            <div>
              <span class="text-cyber-red">●</span> Difficulté: Adaptative
            </div>
            <div>
              <span class="text-cyber-green">●</span> Durée: 30-45 min
            </div>
            <div>
              <span class="text-cyber-purple">●</span> Mode: Coopératif
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="text-center mt-8">
      <button 
        @click="startGame"
        class="flex items-center justify-center gap-2 px-12 py-6 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber text-lg rounded-lg mx-auto transition-all"
      >
        <Play class="w-5 h-5" />
        LANCER L'ESCAPE GAME
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { Users, UserPlus, Trash2, Play } from 'lucide-vue-next'

const emit = defineEmits(['close', 'start-game'])

const teamName = ref('')
const players = ref([
  { name: '', entering: false }
])

const addPlayer = () => {
  if (players.value.length < 4) {
    const newPlayer = { name: '', entering: true }
    players.value.push(newPlayer)
    
    // Trigger animation
    setTimeout(() => {
      newPlayer.entering = false
    }, 10)
  }
}

const removePlayer = (index) => {
  if (players.value.length > 1) {
    const player = players.value[index]
    player.entering = false
    
    setTimeout(() => {
      players.value.splice(index, 1)
    }, 300)
  }
}

const startGame = () => {
  const teamData = {
    name: teamName.value,
    players: players.value.map(p => p.name).filter(name => name.trim())
  }
  
  if (teamData.players.length === 0) {
    alert('Veuillez ajouter au moins un joueur')
    return
  }
  
  emit('start-game', teamData)
}
</script>
