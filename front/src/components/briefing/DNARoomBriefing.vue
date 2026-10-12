<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="dnaRoom"
    theme="cyber-purple"
    unit="Unité de Cybersécurité Médicale - Laboratoire ADN"
    status="ALERTE GÉNÉTIQUE - TRANSMISSION URGENTE"
    footer="TRANSMISSION ACTIVE"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 bg-cyber-purple rounded-full animate-pulse shrink-0"></div>
        <h2 class="text-lg font-bold text-cyber-purple font-tech">
          MISSION CRITIQUE - LABORATOIRE ADN
        </h2>
      </div>

      <div class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed">
        <p>
          <span class="text-cyber-purple font-bold">Agent,</span> nous avons une situation critique dans le laboratoire ADN.
        </p>

        <p>
          Les systèmes de sécurité biométrique ont été compromis par des hackers. Notre base de données génétique, qui contient les profils ADN de tous les citoyens, est en danger.
        </p>

        <p>
          <span class="text-cyber-purple font-bold">Votre mission :</span> reconstituer les séquences ADN corrompues pour rétablir la sécurité du système.
        </p>

        <div class="bg-cyber-purple/10 border border-cyber-purple/30 rounded p-4 mt-4">
          <p class="text-cyber-purple font-bold mb-2">RÈGLES D'APPARIEMENT :</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-red-400">A</span>
              <span>↔</span>
              <span class="text-red-400">T</span>
              <span class="text-gray-400">(Adénine-Thymine)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-green-400">C</span>
              <span>↔</span>
              <span class="text-green-400">G</span>
              <span class="text-gray-400">(Cytosine-Guanine)</span>
            </div>
          </div>
          <p class="text-gray-400 text-xs mt-3">
            Ensuite, chaque groupe de 3 bases (un codon) se traduit en un acide aminé.
          </p>
        </div>

        <p class="text-cyber-purple font-bold">
          Le sort de notre infrastructure génétique dépend de vous. Commencez la reconstruction immédiatement.
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
    default: 47000 // voix off : 44,5 s
  }
})

defineEmits(['close'])
</script>
