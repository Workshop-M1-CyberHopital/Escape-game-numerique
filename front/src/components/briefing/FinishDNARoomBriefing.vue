<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="finishDNARoom"
    theme="purple"
    icon="check"
    unit="Unité de Cybersécurité Médicale - Mission Accomplie"
    status="MISSION RÉUSSIE - FÉLICITATIONS"
    footer="MISSION ACCOMPLIE"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse shrink-0"></div>
        <h2 class="text-lg font-bold text-purple-400 font-tech">
          MISSION ACCOMPLIE - LABORATOIRE ADN
        </h2>
      </div>

      <div class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed">
        <p>
          <span class="text-purple-400 font-bold">Mission accomplie, agent !</span>
        </p>

        <p>
          Vous avez brillamment analysé les échantillons ADN et sécurisé les données génétiques critiques. Votre expertise en bio-informatique a permis de déchiffrer les séquences génétiques.
        </p>

        <p>
          <span class="text-purple-400 font-bold">Les informations sensibles sont maintenant protégées contre les intrusions malveillantes.</span>
        </p>

        <div class="bg-purple-500/10 border border-purple-500/30 rounded p-4 mt-4">
          <p class="text-purple-400 font-bold mb-2">STATUT DE LA MISSION :</p>
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-purple-400 rounded-full shrink-0"></div>
              <span class="text-purple-400">Données génétiques sécurisées à 100%</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-purple-400 rounded-full shrink-0"></div>
              <span class="text-purple-400">Séquences ADN déchiffrées</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-purple-400 rounded-full shrink-0"></div>
              <span class="text-purple-400">Intégrité des données rétablie</span>
            </div>
          </div>
        </div>

        <p class="text-purple-400 font-bold">
          Vous pouvez maintenant passer à la mission suivante : la salle d'imagerie vous attend, et d'autres défis suivront pour sécuriser complètement l'infrastructure médicale.
        </p>

        <p class="text-center text-purple-400 font-bold mt-4">
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
    default: 40000 // voix off : 37,2 s
  }
})

defineEmits(['close'])
</script>
