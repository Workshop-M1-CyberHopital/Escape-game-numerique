<template>
    <div
        v-if="visible"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
        <div
            class="bg-gray-900/95 border-2 border-cyber-blue rounded-lg max-w-4xl w-full relative overflow-hidden"
        >
            <!-- Scanlines effect -->
            <div class="absolute inset-0 scanline opacity-20"></div>

            <!-- Header with agent info -->
            <div class="border-b border-cyber-blue/50 p-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <!-- Agent Avatar -->
                        <div class="relative">
                            <div
                                class="w-16 h-16 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center border-2 border-cyber-blue"
                            >
                                <svg
                                    class="w-8 h-8 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"
                                    />
                                </svg>
                            </div>
                            <!-- Status indicator -->
                            <div
                                class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 animate-pulse"
                            ></div>
                        </div>

                        <!-- Agent Info -->
                        <div>
                            <h3
                                class="text-xl font-bold text-cyber-blue font-tech"
                            >
                                AGENT CYBER-001
                            </h3>
                            <p class="text-sm text-gray-300 font-tech">
                                Unité de Cybersécurité Médicale
                            </p>
                            <div class="flex items-center gap-2 mt-1">
                                <div
                                    class="w-2 h-2 bg-red-400 rounded-full animate-pulse"
                                ></div>
                                <span class="text-xs text-red-400 font-tech"
                                    >TRANSMISSION EN COURS</span
                                >
                            </div>
                        </div>
                    </div>

                    <!-- Close Button -->
                    <button
                        @click="handleClose"
                        class="w-8 h-8 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all duration-300 hover:scale-110"
                        title="Fermer et couper l'audio"
                    >
                        <svg
                            class="w-4 h-4 text-red-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Message Content -->
            <div class="p-6">
                <div
                    class="bg-gray-800/50 border border-cyber-blue/30 rounded-lg p-6"
                >
                    <div class="flex items-start gap-4">
                        <!-- Message bubble -->
                        <div class="flex-1">
                            <div class="text-cyber-blue font-tech text-sm mb-2">
                                [TRANSMISSION SECURISEE - CHIFFREMENT AES-256]
                            </div>
                            <div class="text-white font-tech leading-relaxed">
                                <p class="mb-4">
                                    <span class="text-cyber-blue"
                                        >Unité de Cybersécurité Médicale,</span
                                    >
                                    vous êtes maintenant opérationnels.
                                </p>
                                <p class="mb-4">
                                    Une
                                    <span class="text-red-400"
                                        >cyberattaque massive</span
                                    >
                                    a compromis les systèmes vitaux de l'Hôpital
                                    Numérique Central. Les données médicales de
                                    plus de
                                    <span class="text-yellow-400"
                                        >50 000 patients</span
                                    >
                                    sont en danger.
                                </p>
                                <p class="mb-4">
                                    <span class="text-cyber-blue"
                                        >Votre mission :</span
                                    >
                                    infiltrer et réparer sept zones critiques du
                                    réseau hospitalier.
                                </p>
                                <div
                                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
                                >
                                    <div
                                        class="bg-red-900/20 border border-red-500/50 rounded p-3"
                                    >
                                        <div
                                            class="text-red-400 font-bold text-sm"
                                        >
                                            SALLE DU SERVEUR
                                        </div>
                                        <div class="text-gray-300 text-xs">
                                            Pare-feu principal corrompu
                                        </div>
                                    </div>
                                    <div
                                        class="bg-cyan-900/20 border border-cyan-500/50 rounded p-3"
                                    >
                                        <div
                                            class="text-cyan-400 font-bold text-sm"
                                        >
                                            LABORATOIRE ADN
                                        </div>
                                        <div class="text-gray-300 text-xs">
                                            Séquences génétiques brouillées
                                        </div>
                                    </div>
                                    <div
                                        class="bg-green-900/20 border border-green-500/50 rounded p-3"
                                    >
                                        <div
                                            class="text-green-400 font-bold text-sm"
                                        >
                                            SALLE D'IMAGERIE
                                        </div>
                                        <div class="text-gray-300 text-xs">
                                            Scanners médicaux hors service
                                        </div>
                                    </div>
                                    <div
                                        class="bg-purple-900/20 border border-purple-500/50 rounded p-3"
                                    >
                                        <div
                                            class="text-purple-400 font-bold text-sm"
                                        >
                                            SALLE DU CŒUR
                                        </div>
                                        <div class="text-gray-300 text-xs">
                                            Monitoring cardiaque défaillant
                                        </div>
                                    </div>

                                    <div
                                        class="bg-yellow-900/20 border border-yellow-500/50 rounded p-3"
                                    >
                                        <div
                                            class="text-yellow-400 font-bold text-sm"
                                        >
                                            SALLE DES PATHOLOGIES
                                        </div>
                                        <div class="text-gray-300 text-xs">
                                            Diagnostic médical compromis
                                        </div>
                                    </div>
                                    <div
                                        class="bg-orange-900/20 border border-orange-500/50 rounded p-3"
                                    >
                                        <div
                                            class="text-orange-400 font-bold text-sm"
                                        >
                                            SALLE DES PROTHÈSES
                                        </div>
                                        <div class="text-gray-300 text-xs">
                                            Système orthopédique désynchronisé
                                        </div>
                                    </div>
                                    <div
                                        class="bg-violet-900/20 border border-violet-500/50 rounded p-3"
                                    >
                                        <div
                                            class="text-violet-400 font-bold text-sm"
                                        >
                                            SALLE DE L'AUDITION
                                        </div>
                                        <div class="text-gray-300 text-xs">
                                            Système audio ORL défaillant
                                        </div>
                                    </div>
                                    <div
                                        class="bg-violet-900/20 border border-violet-500/50 rounded p-3"
                                    >
                                        <div
                                            class="text-violet-400 font-bold text-sm"
                                        >
                                            SALLE DES YEUX
                                        </div>
                                        <div class="text-gray-300 text-xs">
                                            Système ophtalmologique défaillant
                                        </div>
                                    </div>
                                </div>
                                <p class="mt-6 text-cyber-blue">
                                    <span class="text-yellow-400"
                                        >L'heure tourne,</span
                                    >
                                    et des vies sont en jeu.
                                </p>
                                <p
                                    class="mt-4 text-center text-cyber-blue font-bold"
                                >
                                    Sélectionnez votre première cible et
                                    commencez la mission.
                                </p>
                                <p
                                    class="text-center text-green-400 font-bold mt-2"
                                >
                                    Bonne chance, agents.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer with progress -->
            <div class="border-t border-cyber-blue/50 p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-2 h-2 bg-cyber-blue rounded-full animate-pulse"
                        ></div>
                        <span class="text-xs text-gray-400 font-tech"
                            >TRANSMISSION ACTIVE</span
                        >
                    </div>
                    <div class="text-xs text-gray-500 font-tech">
                        [AUTO-CLOSE IN {{ Math.ceil(timeRemaining / 1000) }}s]
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    duration: {
        type: Number,
        default: 60000, // 60 seconds
    },
});

const emit = defineEmits(["close"]);

const timeRemaining = ref(props.duration);
let interval = null;

const handleClose = () => {
    // Arrêter l'audio et fermer le popup
    emit("close");
};

onMounted(() => {
    if (props.visible) {
        // Start countdown
        interval = setInterval(() => {
            timeRemaining.value -= 1000;
            if (timeRemaining.value <= 0) {
                emit("close");
            }
        }, 1000);
    }
});

onUnmounted(() => {
    if (interval) {
        clearInterval(interval);
    }
});
</script>

<style scoped>
.scanline {
    background: linear-gradient(transparent 50%, rgba(0, 255, 255, 0.03) 50%);
    background-size: 100% 4px;
    animation: scanline 0.1s linear infinite;
    pointer-events: none;
}

/* S'assurer que les boutons sont cliquables */
button {
    pointer-events: auto !important;
    position: relative;
    z-index: 10;
}

@keyframes scanline {
    0% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(4px);
    }
}
</style>
