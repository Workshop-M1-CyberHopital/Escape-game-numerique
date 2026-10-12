<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="pathologyRoom"
    theme="cyber-red"
    unit="Unité de Diagnostic Médical - Salle des Pathologies"
    status="ALERTE MÉDICALE - DIAGNOSTIC URGENT"
    footer="TRANSMISSION MÉDICALE ACTIVE"
    @close="$emit('close')"
  >
    <div class="text-cyber-red font-tech text-sm mb-2" data-no-voice>
      [TRANSMISSION MÉDICALE URGENTE - NIVEAU CRITIQUE]
    </div>
    <div class="text-white font-tech leading-relaxed">
      <p class="mb-4">
        <span class="text-cyber-red">Agents,</span> vous êtes dans la <span class="text-yellow-400">Salle des Pathologies.</span>
      </p>
      <p class="mb-4">
        Le <span class="text-cyber-red">système de diagnostic est compromis.</span> Les <span class="text-yellow-400">traitements ont été mélangés</span> dans la base de données.
      </p>
      <p class="mb-4">
        <span class="text-cyber-blue">Votre mission :</span> associer chacune des 5 pathologies à son traitement.
      </p>
      <div class="bg-red-900/20 border border-cyber-red/50 rounded p-4 mb-4">
        <div class="text-cyber-red font-bold text-sm mb-2">⚠️ RÈGLE CRITIQUE</div>
        <div class="text-gray-300 text-sm">
          <span class="text-red-400 font-bold">ZÉRO TOLÉRANCE :</span> une erreur (+{{ PENALTY_PER_ERROR }}&nbsp;s de pénalité) efface toutes les associations, il faudra tout recommencer !
        </div>
      </div>
      <p class="mb-4">
        <span class="text-yellow-400">Pourquoi c'est vital :</span> un mauvais traitement peut être inefficace, voire dangereux. Chaque médicament agit sur un mécanisme précis de la maladie.
      </p>
      <p class="text-center text-cyber-red font-bold mt-4">
        La vie des patients dépend de votre diagnostic.
      </p>
    </div>
  </BriefingShell>
</template>

<script setup>
import BriefingShell from './BriefingShell.vue'
import { PENALTY_PER_ERROR } from '../../composables/useGameState'

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
