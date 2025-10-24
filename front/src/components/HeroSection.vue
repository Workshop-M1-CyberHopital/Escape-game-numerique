<template>
  <section
      class="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative"
  >
      <!-- Mascotte décorative en arrière-plan (ne touche pas au layout, pointer-events none) -->
      <div class="mascot-bg" aria-hidden="true">
          <img src="/mascotte/mascotte_coeur.webp" alt="" />
      </div>

      <div class="hero-content text-center space-y-8 max-w-5xl mx-auto fade-in">
          <!-- Alert Badge -->
          <div class="scale-in">
              <span
                  class="inline-flex items-center gap-2 px-6 py-2 text-sm font-tech bg-red-600 text-white rounded-full pulse-glow animate-pulse"
              >
                  <i data-lucide="alert-triangle" class="w-4 h-4"></i>
                  ALERTE CRITIQUE - CYBERATTAQUE EN COURS
              </span>
          </div>

          <!-- Main Title with Glitch Effect -->
          <h1
              class="text-6xl md:text-7xl font-cyber font-black text-white glitch"
              ref="glitchTitle"
          >
              <span class="glitch-text">URGENCE à l'HÔPITAL</span>
              <span class="glitch-layer red">URGENCE à l'HÔPITAL</span>
              <span class="glitch-layer cyan">URGENCE à l'HÔPITAL</span>
          </h1>

          <div
              class="text-3xl md:text-5xl font-cyber font-bold text-cyber-blue"
          >
              Mission Résilience
          </div>

          <!-- Vital Signs Monitor with Canvas -->
          <div class="py-8">
              <div
                  class="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 max-w-xl mx-auto scanline"
              >
                  <div class="flex justify-between items-center mb-4">
                      <div class="flex items-center gap-2">
                          <i
                              data-lucide="activity"
                              class="w-6 h-6 text-cyber-blue"
                          ></i>
                          <span class="font-tech text-sm text-gray-400"
                              >MONITEUR DE SIGNES VITAUX</span
                          >
                      </div>
                      <div class="flex items-center gap-2">
                          <div
                              class="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                          ></div>
                          <span class="font-tech text-xs text-red-500"
                              >SYSTÈME CRITIQUE</span
                          >
                      </div>
                  </div>

                  <div class="grid grid-cols-3 gap-4 mb-4">
                      <div class="text-center">
                          <div
                              class="text-2xl font-bold text-red-500 font-cyber"
                          >
                              98 BPM
                          </div>
                          <div class="text-xs text-gray-500 font-tech">
                              FRÉQUENCE
                          </div>
                      </div>
                      <div class="text-center">
                          <div
                              class="text-2xl font-bold text-yellow-500 font-cyber"
                          >
                              35%
                          </div>
                          <div class="text-xs text-gray-500 font-tech">
                              INTÉGRITÉ
                          </div>
                      </div>
                      <div class="text-center">
                          <div
                              class="text-2xl font-bold text-cyber-green font-cyber"
                          >
                              ACTIF
                          </div>
                          <div class="text-xs text-gray-500 font-tech">
                              STATUT
                          </div>
                      </div>
                  </div>

                  <!-- Canvas ECG Line -->
                  <div class="relative">
                      <canvas
                          ref="vitalCanvas"
                          width="600"
                          height="150"
                          class="w-full h-auto border border-cyber-red/30 rounded bg-black/50"
                      ></canvas>
                      <div
                          class="absolute top-2 right-2 font-tech text-cyber-red text-xs"
                      >
                          BPM: 98 | STATUS: CRITIQUE
                      </div>
                  </div>
              </div>
          </div>

          <!-- Story Section -->
          <div class="fade-in-delay max-w-3xl mx-auto">
              <div
                  class="bg-gray-900/60 backdrop-blur-md border-2 border-cyber-red rounded-lg p-8 scanline"
              >
                  <div class="flex items-start gap-4 mb-4">
                      <i
                          data-lucide="shield"
                          class="w-8 h-8 text-cyber-red flex-shrink-0 mt-1"
                      ></i>
                      <div class="text-left">
                          <h2
                              class="text-2xl font-cyber font-bold text-cyber-red mb-3"
                          >
                              SITUATION D'URGENCE
                          </h2>
                          <p class="text-gray-300 leading-relaxed mb-4">
                              Une cyberattaque a frappé un grand hôpital
                              connecté. Les dossiers médicaux des patients
                              sont corrompus par un virus informatique
                              intelligent.
                          </p>
                          <p class="text-gray-300 leading-relaxed mb-4">
                              Votre équipe est une unité spéciale de
                              cybersécurité médicale chargée de rétablir le
                              système avant que les patients ne soient en
                              danger.
                          </p>
                          <div class="flex flex-wrap gap-2 mt-4">
                              <span
                                  class="px-3 py-1 border border-cyber-blue text-cyber-blue font-tech text-sm rounded"
                              >
                                  {{ totalRooms }} Salles Virtuelles
                              </span>
                              <span
                                  class="px-3 py-1 border border-cyber-green text-cyber-green font-tech text-sm rounded"
                              >
                                  Énigmes Collaboratives
                              </span>
                              <span
                                  class="px-3 py-1 border border-cyber-purple text-cyber-purple font-tech text-sm rounded"
                              >
                                  Mission Pédagogique
                              </span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          <!-- CTA Buttons -->
          <div
              class="flex flex-col sm:flex-row gap-4 justify-center pt-8 fade-in-delay"
          >
              <button
                  @click="$emit('start-mission')"
                  class="flex items-center justify-center gap-2 px-8 py-6 bg-cyber-red hover:bg-cyber-red/80 text-white font-cyber text-lg rounded-lg pulse-glow transition-all"
              >
                  <i data-lucide="play" class="w-5 h-5"></i>
                  COMMENCER LA MISSION
              </button>
          </div>
      </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { drawHeartbeat } from "../utils/vitalSigns";
import { ROOM_IDS } from "../composables/useGameState";

const emit = defineEmits(["start-mission"]);

const glitchTitle = ref(null);
const vitalCanvas = ref(null);
let glitchInterval = null;
let stopHeartbeat = null;

// Nombre de salles calculé dynamiquement depuis la source unique
const totalRooms = computed(() => ROOM_IDS.length);

onMounted(() => {
  // Initialize Lucide Icons
  if (window.lucide) {
      window.lucide.createIcons();
  }

  // Start glitch effect
  if (glitchTitle.value) {
      glitchInterval = setInterval(() => {
          glitchTitle.value.classList.add("active");
          setTimeout(() => {
              glitchTitle.value.classList.remove("active");
          }, 200);
      }, 3000);
  }

  // Start vital signs animation
  if (vitalCanvas.value) {
      stopHeartbeat = drawHeartbeat(vitalCanvas.value);
  }
});

onUnmounted(() => {
  if (glitchInterval) {
      clearInterval(glitchInterval);
  }
  if (stopHeartbeat) {
      stopHeartbeat();
  }
});
</script>

<style scoped>
/* Simple glitch effect */
.glitch {
  position: relative;
  display: inline-block;
}

.glitch-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.glitch-layer.red {
  color: #ff0055;
  transform: translate(-2px, -2px);
}

.glitch-layer.cyan {
  color: #00ffff;
  transform: translate(2px, 2px);
}

.glitch.active .glitch-text {
  opacity: 0;
}

.glitch.active .glitch-layer {
  opacity: 1;
}

/* Mascotte décorative : grande mais non intrusive, n'augmente pas la hauteur */
.mascot-bg {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: 0;

  /* Décalage vers la droite pour éviter la superposition avec la carte centrale */
  justify-content: flex-end;
  padding-right: clamp(1rem, 8vw, 6rem);
}

/* Image : agrandie/plus visible, déplacée vers la droite, conserve le comportement responsive */
.mascot-bg img {
  width: clamp(320px, 44vw, 880px);
  max-height: 82vh;
  object-fit: contain;
  opacity: 0.30; /* augmenté pour meilleure visibilité */
  transform: translateX(8%) translateY(6%) scale(1.06);
  filter: brightness(1.35) saturate(1.35) drop-shadow(0 30px 64px rgba(0,0,0,0.72)) drop-shadow(0 0 32px rgba(34,197,94,0.20));
  mix-blend-mode: screen;
  transition: transform 240ms ease, opacity 200ms ease, filter 240ms ease;
  border-radius: 8px;
  z-index: 0;
}

/* Légère mise en valeur au hover (sensible uniquement si l'utilisateur passe la souris) */
.mascot-bg img:hover {
  opacity: 0.36; /* un peu plus visible au survol */
  transform: translateX(6%) translateY(4%) scale(1.08);
  filter: brightness(1.45) saturate(1.45) drop-shadow(0 36px 72px rgba(0,0,0,0.78)) drop-shadow(0 0 40px rgba(34,197,94,0.26));
}

/* Assurer que le contenu reste au-dessus de la mascotte */
.hero-content {
  position: relative;
  z-index: 10;
}

/* Masquer sur petits écrans pour ne pas gêner la lisibilité */
@media (max-width: 640px) {
  .mascot-bg { display: none; }
}

/* Ajustement sur très grands écrans pour rester en dehors des cartes centrales */
@media (min-width: 1400px) {
  .mascot-bg {
    padding-right: clamp(3rem, 12vw, 14rem);
  }
  .mascot-bg img {
    width: clamp(420px, 36vw, 980px);
    opacity: 0.34; /* ajusté pour grands écrans */
    transform: translateX(14%) translateY(4%) scale(1.08);
  }
}
</style>