import { ref, reactive } from 'vue'

// État global partagé
const toasts = ref([])
let toastId = 0

const showToast = (options) => {
  const id = ++toastId
  const toast = reactive({
    id,
    type: options.type || 'info',
    title: options.title || '',
    message: options.message || '',
    duration: options.duration || 5000,
    autoClose: options.autoClose !== false
  })
  
  // Limiter à 2 toasts maximum
  if (toasts.value.length >= 2) {
    // Supprimer le plus ancien toast (le dernier dans le tableau)
    toasts.value.pop()
  }
  
  // Ajouter le nouveau toast au début pour qu'il s'affiche en haut
  toasts.value.unshift(toast)
  
  // Auto remove after duration
  if (toast.autoClose) {
    setTimeout(() => {
      removeToast(id)
    }, toast.duration)
  }
  
  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const showError = (title, message, duration = 5000) => {
  return showToast({ type: 'error', title, message, duration })
}

const showSuccess = (title, message, duration = 3000) => {
  return showToast({ type: 'success', title, message, duration })
}

const showWarning = (title, message, duration = 4000) => {
  return showToast({ type: 'warning', title, message, duration })
}

const showInfo = (title, message, duration = 4000) => {
  return showToast({ type: 'info', title, message, duration })
}

export function useToast() {
  return {
    toasts,
    showToast,
    removeToast,
    showError,
    showSuccess,
    showWarning,
    showInfo
  }
}
