<template>
    <div
        class="border-cyber-blue/50 fixed bottom-4 left-4 z-[60] flex flex-col items-center gap-3 rounded-lg border bg-gray-900/70 p-3 backdrop-blur-md"
    >
        <!-- Mute/Unmute Button -->
        <button
            @click="toggleMute"
            :class="[
                'rounded-lg p-2 transition-all duration-300 hover:scale-110',
                audioState.isMuted
                    ? 'border border-red-500/50 bg-red-500/20 text-red-400'
                    : 'bg-cyber-blue/20 border-cyber-blue/50 text-cyber-blue border',
            ]"
            :title="audioState.isMuted ? 'Activer le son' : 'Couper le son'"
        >
            <VolumeX v-if="audioState.isMuted" class="h-5 w-5" />
            <Volume2 v-else class="h-5 w-5" />
        </button>

        <!-- Volume Slider Vertical -->
        <div class="my-1 flex flex-col items-center gap-2">
            <Volume1 class="text-cyber-blue h-4 w-4" />
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
            <span
                class="font-tech writing-mode-vertical text-cyber-blue text-xs"
            >
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
    -webkit-appearance: slider-vertical;
    appearance: slider-vertical;
    width: 4px;
    height: 96px;
    background: rgba(55, 65, 81, 0.6);
    border-radius: 4px;
    outline: none;
    cursor: pointer;
}

.slider:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #00ffff;
    cursor: pointer;
    border: 2px solid #0a0a15;
    box-shadow:
        0 0 4px #00ffff,
        0 0 8px #00ffff;
}

.slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #00ffff;
    cursor: pointer;
    border: 2px solid #0a0a15;
    box-shadow:
        0 0 4px #00ffff,
        0 0 8px #00ffff;
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
