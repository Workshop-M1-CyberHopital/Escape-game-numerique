<template>
  <div 
    ref="audioControlsRef"
    class="fixed z-[60] flex items-center gap-3 bg-gray-900/80 backdrop-blur-md border border-cyber-blue/50 rounded-lg p-3 cursor-move select-none"
    :style="{ 
      bottom: position.y + 'px', 
      left: position.x + 'px' 
    }"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <!-- Mute/Unmute Button -->
    <button
      @click="toggleMute"
      :class="[
        'p-2 rounded-lg transition-all duration-300 hover:scale-110',
        audioState.isMuted 
          ? 'bg-red-500/20 border border-red-500/50 text-red-400' 
          : 'bg-cyber-blue/20 border border-cyber-blue/50 text-cyber-blue'
      ]"
      :title="audioState.isMuted ? 'Activer le son' : 'Couper le son'"
    >
      <VolumeX v-if="audioState.isMuted" class="w-4 h-4" />
      <Volume2 v-else class="w-4 h-4" />
    </button>

    <!-- Volume Slider -->
    <div class="flex items-center gap-2">
      <Volume1 class="w-4 h-4 text-gray-400" />
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        :value="audioState.volume"
        @input="setVolume($event.target.value)"
        class="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        :disabled="audioState.isMuted"
      />
      <span class="text-xs text-gray-400 font-tech min-w-[2rem]">
        {{ Math.round(audioState.volume * 100) }}%
      </span>
    </div>

    <!-- Audio Status Indicator -->
    <div 
      :class="[
        'w-2 h-2 rounded-full transition-all duration-300',
        audioState.isEnabled 
          ? (audioState.isMuted ? 'bg-yellow-400' : 'bg-green-400') 
          : 'bg-red-400'
      ]"
      :title="audioState.isEnabled 
        ? (audioState.isMuted ? 'Audio activé (muet)' : 'Audio activé') 
        : 'Audio désactivé'"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { VolumeX, Volume2, Volume1 } from 'lucide-vue-next'
import { useAudio } from '../composables/useAudio'

const { audioState, setVolume, toggleMute } = useAudio()

// Référence pour l'élément
const audioControlsRef = ref(null)

// Position du composant
const position = reactive({
  x: 16, // 4 * 4px (tailwind bottom-4 left-4)
  y: 16
})

// État du drag
const isDragging = ref(false)
const dragStart = reactive({ x: 0, y: 0 })
const startPosition = reactive({ x: 0, y: 0 })

// Fonction pour démarrer le drag
const startDrag = (e) => {
  // Empêcher le drag sur les boutons et sliders
  if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
    return
  }
  
  isDragging.value = true
  
  const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
  const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY
  
  dragStart.x = clientX
  dragStart.y = clientY
  startPosition.x = position.x
  startPosition.y = position.y
  
  e.preventDefault()
}

// Fonction pour le drag
const handleDrag = (e) => {
  if (!isDragging.value) return
  
  const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
  const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY
  
  const deltaX = clientX - dragStart.x
  const deltaY = clientY - dragStart.y
  
  // Calculer la nouvelle position
  let newX = startPosition.x + deltaX
  let newY = startPosition.y - deltaY // Inverser Y car on utilise bottom
  
  // Limiter aux bords de l'écran
  const maxX = window.innerWidth - (audioControlsRef.value?.offsetWidth || 200)
  const maxY = window.innerHeight - (audioControlsRef.value?.offsetHeight || 60)
  
  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))
  
  position.x = newX
  position.y = newY
  
  e.preventDefault()
}

// Fonction pour arrêter le drag
const stopDrag = () => {
  isDragging.value = false
}

// Ajouter les event listeners
onMounted(() => {
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
})

// Nettoyer les event listeners
onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00ffff;
  cursor: pointer;
  border: 2px solid #0a0a15;
  box-shadow: 0 0 0 1px #00ffff;
}

.slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00ffff;
  cursor: pointer;
  border: 2px solid #0a0a15;
  box-shadow: 0 0 0 1px #00ffff;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cursor-move:hover {
  box-shadow: 0 4px 12px rgba(0, 255, 255, 0.3);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.cursor-move::before {
  content: "⋮⋮";
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 8px;
  color: rgba(0, 255, 255, 0.5);
  line-height: 1;
  pointer-events: none;
}
</style>
