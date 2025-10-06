<template>
  <div class="fixed bottom-4 left-4 z-50 flex items-center gap-3 bg-gray-900/80 backdrop-blur-md border border-cyber-blue/50 rounded-lg p-3">
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
import { VolumeX, Volume2, Volume1 } from 'lucide-vue-next'
import { useAudio } from '../composables/useAudio'

const { audioState, setVolume, toggleMute } = useAudio()
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
</style>
