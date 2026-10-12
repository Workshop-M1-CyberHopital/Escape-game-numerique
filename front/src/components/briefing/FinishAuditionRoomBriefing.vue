<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="finishAuditionRoom"
    theme="cyber-purple"
    unit="Unité Audiométrique - Mission Accomplie"
    status="TRANSMISSION DE FÉLICITATIONS"
    footer="TRANSMISSION DE FÉLICITATIONS ACTIVE"
    close-style="accent"
    @close="$emit('close')"
  >
    <div class="text-cyber-purple font-tech text-sm mb-2" data-no-voice>
      [TRANSMISSION DE FÉLICITATIONS - MISSION ACCOMPLIE]
    </div>
    <div class="text-white font-tech leading-relaxed">
      <p class="mb-4">
        <span class="text-cyber-purple">Excellent travail, agents !</span> Vous avez identifié les trois sons médicaux : des battements cardiaques normaux, une respiration sifflante et un acouphène.
      </p>
      <p class="mb-4">
        Le <span class="text-cyber-purple">diagnostic auditif est de nouveau opérationnel</span> : nos médecins peuvent à nouveau s'appuyer sur l'écoute des patients.
      </p>
      <div class="bg-purple-900/20 border border-cyber-purple/50 rounded p-4 mb-4">
        <div class="text-cyber-purple font-bold text-sm mb-2">🎧 À RETENIR</div>
        <ul class="text-gray-300 text-sm space-y-2">
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-cyber-purple rounded-full shrink-0 mt-1.5"></div>
            <span>Au stéthoscope, un cœur normal fait un double bruit régulier « boum-boum », 60 à 100 fois par minute au repos.</span>
          </li>
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-cyber-purple rounded-full shrink-0 mt-1.5"></div>
            <span>Une respiration sifflante (sibilants), surtout à l'expiration, signale des bronches rétrécies, par exemple lors d'une crise d'asthme.</span>
          </li>
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-cyber-purple rounded-full shrink-0 mt-1.5"></div>
            <span>Un acouphène est un son (sifflement, bourdonnement) perçu sans aucune source extérieure, souvent après une exposition à un bruit trop fort.</span>
          </li>
        </ul>
      </div>
      <div class="bg-yellow-500/10 border border-yellow-500/30 rounded p-4 mb-4">
        <div class="text-yellow-400 font-bold text-sm mb-2">DANS LA VRAIE VIE</div>
        <div class="text-gray-300 text-sm">
          Les cellules de l'oreille interne abîmées par le bruit ne se réparent pas. Baissez le volume du casque (pas plus de 60&nbsp;% du maximum, pas plus d'une heure d'affilée), portez des bouchons en concert, et consultez rapidement si un sifflement dure encore 24 heures après une exposition au bruit.
        </div>
      </div>
      <p class="mb-4">
        <span class="text-yellow-400">Mission accomplie avec brio.</span> Préparez-vous pour la suite : la salle des yeux vous attend.
      </p>
      <p class="text-center text-cyber-purple font-bold mt-6">
        Félicitations, agents. Le diagnostic auditif est sauvé.
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
    default: 45000
  }
})

defineEmits(['close'])
</script>
