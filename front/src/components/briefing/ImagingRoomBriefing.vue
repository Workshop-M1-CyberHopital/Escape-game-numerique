<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="imagingRoom"
    theme="cyan"
    agent="AGENT CYBER-003"
    unit="Unité d'Imagerie Médicale - Salle d'Imagerie"
    status="TRANSMISSION URGENTE - IRM CORROMPUE"
    footer="TRANSMISSION URGENTE ACTIVE"
    close-style="accent"
    @close="$emit('close')"
  >
    <div class="text-cyan-400 font-tech text-sm mb-2" data-no-voice>
      [TRANSMISSION URGENTE - SYSTÈME D'IMAGERIE COMPROMIS]
    </div>
    <div class="text-white font-tech leading-relaxed">
      <p class="mb-4">
        <span class="text-cyan-400">Agent,</span> vous pénétrez dans la <span class="text-yellow-400">Salle d'Imagerie médicale.</span>
      </p>
      <p class="mb-4">
        Le <span class="text-cyan-400">virus a corrompu nos systèmes d'IRM cérébrale</span>, mélangeant les coupes anatomiques. Nos médecins sont <span class="text-red-400">aveugles face aux pathologies neurologiques.</span>
      </p>
      <p class="mb-4">
        <span class="text-cyber-blue">Votre mission :</span> remettre les 4 coupes IRM dans l'ordre, du haut vers le bas du crâne, pour restaurer l'imagerie médicale.
      </p>
      <div class="bg-cyan-900/20 border border-cyan-500/50 rounded p-4 mb-4">
        <div class="text-cyan-400 font-bold text-sm mb-2">🧠 LOGIQUE ANATOMIQUE</div>
        <div class="text-gray-300 text-sm">
          Du sommet du crâne vers la base du cerveau, les coupes s'élargissent progressivement. C'est votre seule chance de remettre l'ordre.
        </div>
      </div>
      <p class="mb-4">
        <span class="text-yellow-400">Enjeu critique :</span> sans imagerie fonctionnelle, impossible de diagnostiquer <span class="text-red-400">tumeurs, AVC, fractures</span> ou autres pathologies.
      </p>
      <p class="mb-4">
        Chaque seconde compte. Les <span class="text-cyan-400">données d'imagerie</span> sont vitales pour sauver des vies.
      </p>
      <p class="text-center text-cyan-400 font-bold mt-6">
        L'hôpital compte sur vous, agent. Commencez la reconstruction.
      </p>
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
    default: 47000 // voix off : 44,1 s
  }
})

defineEmits(['close'])
</script>
