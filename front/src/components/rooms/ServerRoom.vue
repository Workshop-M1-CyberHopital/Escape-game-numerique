<template>
    <GameRoom :room-data="roomData" @exit-room="$emit('exit-room')">
      <!-- Interface réorganisée -->
      <div class="space-y-8">
        <!-- Guide d'apprentissage en premier -->
        <div
          class="bg-gray-800/60 backdrop-blur-md border-2 border-blue-500 rounded-lg p-6 scanline"
        >
          <div class="text-center mb-6">
            <div class="flex items-center justify-center gap-3 mb-4">
              <i data-lucide="help-circle" class="w-8 h-8 text-blue-400"></i>
              <h3 class="text-xl font-bold text-blue-400">
                COMMENT IDENTIFIER LE TYPE DE MESSAGE ?
              </h3>
            </div>
            <p class="text-gray-300">
              Apprenez à reconnaître les différents types de messages codés !
            </p>
          </div>
  
          <!-- Explication simple -->
          <div class="bg-gray-900/50 p-4 rounded border border-green-500/30 mb-6">
            <h4 class="font-bold text-green-300 mb-3">
              🔍 Regardez le message ci-dessous :
            </h4>
            <div class="bg-black/30 p-3 rounded border border-green-500/30 mb-3">
              <div class="font-mono text-green-400 text-sm break-all">
                {{ encryptedPuzzle }}
              </div>
            </div>
            <div class="text-sm text-gray-300">
              <p class="mb-2">Ce message contient :</p>
              <ul class="list-disc list-inside space-y-1 text-xs">
                <li>Des lettres (A-Z, a-z)</li>
                <li>Des chiffres (0-9)</li>
                <li>Des symboles (+ et /)</li>
              </ul>
            </div>
          </div>
  
           <!-- Types de messages expliqués simplement -->
           <div
             class="bg-gray-900/50 p-4 rounded border border-purple-500/30 mb-6"
           >
             <h4 class="font-bold text-purple-300 mb-3">
               📚 Types de messages codés :
             </h4>
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               <div class="bg-gray-800/50 p-3 rounded border border-purple-500/30">
                 <div class="font-bold text-purple-300 text-sm mb-1">
                   Hexadécimal
                 </div>
                 <div class="text-xs text-gray-300 mb-2">Seulement 0-9 et A-F</div>
                 <div class="text-xs font-mono text-green-400">48656C6C6F</div>
               </div>
               <div class="bg-gray-800/50 p-3 rounded border border-purple-500/30">
                 <div class="font-bold text-purple-300 text-sm mb-1">Binaire</div>
                 <div class="text-xs text-gray-300 mb-2">Seulement des 0 et 1</div>
                 <div class="text-xs font-mono text-green-400">01001000</div>
               </div>
               <div class="bg-gray-800/50 p-3 rounded border border-purple-500/30">
                 <div class="font-bold text-purple-300 text-sm mb-1">ASCII</div>
                 <div class="text-xs text-gray-300 mb-2">
                   Chiffres séparés par espaces
                 </div>
                 <div class="text-xs font-mono text-green-400">72 101 108</div>
               </div>
               <div class="bg-gray-800/50 p-3 rounded border border-purple-500/30">
                 <div class="font-bold text-purple-300 text-sm mb-1">Morse</div>
                 <div class="text-xs text-gray-300 mb-2">
                   Points et tirets
                 </div>
                 <div class="text-xs font-mono text-green-400">.... . .-.. .-.. ---</div>
               </div>
               <div class="bg-gray-800/50 p-3 rounded border border-purple-500/30">
                 <div class="font-bold text-purple-300 text-sm mb-1">
                   Base64 (Web)
                 </div>
                 <div class="text-xs text-gray-300 mb-2">
                   Lettres, chiffres, +, /
                 </div>
                 <div class="text-xs font-mono text-green-400">SGVsbG8=</div>
               </div>
               <div class="bg-gray-800/50 p-3 rounded border border-purple-500/30">
                 <div class="font-bold text-purple-300 text-sm mb-1">César (ROT13)</div>
                 <div class="text-xs text-gray-300 mb-2">
                   Lettres décalées
                 </div>
                 <div class="text-xs font-mono text-green-400">Uryyb</div>
               </div>
               <div class="bg-gray-800/50 p-3 rounded border border-purple-500/30">
                 <div class="font-bold text-purple-300 text-sm mb-1">Vigenère</div>
                 <div class="text-xs text-gray-300 mb-2">
                   Chiffrement par clé
                 </div>
                 <div class="text-xs font-mono text-green-400">Jgzzv</div>
               </div>
               <div class="bg-gray-800/50 p-3 rounded border border-purple-500/30">
                 <div class="font-bold text-purple-300 text-sm mb-1">Rail Fence</div>
                 <div class="text-xs text-gray-300 mb-2">
                   Lettres réorganisées
                 </div>
                 <div class="text-xs font-mono text-green-400">Hloel</div>
               </div>
               <div class="bg-gray-800/50 p-3 rounded border border-purple-500/30">
                 <div class="font-bold text-purple-300 text-sm mb-1">Inversé</div>
                 <div class="text-xs text-gray-300 mb-2">
                   Texte à l'envers
                 </div>
                 <div class="text-xs font-mono text-green-400">olleH</div>
               </div>
             </div>
           </div>
  
          <!-- Question simple -->
          <div class="bg-gray-900/50 p-4 rounded border border-blue-500/30">
            <h4 class="font-bold text-blue-300 mb-3 text-center">
              ❓ Quel type de message est-ce ?
            </h4>
            <div class="text-sm text-gray-300 mb-4">
              Le message contient des lettres, chiffres, + et /. Quel type
              correspond ?
            </div>
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="option in simpleOptions"
                :key="option.value"
                @click="selectSimpleOption(option.value)"
                :class="{
                                    'bg-blue-500 text-white border-blue-400': selectedSimpleOption === option.value,
                                    'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600': selectedSimpleOption !== option.value
                                }"
                class="p-3 rounded border text-sm font-bold transition-all text-left"
              >
                <div class="font-bold">{{ option.label }}</div>
                <div class="text-xs opacity-80">{{ option.description }}</div>
              </button>
            </div>
  
            <div class="mt-4">
              <button
                @click="checkSimpleAnswer"
                :disabled="!selectedSimpleOption"
                class="w-full px-4 py-3 bg-blue-500 hover:bg-blue-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded transition-all"
              >
                ✅ VALIDER MA RÉPONSE
              </button>
            </div>
          </div>
        </div>
  
        <!-- Interface en deux colonnes -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Log chiffré -->
          <div
            class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline"
          >
            <div class="flex items-center gap-2 mb-4">
              <i data-lucide="file-text" class="w-5 h-5 text-cyber-red"></i>
              <h3 class="font-cyber font-bold text-cyber-red">LOG CHIFFRÉ</h3>
            </div>
  
            <div
              class="bg-black/50 border border-cyber-red/30 rounded p-4 font-tech text-sm text-gray-300 mb-4"
            >
              <div class="text-cyber-red mb-2">[ERROR] Authentication failed</div>
              <div class="text-cyber-red mb-2">
                [WARN] Firewall breach detected
              </div>
              <div class="text-yellow-500 mb-2">
                [INFO] Attempting connection to: {{ encryptedPuzzle }}
              </div>
              <div class="text-cyber-red mb-2">[ERROR] Invalid credentials</div>
              <div class="text-cyber-red mb-2">[CRITICAL] System compromised</div>
            </div>
  
            <div class="text-xs text-gray-500 font-tech">
              Le message semble être encodé. Vous avez maintenant accès au
              décodeur !
            </div>
          </div>
  
          <!-- Message d'encouragement -->
          <div
            v-if="!encodingIdentified"
            class="bg-gray-800/60 backdrop-blur-md border-2 border-gray-600 rounded-lg p-6 scanline"
          >
            <div class="text-center">
              <div class="flex items-center justify-center gap-2 mb-4">
                <i data-lucide="lock" class="w-6 h-6 text-gray-400"></i>
                <h3 class="font-bold text-gray-400">DÉCODEUR VERROUILLÉ</h3>
              </div>
              <div class="text-gray-400">
                <div class="text-sm mb-2">🔒 Le décodeur est verrouillé</div>
                <div class="text-xs">
                  Identifiez d'abord le type de message ci-dessus pour débloquer
                  le décodeur
                </div>
              </div>
            </div>
          </div>
  
          <!-- Interface de décodage -->
          <div
            v-if="encodingIdentified"
            class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
          >
            <div class="flex items-center gap-2 mb-4">
              <i data-lucide="key" class="w-5 h-5 text-cyber-blue"></i>
              <h3 class="font-cyber font-bold text-cyber-blue">DÉCODEUR</h3>
            </div>
  
            <div class="space-y-4">
              <!-- Type d'encodage -->
              <div>
                <label class="block text-sm font-tech text-gray-300 mb-2"
                  >Type d'encodage</label
                >
                 <select
                   v-model="selectedEncoding"
                   class="w-full px-4 py-3 bg-black/50 border border-cyber-blue/30 rounded-lg text-white font-tech focus:outline-none focus:border-cyber-blue transition-all"
                 >
                   <option value="">Sélectionnez le type d'encodage</option>
                   <option value="hex">Hexadécimal</option>
                   <option value="binary">Binaire</option>
                   <option value="ascii">ASCII</option>
                   <option value="morse">Morse</option>
                   <option value="base64">Base64 (Web)</option>
                   <option value="caesar">César (ROT13)</option>
                   <option value="vigenere">Vigenère</option>
                   <option value="railfence">Rail Fence</option>
                   <option value="reverse">Inversé</option>
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
                    <label class="block text-xs font-tech text-gray-400"
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
                  <div class="flex items-center justify-between mb-1">
                    <label class="block text-xs font-tech text-gray-400"
                      >Résultat décodé</label
                    >
                    <button
                      @click="copyDecodedResult"
                      class="text-xs text-cyber-blue hover:text-cyber-blue/80 font-tech flex items-center gap-1 transition-all"
                      title="Copier le résultat"
                    >
                      <i data-lucide="copy" class="w-3 h-3"></i>
                      Copier
                    </button>
                  </div>
                  <div
                    class="w-full px-3 py-2 bg-green-900/30 border border-green-500/50 rounded text-green-400 font-tech text-sm break-words overflow-wrap-anywhere"
                  >
                    {{ decodedResult }}
                  </div>
                </div>
              </div>
            </div>
            <!-- Message décodé pour validation -->
            <div v-if="decodedResult" class="mt-6">
              <label class="block text-sm font-tech text-gray-300 mb-2"
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
              v-if="decodedResult"
              @click="checkDecoding"
              :disabled="!decodedMessage"
              class="w-full mt-4 px-6 py-3 bg-cyber-green hover:bg-cyber-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-cyber font-bold rounded-lg transition-all"
            >
              VÉRIFIER LE MESSAGE
            </button>
          </div>
        </div>
      </div>
  
      <!-- Étape 2: Résolution de l'énigme -->
      <div
        v-if="puzzleDecoded && !puzzleSolved"
        class="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8"
      >
        <!-- Énigme décodée -->
        <div
          class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline"
        >
          <div class="flex items-center gap-2 mb-4">
            <i data-lucide="brain" class="w-5 h-5 text-cyber-red"></i>
            <h3 class="font-cyber font-bold text-cyber-red">ÉNIGME DÉCODÉE</h3>
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
            Le système de sécurité nécessite une réponse logique pour autoriser
            l'accès.
          </div>
        </div>
  
        <!-- Interface de réponse -->
        <div
          class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-blue rounded-lg p-6 scanline"
        >
          <div class="flex items-center gap-2 mb-4">
            <i data-lucide="key" class="w-5 h-5 text-cyber-blue"></i>
            <h3 class="font-cyber font-bold text-cyber-blue">RÉPONSE</h3>
          </div>
  
          <div class="space-y-4">
            <!-- Réponse à l'énigme -->
            <div>
              <label class="block text-sm font-tech text-gray-300 mb-2"
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
            <i data-lucide="lightbulb" class="w-5 h-5 text-yellow-500"></i>
            <h4 class="font-cyber font-bold text-yellow-500">INDICES</h4>
          </div>
  
          <div class="space-y-2 text-sm text-gray-300">
            <!-- Indices pour le décodage -->
            <div v-if="!puzzleDecoded">
              <div v-if="hintsShown >= 1" class="fade-in">
                💡 Le message est encodé avec un algorithme de chiffrement
                standard
              </div>
              <div v-if="hintsShown >= 2" class="fade-in">
                💡 Un encodage très courant sur internet transforme du texte en
                lettres, chiffres, + et /
              </div>
              <div v-if="hintsShown >= 3" class="fade-in">
                💡 Le message décodé est :
                <span class="text-cyber-green font-bold"
                  >Quel est le poids minimum pour donner son sang ?</span
                >
              </div>
            </div>
  
            <!-- Indices pour l'énigme -->
            <div v-if="puzzleDecoded && !puzzleSolved">
              <div v-if="hintsShown >= 1" class="fade-in">
                💡 C'est un nombre entre 40 et 60
              </div>
              <div v-if="hintsShown >= 2" class="fade-in">
                💡 C'est un poids minimum requis pour la sécurité du donneur
              </div>
              <div v-if="hintsShown >= 3" class="fade-in">
                💡 La réponse est :
                <span class="text-cyber-green font-bold">50 kg</span>
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
            <i data-lucide="check-circle" class="w-8 h-8 text-cyber-green"></i>
            <h3 class="text-2xl font-cyber font-bold text-cyber-green">
              SALLE TERMINÉE !
            </h3>
          </div>
          <p class="text-gray-300 mb-4">
            Excellent ! Vous avez réussi à décoder le mot de passe et à restaurer
            le pare-feu. La sécurité des données de santé est maintenant protégée.
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
  const encodingGuess = ref("");
  const encodingIdentified = ref(false);
  const selectedOption = ref("");
  const selectedSimpleOption = ref("");
  
   // Options pour le quiz (9 types d'encodage)
   const simpleOptions = ref([
       { value: "hex", label: "Hexadécimal", description: "Seulement des chiffres et lettres A-F" },
       { value: "binary", label: "Binaire", description: "Seulement des 0 et 1" },
       { value: "ascii", label: "ASCII", description: "Chiffres séparés par des espaces" },
       { value: "morse", label: "Morse", description: "Points et tirets" },
       { value: "base64", label: "Base64 (Web)", description: "Utilisé sur internet, contient + et /" },
       { value: "caesar", label: "César (ROT13)", description: "Lettres décalées" },
       { value: "vigenere", label: "Vigenère", description: "Chiffrement par clé" },
       { value: "railfence", label: "Rail Fence", description: "Lettres réorganisées" },
       { value: "reverse", label: "Inversé", description: "Texte à l'envers" }
   ]);
  
  // Énigme encodée (Base64 de "Quel est le poids minimum pour donner son sang ?")
  const encryptedPuzzle =
      "UXVlbCBlc3QgbGUgcG9pZHMgbWluaW11bSBwb3VyIGRvbm5lciBzb24gc2FuZyA/";
  const decodedPuzzle = ref("");
  
  const showHint = () => {
      hintsShown.value++;
      addHint("server");
  };
  
  // Fonctions pour l'interface simplifiée
  const selectSimpleOption = (value) => {
      selectedSimpleOption.value = value;
  };
  
  const checkSimpleAnswer = () => {
      if (selectedSimpleOption.value === "base64") {
          encodingIdentified.value = true;
          // Effet visuel de succès
          document.body.style.animation = "successFlash 0.5s ease-in-out";
          setTimeout(() => {
              document.body.style.animation = "";
          }, 500);
  
          showSuccess(
              "🎉 EXCELLENT !",
              "Bravo ! Vous avez identifié le bon type de message. C'est effectivement du Base64, utilisé sur internet. Le décodeur est maintenant débloqué !"
          );
      } else {
          // Effet visuel d'erreur
          document.body.style.animation = "errorShake 0.3s ease-in-out";
          setTimeout(() => {
              document.body.style.animation = "";
          }, 300);
  
          addError("server");
          const option = simpleOptions.value.find(opt => opt.value === selectedSimpleOption.value);
          showError(
              "❌ RÉPONSE INCORRECTE",
              `${option?.label} ne correspond pas. Regardez le message : il contient des lettres, chiffres, + et /. C'est du Base64 ! Réessayez ! +5s de pénalité`
          );
      }
  };
  
  const fillEncodedMessage = () => {
      messageToDecode.value = encryptedPuzzle;
  };
  
  const copyDecodedResult = async () => {
      try {
          await navigator.clipboard.writeText(decodedResult.value);
          showSuccess("COPIÉ", "Résultat copié dans le presse-papiers");
      } catch (error) {
          // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
          const textArea = document.createElement('textarea');
          textArea.value = decodedResult.value;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          showSuccess("COPIÉ", "Résultat copié dans le presse-papiers");
      }
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
  
  <style scoped>
  /* Animations pour les effets visuels */
  @keyframes successFlash {
    0%,
    100% {
      background-color: transparent;
    }
    50% {
      background-color: rgba(34, 197, 94, 0.1);
    }
  }
  
  @keyframes errorShake {
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
  </style>
  