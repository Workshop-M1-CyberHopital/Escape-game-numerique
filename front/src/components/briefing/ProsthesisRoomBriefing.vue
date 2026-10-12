<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="prosthesisRoom"
    theme="cyber-green"
    unit="Unité de Cybersécurité Médicale - Salle des Prothèses"
    status="MISSION CRITIQUE - RÉPARATION PROTHÈSES"
    footer="TRANSMISSION URGENTE ACTIVE"
    close-style="accent"
    @close="$emit('close')"
  >
    <div class="text-cyber-green font-tech text-sm mb-2" data-no-voice>
      [TRANSMISSION URGENTE - NIVEAU SÉCURITÉ MAXIMUM]
    </div>
    <div class="text-white font-tech leading-relaxed">
      <p class="mb-4">
        <span class="text-cyber-green">Agents,</span> vous êtes maintenant dans la <span class="text-yellow-400">Salle des Prothèses.</span>
      </p>
      <p class="mb-4">
        Le <span class="text-cyber-green">système de prothèses a été endommagé</span> par la cyberattaque. Nos patients ont besoin de <span class="text-yellow-400">prothèses fonctionnelles</span> pour leur rééducation.
      </p>
      <p class="mb-4">
        <span class="text-cyber-blue">Votre mission :</span> recalibrer les prothèses bioniques de la jambe, en deux étapes.
      </p>
      <ul class="space-y-2 mb-4 text-sm">
        <li class="flex items-start gap-2">
          <span class="text-cyber-green font-bold shrink-0">ÉTAPE 1 :</span>
          <span class="text-gray-300">régler la flexion du genou que la prothèse doit atteindre pendant la marche.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-cyber-green font-bold shrink-0">ÉTAPE 2 :</span>
          <span class="text-gray-300">réaligner les angles de la hanche, du genou et de la cheville en respectant les règles de sécurité du système.</span>
        </li>
      </ul>
      <div class="bg-cyber-green/20 border border-cyber-green/50 rounded p-4 mb-4">
        <div class="text-cyber-green font-bold text-sm mb-2">⚠️ ALERTE CRITIQUE</div>
        <div class="text-gray-300 text-sm">
          Les prothèses sont connectées au réseau hospitalier. Chaque erreur de calibration peut affecter directement la mobilité des patients.
        </div>
      </div>
      <p class="mb-4">
        <span class="text-yellow-400">Pourquoi c'est vital :</span> une prothèse mal réglée fait boiter, fatigue et peut provoquer des <span class="text-cyber-green">chutes</span>. Les prothèses connectées doivent aussi être protégées contre le piratage.
      </p>
      <p class="text-center text-cyber-green font-bold mt-6">
        Bon courage, agents. La mobilité des patients dépend de votre réussite.
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
