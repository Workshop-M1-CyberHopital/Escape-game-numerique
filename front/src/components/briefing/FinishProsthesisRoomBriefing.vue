<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="finishProsthesisRoom"
    theme="cyber-green"
    icon="check"
    unit="Unité de Cybersécurité Médicale - Mission Accomplie"
    status="MISSION RÉUSSIE - FÉLICITATIONS"
    footer="MISSION ACCOMPLIE"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 bg-cyber-green rounded-full animate-pulse shrink-0"></div>
        <h2 class="text-lg font-bold text-cyber-green font-tech">
          MISSION ACCOMPLIE - SALLE DES PROTHÈSES
        </h2>
      </div>

      <div class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed">
        <p>
          <span class="text-cyber-green font-bold">Excellent travail, agent !</span>
        </p>

        <p>
          Vous avez brillamment réparé et calibré toutes les prothèses bioniques. Les patients peuvent maintenant bénéficier de prothèses parfaitement fonctionnelles pour leur rééducation.
        </p>

        <p>
          <span class="text-cyber-green font-bold">Votre expertise en biomécanique a restauré la mobilité de nombreux patients.</span>
        </p>

        <div class="bg-cyber-green/10 border border-cyber-green/30 rounded p-4 mt-4">
          <p class="text-cyber-green font-bold mb-2">STATUT DE LA MISSION :</p>
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-cyber-green rounded-full shrink-0"></div>
              <span class="text-cyber-green">Prothèses calibrées à 100%</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-cyber-green rounded-full shrink-0"></div>
              <span class="text-cyber-green">Système de contrôle restauré</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-cyber-green rounded-full shrink-0"></div>
              <span class="text-cyber-green">Fonctionnalité optimale</span>
            </div>
          </div>
        </div>

        <p class="text-cyber-green font-bold">
          Vous pouvez maintenant passer à la mission suivante : la salle des pathologies vous attend pour une nouvelle mission critique.
        </p>

        <p class="text-center text-cyber-green font-bold mt-4">
          Continuez votre excellent travail, agent. L'hôpital compte sur vous.
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
    default: 33000
  }
})

defineEmits(['close'])
</script>
