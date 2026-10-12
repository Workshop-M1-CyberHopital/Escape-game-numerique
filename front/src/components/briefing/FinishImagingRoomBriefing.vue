<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="finishImagingRoom"
    theme="cyan"
    agent="AGENT CYBER-003"
    unit="Unité d'Imagerie Médicale - Mission Accomplie"
    status="TRANSMISSION DE FÉLICITATIONS"
    footer="TRANSMISSION DE FÉLICITATIONS ACTIVE"
    close-style="accent"
    @close="$emit('close')"
  >
    <div class="text-cyan-400 font-tech text-sm mb-2" data-no-voice>
      [TRANSMISSION DE FÉLICITATIONS - MISSION ACCOMPLIE]
    </div>
    <div class="text-white font-tech leading-relaxed">
      <p class="mb-4">
        <span class="text-cyan-400">Excellent travail, agent !</span> Vous avez parfaitement reconstitué les coupes IRM cérébrales.
      </p>
      <p class="mb-4">
        L'<span class="text-cyan-400">imagerie médicale est maintenant restaurée</span> et nos médecins peuvent à nouveau diagnostiquer les pathologies neurologiques.
      </p>
      <p class="mb-4">
        Grâce à votre expertise, nos <span class="text-yellow-400">systèmes d'imagerie sont opérationnels.</span> Les tumeurs, AVC et lésions cérébrales peuvent être détectés avec précision.
      </p>
      <div class="bg-cyan-900/20 border border-cyan-500/50 rounded p-4 mb-4">
        <div class="text-cyan-400 font-bold text-sm mb-2">🧠 IMPACT MÉDICAL</div>
        <div class="text-gray-300 text-sm">
          Vous avez sauvé d'innombrables vies en restaurant cette technologie vitale. L'hôpital vous remercie.
        </div>
      </div>
      <p class="mb-4">
        <span class="text-yellow-400">Mission accomplie avec brio.</span> Préparez-vous pour la suite de votre mission : la salle du cœur vous attend.
      </p>
      <p class="text-center text-cyan-400 font-bold mt-6">
        Félicitations, agent. L'imagerie médicale est sauvée.
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
    default: 35000 // voix off : 32,3 s
  }
})

defineEmits(['close'])
</script>
