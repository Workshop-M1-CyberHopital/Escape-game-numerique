<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <!-- Étape 1: Décodage de l'énigme -->
        <div
            v-if="!puzzleDecoded"
            class="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
            <!-- Log chiffré -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i
                        data-lucide="file-text"
                        class="w-5 h-5 text-cyber-red"
                    ></i>
                    <h3 class="font-cyber font-bold text-cyber-red">
                        LOG CHIFFRÉ
                    </h3>
                </div>

                <div
                    class="bg-black/50 border border-cyber-red/30 rounded p-4 font-tech text-sm text-gray-300 mb-4"
                >
                    <div class="text-cyber-red mb-2">
                        [ERROR] Authentication failed
                    </div>
                    <div class="text-cyber-red mb-2">
                        [WARN] Firewall breach detected
                    </div>
                    <div class="text-yellow-500 mb-2">
                        [INFO] Attempting connection to: {{ encryptedPuzzle }}
                    </div>
                    <div class="text-cyber-red mb-2">
                        [ERROR] Invalid credentials
                    </div>
                    <div class="text-cyber-red mb-2">
                        [CRITICAL] System compromised
                    </div>
                </div>

                <div class="text-xs text-gray-500 font-tech">
                    Le message semble être encodé. Trouvez la méthode de
                    décodage.
                </div>
            </div>

            <!-- Interface de décodage -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="key" class="w-5 h-5 text-cyber-blue"></i>
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        DÉCODEUR
                    </h3>
                </div>

                <div class="space-y-4">
                    <!-- Type d'encodage -->
                    <div>
                        <label
                            class="block text-sm font-tech text-gray-300 mb-2"
                            >Type d'encodage</label
                        >
                        <select
                            v-model="selectedEncoding"
                            class="w-full px-4 py-3 bg-black/50 border border-cyber-blue/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyber-blue transition-all"
                        >
                            <option value="">
                                Sélectionnez le type d'encodage
                            </option>
                            <option value="caesar">César (ROT13)</option>
                            <option value="hex">Hexadécimal</option>
                            <option value="binary">Binaire</option>
                            <option value="morse">Morse</option>
                            <option value="ascii">ASCII (décimal)</option>
                            <option value="reverse">Inversé</option>
                            <option value="vigenere">Vigenère</option>
                            <option value="base64">Base64</option>
                            <option value="railfence">Rail Fence</option>
                            <option value="url">URL Encoding</option>
                            <option value="unicode">Unicode (décimal)</option>
                        </select>
                    </div>

                    <!-- Décodeur (apparaît pour tous les types) -->
                    <div
                        v-if="selectedEncoding"
                        class="bg-black/30 border border-cyber-blue/30 rounded p-4 mb-4"
                    >
                        <div class="text-cyber-blue font-tech text-sm mb-3">
                            DÉCODEUR {{ selectedEncoding.toUpperCase() }}
                        </div>

                        <!-- Message à décoder -->
                        <div class="mb-3">
                            <div class="flex items-center justify-between mb-1">
                                <label
                                    class="block text-xs font-tech text-gray-400"
                                    >Message encodé</label
                                >
                                <button
                                    @click="fillEncodedMessage"
                                    class="text-xs text-cyber-blue hover:text-cyber-blue/80 font-tech"
                                >
                                    Utiliser le message du log
                                </button>
                            </div>
                            <input
                                v-model="messageToDecode"
                                type="text"
                                placeholder="Collez le message encodé ici"
                                class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                            />
                        </div>

                        <!-- Bouton de décodage -->
                        <button
                            @click="decodeMessage"
                            :disabled="!messageToDecode"
                            class="w-full px-4 py-2 bg-cyber-blue/20 border border-cyber-blue/50 text-cyber-blue font-tech text-sm rounded hover:bg-cyber-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            DÉCODER
                        </button>

                        <!-- Résultat du décodage -->
                        <div v-if="decodedResult" class="mt-3">
                            <label
                                class="block text-xs font-tech text-gray-400 mb-1"
                                >Résultat décodé</label
                            >
                            <div
                                class="w-full px-3 py-2 bg-green-900/30 border border-green-500/50 rounded text-green-400 font-tech text-sm"
                            >
                                {{ decodedResult }}
                            </div>
                        </div>
                    </div>

                    <!-- Message décodé pour validation -->
                    <div>
                        <label
                            class="block text-sm font-tech text-gray-300 mb-2"
                            >Message décodé</label
                        >
                        <input
                            v-model="decodedMessage"
                            type="text"
                            placeholder="Entrez le message décodé"
                            class="w-full px-4 py-3 bg-black/50 border border-cyber-blue/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyber-blue transition-all"
                        />
                    </div>

                    <!-- Bouton de vérification -->
                    <button
                        @click="checkDecoding"
                        :disabled="!decodedMessage"
                        class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
                    >
                        VÉRIFIER LE MESSAGE
                    </button>
                </div>
            </div>
        </div>

        <!-- Étape 2: Résolution de l'énigme -->
        <div
            v-if="puzzleDecoded && !puzzleSolved"
            class="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
            <!-- Énigme décodée -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="brain" class="w-5 h-5 text-cyber-red"></i>
                    <h3 class="font-cyber font-bold text-cyber-red">
                        ÉNIGME DÉCODÉE
                    </h3>
                </div>

                <div
                    class="bg-cyber-red/10 border border-cyber-red/50 rounded p-4 mb-4"
                >
                    <div class="text-cyber-red font-cyber font-bold mb-2">
                        DÉFI INTELLECTUEL
                    </div>
                    <div class="text-white font-tech text-lg mb-2">
                        Résolvez cette énigme pour accéder au serveur :
                    </div>
                    <div
                        class="text-cyber-blue font-cyber text-xl font-bold text-center py-4 bg-black/30 rounded"
                    >
                        {{ decodedPuzzle }}
                    </div>
                </div>

                <div class="text-xs text-gray-500 font-tech">
                    Le système de sécurité nécessite une réponse logique pour
                    autoriser l'accès.
                </div>
            </div>

            <!-- Interface de réponse -->
            <div
                class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i data-lucide="key" class="w-5 h-5 text-cyber-blue"></i>
                    <h3 class="font-cyber font-bold text-cyber-blue">
                        RÉPONSE
                    </h3>
                </div>

                <div class="space-y-4">
                    <!-- Réponse à l'énigme -->
                    <div>
                        <label
                            class="block text-sm font-tech text-gray-300 mb-2"
                            >Votre réponse</label
                        >
                        <input
                            v-model="puzzleAnswer"
                            type="text"
                            placeholder="Réponse en kilogrammes"
                            class="w-full px-4 py-3 bg-black/50 border border-cyber-blue/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyber-blue transition-all"
                        />
                    </div>

                    <!-- Bouton de vérification -->
                    <button
                        @click="checkPuzzleAnswer"
                        :disabled="!puzzleAnswer"
                        class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
                    >
                        VÉRIFIER LA RÉPONSE
                    </button>
                </div>
            </div>
        </div>

        <!-- Indices -->
        <div class="mt-8">
            <div
                class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-6"
            >
                <div class="flex items-center gap-2 mb-4">
                    <i
                        data-lucide="lightbulb"
                        class="w-5 h-5 text-yellow-500"
                    ></i>
                    <h4 class="font-cyber font-bold text-yellow-500">
                        INDICES
                    </h4>
                </div>

                <div class="space-y-2 text-sm text-gray-300">
                    <!-- Indices pour le décodage -->
                    <div v-if="!puzzleDecoded">
                        <div v-if="hintsShown >= 1" class="fade-in">
                            💡 Le message est encodé avec un algorithme de chiffrement standard
                        </div>
                        <div v-if="hintsShown >= 2" class="fade-in">
                            💡 Essayez différents types d'encodage : Base64, Hexadécimal, Binaire, Morse, ASCII...
                        </div>
                        <div v-if="hintsShown >= 3" class="fade-in">
                            💡 Le message décodé est :
                            <span class="text-cyber-green font-bold"
                                >Quel est le poids minimum pour donner son sang
                                ?</span
                            >
                        </div>
                    </div>

                    <!-- Indices pour l'énigme -->
                    <div v-if="puzzleDecoded && !puzzleSolved">
                        <div v-if="hintsShown >= 1" class="fade-in">
                            💡 C'est un nombre entre 40 et 60
                        </div>
                        <div v-if="hintsShown >= 2" class="fade-in">
                            💡 C'est un poids minimum requis pour la sécurité du
                            donneur
                        </div>
                        <div v-if="hintsShown >= 3" class="fade-in">
                            💡 La réponse est :
                            <span class="text-cyber-green font-bold"
                                >50 kg</span
                            >
                        </div>
                    </div>
                </div>

                <button
                    @click="showHint"
                    v-if="hintsShown < 3"
                    class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-tech text-sm rounded transition-all"
                >
                    AFFICHER UN INDICE
                </button>
            </div>
        </div>

        <!-- Message de succès -->
        <div v-if="isCompleted" class="mt-8">
            <div
                class="bg-cyber-green/20 backdrop-blur-md border-2 border-cyber-green rounded-lg p-6 text-center"
            >
                <div class="flex items-center justify-center gap-2 mb-4">
                    <i
                        data-lucide="check-circle"
                        class="w-8 h-8 text-cyber-green"
                    ></i>
                    <h3 class="text-2xl font-cyber font-bold text-cyber-green">
                        SALLE TERMINÉE !
                    </h3>
                </div>
                <p class="text-gray-300 mb-4">
                    Excellent ! Vous avez réussi à décoder le mot de passe et à
                    restaurer le pare-feu. La sécurité des données de santé est
                    maintenant protégée.
                </p>
                <button
                    @click="$emit('room-completed', 'server')"
                    class="px-8 py-3 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all"
                >
                    CONTINUER VERS LA PROCHAINE SALLE
                </button>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref, computed } from "vue";
import GameRoom from "../GameRoom.vue";
import { createFireworks } from "../../utils/fireworks";
import { useToast } from "../../composables/useToast";
import { useGameState } from "../../composables/useGameState";

const emit = defineEmits(["exit-room", "room-completed"]);
const { showSuccess, showError } = useToast();
const { addError, addHint, completeRoom, PENALTY_PER_ERROR } = useGameState();

// Données de la salle
const roomData = {
    title: "SALLE DU SERVEUR",
    subtitle: "Le pare-feu corrompu",
    description:
        "Une cyberattaque a compromis le pare-feu de l'hôpital. Vous devez décoder un mot de passe à partir des logs du système pour restaurer la sécurité.",
    objective: "Sensibiliser à la sécurité des données de santé",
    icon: "server",
    color: "#ff0055",
};

// État du jeu
const selectedEncoding = ref("");
const messageToDecode = ref("");
const decodedResult = ref("");
const decodedMessage = ref("");
const puzzleDecoded = ref(false);
const puzzleAnswer = ref("");
const puzzleSolved = ref(false);
const hintsShown = ref(0);
const isCompleted = ref(false);

// Énigme encodée (Base64 de "Quel est le poids minimum pour donner son sang ?")
const encryptedPuzzle =
    "UXVlbCBlc3QgbGUgcG9pZHMgbWluaW11bSBwb3VyIGRvbm5lciBzb24gc2FuZyA/";
const decodedPuzzle = ref("");

const showHint = () => {
    hintsShown.value++;
    addHint("server");
};

const fillEncodedMessage = () => {
    messageToDecode.value = encryptedPuzzle;
};

const decodeMessage = () => {
    try {
        let decoded = "";

        switch (selectedEncoding.value) {
            case "base64":
                decoded = atob(messageToDecode.value);
                break;

            case "caesar":
                // ROT13 (César avec décalage de 13)
                decoded = messageToDecode.value.replace(
                    /[a-zA-Z]/g,
                    function (c) {
                        const base = c <= "Z" ? 65 : 97;
                        return String.fromCharCode(
                            ((c.charCodeAt(0) - base + 13) % 26) + base,
                        );
                    },
                );
                break;

            case "hex":
                // Hexadécimal vers ASCII
                decoded = messageToDecode.value.replace(/../g, function (hex) {
                    return String.fromCharCode(parseInt(hex, 16));
                });
                break;

            case "binary":
                // Binaire vers ASCII
                const binaryArray = messageToDecode.value.match(/.{8}/g) || [];
                decoded = binaryArray
                    .map((bin) => String.fromCharCode(parseInt(bin, 2)))
                    .join("");
                break;

            case "morse":
                // Code Morse vers texte
                const morseCode = {
                    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
                    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
                    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
                    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
                    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
                    '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
                    '...--': '3', '....-': '4', '.....': '5', '-....': '6',
                    '--...': '7', '---..': '8', '----.': '9', '/': ' '
                };
                decoded = messageToDecode.value
                    .split(' ')
                    .map(code => morseCode[code] || code)
                    .join('');
                break;

            case "ascii":
                // ASCII décimal vers texte
                const asciiNumbers = messageToDecode.value.match(/\d+/g) || [];
                decoded = asciiNumbers
                    .map(num => String.fromCharCode(parseInt(num)))
                    .join('');
                break;

            case "reverse":
                // Inverser le texte
                decoded = messageToDecode.value.split('').reverse().join('');
                break;

            case "vigenere":
                // Vigenère (clé: "CYBER")
                const key = "CYBER";
                let keyIndex = 0;
                decoded = messageToDecode.value.replace(/[a-zA-Z]/g, function(char) {
                    const base = char <= 'Z' ? 65 : 97;
                    const keyChar = key[keyIndex % key.length].toUpperCase();
                    const keyOffset = keyChar.charCodeAt(0) - 65;
                    const charOffset = char.charCodeAt(0) - base;
                    const decodedChar = String.fromCharCode(((charOffset - keyOffset + 26) % 26) + base);
                    keyIndex++;
                    return decodedChar;
                });
                break;

            case "railfence":
                // Rail Fence Cipher (3 rails)
                const rails = 3;
                const railLength = Math.ceil(messageToDecode.value.length / (2 * rails - 2));
                const rail1 = [];
                const rail2 = [];
                const rail3 = [];
                
                for (let i = 0; i < messageToDecode.value.length; i++) {
                    const pos = i % (2 * rails - 2);
                    if (pos < rails) {
                        if (pos === 0) rail1.push(messageToDecode.value[i]);
                        else if (pos === 1) rail2.push(messageToDecode.value[i]);
                        else if (pos === 2) rail3.push(messageToDecode.value[i]);
                    } else {
                        if (pos === 3) rail2.push(messageToDecode.value[i]);
                        else if (pos === 4) rail1.push(messageToDecode.value[i]);
                    }
                }
                decoded = rail1.join('') + rail2.join('') + rail3.join('');
                break;

            case "url":
                // URL Decoding
                decoded = decodeURIComponent(messageToDecode.value);
                break;

            case "unicode":
                // Unicode décimal vers texte
                const unicodeNumbers = messageToDecode.value.match(/\d+/g) || [];
                decoded = unicodeNumbers
                    .map(num => String.fromCharCode(parseInt(num)))
                    .join('');
                break;

            default:
                decoded = "Type d'encodage non supporté";
        }

        decodedResult.value = decoded;
    } catch (error) {
        decodedResult.value = `Erreur de décodage - Vérifiez que le message est bien en ${selectedEncoding.value.toUpperCase()}`;
    }
};

const checkDecoding = () => {
    if (
        decodedMessage.value ===
        "Quel est le poids minimum pour donner son sang ?"
    ) {
        puzzleDecoded.value = true;
        decodedPuzzle.value = decodedMessage.value;
        hintsShown.value = 0; // Réinitialiser les indices pour l'étape suivante

        // Message de succès cyberpunk (durée prolongée pour la lecture)
        showSuccess(
            "DÉCODAGE RÉUSSI",
            "Excellent ! Vous avez percé le pare-feu. Le système commence à se stabiliser. Continuez votre mission pour restaurer l'intégrité des données médicales.",
            8000,
        );
    } else {
        addError("server");
        showError(
            "MESSAGE DÉCODÉ INCORRECT",
            `Message décodé incorrect. Essayez encore ! +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};

const checkPuzzleAnswer = () => {
    const correctAnswers = [
        "50 kg",
        "50kg",
        "50",
        "50 kilos",
        "cinquante kilos",
        "cinquante kg",
    ];
    const userAnswer = puzzleAnswer.value.toLowerCase().trim();

    if (correctAnswers.includes(userAnswer)) {
        puzzleSolved.value = true;
        isCompleted.value = true;
        createFireworks(3000);

        showSuccess(
            "RÉPONSE CORRECTE",
            "Excellent ! Vous avez réussi à décoder le mot de passe et à restaurer le pare-feu. La sécurité des données de santé est maintenant protégée.",
            8000,
        );

        completeRoom("server");
        emit("room-completed", "server");
    } else {
        addError("server");
        showError(
            "RÉPONSE INCORRECTE",
            `Réponse incorrecte. Essayez encore ! +${PENALTY_PER_ERROR}s de pénalité`,
        );
    }
};
</script>
