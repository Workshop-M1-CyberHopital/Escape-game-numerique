<template>
    <section class="px-4 py-20">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16">
                <h2
                    class="text-4xl md:text-6xl font-cyber font-bold text-white mb-4"
                >
                    LES <span class="text-cyber-red">SALLES</span> VIRTUELLES
                </h2>
                <p class="text-gray-400 font-tech text-lg">
                    Réparez les systèmes vitaux en résolvant les énigmes
                </p>

                <!-- Barre de progression -->
                <div class="mt-8 max-w-2xl mx-auto">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-tech text-sm text-gray-400">
                            PROGRESSION
                        </span>
                        <span
                            class="font-cyber text-lg text-cyber-blue font-bold"
                        >
                            {{ completedRooms.length }} / 7
                        </span>
                    </div>
                    <div
                        class="w-full bg-gray-800 rounded-full h-4 border-2 border-gray-700 overflow-hidden"
                    >
                        <div
                            class="h-full bg-gradient-to-r from-cyber-blue to-cyber-green transition-all duration-500 ease-out flex items-center justify-end pr-2"
                            :style="`width: ${(completedRooms.length / 7) * 100}%`"
                        >
                            <span
                                v-if="completedRooms.length > 0"
                                class="text-xs font-bold text-black"
                            >
                                {{
                                    Math.round(
                                        (completedRooms.length / 7) * 100,
                                    )
                                }}%
                            </span>
                        </div>
                    </div>
                    <div
                        class="flex justify-between mt-2 text-xs font-tech text-gray-500"
                    >
                        <span>SERVEUR</span>
                        <span>LAB ADN</span>
                        <span>IMAGERIE</span>
                        <span>CŒUR</span>
                        <span>PROTHÈSES</span>
                        <span>PATHOLOGIES</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Room 1: Server -->
                <div
                    @click="handleRoomClick('server')"
                    :class="[
                        'room-card bg-gray-900/80 backdrop-blur-md border-2 rounded-lg p-6 scanline relative overflow-hidden transition-all duration-300 ease-out',
                        isUnlocked('server')
                            ? 'border-cyber-red cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyber-red/20 hover:border-cyber-red/80'
                            : 'border-gray-600 opacity-60 cursor-not-allowed',
                    ]"
                >
                    <div class="absolute top-4 right-4">
                        <i
                            :data-lucide="
                                isUnlocked('server') ? 'unlock' : 'lock'
                            "
                            :class="
                                isUnlocked('server')
                                    ? 'w-6 h-6 text-green-400'
                                    : 'w-6 h-6 text-gray-500'
                            "
                        >
                        </i>
                    </div>
                    <div class="p-0">
                        <div
                            class="w-16 h-16 mb-4 rounded-lg flex items-center justify-center"
                            style="
                                background-color: rgba(255, 0, 85, 0.2);
                                border: 2px solid #ff0055;
                            "
                        >
                            <i
                                data-lucide="server"
                                class="w-8 h-8 text-cyber-red"
                            ></i>
                        </div>
                        <h3
                            class="text-2xl font-cyber font-bold mb-2"
                            style="color: #ff0055"
                        >
                            SALLE DU SERVEUR
                        </h3>
                        <p class="text-sm font-tech text-gray-400 mb-3">
                            Le pare-feu corrompu
                        </p>
                        <p class="text-sm text-gray-300 mb-4">
                            Décoder un mot de passe à partir d'un log chiffré
                            (substitution, base64, etc.)
                        </p>
                        <div class="space-y-2">
                            <span
                                class="inline-block px-3 py-1 border border-cyber-red text-cyber-red font-tech text-xs rounded"
                            >
                                OBJECTIF
                            </span>
                            <p class="text-xs text-gray-400">
                                Sensibiliser à la sécurité des données de santé
                            </p>
                        </div>
                        <div
                            v-if="!isUnlocked('server')"
                            class="mt-4 pt-4 border-t border-gray-700"
                        >
                            <p class="text-xs font-tech text-yellow-500">
                                🔒 Complétez les salles précédentes pour
                                débloquer
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="isUnlocked('server')"
                        class="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity pointer-events-none"
                        style="background-color: #ff0055"
                    ></div>
                </div>

                <!-- Room 2: DNA Lab -->
                <div
                    @click="handleRoomClick('dna-lab')"
                    :class="[
                        'room-card bg-gray-900/80 backdrop-blur-md border-2 rounded-lg p-6 scanline relative overflow-hidden transition-all duration-300 ease-out',
                        isUnlocked('dna-lab')
                            ? 'border-cyber-blue cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyber-blue/20 hover:border-cyber-blue/80'
                            : 'border-gray-600 opacity-60 cursor-not-allowed',
                    ]"
                >
                    <div class="absolute top-4 right-4">
                        <i
                            :data-lucide="
                                isUnlocked('dna-lab') ? 'unlock' : 'lock'
                            "
                            :class="
                                isUnlocked('dna-lab')
                                    ? 'w-6 h-6 text-green-400'
                                    : 'w-6 h-6 text-gray-500'
                            "
                        >
                        </i>
                    </div>
                    <div class="p-0">
                        <div
                            class="w-16 h-16 mb-4 rounded-lg flex items-center justify-center"
                            style="
                                background-color: rgba(0, 255, 255, 0.2);
                                border: 2px solid #00ffff;
                            "
                        >
                            <i
                                data-lucide="dna"
                                class="w-8 h-8 text-cyber-blue"
                            ></i>
                        </div>
                        <h3
                            class="text-2xl font-cyber font-bold mb-2"
                            style="color: #00ffff"
                        >
                            LABORATOIRE ADN
                        </h3>
                        <p class="text-sm font-tech text-gray-400 mb-3">
                            Les gènes brouillés
                        </p>
                        <p class="text-sm text-gray-300 mb-4">
                            Reconstituer une séquence ADN (mini puzzle logique)
                        </p>
                        <div class="space-y-2">
                            <span
                                class="inline-block px-3 py-1 border border-cyber-blue text-cyber-blue font-tech text-xs rounded"
                            >
                                OBJECTIF
                            </span>
                            <p class="text-xs text-gray-400">
                                Comprendre la logique de l'ADN et des données
                                biomédicales
                            </p>
                        </div>
                        <div
                            v-if="!isUnlocked('dna-lab')"
                            class="mt-4 pt-4 border-t border-gray-700"
                        >
                            <p class="text-xs font-tech text-yellow-500">
                                🔒 Complétez les salles précédentes pour
                                débloquer
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="isUnlocked('dna-lab')"
                        class="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity pointer-events-none"
                        style="background-color: #00ffff"
                    ></div>
                </div>

                <!-- Room 3: Imaging -->
                <div
                    @click="handleRoomClick('imaging')"
                    :class="[
                        'room-card bg-gray-900/80 backdrop-blur-md border-2 rounded-lg p-6 scanline relative overflow-hidden transition-all duration-300 ease-out',
                        isUnlocked('imaging')
                            ? 'border-cyber-green cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyber-green/20 hover:border-cyber-green/80'
                            : 'border-gray-600 opacity-60 cursor-not-allowed',
                    ]"
                >
                    <div class="absolute top-4 right-4">
                        <i
                            :data-lucide="
                                isUnlocked('imaging') ? 'unlock' : 'lock'
                            "
                            :class="
                                isUnlocked('imaging')
                                    ? 'w-6 h-6 text-green-400'
                                    : 'w-6 h-6 text-gray-500'
                            "
                        >
                        </i>
                    </div>
                    <div class="p-0">
                        <div
                            class="w-16 h-16 mb-4 rounded-lg flex items-center justify-center"
                            style="
                                background-color: rgba(0, 255, 136, 0.2);
                                border: 2px solid #00ff88;
                            "
                        >
                            <i
                                data-lucide="scan-line"
                                class="w-8 h-8 text-cyber-green"
                            ></i>
                        </div>
                        <h3
                            class="text-2xl font-cyber font-bold mb-2"
                            style="color: #00ff88"
                        >
                            SALLE D'IMAGERIE
                        </h3>
                        <p class="text-sm font-tech text-gray-400 mb-3">
                            IRM fantôme
                        </p>
                        <p class="text-sm text-gray-300 mb-4">
                            Reconstituer une image médicale corrompue (pixels
                            manquants ou puzzle)
                        </p>
                        <div class="space-y-2">
                            <span
                                class="inline-block px-3 py-1 border border-cyber-green text-cyber-green font-tech text-xs rounded"
                            >
                                OBJECTIF
                            </span>
                            <p class="text-xs text-gray-400">
                                Découvrir le rôle de l'imagerie médicale
                            </p>
                        </div>
                        <div
                            v-if="!isUnlocked('imaging')"
                            class="mt-4 pt-4 border-t border-gray-700"
                        >
                            <p class="text-xs font-tech text-yellow-500">
                                🔒 Complétez les salles précédentes pour
                                débloquer
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="isUnlocked('imaging')"
                        class="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity pointer-events-none"
                        style="background-color: #00ff88"
                    ></div>
                </div>

                <!-- Room 4: Heart -->
                <div
                    @click="handleRoomClick('heart')"
                    :class="[
                        'room-card bg-gray-900/80 backdrop-blur-md border-2 rounded-lg p-6 scanline relative overflow-hidden transition-all duration-300 ease-out',
                        isUnlocked('heart')
                            ? 'border-cyber-purple cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyber-purple/20 hover:border-cyber-purple/80'
                            : 'border-gray-600 opacity-60 cursor-not-allowed',
                    ]"
                >
                    <div class="absolute top-4 right-4">
                        <i
                            :data-lucide="
                                isUnlocked('heart') ? 'unlock' : 'lock'
                            "
                            :class="
                                isUnlocked('heart')
                                    ? 'w-6 h-6 text-green-400'
                                    : 'w-6 h-6 text-gray-500'
                            "
                        >
                        </i>
                    </div>
                    <div class="p-0">
                        <div
                            class="w-16 h-16 mb-4 rounded-lg flex items-center justify-center"
                            style="
                                background-color: rgba(255, 0, 255, 0.2);
                                border: 2px solid #ff00ff;
                            "
                        >
                            <i
                                data-lucide="heart"
                                class="w-8 h-8 text-cyber-purple"
                            ></i>
                        </div>
                        <h3
                            class="text-2xl font-cyber font-bold mb-2"
                            style="color: #ff00ff"
                        >
                            SALLE DU CŒUR
                        </h3>
                        <p class="text-sm font-tech text-gray-400 mb-3">
                            Rythme vital
                        </p>
                        <p class="text-sm text-gray-300 mb-4">
                            Mini-jeu basé sur la synchronisation : cliquer ou
                            respirer au bon rythme
                        </p>
                        <div class="space-y-2">
                            <span
                                class="inline-block px-3 py-1 border border-cyber-purple text-cyber-purple font-tech text-xs rounded"
                            >
                                OBJECTIF
                            </span>
                            <p class="text-xs text-gray-400">
                                Sensibiliser au stress et à la régulation
                                cardiaque
                            </p>
                        </div>
                        <div
                            v-if="!isUnlocked('heart')"
                            class="mt-4 pt-4 border-t border-gray-700"
                        >
                            <p class="text-xs font-tech text-yellow-500">
                                🔒 Complétez les salles précédentes pour
                                débloquer
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="isUnlocked('heart')"
                        class="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity pointer-events-none"
                        style="background-color: #ff00ff"
                    ></div>
                </div>

                <!-- Room 5: Prosthesis -->
                <div
                    @click="handleRoomClick('prosthesis')"
                    :class="[
                        'room-card bg-gray-900/80 backdrop-blur-md border-2 rounded-lg p-6 scanline relative overflow-hidden transition-all duration-300 ease-out',
                        isUnlocked('prosthesis')
                            ? 'border-orange-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 hover:border-orange-500/80'
                            : 'border-gray-600 opacity-60 cursor-not-allowed',
                    ]"
                >
                    <div class="absolute top-4 right-4">
                        <i
                            :data-lucide="
                                isUnlocked('prosthesis') ? 'unlock' : 'lock'
                            "
                            :class="
                                isUnlocked('prosthesis')
                                    ? 'w-6 h-6 text-green-400'
                                    : 'w-6 h-6 text-gray-500'
                            "
                        >
                        </i>
                    </div>
                    <div class="p-0">
                        <div
                            class="w-16 h-16 mb-4 rounded-lg flex items-center justify-center"
                            style="
                                background-color: rgba(249, 115, 22, 0.2);
                                border: 2px solid #f97316;
                            "
                        >
                            <i
                                data-lucide="settings"
                                class="w-8 h-8 text-orange-500"
                            ></i>
                        </div>
                        <h3
                            class="text-2xl font-cyber font-bold mb-2"
                            style="color: #f97316"
                        >
                            SALLE DES PROTHÈSES
                        </h3>
                        <p class="text-sm font-tech text-gray-400 mb-3">
                            Système orthopédique désynchronisé
                        </p>
                        <p class="text-sm text-gray-300 mb-4">
                            Réaligner les articulations virtuelles en résolvant
                            une énigme de mécanique logique
                        </p>
                        <div class="space-y-2">
                            <span
                                class="inline-block px-3 py-1 border border-orange-500 text-orange-500 font-tech text-xs rounded"
                            >
                                OBJECTIF
                            </span>
                            <p class="text-xs text-gray-400">
                                Comprendre la biomécanique et les technologies
                                IoT médicales
                            </p>
                        </div>
                        <div
                            v-if="!isUnlocked('prosthesis')"
                            class="mt-4 pt-4 border-t border-gray-700"
                        >
                            <p class="text-xs font-tech text-yellow-500">
                                🔒 Complétez les salles précédentes pour
                                débloquer
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="isUnlocked('prosthesis')"
                        class="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity pointer-events-none"
                        style="background-color: #f97316"
                    ></div>
                </div>

                <!-- Room 6: Pathology -->
                <div
                    @click="handleRoomClick('pathology')"
                    :class="[
                        'room-card bg-gray-900/80 backdrop-blur-md border-2 rounded-lg p-6 scanline relative overflow-hidden transition-all duration-300 ease-out',
                        isUnlocked('pathology')
                            ? 'border-cyber-red cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyber-red/20 hover:border-cyber-red/80'
                            : 'border-gray-600 opacity-60 cursor-not-allowed',
                    ]"
                >
                    <div class="absolute top-4 right-4">
                        <i
                            :data-lucide="
                                isUnlocked('pathology') ? 'unlock' : 'lock'
                            "
                            :class="
                                isUnlocked('pathology')
                                    ? 'w-6 h-6 text-green-400'
                                    : 'w-6 h-6 text-gray-500'
                            "
                        >
                        </i>
                    </div>
                    <div class="p-0">
                        <div
                            class="w-16 h-16 mb-4 rounded-lg flex items-center justify-center"
                            style="
                                background-color: rgba(255, 0, 85, 0.2);
                                border: 2px solid #ff0055;
                            "
                        >
                            <i
                                data-lucide="heart-pulse"
                                class="w-8 h-8 text-cyber-red"
                            ></i>
                        </div>
                        <h3
                            class="text-2xl font-cyber font-bold mb-2"
                            style="color: #ff0055"
                        >
                            SALLE DES PATHOLOGIES
                        </h3>
                        <p class="text-sm font-tech text-gray-400 mb-3">
                            Diagnostic médical
                        </p>
                        <p class="text-sm text-gray-300 mb-4">
                            Associez chaque pathologie à sa guérison correspondante
                        </p>
                        <div class="space-y-2">
                            <span
                                class="inline-block px-3 py-1 border border-cyber-red text-cyber-red font-tech text-xs rounded"
                            >
                                OBJECTIF
                            </span>
                            <p class="text-xs text-gray-400">
                                Sensibiliser aux pathologies médicales et leurs traitements
                            </p>
                        </div>
                        <div
                            v-if="!isUnlocked('pathology')"
                            class="mt-4 pt-4 border-t border-gray-700"
                        >
                            <p class="text-xs font-tech text-yellow-500">
                                🔒 Complétez les salles précédentes pour
                                débloquer
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="isUnlocked('pathology')"
                        class="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity pointer-events-none"
                        style="background-color: #ff0055"
                    ></div>
                </div>

                <!-- Room 7: Audition -->
                <div
                    @click="handleRoomClick('audition')"
                    :class="[
                        'room-card bg-gray-900/80 backdrop-blur-md border-2 rounded-lg p-6 scanline relative overflow-hidden transition-all duration-300 ease-out',
                        isUnlocked('audition')
                            ? 'border-cyber-purple cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyber-purple/20 hover:border-cyber-purple/80'
                            : 'border-gray-600 opacity-60 cursor-not-allowed',
                    ]"
                >
                    <div class="absolute top-4 right-4">
                        <i
                            :data-lucide="
                                isUnlocked('audition') ? 'unlock' : 'lock'
                            "
                            :class="
                                isUnlocked('audition')
                                    ? 'w-6 h-6 text-green-400'
                                    : 'w-6 h-6 text-gray-500'
                            "
                        >
                        </i>
                    </div>
                    <div class="p-0">
                        <div
                            class="w-16 h-16 mb-4 rounded-lg flex items-center justify-center"
                            style="
                                background-color: rgba(139, 92, 246, 0.2);
                                border: 2px solid #8b5cf6;
                            "
                        >
                            <i
                                data-lucide="volume-2"
                                class="w-8 h-8"
                                style="color: #8b5cf6"
                            ></i>
                        </div>
                        <h3
                            class="text-2xl font-cyber font-bold mb-2"
                            style="color: #8b5cf6"
                        >
                            SALLE DE L'AUDITION
                        </h3>
                        <p class="text-sm font-tech text-gray-400 mb-3">
                            Réparation audiométrique
                        </p>
                        <p class="text-sm text-gray-300 mb-4">
                            Ajustez l'égaliseur audio pour restaurer les fréquences sonores
                        </p>
                        <div class="space-y-2">
                            <span
                                class="inline-block px-3 py-1 border font-tech text-xs rounded"
                                style="border-color: #8b5cf6; color: #8b5cf6"
                            >
                                OBJECTIF
                            </span>
                            <p class="text-xs text-gray-400">
                                Sensibiliser aux troubles auditifs et à l'audiométrie
                            </p>
                        </div>
                        <div
                            v-if="!isUnlocked('audition')"
                            class="mt-4 pt-4 border-t border-gray-700"
                        >
                            <p class="text-xs font-tech text-yellow-500">
                                🔒 Complétez la salle des pathologies pour débloquer
                            </p>
                        </div>
                    </div>
                    <div
                        v-if="isUnlocked('audition')"
                        class="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity pointer-events-none"
                        style="background-color: #8b5cf6"
                    ></div>
                </div>
            </div>

            <!-- Final Message -->
            <div class="mt-16">
                <div
                    class="bg-gray-900/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-8 max-w-3xl mx-auto"
                >
                    <h3
                        class="text-2xl font-cyber font-bold text-cyber-green mb-4"
                    >
                        🎯 OBJECTIF FINAL
                    </h3>
                    <p class="text-gray-300 leading-relaxed">
                        Chaque énigme réussie débloque une clé pour restaurer
                        une partie du système. À la fin, un débriefing montre ce
                        qu'ils ont appris : protection des données, santé,
                        émotion, et travail d'équipe.
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { onMounted } from "vue";

const props = defineProps({
    unlockedRooms: {
        type: Array,
        default: () => [],
    },
    completedRooms: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(["enter-room"]);

const isUnlocked = (roomId) => {
    return props.unlockedRooms.includes(roomId);
};

const isCompleted = (roomId) => {
    return props.completedRooms.includes(roomId);
};

const handleRoomClick = (roomId) => {
    // Toujours émettre l'événement, même si la salle est verrouillée
    // Le composant parent gérera l'affichage du toast d'erreur
    emit("enter-room", roomId);
};

onMounted(() => {
    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
});
</script>
