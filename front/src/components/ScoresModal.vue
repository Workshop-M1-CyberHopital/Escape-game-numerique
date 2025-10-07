<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" @click.self="handleClose">
        <div class="bg-gray-900/95 border-2 border-cyber-blue rounded-lg p-8 max-w-4xl w-full mx-4 scanline max-h-[90vh] overflow-y-auto" @click.stop>
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-cyber font-bold text-cyber-blue">
                    SCORES & CLASSEMENT
                </h2>
                <button
                    @click="handleClose"
                    class="text-gray-400 hover:text-white transition-colors"
                >
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <!-- Onglets -->
            <div class="flex flex-col sm:flex-row gap-2 mb-4">
                <button
                    @click="activeTab = 'leaderboard'"
                    :class="[
                        'flex-1 px-3 py-2 font-cyber font-bold rounded transition-all flex items-center justify-center',
                        activeTab === 'leaderboard' 
                            ? 'bg-cyber-blue text-black' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                >
                    <i data-lucide="trophy" class="w-4 h-4 mr-1"></i>
                    CLASSEMENT
                </button>
                <button
                    @click="activeTab = 'my-scores'"
                    :class="[
                        'flex-1 px-3 py-2 font-cyber font-bold rounded transition-all flex items-center justify-center',
                        activeTab === 'my-scores' 
                            ? 'bg-cyber-blue text-black' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                >
                    <i data-lucide="user" class="w-4 h-4 mr-1"></i>
                    MES SCORES
                </button>
                <button
                    @click="activeTab = 'stats'"
                    :class="[
                        'flex-1 px-3 py-2 font-cyber font-bold rounded transition-all flex items-center justify-center',
                        activeTab === 'stats' 
                            ? 'bg-cyber-blue text-black' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                >
                    <i data-lucide="bar-chart-3" class="w-4 h-4 mr-1"></i>
                    STATISTIQUES
                </button>
            </div>

            <!-- Contenu des onglets -->
            <div class="space-y-6">
                <!-- Classement -->
                <div v-if="activeTab === 'leaderboard'">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-cyber font-bold text-cyber-blue">
                            CLASSEMENT GLOBAL
                        </h3>
                        <div class="flex gap-2">
                            <select
                                v-model="leaderboardSort"
                                @change="loadLeaderboard"
                                class="px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm"
                            >
                                <option value="score">Score</option>
                                <option value="duration">Durée</option>
                                <option value="date">Date</option>
                                <option value="rooms">Salles</option>
                            </select>
                            <select
                                v-model="leaderboardPeriod"
                                @change="loadLeaderboard"
                                class="px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm"
                            >
                                <option value="all">Tout temps</option>
                                <option value="day">Aujourd'hui</option>
                                <option value="week">Cette semaine</option>
                                <option value="month">Ce mois</option>
                            </select>
                        </div>
                    </div>

                    <div v-if="isLoading" class="text-center py-8">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue"></div>
                        <p class="text-gray-400 font-tech mt-2">Chargement...</p>
                    </div>

                    <div v-else class="space-y-2 max-h-96 overflow-y-auto pr-2">
                        <div
                            v-for="(score, index) in leaderboard"
                            :key="score.id"
                            class="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                        >
                            <div class="flex items-center space-x-4">
                                <div class="text-2xl font-cyber font-bold text-cyber-blue w-8">
                                    {{ score.rank }}
                                </div>
                                <div>
                                    <p class="text-white font-tech font-bold">{{ score.username }}</p>
                                    <p v-if="score.teamName" class="text-gray-400 font-tech text-sm">{{ score.teamName }}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-cyber-green font-cyber font-bold text-xl">{{ formatScore(score.score) }}</p>
                                <p class="text-gray-400 font-tech text-sm">{{ formatDuration(score.duration) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mes scores -->
                <div v-if="activeTab === 'my-scores'">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-cyber font-bold text-cyber-blue">
                            MES SCORES
                        </h3>
                        <div class="flex gap-2">
                            <select
                                v-model="myScoresSort"
                                @change="loadMyScores"
                                class="px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm"
                            >
                                <option value="date">Date</option>
                                <option value="score">Score</option>
                                <option value="duration">Durée</option>
                            </select>
                        </div>
                    </div>

                    <div v-if="isLoading" class="text-center py-8">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue"></div>
                        <p class="text-gray-400 font-tech mt-2">Chargement...</p>
                    </div>

                    <div v-else-if="userScores.length === 0" class="text-center py-8">
                        <p class="text-gray-400 font-tech">Aucun score enregistré</p>
                    </div>

                    <div v-else class="space-y-2 max-h-96 overflow-y-auto pr-2">
                        <div
                            v-for="score in userScores"
                            :key="score.id"
                            class="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                        >
                            <div class="flex items-center space-x-4">
                                <div class="text-cyber-green font-cyber font-bold text-xl">
                                    {{ formatScore(score.score) }}
                                </div>
                                <div>
                                    <p class="text-white font-tech">{{ formatDate(score.submittedAt) }}</p>
                                    <p class="text-gray-400 font-tech text-sm">
                                        {{ score.roomsCompleted }} salles • {{ score.errors }} erreurs • {{ score.hints }} indices
                                    </p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-gray-400 font-tech text-sm">{{ formatDuration(score.duration) }}</p>
                                <button
                                    @click="deleteScore(score.id)"
                                    class="text-red-400 hover:text-red-300 font-tech text-sm"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Statistiques -->
                <div v-if="activeTab === 'stats'">
                    <h3 class="text-lg font-cyber font-bold text-cyber-blue mb-4">
                        STATISTIQUES GLOBALES
                    </h3>

                    <div v-if="isLoading" class="text-center py-8">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue"></div>
                        <p class="text-gray-400 font-tech mt-2">Chargement...</p>
                    </div>

                    <div v-else-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-gray-800/50 rounded-lg p-6">
                            <h4 class="text-cyber-blue font-cyber font-bold mb-2">SCORES TOTAUX</h4>
                            <p class="text-3xl font-cyber font-bold text-white">{{ stats.totalScores }}</p>
                        </div>
                        <div class="bg-gray-800/50 rounded-lg p-6">
                            <h4 class="text-cyber-blue font-cyber font-bold mb-2">SCORE MOYEN</h4>
                            <p class="text-3xl font-cyber font-bold text-cyber-green">{{ formatScore(stats.averageScore) }}</p>
                        </div>
                        <div class="bg-gray-800/50 rounded-lg p-6">
                            <h4 class="text-cyber-blue font-cyber font-bold mb-2">MEILLEUR SCORE</h4>
                            <p class="text-3xl font-cyber font-bold text-cyber-green">{{ formatScore(stats.highestScore) }}</p>
                        </div>
                        <div class="bg-gray-800/50 rounded-lg p-6">
                            <h4 class="text-cyber-blue font-cyber font-bold mb-2">JOUEURS</h4>
                            <p class="text-3xl font-cyber font-bold text-white">{{ stats.totalPlayers }}</p>
                        </div>
                        <div class="bg-gray-800/50 rounded-lg p-6">
                            <h4 class="text-cyber-blue font-cyber font-bold mb-2">DURÉE MOYENNE</h4>
                            <p class="text-3xl font-cyber font-bold text-white">{{ formatDuration(stats.averageDuration) }}</p>
                        </div>
                        <div class="bg-gray-800/50 rounded-lg p-6">
                            <h4 class="text-cyber-blue font-cyber font-bold mb-2">RÉUSSITE</h4>
                            <p class="text-3xl font-cyber font-bold text-cyber-green">{{ stats.completionRate }}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useScores } from '../composables/useScores';
import { useToast } from '../composables/useToast';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close']);

// Fonction pour fermer la modal
const handleClose = () => {
    emit('close');
};

const { 
    leaderboard, 
    userScores, 
    stats, 
    getLeaderboard, 
    getMyScores, 
    getStats, 
    deleteScore: deleteScoreApi,
    formatScore,
    formatDuration
} = useScores();

const { showSuccess, showError } = useToast();

// État des onglets et filtres
const activeTab = ref('leaderboard');
const isLoading = ref(false);
const leaderboardSort = ref('score');
const leaderboardPeriod = ref('all');
const myScoresSort = ref('date');

// Charger le classement
const loadLeaderboard = async () => {
    isLoading.value = true;
    try {
        await getLeaderboard({
            sortBy: leaderboardSort.value,
            period: leaderboardPeriod.value,
            limit: 20
        });
    } catch (error) {
        showError('ERREUR', 'Impossible de charger le classement');
    } finally {
        isLoading.value = false;
    }
};

// Charger mes scores
const loadMyScores = async () => {
    isLoading.value = true;
    try {
        await getMyScores({
            sortBy: myScoresSort.value,
            limit: 20
        });
    } catch (error) {
        showError('ERREUR', 'Impossible de charger vos scores');
    } finally {
        isLoading.value = false;
    }
};

// Charger les statistiques
const loadStats = async () => {
    isLoading.value = true;
    try {
        await getStats();
    } catch (error) {
        showError('ERREUR', 'Impossible de charger les statistiques');
    } finally {
        isLoading.value = false;
    }
};

// Supprimer un score
const deleteScore = async (scoreId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce score ?')) {
        return;
    }

    try {
        await deleteScoreApi(scoreId);
        showSuccess('SCORE SUPPRIMÉ', 'Le score a été supprimé');
        loadMyScores(); // Recharger la liste
    } catch (error) {
        showError('ERREUR', 'Impossible de supprimer le score');
    }
};

// Formater la date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Charger les données selon l'onglet actif
const loadData = () => {
    switch (activeTab.value) {
        case 'leaderboard':
            loadLeaderboard();
            break;
        case 'my-scores':
            loadMyScores();
            break;
        case 'stats':
            loadStats();
            break;
    }
};

// Charger les données quand la modal s'ouvre
watch(() => props.visible, (newVisible) => {
    if (newVisible) {
        loadData();
    }
});

// Recharger les données quand l'onglet change
watch(activeTab, () => {
    loadData();
});

// Gestion de la touche Échap
const handleKeydown = (event) => {
    if (event.key === 'Escape') {
        handleClose();
    }
};

// Ajouter/supprimer l'écouteur de clavier
watch(() => props.visible, (newVisible) => {
    if (newVisible) {
        document.addEventListener('keydown', handleKeydown);
    } else {
        document.removeEventListener('keydown', handleKeydown);
    }
});

// Nettoyer l'écouteur au démontage
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
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
    0% { left: -100%; }
    100% { left: 100%; }
}
</style>
