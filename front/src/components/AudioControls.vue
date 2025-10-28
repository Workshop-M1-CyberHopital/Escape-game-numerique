<template>
  <div
    class="border-cyber-blue/50 fixed bottom-4 left-4 z-[60] flex flex-col items-center gap-3 rounded-lg border bg-gray-900/80 p-3 backdrop-blur-md"
  >
    <button
      @click="toggleMute"
      :class="[
        'rounded-lg p-2 transition-all duration-300 hover:scale-110',
        audioState.isMuted
          ? 'border border-red-500/50 bg-red-500/20 text-red-400'
          : 'bg-cyber-blue/20 border border-cyber-blue/50 text-cyber-blue'
      ]"
      :title="audioState.isMuted ? 'Activer le son' : 'Couper le son'"
    >
      <VolumeX v-if="audioState.isMuted" class="h-5 w-5" />
      <Volume2 v-else class="h-5 w-5" />
    </button>

    <div class="my-1 flex flex-col items-center gap-2">
      <Volume1 class="text-gray-400 h-4 w-4" />
      <div class="relative flex h-24 w-8 items-center justify-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          :value="audioState.volume"
          @input="setVolume($event.target.value)"
          class="slider"
          :disabled="audioState.isMuted"
        />
      </div>
      <span class="text-xs text-gray-400 font-tech">
        {{ Math.round(audioState.volume * 100) }}%
      </span>
    </div>
  </div>
</template>

<script setup>
import { VolumeX, Volume2, Volume1 } from "lucide-vue-next";
import { useAudio } from "../composables/useAudio";

const { audioState, setVolume, toggleMute } = useAudio();
</script>

<style scoped>
.slider {
  -webkit-appearance: none;
  appearance: none;
  writing-mode: bt-lr; 
  transform: rotate(270deg); 
  width: 80px; 
  height: 4px; 
  background: #374151;
  border-radius: 0.5rem;
  cursor: pointer;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
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

.slider:hover::-webkit-slider-thumb {
  box-shadow: 0 0 6px #00ffff;
}
.slider:hover::-moz-range-thumb {
  box-shadow: 0 0 6px #00ffff;
}
</style>
