<template>
  <section class="px-4 py-12 sm:py-20 relative">
    <!-- Mascotte décorative à gauche -->
    <div class="mascot-bg-left" aria-hidden="true">
      <img src="/mascotte/mascotte.png" alt="" />
    </div>

    <div class="max-w-7xl mx-auto rooms-content">
      <div class="text-center mb-10 sm:mb-16">
        <h2 class="text-3xl sm:text-4xl md:text-6xl font-cyber font-bold text-white mb-4">
          LES <span class="text-cyber-red">SALLES</span> VIRTUELLES
        </h2>
        <p class="text-gray-400 font-tech text-base sm:text-lg">
          Réparez les systèmes vitaux en résolvant les énigmes
        </p>

        <!-- Progression de la mission -->
        <div class="mt-8 max-w-2xl mx-auto">
          <!-- Compte à rebours (uniquement en partie) -->
          <div
            v-if="inGame"
            class="mb-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 rounded-lg border bg-gray-900/70"
            :class="isCritical ? 'border-cyber-red/70' : 'border-cyber-blue/40'"
            role="timer"
            :aria-label="`${countdownLabel} ${countdownValue}`"
          >
            <Hourglass
              class="w-5 h-5"
              :class="isCritical ? 'text-cyber-red' : 'text-cyber-blue'"
            />
            <span
              class="font-tech text-sm"
              :class="isOvertime ? 'text-cyber-red' : 'text-gray-400'"
            >
              {{ countdownLabel }}
            </span>
            <span
              class="font-cyber text-xl font-bold tabular-nums"
              :class="isCritical ? 'text-cyber-red' : 'text-cyber-blue'"
            >
              {{ countdownValue }}
            </span>
          </div>

          <div class="flex items-center justify-between mb-2 gap-2">
            <span class="font-tech text-sm text-gray-400">
              {{ inGame ? 'SALLES SÉCURISÉES' : 'PROGRESSION' }}
            </span>
            <span class="font-cyber text-lg text-cyber-blue font-bold">
              {{ completedCount }} / {{ ROOMS_CONFIG.length }}
            </span>
          </div>

          <div
            class="w-full bg-gray-800 rounded-full h-4 border-2 border-gray-700 overflow-hidden"
            role="progressbar"
            :aria-valuenow="completedCount"
            aria-valuemin="0"
            :aria-valuemax="ROOMS_CONFIG.length"
            :aria-label="`Progression de la mission : ${completedCount} salles sécurisées sur ${ROOMS_CONFIG.length}`"
          >
            <div
              class="h-full bg-gradient-to-r from-cyber-blue to-cyber-green transition-all duration-500 ease-out flex items-center justify-end pr-2"
              :style="{ width: `${progressPercentage}%` }"
            >
              <span v-if="completedCount > 0" class="text-xs font-bold text-black font-tech">
                {{ progressPercentage }}%
              </span>
            </div>
          </div>

          <div class="grid grid-cols-5 md:grid-cols-9 gap-1 mt-2 text-[10px] md:text-xs font-tech text-gray-500 text-center">
            <span
              v-for="room in ROOMS_CONFIG"
              :key="room.id"
              :class="{
                'text-cyber-green font-bold': isCompleted(room.id),
                'text-gray-300': isUnlocked(room.id) && !isCompleted(room.id),
              }"
            >
              {{ isCompleted(room.id) ? '✓ ' : '' }}{{ room.shortName }}
            </span>
          </div>
        </div>
      </div>

      <!-- Grille des salles -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <component
          :is="inGame ? 'button' : 'div'"
          v-for="(room, index) in ROOMS_CONFIG"
          :key="room.id"
          :type="inGame ? 'button' : undefined"
          :disabled="inGame ? !isPlayable(room.id) : undefined"
          :aria-label="inGame ? getCardLabel(room, index) : undefined"
          @click="handleRoomClick(room.id)"
          :class="[
            'room-card group block w-full text-left backdrop-blur-md border-2 rounded-lg p-6 scanline relative overflow-hidden transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-cyber-blue/70',
            getCardClass(room),
          ]"
        >
          <!-- Statut de la salle -->
          <div class="absolute top-4 right-4 flex items-center gap-2">
            <template v-if="!inGame">
              <span class="font-tech text-xs text-gray-500">
                SALLE {{ index + 1 }}/{{ ROOMS_CONFIG.length }}
              </span>
            </template>
            <template v-else-if="isCompleted(room.id)">
              <span
                class="px-2 py-0.5 rounded bg-cyber-green text-black font-tech text-xs font-bold"
              >
                SÉCURISÉE
              </span>
              <ShieldCheck class="w-6 h-6 text-cyber-green" />
            </template>
            <template v-else-if="isUnlocked(room.id)">
              <span
                v-if="room.id === nextRoomId"
                class="px-2 py-0.5 rounded border font-tech text-xs font-bold animate-pulse"
                :style="{ borderColor: room.color, color: room.color }"
              >
                PROCHAINE SALLE
              </span>
              <Unlock class="w-6 h-6 text-green-400" />
            </template>
            <template v-else>
              <span class="font-tech text-xs text-gray-500">VERROUILLÉE</span>
              <Lock class="w-6 h-6 text-gray-500" />
            </template>
          </div>

          <div class="p-0">
            <!-- Icône de la salle -->
            <div
              class="w-16 h-16 mb-4 rounded-lg flex items-center justify-center"
              :style="{
                backgroundColor: `${room.color}20`,
                border: `2px solid ${room.color}`
              }"
            >
              <component
                :is="getIconComponent(room.icon)"
                class="w-8 h-8"
                :style="{ color: room.color }"
              />
            </div>

            <h3
              class="text-xl sm:text-2xl font-cyber font-bold mb-2 break-words"
              :style="{ color: room.color }"
            >
              {{ room.title }}
            </h3>

            <p class="text-sm font-tech text-gray-400 mb-3">
              {{ room.subtitle }}
            </p>

            <p class="text-sm text-gray-300 mb-4">
              {{ room.description }}
            </p>

            <div class="space-y-2">
              <span
                class="inline-block px-3 py-1 border font-tech text-xs rounded"
                :style="{ borderColor: room.color, color: room.color }"
              >
                OBJECTIF
              </span>
              <p class="text-xs text-gray-400">
                {{ room.objective }}
              </p>
            </div>

            <!-- Salle sécurisée -->
            <div
              v-if="inGame && isCompleted(room.id)"
              class="mt-4 pt-4 border-t border-cyber-green/30 flex flex-wrap items-center justify-between gap-2"
            >
              <p class="text-xs font-tech text-cyber-green flex items-center gap-1">
                <CircleCheck class="w-4 h-4" />
                Système restauré
              </p>
              <p
                v-if="roomTimes[room.id] !== undefined"
                class="text-xs font-tech text-gray-400"
              >
                ⏱️ {{ formatTime(roomTimes[room.id]) }}
              </p>
            </div>

            <!-- Salle verrouillée -->
            <div
              v-else-if="inGame && !isUnlocked(room.id)"
              class="mt-4 pt-4 border-t border-gray-700"
            >
              <p class="text-xs font-tech text-yellow-500">
                {{ room.lockMessage }}
              </p>
            </div>

            <!-- Salle accessible -->
            <div
              v-else-if="inGame"
              class="mt-4 pt-4 border-t border-gray-700/60"
            >
              <p
                class="text-xs font-tech font-bold flex items-center gap-1"
                :style="{ color: room.color }"
              >
                ENTRER DANS LA SALLE
                <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </p>
            </div>
          </div>

          <div
            v-if="inGame && isPlayable(room.id)"
            class="absolute inset-0 opacity-0 group-hover:opacity-10 group-focus-visible:opacity-10 transition-opacity pointer-events-none"
            :style="{ backgroundColor: room.color }"
          ></div>
        </component>
      </div>

      <!-- Objectif Final -->
      <div class="mt-12 sm:mt-16">
        <div class="bg-gray-900/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-6 sm:p-8 max-w-3xl mx-auto">
          <h3 class="text-xl sm:text-2xl font-cyber font-bold text-cyber-green mb-4">
            🎯 OBJECTIF FINAL
          </h3>
          <p class="text-gray-300 leading-relaxed font-tech">
            Chaque énigme réussie débloque une clé pour restaurer une partie
            du système. À la fin de la mission, un débriefing récapitule ce que
            vous avez appris : protection des données de santé, fonctionnement
            du corps humain, gestes qui sauvent et travail d'équipe.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CircleCheck,
  ArrowRight,
  Hourglass,
  Server,
  Dna,
  ScanLine,
  Heart,
  Settings,
  HeartPulse,
  Volume2,
  Eye,
} from 'lucide-vue-next';
import { ROOMS_CONFIG } from '../config/roomsConfig';
import { useGameState } from '../composables/useGameState';
import { MISSION_DURATION } from '../utils/scoring';

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

const emit = defineEmits(['enter-room']);

const gameStateApi = useGameState();
const { gameState, formatTime, getTotalTime } = gameStateApi;

// En partie : cartes interactives (boutons). Sur la page d'accueil : simple aperçu.
const inGame = computed(() => Boolean(gameState.isGameStarted));

const roomTimes = computed(() => gameState.roomTimes || {});

// Nombre de salles réellement terminées (ignore d'éventuels doublons / ids inconnus)
const completedCount = computed(
  () => ROOMS_CONFIG.filter((room) => props.completedRooms.includes(room.id)).length,
);

const progressPercentage = computed(() => {
  if (ROOMS_CONFIG.length === 0) return 0;
  return Math.min(100, Math.round((completedCount.value / ROOMS_CONFIG.length) * 100));
});

const isUnlocked = (roomId) => props.unlockedRooms.includes(roomId);
const isCompleted = (roomId) => props.completedRooms.includes(roomId);
// Une salle terminée est sécurisée : on ne la rejoue pas (erreurs/indices compteraient dans la note)
const isPlayable = (roomId) => isUnlocked(roomId) && !isCompleted(roomId);

// Première salle accessible non terminée
const nextRoomId = computed(
  () => ROOMS_CONFIG.find((room) => isPlayable(room.id))?.id ?? null,
);

// --- Compte à rebours de la mission ---
const CRITICAL_TIME = 10 * 60;

const remainingTime = computed(() =>
  typeof gameStateApi.getRemainingTime === 'function'
    ? gameStateApi.getRemainingTime()
    : MISSION_DURATION - getTotalTime(),
);
const isOvertime = computed(() => remainingTime.value <= 0);
const isCritical = computed(() => remainingTime.value < CRITICAL_TIME);

const formatClock = (seconds) => {
  const s = Math.floor(Math.abs(Number(seconds) || 0));
  const minutes = Math.floor(s / 60);
  const secs = s % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const countdownLabel = computed(() => (isOvertime.value ? 'TEMPS DÉPASSÉ' : 'TEMPS RESTANT'));
const countdownValue = computed(() =>
  isOvertime.value ? `+${formatClock(remainingTime.value)}` : formatClock(remainingTime.value),
);

// --- Cartes ---
// Une seule classe de fond par état : deux utilitaires bg-* sur le même élément dépendraient
// de l'ordre de génération du CSS Tailwind, pas de l'ordre des classes.
const getCardClass = (room) => {
  if (!inGame.value) {
    return `${room.borderClass} bg-gray-900/80 cursor-default`;
  }
  if (isCompleted(room.id)) {
    // Teinte verte via un dégradé (background-image) posé sur le fond sombre (background-color)
    return 'border-cyber-green/60 bg-gray-900/90 bg-gradient-to-br from-cyber-green/10 to-transparent opacity-80 cursor-default';
  }
  if (isUnlocked(room.id)) {
    const highlight = room.id === nextRoomId.value ? ' shadow-lg shadow-cyan-500/20' : '';
    return `${room.borderClass} bg-gray-900/80 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10${highlight}`;
  }
  return 'border-gray-600 bg-gray-900/80 opacity-60 cursor-not-allowed';
};

const getCardLabel = (room, index) => {
  const position = `Salle ${index + 1} sur ${ROOMS_CONFIG.length}`;
  if (isCompleted(room.id)) return `${room.title} – ${position} – sécurisée`;
  if (isUnlocked(room.id)) return `${room.title} – ${position} – entrer dans la salle`;
  return `${room.title} – ${position} – verrouillée`;
};

const handleRoomClick = (roomId) => {
  if (!inGame.value || !isPlayable(roomId)) return;
  emit('enter-room', roomId);
};

const iconMap = {
  server: Server,
  dna: Dna,
  'scan-line': ScanLine,
  heart: Heart,
  settings: Settings,
  'heart-pulse': HeartPulse,
  'volume-2': Volume2,
  eye: Eye,
  'shield-check': ShieldCheck,
};

const getIconComponent = (iconName) => iconMap[iconName] || Server;
</script>

<style scoped>
.rooms-content {
  position: relative;
  z-index: 10;
}

.mascot-bg-left {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  pointer-events: none;
  z-index: 18;
  padding-left: clamp(0.5rem, 6vw, 4rem);
}

.mascot-bg-left img {
  width: clamp(280px, 36vw, 760px);
  max-height: 82vh;
  object-fit: contain;
  opacity: 0.46;
  transform: translateX(-14%) translateY(6%) scale(1.06);
  filter: brightness(1.48) saturate(1.4) drop-shadow(0 30px 64px rgba(0,0,0,0.72)) drop-shadow(0 0 40px rgba(34,197,94,0.22));
  mix-blend-mode: screen;
  transition: transform 240ms ease, opacity 200ms ease, filter 240ms ease;
  border-radius: 8px;
  z-index: 18;
  -webkit-mask-image: linear-gradient(to right, black 0%, black 58%, transparent 92%);
  mask-image: linear-gradient(to right, black 0%, black 58%, transparent 92%);
}

.mascot-bg-left img:hover {
  opacity: 0.5;
  transform: translateX(-12%) translateY(4%) scale(1.08);
  filter: brightness(1.55) saturate(1.45) drop-shadow(0 36px 72px rgba(0,0,0,0.78)) drop-shadow(0 0 44px rgba(34,197,94,0.26));
}

@media (max-width: 640px) {
  .mascot-bg-left { display: none; }
}

@media (min-width: 1400px) {
  .mascot-bg-left {
    padding-left: clamp(2rem, 10vw, 12rem);
  }
  .mascot-bg-left img {
    width: clamp(360px, 32vw, 920px);
    opacity: 0.52;
    transform: translateX(-20%) translateY(4%) scale(1.08);
    -webkit-mask-image: linear-gradient(to right, black 0%, black 64%, transparent 96%);
    mask-image: linear-gradient(to right, black 0%, black 64%, transparent 96%);
  }
}
</style>
