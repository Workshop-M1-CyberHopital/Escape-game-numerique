<template>
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-gray-900/95 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto scanline">
            <!-- Header -->
            <div class="text-center mb-8">
                <div class="flex items-center justify-center gap-3 mb-4">
                    <i data-lucide="trophy" class="w-8 h-8 text-cyber-blue"></i>
                    <h1 class="text-4xl font-cyber font-bold text-cyber-blue">
                        SCORE FINAL
                    </h1>
                </div>
                <div class="text-cyber-green font-tech text-lg">
                    Équipe : {{ scoreData.teamName }}
                </div>
            </div>

            <!-- Score principal -->
            <div class="text-center mb-8">
                <div class="text-8xl font-cyber font-bold text-cyber-blue mb-4">
                    {{ scoreData.score }}/20
                </div>
                <div class="text-2xl font-cyber font-bold mb-2" :class="getScoreColor()">
                    {{ getAppreciation() }}
                </div>
                <div class="text-gray-300 font-tech">
                    {{ getComment() }}
                </div>
            </div>

            <!-- Détails des scores -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <!-- Score Rapidité -->
                <div class="bg-gray-800/50 border border-cyber-blue/30 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <i data-lucide="clock" class="w-5 h-5 text-cyber-blue"></i>
                        <h3 class="font-cyber font-bold text-cyber-blue">RAPIDITÉ</h3>
                    </div>
                    <div class="text-3xl font-cyber font-bold text-cyber-blue mb-2">
                        {{ scoreData.timeScore.toFixed(1) }}/8
                    </div>
                    <div class="text-sm text-gray-400 font-tech">
                        Temps : {{ formatTime(scoreData.totalTime) }}
                    </div>
                </div>

                <!-- Score Précision -->
                <div class="bg-gray-800/50 border border-red-500/30 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <i data-lucide="target" class="w-5 h-5 text-red-500"></i>
                        <h3 class="font-cyber font-bold text-red-500">PRÉCISION</h3>
                    </div>
                    <div class="text-3xl font-cyber font-bold text-red-500 mb-2">
                        {{ scoreData.errorScore.toFixed(1) }}/7
                    </div>
                    <div class="text-sm text-gray-400 font-tech">
                        Erreurs : {{ scoreData.errors }}
                    </div>
                </div>

                <!-- Score Autonomie -->
                <div class="bg-gray-800/50 border border-yellow-500/30 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <i data-lucide="lightbulb" class="w-5 h-5 text-yellow-500"></i>
                        <h3 class="font-cyber font-bold text-yellow-500">AUTONOMIE</h3>
                    </div>
                    <div class="text-3xl font-cyber font-bold text-yellow-500 mb-2">
                        {{ scoreData.hintScore.toFixed(1) }}/5
                    </div>
                    <div class="text-sm text-gray-400 font-tech">
                        Indices : {{ scoreData.hints }}
                    </div>
                </div>
            </div>

            <!-- Statistiques par salle -->
            <div class="mb-8">
                <h3 class="text-xl font-cyber font-bold text-white mb-4 flex items-center gap-2">
                    <i data-lucide="bar-chart-3" class="w-5 h-5 text-cyber-green"></i>
                    STATISTIQUES PAR SALLE
                </h3>
                <div class="space-y-3">
                    <div
                        v-for="room in ['server', 'dna-lab', 'imaging']"
                        :key="room"
                        class="bg-gray-800/40 rounded-lg p-4"
                    >
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-cyber font-bold text-gray-300">
                                {{ getRoomName(room) }}
                            </span>
                            <span class="font-tech text-sm text-gray-500">
                                {{ formatTime(scoreData.roomTimes[room] || 0) }}
                            </span>
                        </div>
                        <div class="flex gap-4 text-sm">
                            <span class="text-red-400">
                                ❌ {{ scoreData.roomErrors[room] || 0 }}
                            </span>
                            <span class="text-yellow-400">
                                💡 {{ scoreData.roomHints[room] || 0 }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Barème explicatif -->
            <div class="bg-gray-800/30 border border-gray-600 rounded-lg p-4 mb-8">
                <h4 class="font-cyber font-bold text-gray-300 mb-3">BARÈME DE NOTATION</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="text-center">
                        <div class="font-cyber font-bold text-cyber-blue">18-20</div>
                        <div class="text-gray-400">EXCELLENT 🏆</div>
                    </div>
                    <div class="text-center">
                        <div class="font-cyber font-bold text-cyber-green">16-18</div>
                        <div class="text-gray-400">TRÈS BIEN 🌟</div>
                    </div>
                    <div class="text-center">
                        <div class="font-cyber font-bold text-yellow-500">14-16</div>
                        <div class="text-gray-400">BIEN ✨</div>
                    </div>
                    <div class="text-center">
                        <div class="font-cyber font-bold text-orange-500">12-14</div>
                        <div class="text-gray-400">ASSEZ BIEN 👍</div>
                    </div>
                    <div class="text-center">
                        <div class="font-cyber font-bold text-red-500">10-12</div>
                        <div class="text-gray-400">PASSABLE 💪</div>
                    </div>
                    <div class="text-center col-span-2">
                        <div class="font-cyber font-bold text-red-600">0-10</div>
                        <div class="text-gray-400">À AMÉLIORER 📚</div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-4 justify-center">
                <button
                    @click="$emit('restart')"
                    class="px-8 py-3 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all"
                >
                    RECOMMENCER
                </button>
                <button
                    @click="$emit('close')"
                    class="px-8 py-3 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 font-cyber font-bold rounded-lg transition-all"
                >
                    FERMER
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from "vue";

const props = defineProps({
    scoreData: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(["close", "restart"]);

const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const getRoomName = (roomId) => {
    const names = {
        server: "SALLE DU SERVEUR",
        "dna-lab": "LABORATOIRE ADN",
        imaging: "SALLE D'IMAGERIE",
    };
    return names[roomId] || roomId;
};

const getScoreColor = () => {
    const score = props.scoreData.score;
    if (score >= 18) return "text-cyber-blue";
    if (score >= 16) return "text-cyber-green";
    if (score >= 14) return "text-yellow-500";
    if (score >= 12) return "text-orange-500";
    if (score >= 10) return "text-red-500";
    return "text-red-600";
};

const getAppreciation = () => {
    const score = props.scoreData.score;
    if (score >= 18) return "EXCELLENT";
    if (score >= 16) return "TRÈS BIEN";
    if (score >= 14) return "BIEN";
    if (score >= 12) return "ASSEZ BIEN";
    if (score >= 10) return "PASSABLE";
    return "À AMÉLIORER";
};

const getComment = () => {
    const score = props.scoreData.score;
    if (score >= 18) return "Performance exceptionnelle ! Vous maîtrisez parfaitement les enjeux de cybersécurité.";
    if (score >= 16) return "Très bonne performance. Quelques détails à peaufiner.";
    if (score >= 14) return "Bonne compréhension des concepts. Continuez ainsi !";
    if (score >= 12) return "Résultats corrects. Il reste des points à améliorer.";
    if (score >= 10) return "Performance acceptable. Plus d'attention aux détails serait bénéfique.";
    return "Des efforts supplémentaires sont nécessaires pour maîtriser ces concepts.";
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
