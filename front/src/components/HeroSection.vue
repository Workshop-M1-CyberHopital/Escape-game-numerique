<template>
  <section class="min-h-screen flex flex-col items-center justify-center px-4 py-20">
    <div class="text-center space-y-8 max-w-5xl mx-auto fade-in">

      <!-- Alert Badge -->
      <div class="scale-in">
        <span class="inline-flex items-center gap-2 px-6 py-2 text-sm font-tech bg-red-600 text-white rounded-full pulse-glow animate-pulse">
          <i data-lucide="alert-triangle" class="w-4 h-4"></i>
          ALERTE CRITIQUE - CYBERATTAQUE EN COURS
        </span>
      </div>

      <!-- Main Title with Glitch Effect -->
      <h1 class="text-6xl md:text-7xl font-cyber font-black text-white glitch" ref="glitchTitle">
        <span class="glitch-text">URGENCE à l'HOPITAL</span>
        <span class="glitch-layer red">URGENCE à l'HOPITAL</span>
        <span class="glitch-layer cyan">URGENCE à l'HOPITAL</span>
      </h1>

      <div class="text-3xl md:text-5xl font-cyber font-bold text-cyber-blue">
        Mission Résilience
      </div>

      <!-- Vital Signs Monitor with Canvas -->
      <div class="py-8">
        <div class="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 max-w-2xl mx-auto scanline">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-2">
              <i data-lucide="activity" class="w-6 h-6 text-cyber-blue"></i>
              <span class="font-tech text-sm text-gray-400">MONITEUR DE SIGNES VITAUX</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span class="font-tech text-xs text-red-500">SYSTÈME CRITIQUE</span>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-red-500 font-cyber">72 BPM</div>
              <div class="text-xs text-gray-500 font-tech">FRÉQUENCE</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-yellow-500 font-cyber">35%</div>
              <div class="text-xs text-gray-500 font-tech">INTÉGRITÉ</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-cyber-green font-cyber">ACTIF</div>
              <div class="text-xs text-gray-500 font-tech">STATUT</div>
            </div>
          </div>

          <!-- Canvas ECG Line -->
          <div class="relative">
            <canvas ref="vitalCanvas" width="600" height="150" class="w-full h-auto border border-cyber-red/30 rounded bg-black/50"></canvas>
            <div class="absolute top-2 right-2 font-tech text-cyber-red text-xs">
              BPM: 98 | STATUS: CRITIQUE
            </div>
          </div>
        </div>
      </div>

      <!-- Story Section -->
      <div class="fade-in-delay max-w-3xl mx-auto">
        <div class="bg-gray-900/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-8 scanline">
          <div class="flex items-start gap-4 mb-4">
            <i data-lucide="shield" class="w-8 h-8 text-cyber-red flex-shrink-0 mt-1"></i>
            <div class="text-left">
              <h2 class="text-2xl font-cyber font-bold text-cyber-red mb-3">
                SITUATION D'URGENCE
              </h2>
              <p class="text-gray-300 leading-relaxed mb-4">
                Une cyberattaque a frappé un grand hôpital connecté. Les
                dossiers médicaux des patients sont corrompus par un virus
                informatique intelligent.
              </p>
              <p class="text-gray-300 leading-relaxed mb-4">
                Votre équipe est une unité spéciale de cybersécurité médicale
                chargée de rétablir le système avant que les patients ne
                soient en danger.
              </p>
              <div class="flex flex-wrap gap-2 mt-4">
                <span class="px-3 py-1 border border-cyber-blue text-cyber-blue font-tech text-sm rounded">
                  4 Salles Virtuelles
                </span>
                <span class="px-3 py-1 border border-cyber-green text-cyber-green font-tech text-sm rounded">
                  Énigmes Collaboratives
                </span>
                <span class="px-3 py-1 border border-cyber-purple text-cyber-purple font-tech text-sm rounded">
                  Mission Pédagogique
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center pt-8 fade-in-delay">
        <button
          @click="$emit('start-mission')"
          class="flex items-center justify-center gap-2 px-8 py-6 bg-cyber-red hover:bg-cyber-red/80 text-white font-cyber text-lg rounded-lg pulse-glow transition-all"
        >
          <i data-lucide="play" class="w-5 h-5"></i>
          COMMENCER LA MISSION
        </button>
        <button class="flex items-center justify-center gap-2 px-8 py-6 border-2 border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 font-cyber text-lg rounded-lg transition-all">
          <i data-lucide="shield" class="w-5 h-5"></i>
          EN SAVOIR PLUS
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { drawHeartbeat } from '../utils/vitalSigns'

const emit = defineEmits(['start-mission'])

const glitchTitle = ref(null)
const vitalCanvas = ref(null)
let glitchInterval = null

onMounted(() => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons()
  }

  // Start glitch effect
  if (glitchTitle.value) {
    glitchInterval = setInterval(() => {
      glitchTitle.value.classList.add('active')
      setTimeout(() => {
        glitchTitle.value.classList.remove('active')
      }, 200)
    }, 3000)
  }

  // Start vital signs animation
  if (vitalCanvas.value) {
    drawHeartbeat(vitalCanvas.value)
  }
})

onUnmounted(() => {
  if (glitchInterval) {
    clearInterval(glitchInterval)
  }
})
</script>
