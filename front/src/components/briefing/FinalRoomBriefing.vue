<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="finalRoom"
    theme="cyber-green"
    avatar-class="from-cyber-green to-cyber-blue"
    unit="Unité de Diagnostic Médical - Salle de Fin"
    status="MISSION FINALE - DIAGNOSTIC CRITIQUE"
    footer="TRANSMISSION FINALE ACTIVE"
    close-style="accent"
    @close="$emit('close')"
  >
    <div class="text-cyber-green font-tech text-sm mb-2" data-no-voice>
      [TRANSMISSION FINALE - DIAGNOSTIC URGENT]
    </div>
    <div class="text-white font-tech leading-relaxed">
      <p class="mb-4">
        <span class="text-cyber-green">Félicitations, agents :</span> vous êtes arrivés jusqu'à la dernière salle.
      </p>
      <p class="mb-4">
        Cependant, une <span class="text-red-400">patiente en état critique</span> nécessite un diagnostic urgent. <span class="text-yellow-400">Marie Dubois, 34 ans,</span> présente des symptômes graves.
      </p>
      <p class="mb-4">
        <span class="text-cyber-blue">Votre mission finale :</span> analyser la fiche patient, poser le bon diagnostic et choisir le traitement approprié.
      </p>
      <div class="bg-red-900/20 border border-red-500/50 rounded p-4 mb-4">
        <div class="text-red-400 font-bold text-sm mb-2">⚠️ PATIENTE CRITIQUE</div>
        <div class="text-gray-300 text-sm">
          Symptômes : fièvre élevée, difficultés respiratoires, toux persistante. Analyses : leucocytes élevés, CRP élevée, saturation en oxygène basse.
        </div>
      </div>
      <p class="mb-4">
        <span class="text-yellow-400">Attention :</span> une erreur de diagnostic ou de traitement ajoutera une pénalité à votre score. Soyez précis et méthodique.
      </p>
      <p class="mb-4">
        Une fois le diagnostic posé et le traitement administré, vous devrez sécuriser le dossier médical de la patiente : un dossier de santé est une donnée sensible, protégée par la loi.
      </p>
      <p class="text-center text-cyber-green font-bold mt-6">
        Bon courage, agents. La vie de cette patiente dépend de votre diagnostic.
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
    default: 40000
  }
})

defineEmits(['close'])
</script>
