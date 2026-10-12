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
            aria-labelledby="user-profile-title"
            @click.stop
        >
            <!-- Header (toujours visible) -->
            <div class="flex items-center justify-between gap-3 px-4 pt-4 pb-3 sm:px-6 sm:pt-6 flex-shrink-0 border-b border-gray-800">
                <h2 id="user-profile-title" class="text-lg sm:text-2xl font-cyber font-bold text-cyber-blue">
                    PROFIL UTILISATEUR
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
            <div class="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                <div v-if="user" class="space-y-6">
                    <!-- Informations utilisateur -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <!-- Profil -->
                        <div class="bg-gray-800/30 border border-cyber-blue/20 rounded-lg p-4">
                            <h3 class="text-lg font-cyber font-bold text-cyber-blue mb-3 flex items-center">
                                <UserIcon class="w-5 h-5 mr-2 flex-shrink-0" />
                                INFORMATIONS
                            </h3>
                            <div class="space-y-2">
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-gray-700/50">
                                    <span class="text-sm font-tech text-gray-400">Nom d'utilisateur</span>
                                    <p class="text-white font-tech text-sm break-all">{{ user.username }}</p>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-gray-700/50">
                                    <span class="text-sm font-tech text-gray-400">Email</span>
                                    <p class="text-white font-tech text-sm break-all">{{ user.email }}</p>
                                </div>
                                <div v-if="user.teamName" class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-gray-700/50">
                                    <span class="text-sm font-tech text-gray-400">Équipe</span>
                                    <p class="text-white font-tech text-sm break-all">{{ user.teamName }}</p>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2">
                                    <span class="text-sm font-tech text-gray-400">Membre depuis</span>
                                    <p class="text-white font-tech text-sm">{{ formatDate(memberSince) }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Statistiques -->
                        <div class="bg-gray-800/30 border border-cyber-green/20 rounded-lg p-4">
                            <h3 class="text-lg font-cyber font-bold text-cyber-green mb-3 flex items-center">
                                <BarChart3 class="w-5 h-5 mr-2 flex-shrink-0" />
                                STATISTIQUES
                            </h3>
                            <div class="space-y-2">
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-gray-700/50">
                                    <span class="text-sm font-tech text-gray-400">Parties jouées</span>
                                    <p class="text-white font-tech text-lg">{{ profileStats.gamesPlayed }}</p>
                                </div>
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2 border-b border-gray-700/50">
                                    <span class="text-sm font-tech text-gray-400">Meilleure note</span>
                                    <p class="text-cyber-green font-tech text-lg">
                                        {{ profileStats.gamesPlayed > 0 ? formatScore(profileStats.bestScore) : '—' }}
                                    </p>
                                </div>
                                <div v-if="profileStats.gamesPlayed > 0" class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-2">
                                    <span class="text-sm font-tech text-gray-400">Note moyenne</span>
                                    <p class="text-white font-tech text-lg">{{ formatScore(profileStats.averageScore) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            @click="openEditProfile"
                            class="flex-1 px-4 py-3 bg-cyber-blue hover:bg-cyber-blue/80 text-black font-cyber font-bold rounded-lg transition-all flex items-center justify-center text-sm sm:text-base"
                        >
                            <Pencil class="w-4 h-4 mr-2 flex-shrink-0" />
                            MODIFIER LE PROFIL
                        </button>
                        <button
                            type="button"
                            @click="openChangePassword"
                            class="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-600/80 text-black font-cyber font-bold rounded-lg transition-all flex items-center justify-center text-sm sm:text-base"
                        >
                            <Key class="w-4 h-4 mr-2 flex-shrink-0" />
                            CHANGER LE MOT DE PASSE
                        </button>
                        <button
                            type="button"
                            @click="handleDeleteAccountClick"
                            :aria-disabled="isGameInProgress"
                            :class="[
                                'flex-1 px-4 py-3 font-cyber font-bold rounded-lg transition-all flex items-center justify-center text-sm sm:text-base',
                                isGameInProgress
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-600/80 text-white'
                            ]"
                            :title="isGameInProgress ? 'Impossible de supprimer le compte pendant une partie' : 'Supprimer le compte'"
                        >
                            <Trash2 class="w-4 h-4 mr-2 flex-shrink-0" />
                            SUPPRIMER LE COMPTE
                        </button>
                    </div>
                </div>

                <!-- Modifier le profil -->
                <div v-if="user && showEditProfile" class="mt-4 bg-gray-800/30 border border-cyber-blue/20 rounded-lg p-4">
                    <h3 class="text-lg font-cyber font-bold text-cyber-blue mb-3 flex items-center">
                        <Pencil class="w-5 h-5 mr-2 flex-shrink-0" />
                        MODIFIER LE PROFIL
                    </h3>
                    <form @submit.prevent="updateProfileHandler" class="space-y-3">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label for="profile-username" class="block text-sm font-tech text-gray-300 mb-1">
                                    Nom d'utilisateur
                                </label>
                                <input
                                    id="profile-username"
                                    v-model="editForm.username"
                                    type="text"
                                    required
                                    :minlength="USERNAME_MIN"
                                    :maxlength="USERNAME_MAX"
                                    autocomplete="username"
                                    class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                                />
                            </div>
                            <div>
                                <label for="profile-team" class="block text-sm font-tech text-gray-300 mb-1">
                                    Nom d'équipe
                                </label>
                                <input
                                    id="profile-team"
                                    v-model="editForm.teamName"
                                    type="text"
                                    maxlength="50"
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
                                <Save class="w-4 h-4 mr-1 flex-shrink-0" />
                                {{ isLoading ? 'SAUVEGARDE...' : 'SAUVEGARDER' }}
                            </button>
                            <button
                                type="button"
                                @click="showEditProfile = false"
                                class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-600/80 text-white font-cyber font-bold rounded transition-all flex items-center justify-center"
                            >
                                <X class="w-4 h-4 mr-1 flex-shrink-0" />
                                ANNULER
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Changer le mot de passe -->
                <div v-if="user && showChangePassword" class="mt-4 bg-gray-800/30 border border-yellow-500/20 rounded-lg p-4">
                    <h3 class="text-lg font-cyber font-bold text-yellow-500 mb-3 flex items-center">
                        <Key class="w-5 h-5 mr-2 flex-shrink-0" />
                        CHANGER LE MOT DE PASSE
                    </h3>
                    <form @submit.prevent="changePasswordHandler" class="space-y-3">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label for="profile-current-password" class="block text-sm font-tech text-gray-300 mb-1">
                                    Mot de passe actuel
                                </label>
                                <input
                                    id="profile-current-password"
                                    v-model="passwordForm.currentPassword"
                                    type="password"
                                    required
                                    autocomplete="current-password"
                                    class="w-full px-3 py-2 bg-black/50 border border-yellow-500/30 rounded text-white font-tech text-sm focus:outline-none focus:border-yellow-500 transition-all"
                                />
                            </div>
                            <div>
                                <label for="profile-new-password" class="block text-sm font-tech text-gray-300 mb-1">
                                    Nouveau mot de passe
                                </label>
                                <input
                                    id="profile-new-password"
                                    v-model="passwordForm.newPassword"
                                    type="password"
                                    required
                                    :minlength="PASSWORD_MIN"
                                    :maxlength="PASSWORD_MAX"
                                    autocomplete="new-password"
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
                                <Key class="w-4 h-4 mr-1 flex-shrink-0" />
                                {{ isLoading ? 'CHANGEMENT...' : 'CHANGER' }}
                            </button>
                            <button
                                type="button"
                                @click="closeChangePassword"
                                class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-600/80 text-white font-cyber font-bold rounded transition-all flex items-center justify-center"
                            >
                                <X class="w-4 h-4 mr-1 flex-shrink-0" />
                                ANNULER
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Supprimer le compte -->
                <div v-if="user && showDeleteAccount" class="mt-4 bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <h3 class="text-lg font-cyber font-bold text-red-500 mb-3 flex items-center">
                        <Trash2 class="w-5 h-5 mr-2 flex-shrink-0" />
                        SUPPRIMER LE COMPTE
                    </h3>
                    <p class="text-gray-300 mb-3 text-sm flex items-start gap-2">
                        <AlertTriangle class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        Cette action est irréversible. Toutes vos données seront supprimées.
                    </p>
                    <form @submit.prevent="deleteAccountHandler" class="space-y-3">
                        <div>
                            <label for="profile-delete-password" class="block text-sm font-tech text-gray-300 mb-1">
                                Confirmer avec votre mot de passe
                            </label>
                            <input
                                id="profile-delete-password"
                                v-model="deleteForm.password"
                                type="password"
                                required
                                autocomplete="current-password"
                                class="w-full px-3 py-2 bg-black/50 border border-red-500/30 rounded text-white font-tech text-sm focus:outline-none focus:border-red-500 transition-all"
                            />
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <button
                                type="submit"
                                :disabled="isLoading"
                                class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-600/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-cyber font-bold rounded transition-all flex items-center justify-center"
                            >
                                <Trash2 class="w-4 h-4 mr-1 flex-shrink-0" />
                                {{ isLoading ? 'SUPPRESSION...' : 'SUPPRIMER DÉFINITIVEMENT' }}
                            </button>
                            <button
                                type="button"
                                @click="closeDeleteAccount"
                                class="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-600/80 text-white font-cyber font-bold rounded transition-all flex items-center justify-center"
                            >
                                <X class="w-4 h-4 mr-1 flex-shrink-0" />
                                ANNULER
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onUnmounted } from 'vue';
import { X, User as UserIcon, BarChart3, Pencil, Key, Trash2, Save, AlertTriangle } from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';
import { useScores } from '../composables/useScores';
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

const auth = useAuth();
const { user, updateProfile, changePassword, deleteAccount, getUserStats } = auth;
const { formatScore } = useScores();
const { showSuccess, showError, showWarning } = useToast();

// Règles identiques à celles du serveur (back/utils/validation.js)
const USERNAME_MIN = 2;
const USERNAME_MAX = 30;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 128;

// État des formulaires
const showEditProfile = ref(false);
const showChangePassword = ref(false);
const showDeleteAccount = ref(false);
const isLoading = ref(false);

// Statistiques chargées depuis /users/stats (repli si refreshUser() n'est pas disponible)
const fetchedStats = ref(null);

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

// Même règle que App.vue : partie lancée et pas encore terminée
const isGameInProgress = computed(() => Boolean(props.gameState?.isGameStarted && !props.gameState?.isGameOver));

const memberSince = computed(() => user.value?.createdAt || fetchedStats.value?.memberSince || null);

const profileStats = computed(() => {
    const source = { ...(user.value || {}), ...(fetchedStats.value || {}) };
    const gamesPlayed = Math.max(0, Number(source.gamesPlayed) || 0);
    const totalScore = Number(source.totalScore) || 0;
    const serverAverage = source.averageScore == null ? NaN : Number(source.averageScore);
    const averageScore = Number.isFinite(serverAverage)
        ? serverAverage
        : (gamesPlayed > 0 ? Math.round((totalScore / gamesPlayed) * 10) / 10 : 0);
    return {
        gamesPlayed,
        bestScore: Number(source.bestScore) || 0,
        averageScore,
    };
});

const clearPasswordFields = () => {
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    deleteForm.password = '';
};

const closeSubForms = () => {
    showEditProfile.value = false;
    showChangePassword.value = false;
    showDeleteAccount.value = false;
    clearPasswordFields();
};

// Fermer la modale : une seule émission même si la déconnexion (suppression du compte)
// et le gestionnaire demandent la fermeture dans le même cycle
let closeRequested = false;
const handleClose = () => {
    closeSubForms();
    if (closeRequested) return;
    closeRequested = true;
    emit('close');
    setTimeout(() => {
        closeRequested = false;
    }, 0);
};

// Initialiser les formulaires
const initForms = () => {
    if (user.value) {
        editForm.username = user.value.username || '';
        editForm.teamName = user.value.teamName || '';
    }
};

// Ouvrir le formulaire de modification du profil
const openEditProfile = () => {
    closeSubForms();
    initForms();
    showEditProfile.value = true;
};

// Mettre à jour le profil
const updateProfileHandler = async () => {
    if (isLoading.value) return;
    const username = editForm.username.trim();
    const teamName = editForm.teamName.trim();
    if (!username) {
        showError('ERREUR', "Le nom d'utilisateur est obligatoire");
        return;
    }
    if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
        showError('ERREUR', `Le nom d'utilisateur doit contenir entre ${USERNAME_MIN} et ${USERNAME_MAX} caractères`);
        return;
    }

    isLoading.value = true;
    try {
        await updateProfile({ username, teamName });
        showSuccess('PROFIL MIS À JOUR', 'Vos informations ont été modifiées');
        showEditProfile.value = false;
    } catch (error) {
        showError('ERREUR', error?.message || 'Impossible de mettre à jour le profil');
    } finally {
        isLoading.value = false;
    }
};

// Ouvrir / fermer le formulaire de changement de mot de passe
const openChangePassword = () => {
    closeSubForms();
    showChangePassword.value = true;
};

const closeChangePassword = () => {
    showChangePassword.value = false;
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
};

// Changer le mot de passe
const changePasswordHandler = async () => {
    if (isLoading.value) return;
    const { currentPassword, newPassword } = passwordForm;
    if (!currentPassword || !newPassword) {
        showError('ERREUR', 'Renseignez le mot de passe actuel et le nouveau mot de passe');
        return;
    }
    if (newPassword.length < PASSWORD_MIN || newPassword.length > PASSWORD_MAX) {
        showError('ERREUR', `Le nouveau mot de passe doit contenir entre ${PASSWORD_MIN} et ${PASSWORD_MAX} caractères`);
        return;
    }
    if (currentPassword === newPassword) {
        showError('ERREUR', "Le nouveau mot de passe doit être différent de l'actuel");
        return;
    }

    isLoading.value = true;
    try {
        await changePassword({ currentPassword, newPassword });
        showSuccess('MOT DE PASSE CHANGÉ', 'Votre mot de passe a été modifié');
        closeChangePassword();
    } catch (error) {
        showError('ERREUR', error?.message || 'Impossible de changer le mot de passe');
    } finally {
        isLoading.value = false;
    }
};

// Ouvrir / fermer le formulaire de suppression de compte
const openDeleteAccount = () => {
    closeSubForms();
    showDeleteAccount.value = true;
};

const closeDeleteAccount = () => {
    showDeleteAccount.value = false;
    deleteForm.password = '';
};

// Clic sur "SUPPRIMER LE COMPTE" : bloqué pendant une partie
const handleDeleteAccountClick = () => {
    if (isGameInProgress.value) {
        showWarning('ACTION BLOQUÉE', "Impossible de supprimer le compte pendant une partie active. Terminez d'abord la partie.");
        return;
    }
    openDeleteAccount();
};

// Supprimer le compte
const deleteAccountHandler = async () => {
    if (isLoading.value) return;
    if (isGameInProgress.value) {
        handleDeleteAccountClick();
        return;
    }
    const password = deleteForm.password;
    if (!password) {
        showError('ERREUR', 'Confirmez avec votre mot de passe');
        return;
    }

    isLoading.value = true;
    try {
        await deleteAccount(password);
        showSuccess('COMPTE SUPPRIMÉ', 'Votre compte a été supprimé');
        handleClose();
    } catch (error) {
        showError('ERREUR', error?.message || 'Impossible de supprimer le compte');
    } finally {
        deleteForm.password = '';
        isLoading.value = false;
    }
};

// Formater la date (valeur absente ou invalide → "—")
const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Rafraîchir les statistiques : useAuth().refreshUser() met à jour l'utilisateur (lecture seule ici).
// Repli sur /users/stats stocké localement si refreshUser n'existe pas.
const loadUserStats = async () => {
    try {
        if (typeof auth.refreshUser === 'function') {
            await auth.refreshUser();
            fetchedStats.value = null;
        } else {
            fetchedStats.value = (await getUserStats()) || null;
        }
    } catch (error) {
        console.warn('Statistiques utilisateur indisponibles:', error?.message || error);
    }
};

// Gestion de la touche Échap
const handleKeydown = (event) => {
    if (event.key === 'Escape') {
        handleClose();
    }
};

// Ouverture / fermeture de la modale
watch(
    () => props.visible,
    (newVisible) => {
        if (newVisible) {
            document.addEventListener('keydown', handleKeydown);
            initForms();
            if (user.value) loadUserStats();
        } else {
            document.removeEventListener('keydown', handleKeydown);
            closeSubForms();
        }
    },
    { immediate: true }
);

// Déconnexion (ou suppression du compte) pendant que la modale est ouverte
watch(
    () => user.value?.id,
    (id, previousId) => {
        fetchedStats.value = null;
        if (!props.visible) return;
        if (!id) {
            handleClose();
        } else if (id !== previousId) {
            initForms();
            loadUserStats();
        }
    }
);

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
