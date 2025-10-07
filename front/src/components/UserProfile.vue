<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" @click.self="handleClose">
        <div class="bg-gray-900/95 border-2 border-cyber-blue rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto scanline" @click.stop>
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-cyber font-bold text-cyber-blue">
                    PROFIL UTILISATEUR
                </h2>
                <button
                    @click="handleClose"
                    class="text-gray-400 hover:text-white transition-colors"
                >
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <div v-if="user" class="space-y-6">
                <!-- Informations utilisateur -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Profil -->
                    <div class="bg-gray-800/30 border border-cyber-blue/20 rounded-lg p-4">
                        <h3 class="text-lg font-cyber font-bold text-cyber-blue mb-3 flex items-center">
                            <i data-lucide="user" class="w-5 h-5 mr-2"></i>
                            INFORMATIONS
                        </h3>
                        <div class="space-y-2">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-700/50">
                                <label class="text-sm font-tech text-gray-400">Nom d'utilisateur</label>
                                <p class="text-white font-tech text-sm">{{ user.username }}</p>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-700/50">
                                <label class="text-sm font-tech text-gray-400">Email</label>
                                <p class="text-white font-tech text-sm break-all">{{ user.email }}</p>
                            </div>
                            <div v-if="user.teamName" class="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-700/50">
                                <label class="text-sm font-tech text-gray-400">Équipe</label>
                                <p class="text-white font-tech text-sm">{{ user.teamName }}</p>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                                <label class="text-sm font-tech text-gray-400">Membre depuis</label>
                                <p class="text-white font-tech text-sm">{{ formatDate(user.createdAt) }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Statistiques -->
                    <div class="bg-gray-800/30 border border-cyber-green/20 rounded-lg p-4">
                        <h3 class="text-lg font-cyber font-bold text-cyber-green mb-3 flex items-center">
                            <i data-lucide="bar-chart-3" class="w-5 h-5 mr-2"></i>
                            STATISTIQUES
                        </h3>
                        <div class="space-y-2">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-700/50">
                                <label class="text-sm font-tech text-gray-400">Parties jouées</label>
                                <p class="text-white font-tech text-lg">{{ user.gamesPlayed || 0 }}</p>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-700/50">
                                <label class="text-sm font-tech text-gray-400">Meilleur score</label>
                                <p class="text-cyber-green font-tech text-lg">{{ formatScore(user.bestScore || 0) }}</p>
                            </div>
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-700/50">
                                <label class="text-sm font-tech text-gray-400">Score total</label>
                                <p class="text-white font-tech text-lg">{{ formatScore(user.totalScore || 0) }}</p>
                            </div>
                            <div v-if="user.gamesPlayed > 0" class="flex flex-col sm:flex-row sm:items-center justify-between py-2">
                                <label class="text-sm font-tech text-gray-400">Score moyen</label>
                                <p class="text-white font-tech text-lg">{{ formatScore(Math.round((user.totalScore || 0) / user.gamesPlayed)) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-col sm:flex-row gap-3">
                    <button
                        @click="openEditProfile"
                        class="flex-1 px-4 py-3 bg-cyber-blue hover:bg-cyber-blue/80 text-black font-cyber font-bold rounded-lg transition-all flex items-center justify-center"
                    >
                        <i data-lucide="edit" class="w-4 h-4 mr-2"></i>
                        MODIFIER LE PROFIL
                    </button>
                    <button
                        @click="openChangePassword"
                        class="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-600/80 text-black font-cyber font-bold rounded-lg transition-all flex items-center justify-center"
                    >
                        <i data-lucide="key" class="w-4 h-4 mr-2"></i>
                        CHANGER LE MOT DE PASSE
                    </button>
                    <button
                        @click="handleDeleteAccountClick"
                        :disabled="gameState.isGameStarted"
                        :class="[
                            'flex-1 px-4 py-3 font-cyber font-bold rounded-lg transition-all flex items-center justify-center',
                            gameState.isGameStarted
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-600/80 text-white'
                        ]"
                        :title="gameState.isGameStarted ? 'Impossible de supprimer le compte pendant une partie' : 'Supprimer le compte'"
                    >
                        <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i>
                        SUPPRIMER LE COMPTE
                    </button>
                </div>
            </div>

            <!-- Modifier le profil -->
            <div v-if="showEditProfile" class="mt-4 bg-gray-800/30 border border-cyber-blue/20 rounded-lg p-4">
                <h3 class="text-lg font-cyber font-bold text-cyber-blue mb-3 flex items-center">
                    <i data-lucide="edit" class="w-5 h-5 mr-2"></i>
                    MODIFIER LE PROFIL
                </h3>
                <form @submit.prevent="updateProfile" class="space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-tech text-gray-300 mb-1">
                                Nom d'utilisateur
                            </label>
                            <input
                                v-model="editForm.username"
                                type="text"
                                required
                                class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-tech text-gray-300 mb-1">
                                Nom d'équipe
                            </label>
                            <input
                                v-model="editForm.teamName"
                                type="text"
                                class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                            />
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <button
                            type="submit"
                            :disabled="isLoading"
                            class="flex-1 px-3 py-2 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded transition-all flex items-center justify-center"
                        >
                            <i data-lucide="save" class="w-4 h-4 mr-1"></i>
                            {{ isLoading ? 'SAUVEGARDE...' : 'SAUVEGARDER' }}
                        </button>
                        <button
                            type="button"
                            @click="showEditProfile = false"
                            class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-600/80 text-white font-cyber font-bold rounded transition-all flex items-center justify-center"
                        >
                            <i data-lucide="x" class="w-4 h-4 mr-1"></i>
                            ANNULER
                        </button>
                    </div>
                </form>
            </div>

            <!-- Changer le mot de passe -->
            <div v-if="showChangePassword" class="mt-4 bg-gray-800/30 border border-yellow-500/20 rounded-lg p-4">
                <h3 class="text-lg font-cyber font-bold text-yellow-500 mb-3 flex items-center">
                    <i data-lucide="key" class="w-5 h-5 mr-2"></i>
                    CHANGER LE MOT DE PASSE
                </h3>
                <form @submit.prevent="changePassword" class="space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-tech text-gray-300 mb-1">
                                Mot de passe actuel
                            </label>
                            <input
                                v-model="passwordForm.currentPassword"
                                type="password"
                                required
                                class="w-full px-3 py-2 bg-black/50 border border-yellow-500/30 rounded text-white font-tech text-sm focus:outline-none focus:border-yellow-500 transition-all"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-tech text-gray-300 mb-1">
                                Nouveau mot de passe
                            </label>
                            <input
                                v-model="passwordForm.newPassword"
                                type="password"
                                required
                                class="w-full px-3 py-2 bg-black/50 border border-yellow-500/30 rounded text-white font-tech text-sm focus:outline-none focus:border-yellow-500 transition-all"
                            />
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <button
                            type="submit"
                            :disabled="isLoading"
                            class="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-600/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded transition-all flex items-center justify-center"
                        >
                            <i data-lucide="key" class="w-4 h-4 mr-1"></i>
                            {{ isLoading ? 'CHANGEMENT...' : 'CHANGER' }}
                        </button>
                        <button
                            type="button"
                            @click="showChangePassword = false"
                            class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-600/80 text-white font-cyber font-bold rounded transition-all flex items-center justify-center"
                        >
                            <i data-lucide="x" class="w-4 h-4 mr-1"></i>
                            ANNULER
                        </button>
                    </div>
                </form>
            </div>

            <!-- Supprimer le compte -->
            <div v-if="showDeleteAccount" class="mt-4 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <h3 class="text-lg font-cyber font-bold text-red-500 mb-3 flex items-center">
                    <i data-lucide="trash-2" class="w-5 h-5 mr-2"></i>
                    SUPPRIMER LE COMPTE
                </h3>
                <p class="text-gray-300 mb-3 text-sm">
                    ⚠️ Cette action est irréversible. Toutes vos données seront supprimées.
                </p>
                <form @submit.prevent="deleteAccount" class="space-y-3">
                    <div>
                        <label class="block text-sm font-tech text-gray-300 mb-1">
                            Confirmer avec votre mot de passe
                        </label>
                        <input
                            v-model="deleteForm.password"
                            type="password"
                            required
                            class="w-full px-3 py-2 bg-black/50 border border-red-500/30 rounded text-white font-tech text-sm focus:outline-none focus:border-red-500 transition-all"
                        />
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <button
                            type="submit"
                            :disabled="isLoading"
                            class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-600/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-cyber font-bold rounded transition-all flex items-center justify-center"
                        >
                            <i data-lucide="trash-2" class="w-4 h-4 mr-1"></i>
                            {{ isLoading ? 'SUPPRESSION...' : 'SUPPRIMER DÉFINITIVEMENT' }}
                        </button>
                        <button
                            type="button"
                            @click="showDeleteAccount = false"
                            class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-600/80 text-white font-cyber font-bold rounded transition-all flex items-center justify-center"
                        >
                            <i data-lucide="x" class="w-4 h-4 mr-1"></i>
                            ANNULER
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onUnmounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    gameState: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['close']);

// Fonction pour fermer la modal
const handleClose = () => {
    // Fermer tous les sous-menus
    showEditProfile.value = false;
    showChangePassword.value = false;
    showDeleteAccount.value = false;
    emit('close');
};

// Fonction pour gérer le clic sur supprimer le compte
const handleDeleteAccountClick = () => {
    if (gameState.isGameStarted) {
        showWarning('Impossible de supprimer le compte pendant une partie active. Terminez d\'abord la partie.');
        return;
    }
    openDeleteAccount();
};

const { user, updateProfile, changePassword, deleteAccount, getUserStats } = useAuth();
const { showSuccess, showError, showWarning } = useToast();

// État des formulaires
const showEditProfile = ref(false);
const showChangePassword = ref(false);
const showDeleteAccount = ref(false);
const isLoading = ref(false);

const editForm = reactive({
    username: '',
    teamName: ''
});

const passwordForm = reactive({
    currentPassword: '',
    newPassword: ''
});

const deleteForm = reactive({
    password: ''
});

// Initialiser les formulaires
const initForms = () => {
    if (user.value) {
        editForm.username = user.value.username;
        editForm.teamName = user.value.teamName || '';
    }
};

// Ouvrir le formulaire de modification du profil
const openEditProfile = () => {
    showEditProfile.value = true;
    showChangePassword.value = false;
    showDeleteAccount.value = false;
};

// Mettre à jour le profil
const updateProfileHandler = async () => {
    isLoading.value = true;
    try {
        await updateProfile(editForm);
        showSuccess('PROFIL MIS À JOUR', 'Vos informations ont été modifiées');
        showEditProfile.value = false;
    } catch (error) {
        showError('ERREUR', error.message);
    } finally {
        isLoading.value = false;
    }
};

// Ouvrir le formulaire de changement de mot de passe
const openChangePassword = () => {
    showChangePassword.value = true;
    showEditProfile.value = false;
    showDeleteAccount.value = false;
};

// Changer le mot de passe
const changePasswordHandler = async () => {
    isLoading.value = true;
    try {
        await changePassword(passwordForm);
        showSuccess('MOT DE PASSE CHANGÉ', 'Votre mot de passe a été modifié');
        showChangePassword.value = false;
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
    } catch (error) {
        showError('ERREUR', error.message);
    } finally {
        isLoading.value = false;
    }
};

// Ouvrir le formulaire de suppression de compte
const openDeleteAccount = () => {
    showDeleteAccount.value = true;
    showEditProfile.value = false;
    showChangePassword.value = false;
};

// Supprimer le compte
const deleteAccountHandler = async () => {
    isLoading.value = true;
    try {
        await deleteAccount(deleteForm.password);
        showSuccess('COMPTE SUPPRIMÉ', 'Votre compte a été supprimé');
        emit('close');
    } catch (error) {
        showError('ERREUR', error.message);
    } finally {
        isLoading.value = false;
    }
};

// Formater la date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
};

// Formater le score
const formatScore = (score) => {
    return score.toLocaleString('fr-FR');
};

// Charger les statistiques utilisateur
const loadUserStats = async () => {
    try {
        const stats = await getUserStats();
        // Mettre à jour les données utilisateur avec les statistiques
        if (stats) {
            user.value.gamesPlayed = stats.gamesPlayed || 0;
            user.value.bestScore = stats.bestScore || 0;
            user.value.totalScore = stats.totalScore || 0;
        }
    } catch (error) {
        console.error('Erreur chargement stats utilisateur:', error);
    }
};

// Initialiser les formulaires quand la modal s'ouvre
watch(() => props.visible, (newVisible) => {
    if (newVisible) {
        initForms();
        loadUserStats(); // Charger les statistiques utilisateur
    } else {
        // Fermer tous les sous-menus quand la modal se ferme
        showEditProfile.value = false;
        showChangePassword.value = false;
        showDeleteAccount.value = false;
    }
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
