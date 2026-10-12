<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="finishHeartRoom"
    theme="cyber-red"
    icon="check"
    unit="Unité de Cybersécurité Médicale - Mission Accomplie"
    status="MISSION RÉUSSIE - FÉLICITATIONS"
    footer="MISSION ACCOMPLIE"
    close-style="accent"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 bg-cyber-red rounded-full animate-pulse shrink-0"></div>
        <h2 class="text-lg font-bold text-cyber-red font-tech">
          MISSION ACCOMPLIE - SALLE DU CŒUR
        </h2>
      </div>

      <div class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed">
        <p>
          <span class="text-cyber-red font-bold">Excellent travail, agents !</span>
        </p>

        <p>
          Vos 30 compressions au bon rythme ont fait circuler le sang jusqu'au cerveau en attendant le défibrillateur. Le choc a relancé le cœur : le patient est sauvé.
        </p>

        <div class="bg-cyber-red/10 border border-cyber-red/30 rounded p-4 mt-4">
          <p class="text-cyber-red font-bold mb-2">À RETENIR : LES GESTES QUI SAUVENT</p>
          <ul class="space-y-2 text-xs">
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-cyber-red rounded-full shrink-0 mt-1"></div>
              <span>Une personne ne répond pas et ne respire pas (ou respire anormalement) : c'est peut-être un arrêt cardiaque. <span class="text-cyber-red font-bold">Appelez le 15 (SAMU) ou le 112.</span></span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-cyber-red rounded-full shrink-0 mt-1"></div>
              <span>Massez au centre de la poitrine, bras tendus : enfoncez de <span class="text-cyber-red font-bold">5 à 6 cm</span>, <span class="text-cyber-red font-bold">100 à 120 fois par minute</span>, en laissant la poitrine remonter entre chaque compression.</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-cyber-red rounded-full shrink-0 mt-1"></div>
              <span>Faites apporter un <span class="text-cyber-red font-bold">défibrillateur (DAE)</span> : il donne les consignes à voix haute et ne délivre un choc que si c'est nécessaire. Tout le monde peut l'utiliser.</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-cyber-red rounded-full shrink-0 mt-1"></div>
              <span>Chaque minute sans massage fait perdre environ 10&nbsp;% de chances de survie : il faut agir tout de suite, sans attendre les secours.</span>
            </li>
          </ul>
        </div>

        <div class="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
          <p class="text-yellow-400 font-bold mb-2">DANS LA VRAIE VIE :</p>
          <p class="text-xs">
            Ne restez jamais spectateur : appeler, masser, défibriller. Pour garder la cadence, pensez à « Stayin' Alive ». Repérez les défibrillateurs de votre lycée ou de votre salle de sport, et formez-vous aux premiers secours (le PSC1 dure environ 7 heures et est accessible dès 10 ans).
          </p>
        </div>

        <p class="text-cyber-red font-bold">
          Vous pouvez maintenant passer à la mission suivante : la salle des prothèses vous attend pour une nouvelle mission critique.
        </p>

        <p class="text-center text-cyber-red font-bold mt-4">
          Continuez votre excellent travail, agents. L'hôpital compte sur vous.
        </p>
      </div>
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
