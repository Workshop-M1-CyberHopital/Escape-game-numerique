<template>
  <section class="px-4 py-20 relative">
    <!-- Mascotte décorative à gauche -->
    <div class="mascot-bg-left" aria-hidden="true">
      <img src="/mascotte/mascotte.png" alt="" />
    </div>

    <div class="max-w-7xl mx-auto rooms-content">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-6xl font-cyber font-bold text-white mb-4">
          LES <span class="text-cyber-red">SALLES</span> VIRTUELLES
        </h2>
        <p class="text-gray-400 font-tech text-lg">
          Réparez les systèmes vitaux en résolvant les énigmes
        </p>

        <!-- Barre de progression -->
        <div class="mt-8 max-w-2xl mx-auto">
          <div class="flex items-center justify-between mb-2">
            <span class="font-tech text-sm text-gray-400">PROGRESSION</span>
            <span class="font-cyber text-lg text-cyber-blue font-bold">
              {{ completedRooms.length }} / {{ ROOMS_CONFIG.length }}
            </span>
          </div>

          <div class="w-full bg-gray-800 rounded-full h-4 border-2 border-gray-700 overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-cyber-blue to-cyber-green transition-all duration-500 ease-out flex items-center justify-end pr-2"
              :style="{ width: `${progressPercentage}%` }"
            >
              <span v-if="completedRooms.length > 0" class="text-xs font-bold text-black font-tech">
                {{ progressPercentage }}%
              </span>
            </div>
          </div>

          <div class="grid grid-cols-5 md:grid-cols-9 gap-1 mt-2 text-[10px] md:text-xs font-tech text-gray-500 text-center">
            <span
              v-for="room in ROOMS_CONFIG"
              :key="room.id"
              :class="{ 'text-cyber-green font-bold': isCompleted(room.id), 'text-gray-300': isUnlocked(room.id) && !isCompleted(room.id) }"
            >
              {{ room.shortName }}
            </span>
          </div>
        </div>
      </div>

      <!-- Grille des salles -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="room in ROOMS_CONFIG"
          :key="room.id"
          @click="handleRoomClick(room.id)"
          :class="[
            'room-card bg-gray-900/80 backdrop-blur-md border-2 rounded-lg p-6 scanline relative overflow-hidden transition-all duration-300 ease-out',
            isUnlocked(room.id)
              ? `${room.borderClass} cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10`
              : 'border-gray-600 opacity-60 cursor-not-allowed',
          ]"
        >
          <!-- Cadenas Statut -->
          <div class="absolute top-4 right-4">
            <Unlock v-if="isUnlocked(room.id)" class="w-6 h-6 text-green-400" />
            <Lock v-else class="w-6 h-6 text-gray-500" />
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
              class="text-2xl font-cyber font-bold mb-2"
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

            <div
              v-if="!isUnlocked(room.id)"
              class="mt-4 pt-4 border-t border-gray-700"
            >
              <p class="text-xs font-tech text-yellow-500">
                {{ room.lockMessage }}
              </p>
            </div>
          </div>

          <div
            v-if="isUnlocked(room.id)"
            class="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity pointer-events-none"
            :style="{ backgroundColor: room.color }"
          ></div>
        </div>
      </div>

      <!-- Objectif Final -->
      <div class="mt-16">
        <div class="bg-gray-900/60 backdrop-blur-md border-2 border-cyber-green rounded-lg p-8 max-w-3xl mx-auto">
          <h3 class="text-2xl font-cyber font-bold text-cyber-green mb-4">
            🎯 OBJECTIF FINAL
          </h3>
          <p class="text-gray-300 leading-relaxed font-tech">
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
import { computed } from 'vue';
import {
  Lock,
  Unlock,
  Server,
  Dna,
  ScanLine,
  Heart,
  Settings,
  HeartPulse,
  Volume2,
  Eye,
  ShieldCheck
} from 'lucide-vue-next';
import { ROOMS_CONFIG } from '../config/roomsConfig';

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

const progressPercentage = computed(() => {
  if (ROOMS_CONFIG.length === 0) return 0;
  return Math.min(100, Math.round((props.completedRooms.length / ROOMS_CONFIG.length) * 100));
});

const isUnlocked = (roomId) => props.unlockedRooms.includes(roomId);
const isCompleted = (roomId) => props.completedRooms.includes(roomId);

const handleRoomClick = (roomId) => {
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
