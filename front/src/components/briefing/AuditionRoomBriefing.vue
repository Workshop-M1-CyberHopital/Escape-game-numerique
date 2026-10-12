<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="auditionRoom"
    theme="cyber-purple"
    unit="Unité Audiométrique - Salle de l'Audition"
    status="TRANSMISSION AUDIO URGENTE"
    footer="TRANSMISSION AUDIO ACTIVE"
    @close="$emit('close')"
  >
    <div class="text-cyber-purple font-tech text-sm mb-2" data-no-voice>
      [TRANSMISSION AUDIO URGENTE - DIAGNOSTIC AUDITIF COMPROMIS]
    </div>
    <div class="text-white font-tech leading-relaxed">
      <p class="mb-4">
        <span class="text-cyber-purple">Agents,</span> vous êtes dans la <span class="text-yellow-400">Salle de l'Audition.</span>
      </p>
      <p class="mb-4">
        Le <span class="text-cyber-purple">système de diagnostic auditif est compromis :</span> les enregistrements des patients ne sont plus interprétés. Les médecins ont besoin de vos oreilles.
      </p>
      <p class="mb-4">
        <span class="text-cyber-blue">Votre mission :</span> écouter <span class="text-yellow-400">3 sons médicaux</span> et identifier, pour chacun, s'il est normal ou pathologique.
      </p>
      <ul class="space-y-2 mb-4 text-sm">
        <li class="flex items-start gap-2">
          <span class="text-cyber-purple font-bold shrink-0">TEST 1 :</span>
          <span class="text-gray-300">les battements du cœur, écoutés au stéthoscope.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-cyber-purple font-bold shrink-0">TEST 2 :</span>
          <span class="text-gray-300">la respiration du patient.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-cyber-purple font-bold shrink-0">TEST 3 :</span>
          <span class="text-gray-300">un son que le patient entend en permanence dans son oreille.</span>
        </li>
      </ul>
      <div class="bg-purple-900/20 border border-cyber-purple/50 rounded p-4 mb-4">
        <div class="text-cyber-purple font-bold text-sm mb-2">🎧 CONSIGNES</div>
        <div class="text-gray-300 text-sm space-y-2">
          <p>Montez le son ou mettez un casque : vérifiez que le son n'est pas coupé dans le panneau audio, en bas à gauche de l'écran, et réglez le volume avec ce panneau ou les boutons de votre appareil.</p>
          <p>Chaque test propose deux réponses. Une mauvaise réponse ajoute <span class="text-purple-400 font-bold">{{ PENALTY_PER_ERROR }}&nbsp;s de pénalité</span> : réécoutez alors le son et retentez ce test.</p>
        </div>
      </div>
      <p class="mb-4">
        <span class="text-yellow-400">Pourquoi c'est vital :</span> à l'écoute, un médecin repère en quelques secondes un cœur irrégulier, des bronches rétrécies ou une oreille abîmée, sans aucun appareil coûteux.
      </p>
      <p class="text-center text-cyber-purple font-bold mt-4">
        Le diagnostic des patients dépend de votre écoute.
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
    default: 40000
  }
})

defineEmits(['close'])
</script>
