<template>
  <div 
    v-if="visible"
    class="fixed inset-0 bg-black z-50 flex items-center justify-center"
  >
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div class="absolute inset-0 scanline opacity-30"></div>
    </div>
    
    <!-- Main Loading Content -->
    <div class="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-4 w-full h-full flex flex-col items-center justify-center">
      <!-- Loading Animation -->
      <div class="relative">
        <div class="w-32 h-32 mx-auto border-4 border-cyber-red/30 rounded-full animate-spin">
          <div class="w-full h-full border-4 border-transparent border-t-cyber-red rounded-full animate-spin"></div>
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-16 h-16 bg-cyber-red/20 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-cyber-red animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Loading Text -->
      <div class="space-y-4">
        <h2 class="text-3xl font-cyber font-bold text-cyber-red glitch">
          <span class="glitch-text">INITIALISATION</span>
          <span class="glitch-layer red">INITIALISATION</span>
          <span class="glitch-layer cyan">INITIALISATION</span>
        </h2>
        
        <div class="text-cyber-red font-tech text-lg">
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
        <div class="bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-cyber-red to-cyber-blue rounded-full transition-all duration-1000 ease-out"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <div class="text-xs text-gray-400 font-tech mt-2">
          {{ Math.round(progress) }}% COMPLÉTÉ
        </div>
      </div>
      
      <!-- Team Info -->
      <div class="bg-gray-900/50 border border-cyber-red/30 rounded-lg p-4 max-w-md mx-auto">
        <div class="text-cyber-red font-tech text-sm mb-2">ÉQUIPE CONFIGURÉE</div>
        <div class="text-white font-tech">{{ teamName }}</div>
        <div class="text-gray-400 font-tech text-xs mt-1">
          {{ players.length }} agent{{ players.length > 1 ? 's' : '' }} assigné{{ players.length > 1 ? 's' : '' }}
        </div>
      </div>
    </div>
    
    <!-- Matrix-like falling characters -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        v-for="i in 20" 
        :key="i"
        class="absolute text-cyber-red/20 font-mono text-xs animate-fall"
        :style="{ 
          left: Math.random() * 100 + '%',
          animationDelay: Math.random() * 3 + 's',
          animationDuration: (Math.random() * 3 + 2) + 's'
        }"
      >
        {{ getRandomChar() }}
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

const getRandomChar = () => {
  const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return chars[Math.floor(Math.random() * chars.length)]
}

const startProgress = () => {
  progress.value = 0
  progressInterval = setInterval(() => {
    progress.value += 2 
    if (progress.value >= 100) {
      clearInterval(progressInterval)
      setTimeout(() => {
        emit('complete')
      }, 500)
    }
  }, props.duration / 50)
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
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
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

.animate-fall {
  animation: fall linear infinite;
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
