<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="finishFinalRoom"
    theme="cyber-green"
    icon="check"
    avatar-class="from-cyber-green to-cyber-blue"
    unit="Unité de Diagnostic Médical - Mission Accomplie"
    status="MISSION RÉUSSIE - FÉLICITATIONS"
    footer="MISSION ACCOMPLIE"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 bg-cyber-green rounded-full animate-pulse shrink-0"></div>
        <h2 class="text-lg font-bold text-cyber-green font-tech">
          MISSION ACCOMPLIE - DIAGNOSTIC FINAL
        </h2>
      </div>

      <div class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed">
        <p>
          <span class="text-cyber-green font-bold">Excellent travail, agents !</span>
        </p>

        <p>
          Vous avez brillamment diagnostiqué une pneumonie bactérienne et administré le traitement approprié. La patiente Marie Dubois est maintenant hors de danger et en voie de guérison complète.
        </p>

        <p>
          <span class="text-cyber-green font-bold">Votre expertise médicale a sauvé une vie.</span>
        </p>

        <div class="bg-cyber-green/10 border border-cyber-green/30 rounded p-4 mt-4">
          <p class="text-cyber-green font-bold mb-2">STATUT DE LA MISSION :</p>
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-cyber-green rounded-full shrink-0"></div>
              <span class="text-cyber-green">Diagnostic correct : pneumonie bactérienne</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-cyber-green rounded-full shrink-0"></div>
              <span class="text-cyber-green">Traitement administré : antibiotiques + oxygène</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-cyber-green rounded-full shrink-0"></div>
              <span class="text-cyber-green">Dossier médical sécurisé</span>
            </div>
          </div>
        </div>

        <p class="text-cyber-green font-bold">
          La cyberattaque est définitivement vaincue et l'hôpital est maintenant entièrement sécurisé.
        </p>

        <p class="text-center text-cyber-green font-bold mt-4">
          Félicitations ! Vous avez accompli votre mission avec succès.
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
