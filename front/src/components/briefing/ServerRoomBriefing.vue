<template>
  <BriefingShell
    :visible="visible"
    :duration="duration"
    briefing-id="serverRoom"
    theme="red"
    unit="Unité de Cybersécurité Médicale - Salle du Serveur"
    status="ALERTE SÉCURITÉ - TRANSMISSION URGENTE"
    footer="TRANSMISSION URGENTE ACTIVE"
    @close="$emit('close')"
  >
    <div class="text-red-400 font-tech text-sm mb-2" data-no-voice>
      [TRANSMISSION URGENTE - NIVEAU SÉCURITÉ MAXIMUM]
    </div>
    <div class="text-white font-tech leading-relaxed">
      <p class="mb-4">
        <span class="text-red-400">Agent,</span> vous êtes maintenant dans la <span class="text-yellow-400">Salle du Serveur principal.</span>
      </p>
      <p class="mb-4">
        Le <span class="text-red-400">système de sécurité a été complètement piraté.</span> Nos enregistrements de sécurité montrent des <span class="text-yellow-400">intrusions multiples</span> dans les dernières 24 heures.
      </p>
      <p class="mb-4">
        <span class="text-cyber-blue">Votre mission :</span> identifier l'encodage du journal d'accès piraté, décoder la question de sécurité qu'il cache, puis y répondre pour restaurer la protection du réseau hospitalier.
      </p>
      <ul class="space-y-2 mb-4 text-sm">
        <li class="flex items-start gap-2">
          <span class="text-red-400 font-bold shrink-0">ÉTAPE 1 :</span>
          <span class="text-gray-300">identifier l'encodage utilisé par les pirates (attention : un encodage n'est pas un chiffrement).</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-red-400 font-bold shrink-0">ÉTAPE 2 :</span>
          <span class="text-gray-300">décoder le journal d'accès piraté avec l'outil de décodage.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-red-400 font-bold shrink-0">ÉTAPE 3 :</span>
          <span class="text-gray-300">répondre à la question de sécurité cachée dans ce journal.</span>
        </li>
      </ul>
      <div class="bg-red-900/20 border border-red-500/50 rounded p-4 mb-4">
        <div class="text-red-400 font-bold text-sm mb-2">⚠️ ALERTE CRITIQUE</div>
        <div class="text-gray-300 text-sm">
          Le journal d'accès est illisible tel quel : il a été encodé. Une fois décodé, il révèle la question de sécurité utilisée par les pirates pour s'introduire.
        </div>
      </div>
      <p class="mb-4">
        <span class="text-yellow-400">Pourquoi c'est vital :</span> un hôpital piraté peut perdre l'accès aux dossiers de ses patients et devoir reporter des soins, et des données de santé très sensibles peuvent être volées.
      </p>
      <p class="mb-4">
        <span class="text-yellow-400">Attention :</span> chaque minute compte. Plus vous tardez, plus le <span class="text-red-400">virus informatique</span> se propage dans les autres systèmes.
      </p>
      <p class="mb-4">
        Commencez par observer le <span class="text-cyber-blue">journal encodé</span> : sa forme (lettres, chiffres, caractères « = » à la fin…) trahit l'encodage utilisé.
      </p>
      <p class="mb-4">
        Une fois la sécurité restaurée, vous pourrez accéder aux autres zones critiques du réseau.
      </p>
      <p class="text-center text-red-400 font-bold mt-6">
        Bon courage, agent. La sécurité des données médicales dépend de votre réussite.
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
    default: 55000 // voix off : 51,1 s
  }
})

defineEmits(['close'])
</script>
