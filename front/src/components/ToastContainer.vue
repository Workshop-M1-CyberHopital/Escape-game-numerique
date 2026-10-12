<template>
  <!--
    z-[80] : au-dessus de toutes les modales (briefings z-50, TeamSetupModal z-[60], AuthModal z-[70]),
    sinon les toasts émis pendant un briefing (score sauvegardé, connexion requise...) restent cachés.
    pointer-events-none sur le conteneur : il ne bloque jamais les clics sur la page.
  -->
  <div
    class="fixed top-4 left-4 right-4 sm:left-auto z-[80] flex flex-col items-end gap-2 pointer-events-none"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :type="toast.type"
        :title="toast.title"
        :message="toast.message"
        :duration="toast.duration"
        :auto-close="toast.autoClose"
        @close="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'
import Toast from './Toast.vue'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
/* Appliqué à l'élément racine de chaque Toast (TransitionGroup) : entrée ET sortie animées */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none;
  }
}
</style>
