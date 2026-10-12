<template>
    <div
        v-if="visible"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        @click.self="handleClose"
    >
        <div
            class="bg-gray-900/95 border-2 border-cyber-blue rounded-lg p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden scanline"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            @click.stop
        >
            <!-- Header -->
            <div class="flex items-center justify-between gap-4 mb-6">
                <h2 id="auth-modal-title" class="text-2xl font-cyber font-bold text-cyber-blue">
                    {{ isLogin ? 'CONNEXION' : 'INSCRIPTION' }}
                </h2>
                <button
                    type="button"
                    @click="handleClose"
                    class="shrink-0 p-2 -mr-2 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Fermer"
                    title="Fermer"
                >
                    <X class="w-6 h-6" aria-hidden="true" />
                </button>
            </div>

            <!-- Formulaire -->
            <form @submit.prevent="handleSubmit" class="space-y-3" novalidate>
                <!-- Nom d'utilisateur (inscription uniquement) -->
                <div v-if="!isLogin">
                    <label for="auth-username" class="block text-sm font-tech text-gray-300 mb-1">
                        Nom d'utilisateur
                    </label>
                    <input
                        id="auth-username"
                        v-model="formData.username"
                        type="text"
                        name="username"
                        autocomplete="username"
                        required
                        minlength="2"
                        maxlength="30"
                        class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                        placeholder="Votre nom d'utilisateur"
                    />
                </div>

                <!-- Email -->
                <div>
                    <label for="auth-email" class="block text-sm font-tech text-gray-300 mb-1">
                        Email
                    </label>
                    <input
                        id="auth-email"
                        ref="emailInput"
                        v-model="formData.email"
                        type="email"
                        name="email"
                        autocomplete="email"
                        inputmode="email"
                        required
                        maxlength="254"
                        class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                        placeholder="votre@email.com"
                    />
                </div>

                <!-- Mot de passe -->
                <div>
                    <label for="auth-password" class="block text-sm font-tech text-gray-300 mb-1">
                        Mot de passe
                    </label>
                    <input
                        id="auth-password"
                        v-model="formData.password"
                        type="password"
                        name="password"
                        :autocomplete="isLogin ? 'current-password' : 'new-password'"
                        required
                        :minlength="isLogin ? undefined : PASSWORD_MIN"
                        maxlength="128"
                        class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                        placeholder="Votre mot de passe"
                    />
                    <p v-if="!isLogin" class="mt-1 text-xs font-tech text-gray-500">
                        {{ PASSWORD_MIN }} caractères minimum.
                    </p>
                </div>

                <!-- Nom d'équipe (inscription uniquement) -->
                <div v-if="!isLogin">
                    <label for="auth-team" class="block text-sm font-tech text-gray-300 mb-1">
                        Nom d'équipe (optionnel)
                    </label>
                    <input
                        id="auth-team"
                        v-model="formData.teamName"
                        type="text"
                        name="teamName"
                        autocomplete="organization"
                        maxlength="50"
                        class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                        placeholder="Nom de votre équipe"
                    />
                </div>

                <!-- Message d'erreur -->
                <div v-if="error" class="bg-red-900/30 border border-red-500/50 rounded p-2" role="alert">
                    <p class="text-red-400 font-tech text-sm">{{ error }}</p>
                </div>

                <!-- Bouton de soumission -->
                <button
                    type="submit"
                    :disabled="isLoading"
                    class="w-full px-4 py-2 bg-cyber-blue hover:bg-cyber-blue/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded transition-all flex items-center justify-center"
                >
                    <LoaderCircle v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    <LogIn v-else-if="isLogin" class="w-4 h-4 mr-2" aria-hidden="true" />
                    <UserPlus v-else class="w-4 h-4 mr-2" aria-hidden="true" />
                    {{ isLoading ? 'TRAITEMENT...' : (isLogin ? 'SE CONNECTER' : 'S\'INSCRIRE') }}
                </button>
            </form>

            <!-- Basculer entre connexion et inscription -->
            <div class="mt-4 text-center">
                <button
                    type="button"
                    @click="toggleMode"
                    :disabled="isLoading"
                    class="text-cyber-blue hover:text-cyber-blue/80 disabled:opacity-50 font-tech text-sm transition-colors flex items-center justify-center mx-auto py-1"
                >
                    <RefreshCw class="w-4 h-4 mr-1" aria-hidden="true" />
                    {{ isLogin ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onUnmounted } from 'vue';
import { X, LogIn, UserPlus, RefreshCw, LoaderCircle } from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';
import { useToast } from '../composables/useToast';

const PASSWORD_MIN = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['close', 'success']);

const { login, register } = useAuth();
const { showSuccess, showError } = useToast();

// État du formulaire
const isLogin = ref(true);
const isLoading = ref(false);
const error = ref('');
const emailInput = ref(null);

const formData = reactive({
    username: '',
    email: '',
    password: '',
    teamName: ''
});

// Fonction pour fermer la modal
const handleClose = () => {
    emit('close');
};

// Réinitialiser le formulaire
const resetForm = () => {
    formData.username = '';
    formData.email = '';
    formData.password = '';
    formData.teamName = '';
    error.value = '';
};

// Basculer entre connexion et inscription
const toggleMode = () => {
    if (isLoading.value) return;
    isLogin.value = !isLogin.value;
    resetForm();
};

// Vérifications locales (le serveur revalide tout) pour des messages immédiats et clairs
const validateForm = () => {
    const email = formData.email.trim();
    if (!isLogin.value) {
        const username = formData.username.trim();
        if (username.length < 2 || username.length > 30) {
            return 'Le nom d\'utilisateur doit contenir entre 2 et 30 caractères.';
        }
    }
    if (!email) return 'L\'email est requis.';
    if (!EMAIL_PATTERN.test(email)) return 'L\'adresse email n\'est pas valide.';
    if (!formData.password) return 'Le mot de passe est requis.';
    if (!isLogin.value && formData.password.length < PASSWORD_MIN) {
        return `Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères.`;
    }
    return '';
};

// Soumettre le formulaire
const handleSubmit = async () => {
    // Protection contre les appels multiples
    if (isLoading.value) {
        return;
    }

    const validationError = validateForm();
    if (validationError) {
        error.value = validationError;
        return;
    }

    isLoading.value = true;
    error.value = '';

    try {
        if (isLogin.value) {
            // Connexion
            await login({
                email: formData.email.trim(),
                password: formData.password
            });
            showSuccess('CONNEXION RÉUSSIE', 'Bienvenue dans l\'escape game !');
        } else {
            // Inscription
            await register({
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password,
                teamName: formData.teamName.trim()
            });
            showSuccess('INSCRIPTION RÉUSSIE', 'Votre compte a été créé avec succès !');
        }

        emit('success');
        emit('close');
        resetForm();
    } catch (err) {
        error.value = err.message || 'Une erreur est survenue.';
        showError('ERREUR', error.value);
    } finally {
        isLoading.value = false;
    }
};

// Gestion de la touche Échap
const handleKeydown = (event) => {
    if (event.key === 'Escape') {
        handleClose();
    }
};

// Ouverture / fermeture : écouteur clavier, focus, réinitialisation
watch(() => props.visible, async (newVisible) => {
    if (newVisible) {
        document.addEventListener('keydown', handleKeydown);
        await nextTick();
        // Pas de focus automatique sur écran tactile (le clavier virtuel masquerait la fenêtre)
        if (window.matchMedia?.('(pointer: fine)').matches) {
            emailInput.value?.focus({ preventScroll: true });
        }
    } else {
        document.removeEventListener('keydown', handleKeydown);
        resetForm();
    }
}, { immediate: true });

// Nettoyer l'écouteur au démontage
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.scanline {
    position: relative;
}

.scanline::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #06b6d4, transparent);
    animation: scan 3s linear infinite;
    pointer-events: none;
}

@keyframes scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
</style>
