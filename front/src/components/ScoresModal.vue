<template>
    <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        @click.self="handleClose"
    >
        <div
            class="bg-gray-900/95 border-2 border-cyber-blue rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col scanline"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scores-modal-title"
            @click.stop
        >
            <!-- Header (toujours visible) -->
            <div class="flex items-center justify-between gap-3 px-4 pt-4 pb-3 sm:px-8 sm:pt-6 flex-shrink-0 border-b border-gray-800">
                <h2 id="scores-modal-title" class="text-lg sm:text-2xl font-cyber font-bold text-cyber-blue">
                    SCORES & CLASSEMENT
                </h2>
                <button
                    type="button"
                    @click="handleClose"
                    aria-label="Fermer"
                    title="Fermer"
                    class="flex items-center gap-1 p-2 -mr-2 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex-shrink-0"
                >
                    <X class="w-6 h-6" />
                    <span class="hidden sm:inline font-tech text-sm">Fermer</span>
                </button>
            </div>

            <!-- Contenu défilant -->
            <div class="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">
                <!-- Onglets -->
                <div class="flex flex-col sm:flex-row gap-2 mb-4">
                    <button
                        v-for="tab in tabs"
                        :key="tab.id"
                        type="button"
                        @click="activeTab = tab.id"
                        :class="[
                            'flex-1 px-3 py-2 font-cyber font-bold rounded transition-all flex items-center justify-center text-sm sm:text-base',
                            activeTab === tab.id
                                ? 'bg-cyber-blue text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        ]"
                    >
                        <component :is="tab.icon" class="w-4 h-4 mr-1 flex-shrink-0" />
                        {{ tab.label }}
                    </button>
                </div>

                <!-- Contenu des onglets -->
                <div class="space-y-6">
                    <!-- Classement -->
                    <div v-if="activeTab === 'leaderboard'">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                            <h3 class="text-lg font-cyber font-bold text-cyber-blue">
                                CLASSEMENT GLOBAL
                            </h3>
                            <div class="flex gap-2">
                                <select
                                    v-model="leaderboardSort"
                                    @change="loadLeaderboard"
                                    aria-label="Trier le classement"
                                    class="flex-1 sm:flex-none min-w-0 px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm"
                                >
                                    <option value="score">Note</option>
                                    <option value="duration">Durée</option>
                                    <option value="date">Date</option>
                                    <option value="rooms">Salles</option>
                                </select>
                                <select
                                    v-model="leaderboardPeriod"
                                    @change="loadLeaderboard"
                                    aria-label="Période du classement"
                                    class="flex-1 sm:flex-none min-w-0 px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm"
                                >
                                    <option value="all">Depuis le début</option>
                                    <option value="day">Dernières 24 h</option>
                                    <option value="week">7 derniers jours</option>
                                    <option value="month">30 derniers jours</option>
                                </select>
                            </div>
                        </div>

                        <div v-if="isLoading" class="text-center py-8">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue"></div>
                            <p class="text-gray-400 font-tech mt-2">Chargement...</p>
                        </div>

                        <div v-else-if="leaderboard.length === 0" class="text-center py-8">
                            <p class="text-gray-400 font-tech">Aucun score enregistré pour cette période</p>
                        </div>

                        <div v-else class="space-y-2">
                            <div
                                v-for="(score, index) in leaderboard"
                                :key="score.id || index"
                                class="flex items-center justify-between gap-3 p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                            >
                                <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <div class="text-xl sm:text-2xl font-cyber font-bold text-cyber-blue w-8 flex-shrink-0 text-center">
                                        {{ score.rank || index + 1 }}
                                    </div>
                                    <div class="min-w-0">
                                        <p class="text-white font-tech font-bold truncate">
                                            {{ getTeamName(score) || score.username }}
                                        </p>
                                        <p v-if="getTeamName(score)" class="text-gray-400 font-tech text-sm truncate">
                                            {{ score.username }}
                                        </p>
                                    </div>
                                </div>
                                <div class="text-right flex-shrink-0">
                                    <p class="text-cyber-green font-cyber font-bold text-lg sm:text-xl whitespace-nowrap">
                                        {{ formatScore(getRecordNote(score)) }}
                                    </p>
                                    <p class="text-gray-400 font-tech text-sm whitespace-nowrap">{{ formatDuration(score.duration) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mes scores -->
                    <div v-if="activeTab === 'my-scores'">
                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                            <h3 class="text-lg font-cyber font-bold text-cyber-blue">
                                MES SCORES
                            </h3>
                            <div v-if="isAuthenticated" class="flex gap-2">
                                <select
                                    v-model="myScoresSort"
                                    @change="loadMyScores"
                                    aria-label="Trier mes scores"
                                    class="flex-1 sm:flex-none min-w-0 px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm"
                                >
                                    <option value="date">Date</option>
                                    <option value="score">Note</option>
                                    <option value="duration">Durée</option>
                                </select>
                            </div>
                        </div>

                        <div v-if="!isAuthenticated" class="text-center py-8 space-y-2">
                            <p class="text-gray-300 font-tech">Connectez-vous pour voir vos scores.</p>
                            <p class="text-gray-500 font-tech text-sm">
                                Utilisez le bouton CONNEXION en haut de la page.
                            </p>
                        </div>

                        <div v-else-if="isLoading" class="text-center py-8">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-blue"></div>
                            <p class="text-gray-400 font-tech mt-2">Chargement...</p>
                        </div>

                        <div v-else-if="userScores.length === 0" class="text-center py-8">
                            <p class="text-gray-400 font-tech">Aucun score enregistré</p>
                        </div>

                        <div v-else class="space-y-2">
                            <div
                                v-for="score in userScores"
                                :key="score.id"
                                class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 sm:p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                            >
                                <div class="flex items-center gap-4 min-w-0">
                                    <div class="text-cyber-green font-cyber font-bold text-lg sm:text-xl whitespace-nowrap flex-shrink-0">
                                        {{ formatScore(getRecordNote(score)) }}
                                    </div>
                                    <div class="min-w-0">
                                        <p v-if="getTeamName(score)" class="text-white font-tech font-bold truncate">
                                            {{ getTeamName(score) }}
                                        </p>
                                        <p class="text-gray-300 font-tech text-sm">{{ formatDate(score.submittedAt) }}</p>
                                        <p class="text-gray-400 font-tech text-sm">
                                            {{ score.roomsCompleted }} salles • {{ plural(score.errors, 'erreur') }} • {{ plural(score.hints, 'indice') }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex sm:flex-col items-center sm:items-end justify-between gap-1 flex-shrink-0">
                                    <p class="text-gray-400 font-tech text-sm">{{ formatDuration(score.duration) }}</p>
                                    <button
                                        type="button"
                                        @click="deleteScore(score.id)"
                                        :disabled="deletingId === score.id"
                                        class="flex items-center gap-1 px-2 py-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 font-tech text-sm"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                        {{ deletingId === score.id ? 'Suppression...' : 'Supprimer' }}
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

                        <div v-else-if="stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                            <div class="bg-gray-800/50 rounded-lg p-4 sm:p-6">
                                <h4 class="text-cyber-blue font-cyber font-bold mb-2">PARTIES ENREGISTRÉES</h4>
                                <p class="text-2xl sm:text-3xl font-cyber font-bold text-white">{{ stats.totalScores ?? 0 }}</p>
                            </div>
                            <div class="bg-gray-800/50 rounded-lg p-4 sm:p-6">
                                <h4 class="text-cyber-blue font-cyber font-bold mb-2">NOTE MOYENNE</h4>
                                <p class="text-2xl sm:text-3xl font-cyber font-bold text-cyber-green">{{ stats.totalScores ? formatScore(stats.averageScore) : '—' }}</p>
                            </div>
                            <div class="bg-gray-800/50 rounded-lg p-4 sm:p-6">
                                <h4 class="text-cyber-blue font-cyber font-bold mb-2">MEILLEURE NOTE</h4>
                                <p class="text-2xl sm:text-3xl font-cyber font-bold text-cyber-green">{{ stats.totalScores ? formatScore(stats.highestScore) : '—' }}</p>
                            </div>
                            <div class="bg-gray-800/50 rounded-lg p-4 sm:p-6">
                                <h4 class="text-cyber-blue font-cyber font-bold mb-2">JOUEURS</h4>
                                <p class="text-2xl sm:text-3xl font-cyber font-bold text-white">{{ stats.totalPlayers ?? 0 }}</p>
                            </div>
                            <div class="bg-gray-800/50 rounded-lg p-4 sm:p-6">
                                <h4 class="text-cyber-blue font-cyber font-bold mb-2">DURÉE MOYENNE</h4>
                                <p class="text-2xl sm:text-3xl font-cyber font-bold text-white">{{ stats.totalScores ? formatDuration(stats.averageDuration) : '—' }}</p>
                            </div>
                            <div class="bg-gray-800/50 rounded-lg p-4 sm:p-6">
                                <h4 class="text-cyber-blue font-cyber font-bold mb-2">RÉUSSITE</h4>
                                <p class="text-2xl sm:text-3xl font-cyber font-bold text-cyber-green">{{ stats.completionRate ?? 0 }}%</p>
                            </div>
                        </div>

                        <div v-else class="text-center py-8">
                            <p class="text-gray-400 font-tech">Statistiques indisponibles</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';
import { X, Trophy, User, BarChart3, Trash2 } from 'lucide-vue-next';
import { useScores } from '../composables/useScores';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close']);

const tabs = [
    { id: 'leaderboard', label: 'CLASSEMENT', icon: Trophy },
    { id: 'my-scores', label: 'MES SCORES', icon: User },
    { id: 'stats', label: 'STATISTIQUES', icon: BarChart3 },
];

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
    resetUserScores,
    getRecordNote,
    formatScore,
    formatDuration
} = useScores();

const { isAuthenticated } = useAuth();
const { showSuccess, showError } = useToast();

// État des onglets et filtres
const activeTab = ref('leaderboard');
const isLoading = ref(false);
const leaderboardSort = ref('score');
const leaderboardPeriod = ref('all');
const myScoresSort = ref('date');
const deletingId = ref(null);

// Seule la dernière requête lancée pilote l'indicateur de chargement
let loadSequence = 0;
const runLoad = async (loader, errorMessage) => {
    const requestId = ++loadSequence;
    isLoading.value = true;
    try {
        await loader();
    } catch (error) {
        if (requestId === loadSequence) {
            showError('ERREUR', errorMessage);
        }
    } finally {
        if (requestId === loadSequence) {
            isLoading.value = false;
        }
    }
};

// Charger le classement
const loadLeaderboard = () =>
    runLoad(
        () => getLeaderboard({
            sortBy: leaderboardSort.value,
            period: leaderboardPeriod.value,
            limit: 20
        }),
        'Impossible de charger le classement'
    );

// Charger mes scores (uniquement si connecté)
const loadMyScores = () => {
    if (!isAuthenticated.value) {
        loadSequence++;
        isLoading.value = false;
        resetUserScores();
        return;
    }
    return runLoad(
        () => getMyScores({
            sortBy: myScoresSort.value,
            limit: 20
        }),
        'Impossible de charger vos scores'
    );
};

// Charger les statistiques
const loadStats = () => runLoad(() => getStats(), 'Impossible de charger les statistiques');

// Supprimer un score
const deleteScore = async (scoreId) => {
    if (deletingId.value) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce score ?')) {
        return;
    }

    deletingId.value = scoreId;
    try {
        await deleteScoreApi(scoreId);
        showSuccess('SCORE SUPPRIMÉ', 'Le score a été supprimé');
        loadMyScores(); // Recharger la liste
    } catch (error) {
        showError('ERREUR', 'Impossible de supprimer le score');
    } finally {
        deletingId.value = null;
    }
};

// Nom d'équipe d'un score (stocké à la racine, ou dans gameData pour les anciens enregistrements)
const getTeamName = (score) => {
    const name = score?.teamName ?? score?.gameData?.teamName;
    return typeof name === 'string' ? name.trim() : '';
};

const plural = (count, word) => {
    const n = Number(count) || 0;
    return `${n} ${word}${n > 1 ? 's' : ''}`;
};

// Formater la date
const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('fr-FR', {
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

// Gestion de la touche Échap
const handleKeydown = (event) => {
    if (event.key === 'Escape') {
        handleClose();
    }
};

// Ouverture / fermeture : chargement des données et écouteur clavier
watch(
    () => props.visible,
    (newVisible) => {
        if (newVisible) {
            document.addEventListener('keydown', handleKeydown);
            loadData();
        } else {
            document.removeEventListener('keydown', handleKeydown);
        }
    },
    { immediate: true }
);

// Recharger les données quand l'onglet change
watch(activeTab, () => {
    if (props.visible) loadData();
});

// Connexion / déconnexion pendant que la modale est ouverte
watch(isAuthenticated, () => {
    if (props.visible && activeTab.value === 'my-scores') {
        loadMyScores();
    }
});

// Nettoyer l'écouteur au démontage
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Le défilement est géré par le contenu interne : la carte ne fait que rogner la ligne de scan */
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
    pointer-events: none;
    z-index: 1;
}

@keyframes scan {
    0% { left: -100%; }
    100% { left: 100%; }
}
</style>
