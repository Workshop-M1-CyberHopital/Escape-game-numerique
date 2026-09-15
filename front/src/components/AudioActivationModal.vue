<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
  >
    <div
      class="bg-gray-900/95 border-2 border-cyber-blue rounded-lg p-8 max-w-md mx-4 text-center"
    >
      <div class="mb-6">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-cyber-blue/20 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 text-cyber-blue"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-cyber-blue mb-2">
          🎵 ACTIVATION AUDIO
        </h3>
        <p class="text-gray-300 mb-6 font-tech text-sm">
          Pour une expérience immersive complète, activez l'audio
          pour entendre le briefing de mission.
        </p>
      </div>

      <div class="flex gap-4 justify-center">
        <button
          @click="$emit('activate')"
          class="px-6 py-3 bg-cyber-blue text-black font-bold rounded-lg hover:bg-cyber-blue/80 transition-all duration-300 hover:scale-105 font-tech text-sm"
        >
          🎵 ACTIVER L'AUDIO
        </button>
        <button
          @click="$emit('continue-without')"
          class="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-all duration-300 font-tech text-sm"
        >
          CONTINUER SANS AUDIO
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

defineEmits(['activate', 'continue-without']);
</script>
