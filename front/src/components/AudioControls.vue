<template>
  <div
    class="border-cyber-blue/50 fixed bottom-4 left-4 z-[60] flex flex-row sm:flex-col items-center gap-2 sm:gap-3 rounded-lg border bg-gray-900/80 p-2 sm:p-3 backdrop-blur-md"
    role="group"
    aria-label="Réglages audio"
  >
    <!-- Briefings vocaux : activables à tout moment (la permission du navigateur est demandée au clic) -->
    <button
      type="button"
      @click="toggleVoice"
      :disabled="isRequesting"
      :aria-pressed="audioState.isEnabled"
      :aria-label="voiceLabel"
      :title="voiceLabel"
      :class="[
        'rounded-lg border p-2 transition-all duration-300 hover:scale-110 disabled:cursor-wait disabled:opacity-60',
        audioState.isEnabled
          ? 'bg-cyber-green/20 border-cyber-green/50 text-cyber-green'
          : 'border-gray-500/50 bg-gray-700/40 text-gray-400'
      ]"
    >
      <Headphones v-if="audioState.isEnabled" class="h-5 w-5" />
      <HeadphoneOff v-else class="h-5 w-5" />
    </button>

    <!-- Son général (briefings vocaux et sons des salles) -->
    <button
      type="button"
      @click="onToggleMute"
      :aria-pressed="audioState.isMuted"
      :aria-label="muteLabel"
      :title="muteLabel"
      :class="[
        'rounded-lg border p-2 transition-all duration-300 hover:scale-110',
        audioState.isMuted
          ? 'border-red-500/50 bg-red-500/20 text-red-400'
          : 'bg-cyber-blue/20 border-cyber-blue/50 text-cyber-blue'
      ]"
    >
      <VolumeX v-if="audioState.isMuted" class="h-5 w-5" />
      <Volume2 v-else class="h-5 w-5" />
    </button>

    <!-- Volume (sur téléphone, les boutons de l'appareil suffisent) -->
    <div class="my-1 hidden sm:flex flex-col items-center gap-2">
      <Volume1 class="text-gray-400 h-4 w-4" aria-hidden="true" />
      <div class="relative flex h-24 w-8 items-center justify-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          :value="audioState.volume"
          @input="setVolume($event.target.value)"
          class="slider"
          :disabled="audioState.isMuted"
          aria-label="Volume"
          :aria-valuetext="`${Math.round(audioState.volume * 100)} %`"
        />
      </div>
      <span class="text-xs text-gray-400 font-tech">
        {{ Math.round(audioState.volume * 100) }}%
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { VolumeX, Volume2, Volume1, Headphones, HeadphoneOff } from "lucide-vue-next";
import { useAudio } from "../composables/useAudio";
import { useBriefing } from "../composables/useBriefing";
import { useToast } from "../composables/useToast";

const { audioState, setVolume, toggleMute, requestAudioPermission, disableAudio } = useAudio();
const { playActiveBriefingVoice, stopActiveBriefingVoice } = useBriefing();
const { showError, showInfo } = useToast();

const isRequesting = ref(false);
const PERMISSION_TIMEOUT_MS = 5000;

const voiceLabel = computed(() =>
  audioState.isEnabled
    ? "Briefings vocaux activés : cliquer pour les désactiver"
    : "Briefings vocaux désactivés : cliquer pour les activer"
);

const muteLabel = computed(() =>
  audioState.isMuted
    ? "Son coupé : cliquer pour réactiver le son du jeu"
    : "Couper le son du jeu (briefings et sons des salles)"
);

const toggleVoice = async () => {
  if (isRequesting.value) return;

  if (audioState.isEnabled) {
    stopActiveBriefingVoice();
    disableAudio();
    showInfo("BRIEFINGS VOCAUX", "Voix des briefings désactivée. Les sons des salles restent actifs.");
    return;
  }

  isRequesting.value = true;
  try {
    // Appel direct dans le clic : le navigateur autorise alors la lecture du son.
    // Délai maximal : le bouton ne doit pas rester bloqué si le navigateur ne répond pas.
    const granted = await Promise.race([
      requestAudioPermission(),
      new Promise((resolve) => setTimeout(() => resolve(audioState.isEnabled), PERMISSION_TIMEOUT_MS))
    ]);
    if (!granted) {
      showError(
        "AUDIO BLOQUÉ",
        "Le navigateur a refusé la lecture du son. Vérifiez que le son n'est pas bloqué pour ce site, puis réessayez."
      );
      return;
    }
    // Activer la voix suppose de l'entendre : on réactive le son s'il était coupé
    if (audioState.isMuted) toggleMute();
    playActiveBriefingVoice();
    showInfo("BRIEFINGS VOCAUX", "Voix des briefings activée.");
  } finally {
    isRequesting.value = false;
  }
};

const onToggleMute = () => {
  toggleMute();
  // La synthèse vocale est arrêtée quand on coupe le son : on la relance au retour du son
  if (!audioState.isMuted) playActiveBriefingVoice();
};
</script>

<style scoped>
.slider {
  -webkit-appearance: none;
  appearance: none;
  transform: rotate(270deg);
  width: 80px;
  height: 4px;
  background: #374151;
  border-radius: 0.5rem;
  cursor: pointer;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00ffff;
  cursor: pointer;
  border: 2px solid #0a0a15;
  box-shadow: 0 0 0 1px #00ffff;
}

.slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00ffff;
  cursor: pointer;
  border: 2px solid #0a0a15;
  box-shadow: 0 0 0 1px #00ffff;
}

.slider:hover::-webkit-slider-thumb {
  box-shadow: 0 0 6px #00ffff;
}
.slider:hover::-moz-range-thumb {
  box-shadow: 0 0 6px #00ffff;
}
</style>
