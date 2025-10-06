<template>
  <div class="min-h-screen bg-gray-900 relative">
    <!-- Header avec timer et équipe -->
    <header class="bg-gray-800/90 backdrop-blur-md border-b-2 border-cyber-blue p-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button 
            @click="$emit('exit-room')"
            class="flex items-center gap-2 px-4 py-2 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 font-tech text-sm rounded transition-all"
          >
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            RETOUR
          </button>
          <div class="text-cyber-blue font-cyber font-bold text-lg">
            {{ roomData.title }}
          </div>
        </div>
        
        <div class="flex items-center gap-6">
          <!-- Timer -->
          <div class="flex items-center gap-2">
            <i data-lucide="clock" class="w-5 h-5 text-cyber-red"></i>
            <span class="font-tech text-cyber-red font-bold">
              {{ formatTime(gameState.timer) }}
            </span>
          </div>
          
          <!-- Équipe -->
          <div class="flex items-center gap-2">
            <i data-lucide="users" class="w-5 h-5 text-cyber-green"></i>
            <span class="font-tech text-cyber-green">
              {{ gameState.teamName }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu de la salle -->
    <main class="p-8">
      <div class="max-w-6xl mx-auto">
        <!-- Description de la salle -->
        <div class="mb-8">
          <div class="bg-gray-800/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-6 scanline">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-lg flex items-center justify-center" :style="`background-color: ${roomData.color}20; border: 2px solid ${roomData.color};`">
                <i :data-lucide="roomData.icon" class="w-8 h-8" :style="`color: ${roomData.color};`"></i>
              </div>
              <div class="flex-1">
                <h1 class="text-3xl font-cyber font-bold mb-2" :style="`color: ${roomData.color};`">
                  {{ roomData.title }}
                </h1>
                <p class="text-lg font-tech text-gray-400 mb-3">{{ roomData.subtitle }}</p>
                <p class="text-gray-300 leading-relaxed mb-4">
                  {{ roomData.description }}
                </p>
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 border border-cyber-blue text-cyber-blue font-tech text-sm rounded">
                    OBJECTIF
                  </span>
                  <span class="text-sm text-gray-400">{{ roomData.objective }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenu spécifique de la salle -->
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useGameState } from '../composables/useGameState'

const props = defineProps({
  roomData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['exit-room'])

const { gameState, formatTime } = useGameState()
</script>
