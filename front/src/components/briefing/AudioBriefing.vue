<template>
    <BriefingShell
        :visible="visible"
        :duration="duration"
        briefing-id="audio"
        theme="cyber-blue"
        icon="file"
        unit="Unité de Cybersécurité Médicale"
        status="TRANSMISSION EN COURS"
        status-theme="red"
        indicator-class="bg-green-400"
        footer="TRANSMISSION ACTIVE"
        @close="$emit('close')"
    >
        <div class="text-cyber-blue font-tech text-sm mb-2" data-no-voice>
            [TRANSMISSION SÉCURISÉE - CHIFFREMENT AES-256]
        </div>
        <div class="text-white font-tech leading-relaxed">
            <p class="mb-4">
                <span class="text-cyber-blue">Unité de Cybersécurité Médicale,</span>
                vous êtes maintenant opérationnels.
            </p>
            <p class="mb-4">
                Une
                <span class="text-red-400">cyberattaque massive</span>
                a compromis les systèmes vitaux de l'Hôpital Numérique Central.
                Les données médicales de plus de
                <span class="text-yellow-400">50&nbsp;000 patients</span>
                sont en danger.
            </p>
            <p class="mb-4">
                <span class="text-cyber-blue">Mission :</span>
                réparer neuf zones critiques du réseau, dans cet ordre.
            </p>

            <!-- Liste générée depuis roomsConfig : même ordre que le déverrouillage des salles -->
            <ol class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <li
                    v-for="(room, index) in missionRooms"
                    :key="room.id"
                    class="border rounded p-3"
                    :class="room.box"
                >
                    <div class="font-bold text-sm" :class="room.titleClass">
                        <span class="text-gray-500 mr-1" data-no-voice>{{ String(index + 1).padStart(2, "0") }}</span>
                        {{ room.title }}
                    </div>
                    <div class="text-gray-300 text-xs">
                        {{ room.text }}
                    </div>
                </li>
            </ol>

            <p class="mt-6 text-cyber-blue">
                <span class="text-yellow-400">L'heure tourne,</span>
                et des vies sont en jeu.
            </p>
            <p class="mt-4 text-center text-cyber-blue font-bold">
                Chaque salle débloquée rapproche la restauration.
            </p>
            <p class="text-center text-cyber-blue font-bold mt-2">
                Sélectionnez votre première cible et commencez.
            </p>
            <p class="text-center text-green-400 font-bold mt-2">
                Bonne chance, agents.
            </p>
        </div>
    </BriefingShell>
</template>

<script setup>
import BriefingShell from "./BriefingShell.vue";
import { ROOMS_CONFIG } from "../../config/roomsConfig";

defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    duration: {
        type: Number,
        default: 70000, // voix off de mission : 68,4 s
    },
});

defineEmits(["close"]);

// Texte de mission et couleurs de chaque carte (l'ordre et les titres viennent de roomsConfig)
const MISSION_CARDS = {
    server: {
        box: "bg-red-900/20 border-red-500/50",
        titleClass: "text-red-400",
        text: "Pare-feu corrompu. Décoder les logs",
    },
    "dna-lab": {
        box: "bg-cyan-900/20 border-cyan-500/50",
        titleClass: "text-cyan-400",
        text: "Séquences brouillées. Reconstituer l'ADN",
    },
    imaging: {
        box: "bg-green-900/20 border-green-500/50",
        titleClass: "text-green-400",
        text: "Scanners défaillants. Restaurer les images",
    },
    heart: {
        box: "bg-purple-900/20 border-purple-500/50",
        titleClass: "text-purple-400",
        text: "Arrêt cardiaque. Masser au bon rythme",
    },
    prosthesis: {
        box: "bg-orange-900/20 border-orange-500/50",
        titleClass: "text-orange-400",
        text: "Système désynchronisé. Réaligner les articulations",
    },
    pathology: {
        box: "bg-yellow-900/20 border-yellow-500/50",
        titleClass: "text-yellow-400",
        text: "Diagnostic compromis. Associer pathologies et traitements",
    },
    audition: {
        box: "bg-violet-900/20 border-violet-500/50",
        titleClass: "text-violet-400",
        text: "Diagnostic auditif corrompu. Identifier les sons médicaux",
    },
    eye: {
        box: "bg-cyan-900/20 border-cyan-500/50",
        titleClass: "text-cyan-400",
        text: "Diagnostic visuel corrompu. Recalibrer les tests de vision",
    },
    final: {
        box: "bg-green-900/20 border-green-500/50",
        titleClass: "text-green-400",
        text: "Patient critique. Diagnostiquer et sécuriser",
    },
};

const DEFAULT_CARD = {
    box: "bg-gray-900/20 border-gray-500/50",
    titleClass: "text-gray-300",
};

const missionRooms = ROOMS_CONFIG.map((room) => {
    const card = MISSION_CARDS[room.id] || DEFAULT_CARD;
    return {
        id: room.id,
        title: room.title,
        box: card.box,
        titleClass: card.titleClass,
        text: card.text || room.subtitle,
    };
});
</script>
