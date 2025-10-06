<template>
  <GameRoom 
    :room-data="roomData" 
    @exit-room="$emit('exit-room')"
  >
    <!-- Interface de décodage -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Log chiffré -->
      <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline">
        <div class="flex items-center gap-2 mb-4">
          <i data-lucide="file-text" class="w-5 h-5 text-cyber-red"></i>
          <h3 class="font-cyber font-bold text-cyber-red">LOG CHIFFRÉ</h3>
        </div>
        
        <div class="bg-black/50 border border-cyber-red/30 rounded p-4 font-tech text-sm text-gray-300 mb-4">
          <div class="text-cyber-red mb-2">[ERROR] Authentication failed</div>
          <div class="text-cyber-red mb-2">[WARN] Firewall breach detected</div>
          <div class="text-yellow-500 mb-2">[INFO] Attempting connection to: {{ encryptedPassword }}</div>
          <div class="text-cyber-red mb-2">[ERROR] Invalid credentials</div>
          <div class="text-cyber-red mb-2">[CRITICAL] System compromised</div>
        </div>
        
        <div class="text-xs text-gray-500 font-tech">
          Le mot de passe semble être encodé. Trouvez la méthode de décodage.
        </div>
      </div>

      <!-- Interface de décodage -->
      <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline">
        <div class="flex items-center gap-2 mb-4">
          <i data-lucide="key" class="w-5 h-5 text-cyber-blue"></i>
          <h3 class="font-cyber font-bold text-cyber-blue">DÉCODEUR</h3>
        </div>
        
        <div class="space-y-4">
          <!-- Type d'encodage -->
          <div>
            <label class="block text-sm font-tech text-gray-300 mb-2">Type d'encodage</label>
            <select 
              v-model="selectedEncoding"
              class="w-full px-4 py-3 bg-black/50 border border-cyber-blue/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyber-blue transition-all"
            >
              <option value="">Sélectionnez le type d'encodage</option>
              <option value="base64">Base64</option>
              <option value="caesar">César (ROT13)</option>
              <option value="hex">Hexadécimal</option>
              <option value="binary">Binaire</option>
            </select>
          </div>
          
          <!-- Mot de passe décodé -->
          <div>
            <label class="block text-sm font-tech text-gray-300 mb-2">Mot de passe décodé</label>
            <input 
              v-model="decodedPassword"
              type="text"
              placeholder="Entrez le mot de passe décodé"
              class="w-full px-4 py-3 bg-black/50 border border-cyber-blue/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyber-blue transition-all"
            />
          </div>
          
          <!-- Bouton de vérification -->
          <button 
            @click="checkPassword"
            :disabled="!decodedPassword"
            class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
          >
            VÉRIFIER LE MOT DE PASSE
          </button>
        </div>
      </div>
    </div>

    <!-- Indices -->
    <div class="mt-8">
      <div class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-6">
        <div class="flex items-center gap-2 mb-4">
          <i data-lucide="lightbulb" class="w-5 h-5 text-yellow-500"></i>
          <h4 class="font-cyber font-bold text-yellow-500">INDICES</h4>
        </div>
        
        <div class="space-y-2 text-sm text-gray-300">
          <div v-if="hintsShown >= 1" class="fade-in">
            💡 Le mot de passe est encodé en Base64
          </div>
          <div v-if="hintsShown >= 2" class="fade-in">
            💡 Utilisez un décodeur Base64 en ligne ou votre navigateur
          </div>
          <div v-if="hintsShown >= 3" class="fade-in">
            💡 Le mot de passe décodé est : <span class="text-cyber-green font-bold">CYBERMEDICS2024</span>
          </div>
        </div>
        
        <button 
          @click="showHint"
          v-if="hintsShown < 3"
          class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-tech text-sm rounded transition-all"
        >
          AFFICHER UN INDICE
        </button>
      </div>
    </div>

    <!-- Message de succès -->
    <div v-if="isCompleted" class="mt-8">
      <div class="bg-cyber-green/20 backdrop-blur-md border-2 border-cyber-green rounded-lg p-6 text-center">
        <div class="flex items-center justify-center gap-2 mb-4">
          <i data-lucide="check-circle" class="w-8 h-8 text-cyber-green"></i>
          <h3 class="text-2xl font-cyber font-bold text-cyber-green">SALLE TERMINÉE !</h3>
        </div>
        <p class="text-gray-300 mb-4">
          Excellent ! Vous avez réussi à décoder le mot de passe et à restaurer le pare-feu.
          La sécurité des données de santé est maintenant protégée.
        </p>
        <button 
          @click="$emit('room-completed', 'server')"
          class="px-8 py-3 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all"
        >
          CONTINUER VERS LA PROCHAINE SALLE
        </button>
      </div>
    </div>
  </GameRoom>
</template>

<script setup>
import { ref, computed } from 'vue'
import GameRoom from '../GameRoom.vue'

const emit = defineEmits(['exit-room', 'room-completed'])

// Données de la salle
const roomData = {
  title: 'SALLE DU SERVEUR',
  subtitle: 'Le pare-feu corrompu',
  description: 'Une cyberattaque a compromis le pare-feu de l\'hôpital. Vous devez décoder un mot de passe à partir des logs du système pour restaurer la sécurité.',
  objective: 'Sensibiliser à la sécurité des données de santé',
  icon: 'server',
  color: '#ff0055'
}

// État du jeu
const selectedEncoding = ref('')
const decodedPassword = ref('')
const hintsShown = ref(0)
const isCompleted = ref(false)

// Mot de passe chiffré (Base64 de "CYBERMEDICS2024")
const encryptedPassword = 'Q1lCRVJNRURJQ1MyMDI0'

const showHint = () => {
  hintsShown.value++
}

const checkPassword = () => {
  if (decodedPassword.value.toUpperCase() === 'CYBERMEDICS2024') {
    isCompleted.value = true
    // Débloquer la prochaine salle
    emit('room-completed', 'server')
  } else {
    alert('Mot de passe incorrect. Essayez encore !')
  }
}
</script>
