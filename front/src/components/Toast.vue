<template>
  <div class="w-full sm:w-96 max-w-full pointer-events-auto">
    <div
      :class="[
        'bg-gray-900/95 backdrop-blur-md border-2 rounded-lg p-4 scanline shadow-2xl',
        type === 'error' ? 'border-cyber-red' :
        type === 'success' ? 'border-cyber-green' :
        type === 'warning' ? 'border-yellow-500' : 'border-cyber-blue'
      ]"
    >
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div
          :class="[
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            type === 'error' ? 'bg-cyber-red/20' :
            type === 'success' ? 'bg-cyber-green/20' :
            type === 'warning' ? 'bg-yellow-500/20' : 'bg-cyber-blue/20'
          ]"
          aria-hidden="true"
        >
          <AlertTriangle v-if="type === 'error'" class="w-5 h-5 text-cyber-red" />
          <CheckCircle v-else-if="type === 'success'" class="w-5 h-5 text-cyber-green" />
          <AlertTriangle v-else-if="type === 'warning'" class="w-5 h-5 text-yellow-500" />
          <Info v-else class="w-5 h-5 text-cyber-blue" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h4
            :class="[
              'font-cyber font-bold text-sm mb-1 break-words',
              type === 'error' ? 'text-cyber-red' :
              type === 'success' ? 'text-cyber-green' :
              type === 'warning' ? 'text-yellow-500' : 'text-cyber-blue'
            ]"
          >
            {{ title }}
          </h4>
          <p class="text-gray-300 font-tech text-xs leading-relaxed break-words">
            {{ message }}
          </p>
        </div>

        <!-- Close Button -->
        <button
          type="button"
          @click="close"
          class="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          aria-label="Fermer la notification"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Progress Bar -->
      <div
        v-if="autoClose"
        class="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden"
        aria-hidden="true"
      >
        <div
          :class="[
            'h-full transition-all duration-100 ease-linear',
            type === 'error' ? 'bg-cyber-red' :
            type === 'success' ? 'bg-cyber-green' :
            type === 'warning' ? 'bg-yellow-500' : 'bg-cyber-blue'
          ]"
          :style="{ width: progressWidth + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-vue-next'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['error', 'success', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5000
  },
  autoClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const progressWidth = ref(100)
let progressInterval = null
let isClosed = false

const stopProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

// Idempotent : la barre de progression et le bouton ne peuvent pas émettre deux fois
const close = () => {
  if (isClosed) return
  isClosed = true
  stopProgress()
  emit('close')
}

const startProgress = () => {
  if (!props.autoClose) return

  const duration = Math.max(1, props.duration)
  const startTime = Date.now()
  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, duration - elapsed)
    progressWidth.value = (remaining / duration) * 100

    if (remaining <= 0) {
      close()
    }
  }, 50)
}

onMounted(startProgress)

onUnmounted(stopProgress)
</script>
