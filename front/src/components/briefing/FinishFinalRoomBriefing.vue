<template>
    <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
        <div
            class="bg-gray-900/95 backdrop-blur-md border-2 border-cyber-green rounded-lg p-8 max-w-4xl mx-auto m-4 scanline relative overflow-hidden"
        >
            <!-- Close button -->
            <button
                @click="$emit('close')"
                class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
                <i data-lucide="x" class="w-6 h-6"></i>
            </button>

            <!-- Header -->
            <div class="text-center mb-8">
                <div class="flex items-center justify-center gap-3 mb-4">
                    <i data-lucide="trophy" class="w-12 h-12 text-cyber-green"></i>
                    <h2 class="font-cyber font-bold text-cyber-green text-3xl">
                        MISSION ACCOMPLIE !
                    </h2>
                </div>
                <p class="text-gray-300 text-lg font-tech">
                    Diagnostic réussi - Patient sauvé
                </p>
            </div>

            <!-- Content -->
            <div class="space-y-6">
                <!-- Success message -->
                <div class="bg-green-900/20 border border-green-500/50 rounded-lg p-6">
                    <h3 class="text-green-400 font-bold text-xl mb-4 flex items-center gap-2">
                        <i data-lucide="check-circle" class="w-6 h-6"></i>
                        DIAGNOSTIC RÉUSSI
                    </h3>
                    <div class="space-y-3 text-gray-300">
                        <p>
                            🎉 <strong class="text-green-400">Excellent travail !</strong> Vous avez correctement 
                            diagnostiqué une <strong class="text-cyber-blue">pneumonie bactérienne</strong> chez Marie Dubois.
                        </p>
                        <p>
                            Le traitement par <strong class="text-cyber-blue">antibiotiques</strong> et 
                            <strong class="text-cyber-blue">oxygénothérapie</strong> a été administré avec succès.
                        </p>
                        <p>
                            Le patient est maintenant <strong class="text-green-400">hors de danger</strong> 
                            et en voie de guérison complète.
                        </p>
                    </div>
                </div>

                <!-- Medical summary -->
                <div class="bg-gray-800/60 border border-cyber-blue/30 rounded-lg p-6">
                    <h3 class="text-cyber-blue font-bold text-xl mb-4 flex items-center gap-2">
                        <i data-lucide="stethoscope" class="w-5 h-5"></i>
                        RÉSUMÉ MÉDICAL
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="text-white font-bold mb-3">Diagnostic final</h4>
                            <div class="space-y-2 text-sm text-gray-300">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="check" class="w-4 h-4 text-green-400"></i>
                                    <span>Pneumonie bactérienne</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="check" class="w-4 h-4 text-green-400"></i>
                                    <span>Insuffisance respiratoire modérée</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="check" class="w-4 h-4 text-green-400"></i>
                                    <span>État critique résolu</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 class="text-white font-bold mb-3">Traitement administré</h4>
                            <div class="space-y-2 text-sm text-gray-300">
                                <div class="flex items-center gap-2">
                                    <i data-lucide="check" class="w-4 h-4 text-green-400"></i>
                                    <span>Antibiotiques (Amoxicilline)</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="check" class="w-4 h-4 text-green-400"></i>
                                    <span>Oxygénothérapie (2L/min)</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i data-lucide="check" class="w-4 h-4 text-green-400"></i>
                                    <span>Surveillance continue</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Security achievement -->
                <div class="bg-gray-800/60 border border-cyber-purple/30 rounded-lg p-6">
                    <h3 class="text-cyber-purple font-bold text-xl mb-4 flex items-center gap-2">
                        <i data-lucide="shield-check" class="w-5 h-5"></i>
                        SÉCURITÉ RENFORCÉE
                    </h3>
                    <div class="space-y-3 text-gray-300">
                        <p>
                            Le <strong class="text-cyber-blue">dossier patient</strong> a été sécurisé avec succès 
                            dans le coffre-fort numérique du hôpital.
                        </p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div class="text-center p-3 bg-cyber-green/10 rounded-lg">
                                <i data-lucide="lock" class="w-6 h-6 text-cyber-green mx-auto mb-2"></i>
                                <div class="text-sm font-bold text-cyber-green">Chiffrement AES-256</div>
                            </div>
                            <div class="text-center p-3 bg-cyber-blue/10 rounded-lg">
                                <i data-lucide="cloud" class="w-6 h-6 text-cyber-blue mx-auto mb-2"></i>
                                <div class="text-sm font-bold text-cyber-blue">Sauvegarde Cloud</div>
                            </div>
                            <div class="text-center p-3 bg-cyber-purple/10 rounded-lg">
                                <i data-lucide="shield" class="w-6 h-6 text-cyber-purple mx-auto mb-2"></i>
                                <div class="text-sm font-bold text-cyber-purple">Protection RGPD</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Final message -->
                <div class="bg-gradient-to-r from-cyber-green/20 to-cyber-blue/20 border border-cyber-green/50 rounded-lg p-6">
                    <h3 class="text-cyber-green font-bold text-xl mb-4 flex items-center gap-2">
                        <i data-lucide="star" class="w-6 h-6"></i>
                        MISSION TERMINÉE
                    </h3>
                    <div class="space-y-3 text-gray-300">
                        <p>
                            🏆 <strong class="text-cyber-green">Félicitations !</strong> Vous avez complètement 
                            résolu la cyberattaque et sauvé un patient en danger.
                        </p>
                        <p>
                            Votre équipe a démontré d'excellentes compétences en 
                            <strong class="text-cyber-blue">cybersécurité</strong> et en 
                            <strong class="text-cyber-blue">diagnostic médical</strong>.
                        </p>
                        <p class="text-center text-lg font-bold text-cyber-green">
                            L'hôpital est maintenant sécurisé et opérationnel ! 🎉
                        </p>
                    </div>
                </div>
            </div>

            <!-- Action buttons -->
            <div class="flex justify-center gap-4 mt-8">
                <button
                    @click="$emit('close')"
                    class="bg-cyber-green hover:bg-cyber-green/80 text-white px-8 py-3 rounded-lg font-bold transition-colors duration-300 flex items-center gap-2"
                >
                    <i data-lucide="check" class="w-5 h-5"></i>
                    TERMINER LA MISSION
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

defineEmits(['close'])
</script>

<style scoped>
.font-cyber {
    font-family: "Orbitron", sans-serif;
}

.font-tech {
    font-family: "Courier New", monospace;
}

.scanline {
    position: relative;
}

.scanline::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00ff00, transparent);
    animation: scan 2s linear infinite;
}

@keyframes scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
</style>
