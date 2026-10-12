import { ref, reactive } from 'vue'

// Nombre maximum de toasts affichés simultanément
const MAX_TOASTS = 2

// État global partagé
const toasts = ref([])
let toastId = 0
// Minuteries de fermeture automatique, par id (annulées quand le toast disparaît)
const autoCloseTimers = new Map()

const clearAutoCloseTimer = (id) => {
  const timer = autoCloseTimers.get(id)
  if (timer) {
    clearTimeout(timer)
    autoCloseTimers.delete(id)
  }
}

const removeToast = (id) => {
  clearAutoCloseTimer(id)
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const showToast = (options = {}) => {
  const id = ++toastId
  const duration = Number(options.duration) > 0 ? Number(options.duration) : 5000
  const toast = reactive({
    id,
    type: options.type || 'info',
    title: options.title || '',
    message: options.message || '',
    duration,
    autoClose: options.autoClose !== false
  })

  // Limiter le nombre de toasts : supprimer les plus anciens (en fin de tableau)
  while (toasts.value.length >= MAX_TOASTS) {
    removeToast(toasts.value[toasts.value.length - 1].id)
  }

  // Ajouter le nouveau toast au début pour qu'il s'affiche en haut
  toasts.value.unshift(toast)

  // Fermeture automatique (filet de sécurité si le composant Toast n'est pas monté)
  if (toast.autoClose) {
    autoCloseTimers.set(id, setTimeout(() => removeToast(id), duration))
  }

  return id
}

// Vide tous les toasts (ex. réinitialisation de partie)
const clearToasts = () => {
  autoCloseTimers.forEach(timer => clearTimeout(timer))
  autoCloseTimers.clear()
  toasts.value.splice(0)
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
    clearToasts,
    showError,
    showSuccess,
    showWarning,
    showInfo
  }
}
