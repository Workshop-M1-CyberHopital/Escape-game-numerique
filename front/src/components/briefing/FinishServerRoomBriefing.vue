<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="finishServerRoom"
    theme="green"
    icon="check"
    unit="Unité de Cybersécurité Médicale - Mission Accomplie"
    status="MISSION RÉUSSIE - FÉLICITATIONS"
    footer="MISSION ACCOMPLIE"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse shrink-0"></div>
        <h2 class="text-lg font-bold text-green-400 font-tech">
          MISSION ACCOMPLIE - SALLE DU SERVEUR
        </h2>
      </div>

      <div class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed">
        <p>
          <span class="text-green-400 font-bold">Excellent travail, agent !</span>
        </p>

        <p>
          Vous avez brillamment décodé le journal piraté et restauré la sécurité du pare-feu principal. Les données médicales sensibles sont maintenant protégées contre les intrusions malveillantes.
        </p>

        <div class="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
          <p class="text-yellow-400 font-bold mb-2">À RETENIR :</p>
          <p class="text-xs">
            Base64 est un encodage, pas un chiffrement : n'importe qui peut le décoder, sans clé. Pour protéger des données de santé, il faut un vrai chiffrement et des mots de passe solides, personnels et jamais partagés.
          </p>
        </div>

        <p>
          <span class="text-green-400 font-bold">Votre expertise en cybersécurité a sauvé des milliers de dossiers patients.</span>
        </p>

        <div class="bg-green-500/10 border border-green-500/30 rounded p-4 mt-4">
          <p class="text-green-400 font-bold mb-2">STATUT DE LA MISSION :</p>
          <div class="space-y-2 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-400 rounded-full shrink-0"></div>
              <span class="text-green-400">Pare-feu restauré à 100%</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-400 rounded-full shrink-0"></div>
              <span class="text-green-400">Intégrité des données rétablie</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-green-400 rounded-full shrink-0"></div>
              <span class="text-green-400">Sécurité renforcée</span>
            </div>
          </div>
        </div>

        <p class="text-green-400 font-bold">
          Vous pouvez maintenant passer à la mission suivante : le laboratoire ADN vous attend pour une nouvelle mission critique.
        </p>

        <p class="text-center text-green-400 font-bold mt-4">
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
    default: 32000 // voix off : 29,5 s
  }
})

defineEmits(['close'])
</script>
