<template>
  <div 
    v-if="visible"
    class="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
    role="dialog"
    aria-modal="true"
    aria-label="Initialisation de la mission"
    aria-busy="true"
  >
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div class="absolute inset-0 scanline opacity-30"></div>
    </div>
    
    <!-- Main Loading Content (défilable sur petit écran ; my-auto garde le haut accessible) -->
    <div class="relative z-10 w-full h-full overflow-y-auto flex flex-col px-4 py-6">
      <div class="my-auto w-full max-w-2xl mx-auto text-center space-y-5 sm:space-y-8 flex flex-col items-center">
      <!-- Loading Animation -->
      <div class="relative shrink-0">
        <div class="w-24 h-24 sm:w-32 sm:h-32 mx-auto border-4 border-cyber-red/30 rounded-full animate-spin">
          <div class="w-full h-full border-4 border-transparent border-t-cyber-red rounded-full animate-spin"></div>
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-12 h-12 sm:w-16 sm:h-16 bg-cyber-red/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 sm:w-8 sm:h-8 text-cyber-red animate-pulse" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Loading Text -->
      <div class="space-y-4">
        <h2 class="text-2xl sm:text-3xl font-cyber font-bold text-cyber-red glitch">
          <span class="glitch-text">INITIALISATION</span>
          <span class="glitch-layer red" aria-hidden="true">INITIALISATION</span>
          <span class="glitch-layer cyan" aria-hidden="true">INITIALISATION</span>
        </h2>
        
        <div class="text-cyber-red font-tech text-base sm:text-lg">
          CONFIGURATION DES SYSTÈMES...
        </div>
        
        <!-- Progress Steps -->
        <div class="space-y-2 text-left max-w-md mx-auto">
          <div class="flex items-center gap-3 text-sm font-tech">
            <div class="w-2 h-2 bg-cyber-red rounded-full animate-pulse"></div>
            <span class="text-gray-300">Chargement des modules de sécurité...</span>
          </div>
          <div class="flex items-center gap-3 text-sm font-tech">
            <div class="w-2 h-2 bg-cyber-red rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
            <span class="text-gray-300">Initialisation des protocoles...</span>
          </div>
          <div class="flex items-center gap-3 text-sm font-tech">
            <div class="w-2 h-2 bg-cyber-red rounded-full animate-pulse" style="animation-delay: 1s"></div>
            <span class="text-gray-300">Connexion aux systèmes hospitaliers...</span>
          </div>
          <div class="flex items-center gap-3 text-sm font-tech">
            <div class="w-2 h-2 bg-cyber-red rounded-full animate-pulse" style="animation-delay: 1.5s"></div>
            <span class="text-gray-300">Préparation de la mission...</span>
          </div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="w-full max-w-md mx-auto">
        <!-- Pas de région aria-live ici : la valeur change toutes les 60 ms -->
        <div
          class="bg-gray-800 rounded-full h-2 overflow-hidden"
          role="progressbar"
          aria-label="Initialisation de la mission"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(progress)"
        >
          <div
            class="h-full bg-gradient-to-r from-cyber-red to-cyber-blue rounded-full transition-all duration-200 ease-out"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <div class="text-xs text-gray-400 font-tech mt-2" aria-hidden="true">
          {{ Math.round(progress) }}% COMPLÉTÉ
        </div>
      </div>
      
      <!-- Team Info -->
      <div class="bg-gray-900/50 border border-cyber-red/30 rounded-lg p-4 max-w-md mx-auto">
        <div class="text-cyber-red font-tech text-sm mb-2">ÉQUIPE CONFIGURÉE</div>
        <div class="text-white font-tech break-words">{{ teamName }}</div>
        <div class="text-gray-400 font-tech text-xs mt-1">
          {{ players.length }} agent{{ players.length > 1 ? 's' : '' }} assigné{{ players.length > 1 ? 's' : '' }}
        </div>
      </div>
      </div>
    </div>
    
    <!-- Matrix-like falling characters -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div 
        v-for="drop in fallingChars" 
        :key="drop.id"
        class="absolute top-0 text-cyber-red/20 font-mono text-xs animate-fall"
        :style="{ 
          left: drop.left + '%',
          animationDelay: drop.delay + 's',
          animationDuration: drop.duration + 's'
        }"
      >
        {{ drop.char }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  teamName: {
    type: String,
    default: ''
  },
  players: {
    type: Array,
    default: () => []
  },
  duration: {
    type: Number,
    default: 3000 // 3 seconds
  }
})

const emit = defineEmits(['complete'])

const progress = ref(0)
let progressInterval = null
let completeTimeout = null

const CHARS = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const FALLING_CHAR_COUNT = 20

const getRandomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)]

// Calculé une seule fois : un Math.random() dans le template était réévalué à chaque
// rendu (toutes les 60 ms avec la progression) et faisait « téléporter » les caractères.
const fallingChars = Array.from({ length: FALLING_CHAR_COUNT }, (_, id) => ({
  id,
  left: Math.round(Math.random() * 1000) / 10,
  delay: Math.round(Math.random() * 30) / 10,
  duration: Math.round((Math.random() * 3 + 2) * 10) / 10,
  char: getRandomChar()
}))

const stopProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  if (completeTimeout) {
    clearTimeout(completeTimeout)
    completeTimeout = null
  }
}

const startProgress = () => {
  stopProgress()
  progress.value = 0
  const step = Math.max(10, props.duration / 50)
  progressInterval = setInterval(() => {
    progress.value = Math.min(100, progress.value + 2)
    if (progress.value >= 100) {
      clearInterval(progressInterval)
      progressInterval = null
      completeTimeout = setTimeout(() => {
        completeTimeout = null
        emit('complete')
      }, 500)
    }
  }, step)
}

onMounted(() => {
  if (props.visible) {
    startProgress()
  }
})

// Watcher pour détecter les changements de visible
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    startProgress()
  } else {
    stopProgress()
  }
})

onUnmounted(stopProgress)
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

.glitch {
  position: relative;
}

.glitch-text {
  position: relative;
  z-index: 1;
}

.glitch-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.7;
  animation: glitch 0.3s infinite;
}

.glitch-layer.red {
  color: #ef4444;
  animation-delay: 0.1s;
}

.glitch-layer.cyan {
  color: #06b6d4;
  animation-delay: 0.2s;
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}

/* both : pendant son délai, le caractère reste caché au-dessus de l'écran (au lieu de s'afficher en haut) */
.animate-fall {
  animation: fall linear infinite both;
}

@media (prefers-reduced-motion: reduce) {
  .animate-fall {
    display: none;
  }
}

@keyframes fall {
  0% {
    transform: translateY(-100vh);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}
</style>
