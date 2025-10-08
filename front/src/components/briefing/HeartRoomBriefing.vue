<template>
    <div
        v-if="visible"
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
        <div
            class="bg-gray-900/95 border-2 border-cyber-red rounded-lg max-w-4xl w-full relative overflow-hidden"
        >
            <!-- Scanlines effect -->
            <div class="absolute inset-0 scanline opacity-20"></div>

            <!-- Header with agent info -->
            <div class="border-b border-cyber-red/50 p-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <!-- Agent Avatar -->
                        <div class="relative">
                            <div
                                class="w-16 h-16 bg-gradient-to-br from-cyber-red to-red-700 rounded-full flex items-center justify-center border-2 border-cyber-red"
                            >
                                <svg
                                    class="w-8 h-8 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"
                                    />
                                </svg>
                            </div>
                            <!-- Status indicator -->
                            <div
                                class="absolute -bottom-1 -right-1 w-4 h-4 bg-cyber-red rounded-full border-2 border-gray-900 animate-pulse"
                            ></div>
                        </div>

                        <!-- Agent Info -->
                        <div>
                            <h3
                                class="text-xl font-bold text-cyber-red font-tech"
                            >
                                AGENT CYBER-001
                            </h3>
                            <p class="text-sm text-gray-300 font-tech">
                                Unité de Cybersécurité Médicale - Salle de
                                Réanimation
                            </p>
                            <div class="flex items-center gap-2 mt-1">
                                <div
                                    class="w-2 h-2 bg-cyber-red rounded-full animate-pulse"
                                ></div>
                                <span class="text-xs text-cyber-red font-tech"
                                    >URGENCE CARDIAQUE - CODE ROUGE</span
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
                    class="bg-gray-800/50 border border-cyber-red/30 rounded-lg p-6"
                >
                    <div class="space-y-4">
                        <div class="flex items-center gap-3 mb-4">
                            <div
                                class="w-3 h-3 bg-cyber-red rounded-full animate-pulse"
                            ></div>
                            <h2
                                class="text-lg font-bold text-cyber-red font-tech"
                            >
                                CODE ROUGE - ARRÊT CARDIAQUE
                            </h2>
                        </div>

                        <div
                            class="space-y-3 text-gray-300 font-tech text-sm leading-relaxed"
                        >
                            <p>
                                <span class="text-cyber-red font-bold"
                                    >Agent,</span
                                >
                                nous avons une urgence vitale en salle de
                                réanimation !
                            </p>

                            <p>
                                Un patient critique vient de faire un arrêt
                                cardiaque. Les défibrillateurs automatiques ont
                                été sabotés par les hackers. Vous devez
                                intervenir manuellement.
                            </p>

                            <p>
                                <span class="text-cyber-red font-bold"
                                    >Votre mission :</span
                                >
                                effectuer un massage cardiaque d'urgence en
                                respectant le rythme correct de 100 compressions
                                par minute.
                            </p>

                            <div
                                class="bg-cyber-red/10 border border-cyber-red/30 rounded p-4 mt-4"
                            >
                                <p class="text-cyber-red font-bold mb-2">
                                    PROTOCOLE DE RÉANIMATION :
                                </p>
                                <div class="space-y-2 text-xs">
                                    <div class="flex items-center gap-2">
                                        <span class="text-cyber-red">🎵</span>
                                        <span
                                            >Suivez le rythme de "Stayin' Alive"
                                            des Bee Gees</span
                                        >
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-cyber-red">⌨️</span>
                                        <span
                                            >Appuyez sur ESPACE au bon
                                            moment</span
                                        >
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-cyber-red">💓</span>
                                        <span
                                            >Objectif : 30 compressions
                                            correctes</span
                                        >
                                    </div>
                                </div>
                            </div>

                            <p class="text-cyber-red font-bold">
                                Chaque seconde compte ! Commencez le massage
                                cardiaque immédiatement pour sauver ce patient.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer with progress -->
            <div class="border-t border-cyber-red/50 p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div
                            class="w-2 h-2 bg-cyber-red rounded-full animate-pulse"
                        ></div>
                        <span class="text-xs text-gray-400 font-tech"
                            >URGENCE CARDIAQUE ACTIVE</span
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
});

const emit = defineEmits(["close"]);

const timeRemaining = ref(45000); // 45 secondes pour le briefing
let timer = null;

const handleClose = () => {
    emit("close");
};

onMounted(() => {
    if (props.visible) {
        timer = setInterval(() => {
            timeRemaining.value -= 100;
            if (timeRemaining.value <= 0) {
                handleClose();
            }
        }, 100);
    }
});

onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
    }
});
</script>

<style scoped>
.scanline {
    background: linear-gradient(transparent 50%, rgba(239, 68, 68, 0.03) 50%);
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
