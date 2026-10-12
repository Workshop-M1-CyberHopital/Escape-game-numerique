<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="finishPathologyRoom"
    theme="cyber-red"
    unit="Unité de Diagnostic Médical - Mission Accomplie"
    status="TRANSMISSION DE FÉLICITATIONS"
    footer="TRANSMISSION DE FÉLICITATIONS ACTIVE"
    close-style="accent"
    @close="$emit('close')"
  >
    <div class="text-cyber-red font-tech text-sm mb-2" data-no-voice>
      [TRANSMISSION DE FÉLICITATIONS - MISSION ACCOMPLIE]
    </div>
    <div class="text-white font-tech leading-relaxed">
      <p class="mb-4">
        <span class="text-cyber-red">Excellent travail, agent !</span> Vous avez associé chaque pathologie à son traitement.
      </p>
      <p class="mb-4">
        Le <span class="text-cyber-red">système de diagnostic médical est maintenant restauré</span> et nos médecins peuvent à nouveau traiter les patients avec précision.
      </p>
      <p class="mb-4">
        Grâce à votre expertise, nos <span class="text-yellow-400">capacités de diagnostic sont opérationnelles.</span> Hypertension, diabète, asthme et autres pathologies peuvent être traités efficacement.
      </p>
      <div class="bg-red-900/20 border border-cyber-red/50 rounded p-4 mb-4">
        <div class="text-cyber-red font-bold text-sm mb-2">🏥 À RETENIR</div>
        <div class="text-gray-300 text-sm">
          Un traitement de fond contrôle une maladie chronique (hypertension, diabète, asthme…) sans la guérir : on ne l'arrête jamais sans l'avis d'un médecin.
        </div>
      </div>
      <p class="mb-4">
        <span class="text-yellow-400">Mission accomplie avec brio.</span> Préparez-vous pour la suite de votre mission : la salle de l'audition vous attend.
      </p>
      <p class="text-center text-cyber-red font-bold mt-6">
        Félicitations, agent. Le diagnostic médical est sauvé.
      </p>
    </div>
  </BriefingShell>
</template>

<script setup>
import BriefingShell from './BriefingShell.vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 35000
  }
})

defineEmits(['close'])
</script>
