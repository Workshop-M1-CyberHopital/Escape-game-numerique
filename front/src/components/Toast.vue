<template>
  <Transition name="toast">
    <div 
      v-if="visible" 
      class="max-w-sm w-full"
    >
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
                'font-cyber font-bold text-sm mb-1',
                type === 'error' ? 'text-cyber-red' : 
                type === 'success' ? 'text-cyber-green' : 
                type === 'warning' ? 'text-yellow-500' : 'text-cyber-blue'
              ]"
            >
              {{ title }}
            </h4>
            <p class="text-gray-300 font-tech text-xs leading-relaxed">
              {{ message }}
            </p>
          </div>
          
          <!-- Close Button -->
          <button 
            @click="close"
            class="text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
        
        <!-- Progress Bar -->
        <div 
          v-if="autoClose"
          class="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden"
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
  </Transition>
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

const visible = ref(false)
const progressWidth = ref(100)
let progressInterval = null
let closeTimeout = null

const close = () => {
  visible.value = false
  emit('close')
}

const startProgress = () => {
  if (!props.autoClose) return
  
  const startTime = Date.now()
  const updateProgress = () => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, props.duration - elapsed)
    progressWidth.value = (remaining / props.duration) * 100
    
    if (remaining <= 0) {
      close()
    }
  }
  
  progressInterval = setInterval(updateProgress, 50)
}

onMounted(() => {
  visible.value = true
  
  if (props.autoClose) {
    closeTimeout = setTimeout(close, props.duration)
    startProgress()
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
  if (closeTimeout) {
    clearTimeout(closeTimeout)
  }
})
</script>

<style scoped>
.toast-enter-active {
  animation: toastSlideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: toastSlideOut 0.3s ease-out;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
