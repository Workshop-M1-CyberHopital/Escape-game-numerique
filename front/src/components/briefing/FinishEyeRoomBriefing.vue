<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="finishEyeRoom"
    theme="cyan"
    icon="check"
    unit="Unité d'Ophtalmologie - Mission Accomplie"
    status="TRANSMISSION DE FÉLICITATIONS"
    footer="TRANSMISSION DE FÉLICITATIONS ACTIVE"
    close-style="accent"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shrink-0"></div>
        <h2 class="text-lg font-bold text-cyan-400 font-tech">
          MISSION ACCOMPLIE - SALLE DES YEUX
        </h2>
      </div>

      <div class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed">
        <p>
          <span class="text-cyan-400 font-bold">Excellent travail, agents !</span>
        </p>

        <p>
          Les tests d'acuité visuelle et de vision des couleurs sont recalibrés : les ophtalmologistes de l'hôpital peuvent de nouveau poser des diagnostics fiables.
        </p>

        <div class="bg-cyan-500/10 border border-cyan-500/30 rounded p-4 mt-4">
          <p class="text-cyan-400 font-bold mb-2">À RETENIR :</p>
          <ul class="space-y-2 text-xs">
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-cyan-400 rounded-full shrink-0 mt-1"></div>
              <span>L'acuité visuelle se mesure un œil après l'autre. En France, elle se note en dixièmes (échelle de Monoyer) : <span class="text-cyan-400 font-bold">10/10</span> correspond à une vision normale, le « 20/20 » du tableau de Snellen.</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-cyan-400 rounded-full shrink-0 mt-1"></div>
              <span>La myopie (vision floue de loin), l'hypermétropie et l'astigmatisme sont fréquents et se corrigent avec des lunettes ou des lentilles.</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-cyan-400 rounded-full shrink-0 mt-1"></div>
              <span>Le <span class="text-cyan-400 font-bold">daltonisme</span> touche environ 8&nbsp;% des hommes et 0,5&nbsp;% des femmes : les gènes de la vision du rouge et du vert sont portés par le chromosome X.</span>
            </li>
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-cyan-400 rounded-full shrink-0 mt-1"></div>
              <span>Les planches d'Ishihara, publiées en 1917 par l'ophtalmologiste japonais Shinobu Ishihara, servent toujours à dépister les anomalies de la vision rouge-vert.</span>
            </li>
          </ul>
        </div>

        <div class="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
          <p class="text-yellow-400 font-bold mb-2">DANS LA VRAIE VIE :</p>
          <p class="text-xs">
            Faites contrôler votre vue si vous plissez les yeux pour lire le tableau, ou si vous avez souvent mal à la tête après les cours ou les écrans. Devant un écran, faites des pauses : toutes les 20 minutes, regardez au loin pendant 20 secondes. Et si vous visez un métier comme pilote, conducteur de train ou électricien, une bonne vision des couleurs est exigée : mieux vaut le savoir tôt.
          </p>
        </div>

        <p class="text-cyan-400 font-bold">
          Une dernière mission vous attend : dans la salle de fin, une urgence vitale attend votre diagnostic.
        </p>

        <p class="text-center text-cyan-400 font-bold mt-4">
          Félicitations, agents. Le diagnostic visuel est sauvé.
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
