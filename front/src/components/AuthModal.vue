<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" @click.self="handleClose">
        <div class="bg-gray-900/95 border-2 border-cyber-blue rounded-lg p-6 max-w-md w-full mx-4 scanline" @click.stop>
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-cyber font-bold text-cyber-blue">
                    {{ isLogin ? 'CONNEXION' : 'INSCRIPTION' }}
                </h2>
                <button
                    @click="handleClose"
                    class="text-gray-400 hover:text-white transition-colors"
                >
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
            </div>

            <!-- Formulaire -->
            <form @submit.prevent="handleSubmit" class="space-y-3">
                <!-- Nom d'utilisateur (inscription uniquement) -->
                <div v-if="!isLogin">
                    <label class="block text-sm font-tech text-gray-300 mb-1">
                        Nom d'utilisateur
                    </label>
                    <input
                        v-model="formData.username"
                        type="text"
                        required
                        class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                        placeholder="Votre nom d'utilisateur"
                    />
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-sm font-tech text-gray-300 mb-1">
                        Email
                    </label>
                    <input
                        v-model="formData.email"
                        type="email"
                        required
                        class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                        placeholder="votre@email.com"
                    />
                </div>

                <!-- Mot de passe -->
                <div>
                    <label class="block text-sm font-tech text-gray-300 mb-1">
                        Mot de passe
                    </label>
                    <input
                        v-model="formData.password"
                        type="password"
                        required
                        class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                        placeholder="Votre mot de passe"
                    />
                </div>

                <!-- Nom d'équipe (inscription uniquement) -->
                <div v-if="!isLogin">
                    <label class="block text-sm font-tech text-gray-300 mb-1">
                        Nom d'équipe (optionnel)
                    </label>
                    <input
                        v-model="formData.teamName"
                        type="text"
                        class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                        placeholder="Nom de votre équipe"
                    />
                </div>

                <!-- Message d'erreur -->
                <div v-if="error" class="bg-red-900/30 border border-red-500/50 rounded p-2">
                    <p class="text-red-400 font-tech text-sm">{{ error }}</p>
                </div>

                <!-- Bouton de soumission -->
                <button
                    type="submit"
                    :disabled="isLoading"
                    class="w-full px-4 py-2 bg-cyber-blue hover:bg-cyber-blue/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded transition-all flex items-center justify-center"
                >
                    <i data-lucide="log-in" class="w-4 h-4 mr-2" v-if="isLogin"></i>
                    <i data-lucide="user-plus" class="w-4 h-4 mr-2" v-else></i>
                    {{ isLoading ? 'TRAITEMENT...' : (isLogin ? 'SE CONNECTER' : 'S\'INSCRIRE') }}
                </button>
            </form>

            <!-- Basculer entre connexion et inscription -->
            <div class="mt-4 text-center">
                <button
                    @click="toggleMode"
                    class="text-cyber-blue hover:text-cyber-blue/80 font-tech text-sm transition-colors flex items-center justify-center mx-auto"
                >
                    <i data-lucide="refresh-cw" class="w-4 h-4 mr-1"></i>
                    {{ isLogin ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter' }}
                </button>
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
    }
});

const emit = defineEmits(['close', 'success']);

// Fonction pour fermer la modal
const handleClose = () => {
    emit('close');
};

const { login, register, isAuthenticated } = useAuth();
const { showSuccess, showError } = useToast();

// État du formulaire
const isLogin = ref(true);
const isLoading = ref(false);
const error = ref('');

const formData = reactive({
    username: '',
    email: '',
    password: '',
    teamName: ''
});

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
    isLogin.value = !isLogin.value;
    resetForm();
};

// Soumettre le formulaire
const handleSubmit = async () => {
    isLoading.value = true;
    error.value = '';

    try {
        if (isLogin.value) {
            // Connexion
            await login({
                email: formData.email,
                password: formData.password
            });
            showSuccess('CONNEXION RÉUSSIE', 'Bienvenue dans l\'escape game !');
        } else {
            // Inscription
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                teamName: formData.teamName
            });
            showSuccess('INSCRIPTION RÉUSSIE', 'Votre compte a été créé avec succès !');
        }

        emit('success');
        emit('close');
        resetForm();
    } catch (err) {
        error.value = err.message || 'Une erreur est survenue';
        showError('ERREUR', error.value);
    } finally {
        isLoading.value = false;
    }
};

// Réinitialiser le formulaire quand la modal se ferme
watch(() => props.visible, (newVisible) => {
    if (!newVisible) {
        resetForm();
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
