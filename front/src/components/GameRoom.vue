<template>
    <div class="min-h-screen bg-gray-900 relative">
        <!-- Header avec timer et équipe -->
        <header
            class="bg-gray-800/90 backdrop-blur-md border-b-2 border-cyber-blue p-4"
        >
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <button
                        @click="$emit('exit-room')"
                        class="flex items-center gap-2 px-4 py-2 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 font-tech text-sm rounded transition-all"
                    >
                        <ArrowLeft class="w-4 h-4" />
                        RETOUR
                    </button>
                    <div class="text-cyber-blue font-cyber font-bold text-lg">
                        {{ roomData.title }}
                    </div>
                </div>

                <div class="flex items-center gap-6"></div>
            </div>
        </header>

        <!-- Modal Stats (toujours visible) -->

        <!-- Contenu de la salle -->
        <main class="p-8">
            <div class="max-w-6xl mx-auto">
                <!-- Description de la salle -->
                <div class="mb-8">
                    <div
                        class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline"
                    >
                        <div class="flex items-start gap-4">
                            <div
                                class="w-16 h-16 rounded-lg flex items-center justify-center"
                                :style="`background-color: ${roomData.color}20; border: 2px solid ${roomData.color};`"
                            >
                                <component
                                    :is="getIconComponent(roomData.icon)"
                                    class="w-8 h-8"
                                    :style="`color: ${roomData.color};`"
                                />
                            </div>
                            <div class="flex-1">
                                <h1
                                    class="text-3xl font-cyber font-bold mb-2"
                                    :style="`color: ${roomData.color};`"
                                >
                                    {{ roomData.title }}
                                </h1>
                                <p class="text-lg font-tech text-gray-400 mb-3">
                                    {{ roomData.subtitle }}
                                </p>
                                <p class="text-gray-300 leading-relaxed mb-4">
                                    {{ roomData.description }}
                                </p>
                                <div class="flex items-center gap-2">
                                    <span
                                        class="px-3 py-1 border border-cyber-blue text-cyber-blue font-tech text-sm rounded"
                                    >
                                        OBJECTIF
                                    </span>
                                    <span class="text-sm text-gray-400">{{
                                        roomData.objective
                                    }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contenu spécifique de la salle -->
                <slot></slot>
            </div>
        </main>
    </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useGameState } from "../composables/useGameState";
import {
    ArrowLeft,
    Clock,
    Users,
    Server,
    Dna,
    ScanLine,
    Heart,
    BarChart3,
} from "lucide-vue-next";

const props = defineProps({
    roomData: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["exit-room"]);

const { gameState, formatTime, getTotalTime } = useGameState();

const getRoomName = (roomId) => {
    const names = {
        server: "SERVEUR",
        "dna-lab": "LAB ADN",
        imaging: "IMAGERIE",
        heart: "CŒUR",
    };
    return names[roomId] || roomId;
};

// Mapping des icônes
const iconMap = {
    server: Server,
    dna: Dna,
    "scan-line": ScanLine,
    heart: Heart,
};

// Fonction pour obtenir le composant d'icône
const getIconComponent = (iconName) => {
    return iconMap[iconName] || Server;
};

onMounted(() => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
</script>

<style scoped>
.scanline {
    position: relative;
    overflow: hidden;
}

.scanline::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #06b6d4, transparent);
    animation: scan 3s linear infinite;
}

@keyframes scan {
    0% {
        left: -100%;
    }
    100% {
        left: 100%;
    }
}
</style>
