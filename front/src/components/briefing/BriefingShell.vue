<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/80 backdrop-blur-sm"
  >
    <div class="briefing-wrapper flex min-h-full items-center justify-center p-3 sm:p-4">
      <div
        ref="panelRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="briefing-panel bg-gray-900/95 border-2 rounded-lg max-w-4xl w-full max-h-[90vh] relative overflow-hidden flex flex-col focus:outline-none"
        :class="t.border"
      >
        <!-- Scanlines effect -->
        <div
          class="absolute inset-0 scanline opacity-20"
          :style="{ '--scan-color': t.scan }"
          aria-hidden="true"
        ></div>

        <!-- Header with agent info (toujours visible : le bouton de fermeture reste accessible) -->
        <div class="shrink-0 border-b p-4 sm:p-6" :class="t.borderSoft">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 sm:gap-4 min-w-0">
              <!-- Agent Avatar -->
              <div class="relative shrink-0">
                <div
                  class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br rounded-full flex items-center justify-center border-2"
                  :class="[avatarClass || t.avatar, t.border]"
                >
                  <svg
                    class="w-6 h-6 sm:w-8 sm:h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path :d="iconPath" />
                  </svg>
                </div>
                <!-- Status indicator -->
                <div
                  class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 animate-pulse"
                  :class="indicatorClass || t.dot"
                ></div>
              </div>

              <!-- Agent Info -->
              <div class="min-w-0">
                <h3 :id="titleId" class="text-lg sm:text-xl font-bold font-tech" :class="t.text">
                  {{ agent }}
                </h3>
                <p class="text-xs sm:text-sm text-gray-300 font-tech">
                  {{ unit }}
                </p>
                <div class="flex items-center gap-2 mt-1">
                  <div class="w-2 h-2 rounded-full animate-pulse shrink-0" :class="s.dot"></div>
                  <span class="text-xs font-tech" :class="s.text">{{ status }}</span>
                </div>
              </div>
            </div>

            <!-- Close Button -->
            <button
              type="button"
              @click="handleClose"
              class="shrink-0 w-10 h-10 sm:w-8 sm:h-8 border rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              :class="closeButtonClass"
              title="Fermer et couper l'audio (Échap)"
              aria-label="Fermer le briefing"
            >
              <svg
                class="w-4 h-4"
                :class="closeIconClass"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Message Content (défile si le message est plus haut que l'écran) -->
        <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6" data-briefing-voice>
          <div class="bg-gray-800/50 border rounded-lg p-4 sm:p-6" :class="t.boxBorder">
            <slot />
          </div>
        </div>

        <!-- Footer with progress -->
        <div class="shrink-0 border-t p-3 sm:p-4" :class="t.borderSoft">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-2 h-2 rounded-full animate-pulse shrink-0" :class="t.dot"></div>
              <span class="text-xs text-gray-400 font-tech truncate">{{ footer }}</span>
            </div>
            <div class="text-xs text-gray-500 font-tech shrink-0">
              [FERMETURE AUTO DANS {{ secondsRemaining }} s]
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useBriefing } from "../../composables/useBriefing";

// Thèmes de couleur (classes Tailwind complètes, conservées à l'identique des briefings d'origine)
const THEMES = {
  "cyber-blue": {
    border: "border-cyber-blue",
    borderSoft: "border-cyber-blue/50",
    boxBorder: "border-cyber-blue/30",
    text: "text-cyber-blue",
    dot: "bg-cyber-blue",
    avatar: "from-cyber-blue to-cyber-purple",
    closeAccent: "bg-cyber-blue/20 border-cyber-blue/50 hover:bg-cyber-blue/30",
    scan: "rgba(0, 255, 255, 0.03)",
  },
  red: {
    border: "border-red-500",
    borderSoft: "border-red-500/50",
    boxBorder: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
    avatar: "from-red-500 to-red-700",
    closeAccent: "bg-red-500/20 border-red-500/50 hover:bg-red-500/30",
    scan: "rgba(255, 0, 0, 0.03)",
  },
  green: {
    border: "border-green-500",
    borderSoft: "border-green-500/50",
    boxBorder: "border-green-500/30",
    text: "text-green-400",
    dot: "bg-green-400",
    avatar: "from-green-500 to-green-700",
    closeAccent: "bg-green-500/20 border-green-500/50 hover:bg-green-500/30",
    scan: "rgba(0, 255, 255, 0.03)",
  },
  "cyber-purple": {
    border: "border-cyber-purple",
    borderSoft: "border-cyber-purple/50",
    boxBorder: "border-cyber-purple/30",
    text: "text-cyber-purple",
    dot: "bg-cyber-purple",
    avatar: "from-cyber-purple to-purple-700",
    closeAccent: "bg-cyber-purple/20 border-cyber-purple/50 hover:bg-cyber-purple/30",
    scan: "rgba(0, 255, 255, 0.03)",
  },
  purple: {
    border: "border-purple-500",
    borderSoft: "border-purple-500/50",
    boxBorder: "border-purple-500/30",
    text: "text-purple-400",
    dot: "bg-purple-400",
    avatar: "from-purple-500 to-purple-700",
    closeAccent: "bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30",
    scan: "rgba(0, 255, 255, 0.03)",
  },
  cyan: {
    border: "border-cyan-500",
    borderSoft: "border-cyan-500/50",
    boxBorder: "border-cyan-500/30",
    text: "text-cyan-400",
    dot: "bg-cyan-400",
    avatar: "from-cyan-500 to-cyan-700",
    closeAccent: "bg-cyan-500/20 border-cyan-500/50 hover:bg-cyan-500/30",
    scan: "rgba(6, 182, 212, 0.03)",
  },
  "cyber-red": {
    border: "border-cyber-red",
    borderSoft: "border-cyber-red/50",
    boxBorder: "border-cyber-red/30",
    text: "text-cyber-red",
    dot: "bg-cyber-red",
    avatar: "from-cyber-red to-red-700",
    closeAccent: "bg-cyber-red/20 border-cyber-red/50 hover:bg-cyber-red/30",
    scan: "rgba(239, 68, 68, 0.03)",
  },
  "cyber-green": {
    border: "border-cyber-green",
    borderSoft: "border-cyber-green/50",
    boxBorder: "border-cyber-green/30",
    text: "text-cyber-green",
    dot: "bg-cyber-green",
    avatar: "from-cyber-green to-green-700",
    closeAccent: "bg-cyber-green/20 border-cyber-green/50 hover:bg-cyber-green/30",
    scan: "rgba(0, 255, 0, 0.03)",
  },
};

const ICON_PATHS = {
  target:
    "M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z",
  check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  heart:
    "M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z",
  file: "M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z",
  eye: "M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z",
};

const props = defineProps({
  visible: { type: Boolean, default: false },
  // Durée d'affichage (ms) : valeur de départ du compte à rebours
  duration: { type: Number, default: 45000 },
  // Id du registre useBriefing : le compte à rebours suit alors la fermeture automatique réelle
  briefingId: { type: String, default: "" },
  theme: { type: String, default: "cyber-blue" },
  icon: { type: String, default: "target" },
  agent: { type: String, default: "AGENT CYBER-001" },
  unit: { type: String, default: "Unité de Cybersécurité Médicale" },
  status: { type: String, default: "TRANSMISSION EN COURS" },
  statusTheme: { type: String, default: "" },
  footer: { type: String, default: "TRANSMISSION ACTIVE" },
  closeStyle: { type: String, default: "danger" }, // 'danger' (rouge) ou 'accent' (couleur du thème)
  avatarClass: { type: String, default: "" },
  indicatorClass: { type: String, default: "" },
});

const emit = defineEmits(["close"]);

const t = computed(() => THEMES[props.theme] || THEMES["cyber-blue"]);
const s = computed(() => THEMES[props.statusTheme] || t.value);
const iconPath = computed(() => ICON_PATHS[props.icon] || ICON_PATHS.target);
const closeButtonClass = computed(() =>
  props.closeStyle === "accent"
    ? t.value.closeAccent
    : "bg-red-500/20 border-red-500/50 hover:bg-red-500/30",
);
const closeIconClass = computed(() => (props.closeStyle === "accent" ? t.value.text : "text-red-400"));

const titleId = `briefing-title-${Math.random().toString(36).slice(2, 9)}`;
const panelRef = ref(null);

// --- Compte à rebours ---
// Briefing piloté par useBriefing : on affiche le temps restant réel (repoussé tant que la voix off joue).
// Utilisation autonome : compte à rebours local qui ferme le briefing à la fin de `duration`.
const { activeBriefing, briefingTimeRemaining } = useBriefing();
const isManaged = computed(
  () => Boolean(props.briefingId) && activeBriefing.value?.id === props.briefingId,
);

const localRemaining = ref(props.duration);
let localTimer = null;
let localDeadline = 0;

const stopLocalCountdown = () => {
  if (localTimer) {
    clearInterval(localTimer);
    localTimer = null;
  }
};

const startLocalCountdown = () => {
  stopLocalCountdown();
  if (isManaged.value || !props.visible) return;
  localDeadline = Date.now() + props.duration;
  localRemaining.value = props.duration;
  localTimer = setInterval(() => {
    const remaining = localDeadline - Date.now();
    localRemaining.value = Math.max(0, remaining);
    if (remaining <= 0) {
      stopLocalCountdown();
      emit("close");
    }
  }, 250);
};

const secondsRemaining = computed(() => {
  const remaining = isManaged.value ? briefingTimeRemaining.value : localRemaining.value;
  return Math.max(0, Math.ceil(remaining / 1000));
});

const handleClose = () => {
  emit("close");
};

// Modale : Échap ferme le briefing, et le clavier ne pilote pas la salle cachée derrière
const onKeydown = (event) => {
  if (!props.visible) return;
  if (event.key === "Escape") {
    event.preventDefault();
    handleClose();
  }
  event.stopPropagation();
};

let previousFocus = null;

const focusPanel = async () => {
  await nextTick();
  // Le focus quitte la salle (champ de saisie, bouton) sans activer le bouton de fermeture
  panelRef.value?.focus({ preventScroll: true });
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      startLocalCountdown();
      focusPanel();
    } else {
      stopLocalCountdown();
    }
  },
);

onMounted(() => {
  previousFocus = document.activeElement;
  window.addEventListener("keydown", onKeydown, true);
  if (props.visible) {
    startLocalCountdown();
    focusPanel();
  }
});

onUnmounted(() => {
  stopLocalCountdown();
  window.removeEventListener("keydown", onKeydown, true);
  if (previousFocus && previousFocus.isConnected && typeof previousFocus.focus === "function") {
    previousFocus.focus({ preventScroll: true });
  }
});
</script>

<style scoped>
.briefing-panel {
  max-height: 90vh;
  max-height: 90dvh;
}

/* Téléphone : on garde le bas de l'écran libre pour le panneau audio */
@media (max-width: 639px) {
  .briefing-wrapper {
    padding-bottom: 5.5rem;
  }
  .briefing-panel {
    max-height: calc(100vh - 7rem);
    max-height: calc(100dvh - 7rem);
  }
}

.scanline {
  background: linear-gradient(transparent 50%, var(--scan-color, rgba(0, 255, 255, 0.03)) 50%);
  background-size: 100% 4px;
  animation: briefing-scanline 0.1s linear infinite;
  pointer-events: none;
}

/* S'assurer que les boutons sont cliquables */
button {
  pointer-events: auto !important;
  position: relative;
  z-index: 10;
}

@keyframes briefing-scanline {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .scanline {
    animation: none;
  }
}
</style>
