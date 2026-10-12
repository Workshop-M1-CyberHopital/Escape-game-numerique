<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
        <div :class="['rounded-lg', feedbackClass]">
            <!-- Salle déjà terminée : rejouer sans pénalité -->
            <div
                v-if="isReplay"
                class="mb-6 bg-yellow-500/10 border border-yellow-500/40 rounded-lg p-4 text-sm font-tech text-yellow-300"
            >
                🔁 Salle déjà terminée : vous la rejouez en mode entraînement
                (aucune pénalité, indices gratuits).
            </div>

            <!-- Progression -->
            <ol
                ref="progressBar"
                class="flex flex-wrap gap-2 mb-8 font-tech text-xs scroll-mt-28"
                aria-label="Progression de la salle"
            >
                <li
                    v-for="(step, index) in STEPS"
                    :key="step"
                    :class="stepClass(index)"
                    :aria-current="index === currentStep ? 'step' : undefined"
                    class="px-3 py-1 rounded border"
                >
                    <span v-if="index < currentStep">✓</span>
                    <span v-else>{{ index + 1 }}.</span>
                    {{ step }}
                </li>
            </ol>

            <!-- Étape 1 : identifier l'encodage puis décoder le log -->
            <div v-if="!puzzleDecoded" class="space-y-8">
                <!-- Guide d'apprentissage -->
                <div
                    class="bg-gray-800/60 backdrop-blur-md border-2 border-blue-500 rounded-lg p-6 scanline"
                >
                    <div class="text-center mb-6">
                        <div
                            class="flex items-center justify-center gap-3 mb-4"
                        >
                            <HelpCircle
                                class="w-8 h-8 text-blue-400 shrink-0"
                            />
                            <h3 class="text-xl font-bold text-blue-400">
                                COMMENT IDENTIFIER LE TYPE DE MESSAGE ?
                            </h3>
                        </div>
                        <p class="text-gray-300">
                            Apprenez à reconnaître les différents types de
                            messages codés !
                        </p>
                    </div>

                    <!-- Exemple à analyser -->
                    <div
                        class="bg-gray-900/50 p-4 rounded border border-green-500/30 mb-6"
                    >
                        <h4 class="font-bold text-green-300 mb-3">
                            🔍 Regardez le message ci-dessous :
                        </h4>
                        <div
                            class="bg-black/30 p-3 rounded border border-green-500/30 mb-3"
                        >
                            <div
                                class="font-mono text-green-400 text-sm break-all"
                            >
                                {{ QUIZ_SAMPLE }}
                            </div>
                        </div>
                        <div class="text-sm text-gray-300">
                            <p class="mb-2">Ce message contient :</p>
                            <ul class="list-disc list-inside space-y-1 text-xs">
                                <li>Des lettres majuscules et minuscules (A-Z, a-z)</li>
                                <li>Des chiffres (0-9)</li>
                                <li>Un symbole (/)</li>
                                <li>Aucun espace</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Fiches : encodages et chiffrements -->
                    <div
                        class="bg-gray-900/50 p-4 rounded border border-purple-500/30 mb-6"
                    >
                        <h4 class="font-bold text-purple-300 mb-1">
                            📚 Types de messages codés :
                        </h4>
                        <p class="text-xs text-gray-400 mb-3">
                            Chaque exemple représente le mot « Hello ».
                        </p>
                        <div
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                        >
                            <div
                                v-for="encoding in ENCODINGS"
                                :key="encoding.value"
                                class="bg-gray-800/50 p-3 rounded border border-purple-500/30"
                            >
                                <div
                                    class="flex items-start justify-between gap-2 mb-1"
                                >
                                    <div
                                        class="font-bold text-purple-300 text-sm"
                                    >
                                        {{ encoding.label }}
                                    </div>
                                    <span
                                        :class="
                                            encoding.kind === 'encodage'
                                                ? 'border-green-500/50 text-green-300'
                                                : 'border-yellow-500/50 text-yellow-300'
                                        "
                                        class="shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-tech uppercase"
                                    >
                                        {{ encoding.kind }}
                                    </span>
                                </div>
                                <div class="text-xs text-gray-300 mb-2">
                                    {{ encoding.rule }}
                                </div>
                                <div
                                    class="text-xs font-mono text-green-400 break-all"
                                >
                                    {{ encoding.example }}
                                </div>
                            </div>
                        </div>
                        <div
                            class="mt-4 bg-yellow-500/10 border border-yellow-500/40 rounded p-3 text-xs text-yellow-100 leading-relaxed"
                        >
                            ⚠️ <strong>Encodage ≠ chiffrement.</strong> Un
                            encodage (Base64, hexadécimal…) change seulement
                            l'écriture : n'importe qui peut le décoder, sans
                            clé. Base64 n'est donc <strong>PAS</strong> un
                            chiffrement ! Un chiffrement repose sur un secret
                            (une clé) ; les anciens (César, Vigenère, Rail
                            Fence…) se cassent en quelques secondes, c'est
                            pourquoi on utilise aujourd'hui des algorithmes
                            modernes comme AES.
                        </div>
                    </div>

                    <!-- Question -->
                    <div
                        class="bg-gray-900/50 p-4 rounded border border-blue-500/30"
                    >
                        <h4 class="font-bold text-blue-300 mb-3 text-center">
                            ❓ Quel type de message est-ce ?
                        </h4>
                        <div class="text-sm text-gray-300 mb-4">
                            Le message contient des lettres, des chiffres et un
                            symbole. Quel type correspond ?
                        </div>
                        <div
                            class="grid grid-cols-1 gap-2"
                            role="group"
                            aria-label="Types de message"
                        >
                            <button
                                v-for="option in ENCODINGS"
                                :key="option.value"
                                type="button"
                                :disabled="
                                    encodingIdentified ||
                                    triedOptions.includes(option.value)
                                "
                                :aria-pressed="selectedSimpleOption === option.value"
                                @click="selectSimpleOption(option.value)"
                                :class="optionClass(option.value)"
                                class="p-3 rounded border text-sm font-bold transition-all text-left"
                            >
                                <div class="font-bold">
                                    {{ option.label }}
                                    <span
                                        v-if="
                                            !encodingIdentified &&
                                            triedOptions.includes(option.value)
                                        "
                                        class="ml-1 text-xs font-normal text-red-400"
                                    >
                                        ✗ déjà essayé
                                    </span>
                                </div>
                                <div class="text-xs opacity-80">
                                    {{ option.quiz }}
                                </div>
                            </button>
                        </div>

                        <div class="mt-4">
                            <div
                                v-if="encodingIdentified"
                                class="w-full px-4 py-3 bg-cyber-green/10 border border-cyber-green text-cyber-green font-bold rounded text-center text-sm"
                            >
                                ✅ Bonne réponse : Base64 ! Le décodeur est
                                déverrouillé.
                            </div>
                            <button
                                v-else
                                type="button"
                                @click="checkSimpleAnswer"
                                :disabled="!selectedSimpleOption || cooldown"
                                class="w-full px-4 py-3 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-all"
                            >
                                ✅ VALIDER MA RÉPONSE
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Log + décodeur -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Log encodé -->
                    <div
                        class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline"
                    >
                        <div class="flex items-center gap-2 mb-4">
                            <FileText class="w-5 h-5 text-cyber-red" />
                            <h3 class="font-cyber font-bold text-cyber-red">
                                LOG ENCODÉ
                            </h3>
                        </div>

                        <div
                            class="bg-black/50 border border-cyber-red/30 rounded p-4 font-tech text-sm text-gray-300 mb-4"
                        >
                            <div class="text-cyber-red mb-2">
                                [ERREUR] Échec de l'authentification
                            </div>
                            <div class="text-cyber-red mb-2">
                                [ALERTE] Intrusion détectée sur le pare-feu
                            </div>
                            <div class="text-yellow-500 mb-2">
                                [INFO] Question de sécurité du pare-feu :
                                <span
                                    class="block mt-1 break-all select-all text-yellow-300"
                                    >{{ ENCODED_QUESTION }}</span
                                >
                            </div>
                            <div class="text-cyber-red mb-2">
                                [ERREUR] Identifiants invalides
                            </div>
                            <div class="text-cyber-red mb-2">
                                [CRITIQUE] Système compromis
                            </div>
                        </div>

                        <div class="text-xs text-gray-500 font-tech">
                            <template v-if="encodingIdentified">
                                La ligne [INFO] contient la question encodée :
                                utilisez le décodeur pour la lire.
                            </template>
                            <template v-else>
                                Une ligne du log est encodée. Identifiez d'abord
                                son type ci-dessus pour déverrouiller le
                                décodeur.
                            </template>
                        </div>
                    </div>

                    <!-- Décodeur verrouillé -->
                    <div
                        v-if="!encodingIdentified"
                        class="bg-gray-800/60 backdrop-blur-md border-2 border-gray-600 rounded-lg p-6 scanline"
                    >
                        <div class="text-center">
                            <div
                                class="flex items-center justify-center gap-2 mb-4"
                            >
                                <Lock class="w-6 h-6 text-gray-400" />
                                <h3 class="font-bold text-gray-400">
                                    DÉCODEUR VERROUILLÉ
                                </h3>
                            </div>
                            <div class="text-gray-400">
                                <div class="text-sm mb-2">
                                    🔒 Le décodeur est verrouillé
                                </div>
                                <div class="text-xs">
                                    Identifiez d'abord le type de message
                                    ci-dessus pour débloquer le décodeur
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Décodeur -->
                    <div
                        v-else
                        class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
                    >
                        <div class="flex items-center gap-2 mb-4">
                            <Key class="w-5 h-5 text-cyber-blue" />
                            <h3 class="font-cyber font-bold text-cyber-blue">
                                DÉCODEUR
                            </h3>
                        </div>

                        <div class="space-y-4">
                            <!-- Type d'encodage -->
                            <div>
                                <label
                                    for="server-encoding"
                                    class="block text-sm font-tech text-gray-300 mb-2"
                                    >Type d'encodage</label
                                >
                                <select
                                    id="server-encoding"
                                    v-model="selectedEncoding"
                                    class="w-full px-4 py-3 bg-black/50 border border-cyber-blue/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyber-blue transition-all"
                                >
                                    <option value="">
                                        Sélectionnez le type d'encodage
                                    </option>
                                    <optgroup label="Encodages (sans clé)">
                                        <option
                                            v-for="encoding in ENCODINGS_ONLY"
                                            :key="encoding.value"
                                            :value="encoding.value"
                                        >
                                            {{ encoding.label }}
                                        </option>
                                    </optgroup>
                                    <optgroup label="Chiffrements">
                                        <option
                                            v-for="encoding in CIPHERS_ONLY"
                                            :key="encoding.value"
                                            :value="encoding.value"
                                        >
                                            {{ encoding.label }}
                                        </option>
                                    </optgroup>
                                </select>
                            </div>

                            <!-- Décodeur (apparaît pour tous les types) -->
                            <div
                                v-if="selectedEncodingInfo"
                                class="bg-black/30 border border-cyber-blue/30 rounded p-4"
                            >
                                <div
                                    class="text-cyber-blue font-tech text-sm mb-1"
                                >
                                    DÉCODEUR
                                    {{ selectedEncodingInfo.label.toUpperCase() }}
                                </div>
                                <div
                                    v-if="selectedEncodingInfo.note"
                                    class="text-xs font-tech text-gray-400 mb-2"
                                >
                                    {{ selectedEncodingInfo.note }}
                                </div>

                                <form
                                    class="mt-3 space-y-3"
                                    @submit.prevent="decodeMessage"
                                >
                                    <!-- Message à décoder -->
                                    <div>
                                        <div
                                            class="flex flex-wrap items-center justify-between gap-1 mb-1"
                                        >
                                            <label
                                                for="server-encoded"
                                                class="block text-xs font-tech text-gray-400"
                                                >Message encodé</label
                                            >
                                            <button
                                                type="button"
                                                @click="fillEncodedMessage"
                                                class="text-xs text-cyber-blue hover:text-cyber-blue/80 font-tech"
                                            >
                                                Utiliser le message du log
                                            </button>
                                        </div>
                                        <input
                                            id="server-encoded"
                                            v-model="messageToDecode"
                                            type="text"
                                            autocomplete="off"
                                            autocapitalize="off"
                                            autocorrect="off"
                                            spellcheck="false"
                                            enterkeyhint="go"
                                            placeholder="Collez le message encodé ici"
                                            class="w-full px-3 py-2 bg-black/50 border border-cyber-blue/30 rounded text-white font-tech text-sm focus:outline-none focus:border-cyber-blue transition-all"
                                        />
                                    </div>

                                    <!-- Bouton de décodage -->
                                    <button
                                        type="submit"
                                        :disabled="!messageToDecode.trim()"
                                        class="w-full px-4 py-2 bg-cyber-blue/20 border border-cyber-blue/50 text-cyber-blue font-tech text-sm rounded hover:bg-cyber-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        DÉCODER
                                    </button>
                                </form>

                                <!-- Résultat du décodage -->
                                <div v-if="decodedResult" class="mt-3">
                                    <div
                                        class="flex flex-wrap items-center justify-between gap-1 mb-1"
                                    >
                                        <span
                                            class="block text-xs font-tech text-gray-400"
                                            >Résultat décodé</span
                                        >
                                        <button
                                            v-if="!decodeError"
                                            type="button"
                                            @click="copyDecodedResult"
                                            class="text-xs text-cyber-blue hover:text-cyber-blue/80 font-tech flex items-center gap-1 transition-all"
                                            title="Copier le résultat"
                                        >
                                            <Copy class="w-3 h-3" />
                                            Copier
                                        </button>
                                    </div>
                                    <div
                                        :class="
                                            decodeError
                                                ? 'bg-red-900/20 border-red-500/50 text-red-300'
                                                : 'bg-green-900/30 border-green-500/50 text-green-400'
                                        "
                                        class="w-full px-3 py-2 border rounded font-tech text-sm break-words"
                                        aria-live="polite"
                                    >
                                        {{ decodedResult }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Message décodé pour validation -->
                        <form
                            v-if="decodedResult && !decodeError"
                            class="mt-6"
                            @submit.prevent="checkDecoding"
                        >
                            <div
                                class="flex flex-wrap items-center justify-between gap-1 mb-2"
                            >
                                <label
                                    for="server-decoded"
                                    class="block text-sm font-tech text-gray-300"
                                    >Message décodé</label
                                >
                                <button
                                    type="button"
                                    @click="useDecodedResult"
                                    class="text-xs text-cyber-blue hover:text-cyber-blue/80 font-tech"
                                >
                                    Utiliser le résultat décodé
                                </button>
                            </div>
                            <input
                                id="server-decoded"
                                v-model="decodedMessage"
                                type="text"
                                autocomplete="off"
                                enterkeyhint="go"
                                placeholder="Entrez le message décodé"
                                class="w-full px-4 py-3 bg-black/50 border border-cyber-blue/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyber-blue transition-all"
                            />

                            <!-- Bouton de vérification -->
                            <button
                                type="submit"
                                :disabled="!decodedMessage.trim() || cooldown"
                                class="w-full mt-4 px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
                            >
                                VÉRIFIER LE MESSAGE
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Étape 2 : répondre à la question décodée -->
            <div
                v-if="puzzleDecoded && !isCompleted"
                class="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
                <!-- Question décodée -->
                <div
                    class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline"
                >
                    <div class="flex items-center gap-2 mb-4">
                        <Brain class="w-5 h-5 text-cyber-red" />
                        <h3 class="font-cyber font-bold text-cyber-red">
                            ÉNIGME DÉCODÉE
                        </h3>
                    </div>

                    <div
                        class="bg-cyber-red/10 border border-cyber-red/50 rounded p-4 mb-4"
                    >
                        <div class="text-cyber-red font-cyber font-bold mb-2">
                            QUESTION DE SÉCURITÉ
                        </div>
                        <div class="text-white font-tech text-lg mb-2">
                            Répondez à cette question pour restaurer l'accès au
                            serveur :
                        </div>
                        <div
                            class="text-cyber-blue font-cyber text-lg sm:text-xl font-bold text-center py-4 px-2 bg-black/30 rounded break-words"
                        >
                            {{ DECODED_QUESTION }}
                        </div>
                    </div>

                    <div class="text-xs text-gray-500 font-tech">
                        Le pare-feu attend la bonne réponse pour autoriser
                        l'accès.
                    </div>
                </div>

                <!-- Réponse -->
                <div
                    class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
                >
                    <div class="flex items-center gap-2 mb-4">
                        <Key class="w-5 h-5 text-cyber-blue" />
                        <h3 class="font-cyber font-bold text-cyber-blue">
                            RÉPONSE
                        </h3>
                    </div>

                    <form class="space-y-4" @submit.prevent="checkPuzzleAnswer">
                        <div>
                            <label
                                for="server-answer"
                                class="block text-sm font-tech text-gray-300 mb-2"
                                >Votre réponse</label
                            >
                            <input
                                id="server-answer"
                                v-model="puzzleAnswer"
                                type="text"
                                autocomplete="off"
                                enterkeyhint="go"
                                placeholder="Réponse en kilogrammes"
                                class="w-full px-4 py-3 bg-black/50 border border-cyber-blue/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyber-blue transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            :disabled="!puzzleAnswer.trim() || cooldown"
                            class="w-full px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
                        >
                            VÉRIFIER LA RÉPONSE
                        </button>
                    </form>
                </div>
            </div>

            <!-- Indices -->
            <div v-if="!isCompleted" class="mt-8">
                <div
                    class="bg-gray-800/40 backdrop-blur-md border border-gray-600 rounded-lg p-6"
                >
                    <div
                        class="flex flex-wrap items-center justify-between gap-2 mb-4"
                    >
                        <div class="flex items-center gap-2">
                            <Lightbulb class="w-5 h-5 text-yellow-500" />
                            <h4 class="font-cyber font-bold text-yellow-500">
                                INDICES
                            </h4>
                        </div>
                        <span class="text-xs font-tech text-gray-400">
                            {{ HINT_PHASE_LABELS[currentPhase] }} ·
                            {{ revealedCount }}/{{ phaseHints.length }}
                        </span>
                    </div>

                    <div
                        class="space-y-2 text-sm text-gray-300"
                        aria-live="polite"
                    >
                        <p
                            v-if="revealedCount === 0"
                            class="text-xs font-tech text-gray-500"
                        >
                            Aucun indice affiché pour cette étape.
                        </p>
                        <div
                            v-for="(hint, index) in revealedHints"
                            :key="`${currentPhase}-${index}`"
                            class="fade-in"
                        >
                            💡 {{ hint.text }}
                            <span
                                v-if="hint.answer"
                                class="text-cyber-green font-bold"
                                >{{ hint.answer }}</span
                            >
                        </div>
                    </div>

                    <button
                        type="button"
                        @click="showHint"
                        :disabled="!canRevealHint || hintCooldown"
                        class="mt-4 px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 font-tech text-sm rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        {{ hintButtonLabel }}
                    </button>
                </div>
            </div>

            <!-- Message de succès -->
            <div v-if="isCompleted" class="mt-8">
                <div
                    class="bg-cyber-green/20 backdrop-blur-md border-2 border-cyber-green rounded-lg p-6 text-center"
                >
                    <div
                        class="flex flex-wrap items-center justify-center gap-2 mb-4"
                    >
                        <CheckCircle class="w-8 h-8 text-cyber-green" />
                        <h3
                            class="text-xl sm:text-2xl font-cyber font-bold text-cyber-green"
                        >
                            SALLE TERMINÉE !
                        </h3>
                    </div>
                    <p class="text-gray-300 mb-4">
                        Bravo ! Vous avez décodé la question de sécurité cachée
                        dans les logs et restauré le pare-feu. Les données de
                        santé de l'hôpital sont de nouveau protégées.
                    </p>
                    <div
                        class="text-left bg-black/30 border border-cyber-green/40 rounded p-4 mb-6 text-sm text-gray-300 space-y-2"
                    >
                        <div class="font-cyber font-bold text-cyber-green">
                            📌 À RETENIR
                        </div>
                        <p>
                            Base64 est un <strong>encodage</strong>, pas un
                            chiffrement : n'importe qui peut le décoder en un
                            clic, sans clé.
                        </p>
                        <p>
                            Pour protéger des données de santé, il faut un vrai
                            chiffrement (par exemple AES) avec une clé secrète,
                            et ne jamais laisser d'informations sensibles
                            lisibles dans les journaux (logs).
                        </p>
                        <p>
                            🩸 Le saviez-vous ? En France, on peut donner son
                            sang de 18 à 70 ans, à condition de peser au moins
                            50 kg.
                        </p>
                    </div>
                    <button
                        type="button"
                        @click="$emit('exit-room')"
                        class="w-full sm:w-auto px-8 py-3 bg-cyber-green hover:bg-cyber-green/80 text-black font-cyber font-bold rounded-lg transition-all"
                    >
                        CONTINUER VERS LA PROCHAINE SALLE
                    </button>
                </div>
            </div>
        </div>
    </GameRoom>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onUnmounted } from "vue";
import {
    HelpCircle,
    FileText,
    Lock,
    Key,
    Copy,
    Brain,
    Lightbulb,
    CheckCircle,
} from "lucide-vue-next";
import GameRoom from "../GameRoom.vue";
import { createFireworks } from "../../utils/fireworks";
import { useToast } from "../../composables/useToast";
import { useGameState } from "../../composables/useGameState";
import { PENALTY_PER_HINT } from "../../utils/scoring";

const ROOM_ID = "server";

const emit = defineEmits(["exit-room", "room-completed"]);
const { showSuccess, showError, showInfo } = useToast();
const { gameState, addError, addHint, completeRoom, PENALTY_PER_ERROR } =
    useGameState();

// Données de la salle
const roomData = {
    title: "SALLE DU SERVEUR",
    subtitle: "Le pare-feu corrompu",
    description:
        "Une cyberattaque a compromis le pare-feu de l'hôpital. Le pirate a caché la question de sécurité du pare-feu dans les logs du système : identifiez l'encodage utilisé, décodez la question et répondez-y pour restaurer l'accès.",
    objective: "Sensibiliser à la sécurité des données de santé",
    icon: "server",
    color: "#ff0055",
};

// --- Données et fonctions pures (sans état) ---

// Message d'exemple du quiz (Base64 de « Vous allez bien ?? »)
const QUIZ_SAMPLE = "Vm91cyBhbGxleiBiaWVuID8/";

// Question cachée dans le log (Base64 de DECODED_QUESTION)
const ENCODED_QUESTION =
    "UXVlbCBlc3QgbGUgcG9pZHMgbWluaW11bSBwb3VyIGRvbm5lciBzb24gc2FuZyA/";
const DECODED_QUESTION = "Quel est le poids minimum pour donner son sang ?";

const VIGENERE_KEY = "CYBER";
const RAIL_FENCE_RAILS = 3;

// Fiches, options du quiz et du décodeur. Chaque exemple encode le mot « Hello ».
const ENCODINGS = [
    {
        value: "hex",
        label: "Hexadécimal",
        kind: "encodage",
        rule: "Seulement 0-9 et A-F (2 caractères par lettre)",
        example: "48656C6C6F",
        quiz: "Seulement des chiffres et des lettres de A à F",
    },
    {
        value: "binary",
        label: "Binaire",
        kind: "encodage",
        rule: "Seulement des 0 et des 1 (8 par lettre)",
        example: "01001000 01100101 01101100 01101100 01101111",
        quiz: "Seulement des 0 et des 1",
    },
    {
        value: "ascii",
        label: "ASCII",
        kind: "encodage",
        rule: "Un nombre par lettre, séparés par des espaces",
        example: "72 101 108 108 111",
        quiz: "Des nombres séparés par des espaces",
    },
    {
        value: "morse",
        label: "Morse",
        kind: "encodage",
        rule: "Points et tirets",
        example: ".... . .-.. .-.. ---",
        quiz: "Des points et des tirets",
    },
    {
        value: "base64",
        label: "Base64 (Web)",
        kind: "encodage",
        rule: "Lettres, chiffres, + et /, parfois = à la fin",
        example: "SGVsbG8=",
        quiz: "Utilisé sur internet : lettres, chiffres et symboles",
    },
    {
        value: "caesar",
        label: "César (ROT13)",
        kind: "chiffrement",
        rule: "Chaque lettre décalée dans l'alphabet (ici de 13 rangs)",
        example: "Uryyb",
        quiz: "Lettres décalées",
        note: "Décalage utilisé : 13 lettres (ROT13).",
    },
    {
        value: "vigenere",
        label: "Vigenère",
        kind: "chiffrement",
        rule: `Décalage variable selon une clé (ici : ${VIGENERE_KEY})`,
        example: "Jcmpf",
        quiz: "Chiffrement par clé",
        note: `Clé utilisée : ${VIGENERE_KEY}.`,
    },
    {
        value: "railfence",
        label: "Rail Fence",
        kind: "chiffrement",
        rule: `Lettres écrites en zigzag sur ${RAIL_FENCE_RAILS} rails puis relues ligne par ligne`,
        example: "Hoell",
        quiz: "Lettres réorganisées",
        note: `Nombre de rails : ${RAIL_FENCE_RAILS}.`,
    },
    {
        value: "reverse",
        label: "Inversé",
        kind: "chiffrement",
        rule: "Texte écrit à l'envers (sans clé : aucune protection)",
        example: "olleH",
        quiz: "Texte à l'envers",
    },
];
const ENCODINGS_ONLY = ENCODINGS.filter((e) => e.kind === "encodage");
const CIPHERS_ONLY = ENCODINGS.filter((e) => e.kind === "chiffrement");

const STEPS = [
    "IDENTIFIER L'ENCODAGE",
    "DÉCODER LE LOG",
    "RÉPONDRE À LA QUESTION",
];

// Indices par étape. Le nombre d'indices payés est réparti sur ces étapes.
const HINT_PHASES = ["identify", "decode", "riddle"];
const HINT_PHASE_LABELS = {
    identify: "Étape 1 · identifier",
    decode: "Étape 2 · décoder",
    riddle: "Étape 3 · répondre",
};
const HINTS = {
    identify: [
        {
            text: "Comparez le message avec les fiches : un mélange de majuscules, de minuscules, de chiffres et de « / » élimine l'hexadécimal, le binaire, l'ASCII et le Morse.",
        },
        {
            text: "César, Vigenère, Rail Fence et Inversé ne font que modifier ou déplacer les lettres d'un texte : on y verrait encore des espaces entre les mots. Ici, aucun espace : c'est un encodage utilisé partout sur le web (pièces jointes d'e-mails, images…).",
        },
        { text: "La bonne réponse est :", answer: "Base64 (Web)" },
    ],
    decode: [
        {
            text: "Dans le décodeur, choisissez « Base64 (Web) », puis cliquez sur « Utiliser le message du log ».",
        },
        {
            text: "Cliquez sur DÉCODER, puis sur « Utiliser le résultat décodé » (ou recopiez la phrase) et enfin sur VÉRIFIER LE MESSAGE.",
        },
        {
            text: "Le message décodé est :",
            answer: `« ${DECODED_QUESTION} »`,
        },
    ],
    riddle: [
        {
            text: "C'est un nombre rond compris entre 40 et 60, exprimé en kilogrammes.",
        },
        {
            text: "À chaque don, on prélève environ 450 mL de sang : un poids minimum est exigé pour que ce soit sans danger pour le donneur.",
        },
        { text: "La réponse est :", answer: "50 kg" },
    ],
};

// Normalisation des réponses tapées : accents, casse, espaces, guillemets et ponctuation finale
const normalizeText = (value) =>
    String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[’‘`´]/g, "'")
        .replace(/\s+/g, " ")
        .replace(/^[\s"'«»“”]+/, "")
        .replace(/[\s"'«»“”.!?…;:,]+$/, "")
        .trim();

const levenshtein = (a, b) => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const current = [i];
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            current[j] = Math.min(
                previous[j] + 1,
                current[j - 1] + 1,
                previous[j - 1] + cost,
            );
        }
        previous = current;
    }
    return previous[b.length];
};

// Ignore espaces et ponctuation, tolère 2 fautes de frappe (clavier de téléphone, correcteur)
const compactText = (value) => normalizeText(value).replace(/[^a-z0-9]/g, "");
const isDecodedQuestion = (value) => {
    const typed = compactText(value);
    const expected = compactText(DECODED_QUESTION);
    return typed.length > 0 && levenshtein(typed, expected) <= 2;
};

// « 50 », « 50 kg », « 50kgs », « 50 kilos », « 50 kilogrammes », « cinquante », « au moins 50 kg »,
// « il faut peser plus de 50 kg », « 50 kg ou plus »… (refuse 45, 500, 50 g, moins de 50 kg…)
const RIDDLE_ANSWER = new RegExp(
    "^(?:(?:il faut|on doit|faut)\\s+)?(?:(?:peser|faire)\\s+)?" +
        "(?:(?:au moins|au minimum|minimum|mini|min|plus de|>=|≥|>)\\s*)?" +
        "(?:50(?:[.,]0+)?|cinquante)\\s*" +
        "(?:kgs?|kilos?|kilo-?\\s?grammes?)?" +
        "(?:\\s*(?:au minimum|minimum|mini|min|au moins|ou plus|et plus|\\+))?$",
);
const isRiddleAnswer = (value) => RIDDLE_ANSWER.test(normalizeText(value));

const bytesToText = (bytes) => new TextDecoder("utf-8").decode(bytes);

const railFenceDecode = (text, rails) => {
    const chars = Array.from(text);
    const cycle = 2 * rails - 2;
    if (rails < 2 || chars.length <= 1) return text;
    const railOf = (i) => {
        const pos = i % cycle;
        return pos < rails ? pos : cycle - pos;
    };
    const counts = Array(rails).fill(0);
    chars.forEach((_, i) => counts[railOf(i)]++);
    const railChars = [];
    let start = 0;
    for (let r = 0; r < rails; r++) {
        railChars.push(chars.slice(start, start + counts[r]));
        start += counts[r];
    }
    const read = Array(rails).fill(0);
    return chars.map((_, i) => railChars[railOf(i)][read[railOf(i)]++]).join("");
};

const MORSE_TABLE = {
    ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E",
    "..-.": "F", "--.": "G", "....": "H", "..": "I", ".---": "J",
    "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O",
    ".--.": "P", "--.-": "Q", ".-.": "R", "...": "S", "-": "T",
    "..-": "U", "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y",
    "--..": "Z", "-----": "0", ".----": "1", "..---": "2",
    "...--": "3", "....-": "4", ".....": "5", "-....": "6",
    "--...": "7", "---..": "8", "----.": "9", "/": " ",
};

// Chaque décodeur lève une erreur si le message n'est pas dans son format
const DECODERS = {
    base64: (input) => {
        const binary = atob(input.replace(/\s+/g, ""));
        return bytesToText(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
    },
    hex: (input) => {
        const clean = input.replace(/\s+/g, "").replace(/^0x/i, "");
        if (!/^(?:[0-9a-f]{2})+$/i.test(clean)) throw new Error("format");
        const bytes = clean.match(/../g).map((h) => parseInt(h, 16));
        return bytesToText(Uint8Array.from(bytes));
    },
    binary: (input) => {
        const clean = input.replace(/\s+/g, "");
        if (!/^(?:[01]{8})+$/.test(clean)) throw new Error("format");
        const bytes = clean.match(/.{8}/g).map((b) => parseInt(b, 2));
        return bytesToText(Uint8Array.from(bytes));
    },
    ascii: (input) => {
        if (!/^\d{1,3}(?:[\s,;]+\d{1,3})*$/.test(input)) throw new Error("format");
        const codes = input.match(/\d+/g).map(Number);
        if (codes.some((code) => code > 255)) throw new Error("format");
        return String.fromCharCode(...codes);
    },
    morse: (input) => {
        const clean = input.replace(/[·•]/g, ".").replace(/[−–—_]/g, "-");
        if (!/^[.\-\/\s]+$/.test(clean)) throw new Error("format");
        return clean
            .trim()
            .split(/\s+/)
            .map((code) => MORSE_TABLE[code] ?? "?")
            .join("")
            .replace(/\s+/g, " ")
            .trim();
    },
    caesar: (input) =>
        input.replace(/[a-zA-Z]/g, (c) => {
            const base = c <= "Z" ? 65 : 97;
            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
        }),
    vigenere: (input) => {
        let keyIndex = 0;
        return input.replace(/[a-zA-Z]/g, (c) => {
            const base = c <= "Z" ? 65 : 97;
            const shift =
                VIGENERE_KEY.charCodeAt(keyIndex % VIGENERE_KEY.length) - 65;
            keyIndex++;
            return String.fromCharCode(
                ((c.charCodeAt(0) - base - shift + 26) % 26) + base,
            );
        });
    },
    railfence: (input) => railFenceDecode(input, RAIL_FENCE_RAILS),
    reverse: (input) => Array.from(input).reverse().join(""),
};

// --- fin des fonctions pures ---

const ERROR_COOLDOWN_MS = 1000;
const HINT_COOLDOWN_MS = 600;
const FEEDBACK_MS = { success: 500, error: 300 };
const PROGRESS_STORAGE_KEY = "cyberhopital:room:server:v1";

// Salle déjà terminée : on peut la rejouer sans pénalité
const isReplay = Boolean(gameState.completedRooms?.includes(ROOM_ID));

// État du jeu
const selectedSimpleOption = ref("");
const triedOptions = ref([]);
const encodingIdentified = ref(false);
const selectedEncoding = ref("");
const messageToDecode = ref("");
const decodedResult = ref("");
const decodeError = ref(false);
const decodedMessage = ref("");
const puzzleDecoded = ref(false);
const puzzleAnswer = ref("");
const isCompleted = ref(false);
const cooldown = ref(false);
const hintCooldown = ref(false);
const feedback = ref("");
const progressBar = ref(null);
const hintsByPhase = reactive({ identify: 0, decode: 0, riddle: 0 });

let unmounted = false;
let cooldownTimer = null;
let hintCooldownTimer = null;
let feedbackTimer = null;

const currentStep = computed(() => {
    if (isCompleted.value) return STEPS.length;
    if (puzzleDecoded.value) return 2;
    if (encodingIdentified.value) return 1;
    return 0;
});

const stepClass = (index) => {
    if (index < currentStep.value)
        return "border-cyber-green/60 text-cyber-green bg-cyber-green/10";
    if (index === currentStep.value)
        return "border-cyber-blue text-cyber-blue bg-cyber-blue/10";
    return "border-gray-600 text-gray-500";
};

const feedbackClass = computed(() => {
    if (feedback.value === "success") return "server-room-flash";
    if (feedback.value === "error") return "server-room-shake";
    return "";
});

const selectedEncodingInfo = computed(
    () => ENCODINGS.find((e) => e.value === selectedEncoding.value) || null,
);

// --- Progression conservée quand on quitte la salle (RETOUR) ou recharge la page ---

// gameId est conservé par la sauvegarde de partie : la progression survit à un rechargement de la page
const currentGameKey = () =>
    gameState.gameId ? `${gameState.gameId}|${gameState.teamName}` : null;

const readSavedProgress = () => {
    const key = currentGameKey();
    if (!key) return null;
    try {
        const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : null;
        return data && data.gameKey === key ? data : null;
    } catch {
        return null;
    }
};

const saveProgress = () => {
    if (isReplay) return;
    const key = currentGameKey();
    if (!key) return;
    try {
        window.localStorage.setItem(
            PROGRESS_STORAGE_KEY,
            JSON.stringify({
                gameKey: key,
                encodingIdentified: encodingIdentified.value,
                puzzleDecoded: puzzleDecoded.value,
                hints: { ...hintsByPhase },
            }),
        );
    } catch {
        // Stockage indisponible : la progression reste en mémoire.
    }
};

const clearProgress = () => {
    try {
        window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
        // Rien à nettoyer.
    }
};

const currentPhase = computed(() => {
    if (!encodingIdentified.value) return "identify";
    if (!puzzleDecoded.value) return "decode";
    return "riddle";
});

const restoreProgress = () => {
    if (isReplay) return;
    const paid = Math.max(0, Math.floor(Number(gameState.roomHints?.[ROOM_ID]) || 0));
    const saved = readSavedProgress();

    if (saved) {
        encodingIdentified.value = Boolean(saved.encodingIdentified);
        puzzleDecoded.value =
            encodingIdentified.value && Boolean(saved.puzzleDecoded);
        const split = HINT_PHASES.map((phase) =>
            Math.min(
                HINTS[phase].length,
                Math.max(0, Math.floor(Number(saved.hints?.[phase]) || 0)),
            ),
        );
        if (split.reduce((sum, n) => sum + n, 0) === paid) {
            HINT_PHASES.forEach((phase, i) => (hintsByPhase[phase] = split[i]));
            return;
        }
    }

    // Répartition déterministe des indices déjà payés : d'abord l'étape en cours,
    // puis les autres dans l'ordre. Le nombre d'indices visibles = le nombre payé.
    let remaining = paid;
    const order = [
        currentPhase.value,
        ...HINT_PHASES.filter((p) => p !== currentPhase.value),
    ];
    for (const phase of order) {
        const count = Math.min(remaining, HINTS[phase].length);
        hintsByPhase[phase] = count;
        remaining -= count;
    }
};

restoreProgress();

// --- Indices ---

const phaseHints = computed(() => HINTS[currentPhase.value]);
const revealedCount = computed(() => hintsByPhase[currentPhase.value]);
const revealedHints = computed(() =>
    phaseHints.value.slice(0, revealedCount.value),
);
const canRevealHint = computed(
    () => !isCompleted.value && revealedCount.value < phaseHints.value.length,
);
const hintButtonLabel = computed(() => {
    if (!canRevealHint.value) return "PLUS D'INDICE DISPONIBLE";
    if (isReplay) return "AFFICHER UN INDICE (gratuit)";
    return `AFFICHER UN INDICE (−${PENALTY_PER_HINT} pt)`;
});

const showHint = () => {
    if (!canRevealHint.value || hintCooldown.value) return;
    hintsByPhase[currentPhase.value] += 1;
    if (!isReplay) addHint(ROOM_ID);
    saveProgress();
    hintCooldown.value = true;
    clearTimeout(hintCooldownTimer);
    hintCooldownTimer = setTimeout(() => {
        hintCooldown.value = false;
        hintCooldownTimer = null;
    }, HINT_COOLDOWN_MS);
};

// --- Retours visuels, pénalités ---

const playFeedback = (type) => {
    if (unmounted) return;
    clearTimeout(feedbackTimer);
    feedback.value = type;
    feedbackTimer = setTimeout(() => {
        feedback.value = "";
        feedbackTimer = null;
    }, FEEDBACK_MS[type]);
};

const startCooldown = () => {
    if (unmounted) return;
    cooldown.value = true;
    clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(() => {
        cooldown.value = false;
        cooldownTimer = null;
    }, ERROR_COOLDOWN_MS);
};

const penaltyText = () =>
    isReplay
        ? "Mode entraînement : pas de pénalité."
        : `+${PENALTY_PER_ERROR}s de pénalité`;

const registerError = () => {
    if (!isReplay) addError(ROOM_ID);
    playFeedback("error");
    startCooldown();
};

const scrollToProgress = () => {
    nextTick(() => {
        if (unmounted || !progressBar.value?.scrollIntoView) return;
        const reduceMotion = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)",
        )?.matches;
        progressBar.value.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
        });
    });
};

// --- Étape 1 : identification ---

const optionClass = (value) => {
    if (encodingIdentified.value) {
        return value === "base64"
            ? "bg-cyber-green/20 text-cyber-green border-cyber-green cursor-default"
            : "bg-gray-800 text-gray-500 border-gray-700 cursor-default";
    }
    // Une option déjà essayée est désactivée : la même erreur ne peut pas être comptée deux fois
    if (triedOptions.value.includes(value))
        return "bg-gray-800 text-gray-400 border-red-500/40 cursor-not-allowed";
    if (selectedSimpleOption.value === value)
        return "bg-blue-500 text-white border-blue-400";
    return "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600";
};

const selectSimpleOption = (value) => {
    if (encodingIdentified.value || triedOptions.value.includes(value)) return;
    selectedSimpleOption.value = value;
};

const checkSimpleAnswer = () => {
    if (encodingIdentified.value || cooldown.value || !selectedSimpleOption.value)
        return;
    if (triedOptions.value.includes(selectedSimpleOption.value)) return;

    if (selectedSimpleOption.value === "base64") {
        encodingIdentified.value = true;
        saveProgress();
        playFeedback("success");
        showSuccess(
            "🎉 EXCELLENT !",
            "C'est bien du Base64, un encodage très utilisé sur le web. Le décodeur est déverrouillé : à vous de lire le log !",
        );
        return;
    }

    const option = ENCODINGS.find((o) => o.value === selectedSimpleOption.value);
    if (!triedOptions.value.includes(selectedSimpleOption.value)) {
        triedOptions.value.push(selectedSimpleOption.value);
    }
    selectedSimpleOption.value = "";
    registerError();
    showError(
        "❌ RÉPONSE INCORRECTE",
        `${option?.label ?? "Ce type"} ne correspond pas. Comparez les caractères du message (majuscules, minuscules, chiffres, symbole, espaces) avec les fiches. ${penaltyText()}`,
    );
};

// --- Étape 1 : décodage ---

watch(selectedEncoding, () => {
    decodedResult.value = "";
    decodeError.value = false;
});

const fillEncodedMessage = () => {
    messageToDecode.value = ENCODED_QUESTION;
};

const decodeMessage = () => {
    const input = messageToDecode.value.trim();
    const encoding = selectedEncodingInfo.value;
    if (!input || !encoding) return;

    try {
        const decoded = DECODERS[encoding.value](input);
        if (!decoded) throw new Error("vide");
        decodedResult.value = decoded;
        decodeError.value = false;
    } catch {
        decodedResult.value = `Erreur de décodage : ce message n'est pas au format ${encoding.label}.`;
        decodeError.value = true;
    }
};

const copyDecodedResult = async () => {
    const text = decodedResult.value;
    if (!text || decodeError.value) return;
    try {
        await navigator.clipboard.writeText(text);
        showSuccess("COPIÉ", "Résultat copié dans le presse-papiers");
        return;
    } catch {
        // API Clipboard indisponible (contexte non sécurisé, ancien navigateur)
    }
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (copied) {
            showSuccess("COPIÉ", "Résultat copié dans le presse-papiers");
            return;
        }
    } catch {
        // Copie impossible
    }
    showInfo(
        "COPIE IMPOSSIBLE",
        "Utilisez le bouton « Utiliser le résultat décodé » ou recopiez la phrase.",
    );
};

const useDecodedResult = () => {
    if (decodedResult.value && !decodeError.value) {
        decodedMessage.value = decodedResult.value;
    }
};

const checkDecoding = () => {
    if (puzzleDecoded.value || cooldown.value || !encodingIdentified.value)
        return;
    if (!decodedMessage.value.trim()) return;

    if (isDecodedQuestion(decodedMessage.value)) {
        puzzleDecoded.value = true;
        saveProgress();
        playFeedback("success");
        showSuccess(
            "DÉCODAGE RÉUSSI",
            "Le log cachait la question de sécurité du pare-feu. Répondez-y pour restaurer l'accès !",
            6000,
        );
        scrollToProgress();
        return;
    }

    registerError();
    showError(
        "MESSAGE DÉCODÉ INCORRECT",
        `Ce n'est pas le message caché dans le log. Vérifiez le type de décodeur choisi et réessayez. ${penaltyText()}`,
    );
};

// --- Étape 2 : question de sécurité ---

const finishRoom = () => {
    if (isCompleted.value) return;
    isCompleted.value = true;
    clearProgress();
    completeRoom(ROOM_ID);
    emit("room-completed", ROOM_ID);

    playFeedback("success");
    createFireworks(3000);
    showSuccess(
        "PARE-FEU RESTAURÉ",
        "Bonne réponse : il faut peser au moins 50 kg pour donner son sang. À retenir : Base64 n'est pas un chiffrement, n'importe qui peut le décoder !",
        8000,
    );
    scrollToProgress();
};

const checkPuzzleAnswer = () => {
    if (isCompleted.value || !puzzleDecoded.value || cooldown.value) return;
    if (!puzzleAnswer.value.trim()) return;

    if (isRiddleAnswer(puzzleAnswer.value)) {
        finishRoom();
        return;
    }

    registerError();
    showError(
        "RÉPONSE INCORRECTE",
        `Ce n'est pas le bon poids. Pensez aux conditions pour donner son sang en France. ${penaltyText()}`,
    );
};

onUnmounted(() => {
    unmounted = true;
    clearTimeout(cooldownTimer);
    clearTimeout(hintCooldownTimer);
    clearTimeout(feedbackTimer);
    cooldownTimer = null;
    hintCooldownTimer = null;
    feedbackTimer = null;
});
</script>

<style>
/* Non scopé : Vue renomme les @keyframes d'un bloc scoped. Préfixe unique pour éviter les collisions. */
@keyframes server-room-success-flash {
    0%,
    100% {
        background-color: transparent;
    }
    50% {
        background-color: rgba(34, 197, 94, 0.1);
    }
}

@keyframes server-room-error-shake {
    0%,
    100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-5px);
    }
    75% {
        transform: translateX(5px);
    }
}

.server-room-flash {
    animation: server-room-success-flash 0.5s ease-in-out;
}

.server-room-shake {
    animation: server-room-error-shake 0.3s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
    .server-room-flash,
    .server-room-shake {
        animation: none;
    }
}
</style>
