<template>
    <BriefingShell
        :visible="visible"
        :duration="duration"
        briefing-id="heartRoom"
        theme="cyber-red"
        icon="heart"
        unit="Unité de Cybersécurité Médicale - Salle de Réanimation"
        status="URGENCE CARDIAQUE - CODE ROUGE"
        footer="URGENCE CARDIAQUE ACTIVE"
        @close="$emit('close')"
    >
        <div class="space-y-4">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-3 h-3 bg-cyber-red rounded-full animate-pulse shrink-0"></div>
                <h2 class="text-lg font-bold text-cyber-red font-tech">
                    CODE ROUGE - ARRÊT CARDIAQUE
                </h2>
            </div>

            <div class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed">
                <p>
                    <span class="text-cyber-red font-bold">Agents,</span>
                    nous avons une urgence vitale en salle de réanimation !
                </p>

                <p>
                    Un patient vient de faire un arrêt cardiaque : son cœur ne
                    pompe plus le sang. Les secours sont prévenus et un
                    défibrillateur est en route, mais les hackers ont saboté
                    l'assistance automatique. D'ici là, vous seuls pouvez
                    maintenir le sang en circulation.
                </p>

                <p>
                    <span class="text-cyber-red font-bold">Votre mission :</span>
                    effectuer un massage cardiaque en respectant le bon rythme :
                    100 à 120 compressions par minute. Le métronome de la salle
                    bat à 100 par minute.
                </p>

                <div class="bg-cyber-red/10 border border-cyber-red/30 rounded p-4 mt-4">
                    <p class="text-cyber-red font-bold mb-2">
                        PROTOCOLE DE RÉANIMATION :
                    </p>
                    <div class="space-y-2 text-xs">
                        <div class="flex items-start gap-2">
                            <span class="text-cyber-red shrink-0">🎵</span>
                            <span>Gardez le rythme de « Stayin' Alive » des Bee Gees (environ 100 battements par minute)</span>
                        </div>
                        <div class="flex items-start gap-2">
                            <span class="text-cyber-red shrink-0">⌨️</span>
                            <span>Comprimez au bon moment avec ESPACE, ENTRÉE, le bouton à l'écran (au doigt) ou une manette</span>
                        </div>
                        <div class="flex items-start gap-2">
                            <span class="text-cyber-red shrink-0">💓</span>
                            <span>Objectif : 30 compressions correctes. Une compression hors rythme coûte une pénalité</span>
                        </div>
                    </div>
                </div>

                <p>
                    <span class="text-yellow-400 font-bold">Pourquoi c'est vital :</span>
                    privé d'oxygène, le cerveau commence à subir des lésions en
                    quelques minutes. Le massage cardiaque fait circuler le sang
                    jusqu'à l'arrivée du défibrillateur.
                </p>

                <p class="text-cyber-red font-bold">
                    Chaque seconde compte ! Commencez le massage cardiaque
                    immédiatement pour sauver ce patient.
                </p>
            </div>
        </div>
    </BriefingShell>
</template>

<script setup>
import BriefingShell from "./BriefingShell.vue";

defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    duration: {
        type: Number,
        default: 45000,
    },
});

defineEmits(["close"]);
</script>
