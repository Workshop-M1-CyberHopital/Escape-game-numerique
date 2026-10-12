<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="eyeRoom"
    theme="cyan"
    icon="eye"
    unit="Unité d'Ophtalmologie - Salle des Yeux"
    status="ALERTE VISUELLE - TRANSMISSION URGENTE"
    footer="TRANSMISSION URGENTE ACTIVE"
    close-style="accent"
    @close="$emit('close')"
  >
    <div class="text-cyan-400 font-tech text-sm mb-2" data-no-voice>
      [TRANSMISSION URGENTE - SYSTÈME OPHTALMOLOGIQUE COMPROMIS]
    </div>
    <div class="text-white font-tech leading-relaxed">
      <p class="mb-4">
        <span class="text-cyan-400">Agents,</span> vous entrez dans la <span class="text-yellow-400">Salle des Yeux.</span>
      </p>
      <p class="mb-4">
        Le virus a brouillé le <span class="text-cyan-400">système de diagnostic ophtalmologique</span> : le tableau de lettres qui mesure l'acuité visuelle est devenu flou et le module de vision des couleurs est désynchronisé.
      </p>
      <p class="mb-4">
        <span class="text-cyber-blue">Votre mission :</span> recalibrer les deux tests de vue de l'hôpital.
      </p>
      <ul class="space-y-2 mb-4 text-sm">
        <li class="flex items-start gap-2">
          <span class="text-cyan-400 font-bold shrink-0">ÉTAPE 1 :</span>
          <span class="text-gray-300">test d'acuité visuelle. Déchiffrez la ligne demandée du tableau de lettres (type Snellen) et saisissez-la comme code d'accès.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-cyan-400 font-bold shrink-0">ÉTAPE 2 :</span>
          <span class="text-gray-300">test de vision des couleurs. Retrouvez le nombre caché dans chacune des 5 planches d'Ishihara.</span>
        </li>
      </ul>
      <div class="bg-cyan-900/20 border border-cyan-500/50 rounded p-4 mb-4">
        <div class="text-cyan-400 font-bold text-sm mb-2">👁️ POURQUOI C'EST VITAL</div>
        <div class="text-gray-300 text-sm">
          Une baisse de la vue s'installe souvent sans que l'on s'en rende compte. Ces tests simples permettent de la repérer et de la corriger, et de dépister un daltonisme, qui touche environ 8&nbsp;% des hommes.
        </div>
      </div>
      <p class="mb-4">
        <span class="text-yellow-400">Attention :</span> chaque erreur ajoute {{ PENALTY_PER_ERROR }} secondes de pénalité. Prenez le temps de bien regarder.
      </p>
      <p class="text-center text-cyan-400 font-bold mt-6">
        Bon courage, agents. Les diagnostics des patients dépendent de votre regard.
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
