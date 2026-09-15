import { ref, defineAsyncComponent } from 'vue';
import { useGameState } from './useGameState';
import { useAudio } from './useAudio';

// Registre des 16 composants de briefings chargés à la demande
const BRIEFING_REGISTRY = {
  audio: {
    id: 'audio',
    component: defineAsyncComponent(() => import('../components/briefing/AudioBriefing.vue')),
    audioKey: 'roomSelection',
    duration: 60000,
  },
  serverRoom: {
    id: 'serverRoom',
    component: defineAsyncComponent(() => import('../components/briefing/ServerRoomBriefing.vue')),
    audioKey: 'serverRoom',
    duration: 55000,
  },
  finishServerRoom: {
    id: 'finishServerRoom',
    component: defineAsyncComponent(() => import('../components/briefing/FinishServerRoomBriefing.vue')),
    audioKey: 'finishServerRoom',
    duration: 30000,
  },
  dnaRoom: {
    id: 'dnaRoom',
    component: defineAsyncComponent(() => import('../components/briefing/DNARoomBriefing.vue')),
    audioKey: 'dnaRoom',
    duration: 45000,
  },
  finishDNARoom: {
    id: 'finishDNARoom',
    component: defineAsyncComponent(() => import('../components/briefing/FinishDNARoomBriefing.vue')),
    audioKey: 'finishDNARoom',
    duration: 38000,
  },
  imagingRoom: {
    id: 'imagingRoom',
    component: defineAsyncComponent(() => import('../components/briefing/ImagingRoomBriefing.vue')),
    audioKey: 'imagingRoom',
    duration: 45000,
  },
  finishImagingRoom: {
    id: 'finishImagingRoom',
    component: defineAsyncComponent(() => import('../components/briefing/FinishImagingRoomBriefing.vue')),
    audioKey: 'finishImagingRoom',
    duration: 33000,
  },
  heartRoom: {
    id: 'heartRoom',
    component: defineAsyncComponent(() => import('../components/briefing/HeartRoomBriefing.vue')),
    audioKey: null,
    duration: 45000,
  },
  prosthesisRoom: {
    id: 'prosthesisRoom',
    component: defineAsyncComponent(() => import('../components/briefing/ProsthesisRoomBriefing.vue')),
    audioKey: null,
    duration: 33000,
  },
  finishProsthesisRoom: {
    id: 'finishProsthesisRoom',
    component: defineAsyncComponent(() => import('../components/briefing/FinishProsthesisRoomBriefing.vue')),
    audioKey: null,
    duration: 30000,
  },
  pathologyRoom: {
    id: 'pathologyRoom',
    component: defineAsyncComponent(() => import('../components/briefing/PathologyRoomBriefing.vue')),
    audioKey: null,
    duration: 33000,
  },
  finishPathologyRoom: {
    id: 'finishPathologyRoom',
    component: defineAsyncComponent(() => import('../components/briefing/FinishPathologyRoomBriefing.vue')),
    audioKey: null,
    duration: 33000,
  },
  auditionRoom: {
    id: 'auditionRoom',
    component: defineAsyncComponent(() => import('../components/briefing/AuditionRoomBriefing.vue')),
    audioKey: null,
    duration: 33000,
  },
  finishAuditionRoom: {
    id: 'finishAuditionRoom',
    component: defineAsyncComponent(() => import('../components/briefing/FinishAuditionRoomBriefing.vue')),
    audioKey: null,
    duration: 33000,
  },
  finalRoom: {
    id: 'finalRoom',
    component: defineAsyncComponent(() => import('../components/briefing/FinalRoomBriefing.vue')),
    audioKey: null,
    duration: 33000,
  },
  finishFinalRoom: {
    id: 'finishFinalRoom',
    component: defineAsyncComponent(() => import('../components/briefing/FinishFinalRoomBriefing.vue')),
    audioKey: null,
    duration: 33000,
  },
};

// Mappings des salles vers leurs briefings d'introduction et de fin
const ROOM_INTROS = {
  server: 'serverRoom',
  'dna-lab': 'dnaRoom',
  imaging: 'imagingRoom',
  heart: 'heartRoom',
  prosthesis: 'prosthesisRoom',
  pathology: 'pathologyRoom',
  audition: 'auditionRoom',
  final: 'finalRoom',
};

const ROOM_FINISHES = {
  server: 'finishServerRoom',
  'dna-lab': 'finishDNARoom',
  imaging: 'finishImagingRoom',
  prosthesis: 'finishProsthesisRoom',
  pathology: 'finishPathologyRoom',
  audition: 'finishAuditionRoom',
  final: 'finishFinalRoom',
};

// État réactif partagé
const activeBriefing = ref(null);
let autoCloseTimer = null;

export function useBriefing() {
  const { markBriefingAsShown, isBriefingShown } = useGameState();
  const { audioState, playSound, stopSound } = useAudio();

  const clearTimer = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  };

  const closeActiveBriefing = () => {
    clearTimer();

    if (activeBriefing.value) {
      const { id, audioKey } = activeBriefing.value;

      if (audioKey) {
        stopSound(audioKey);
        setTimeout(() => stopSound(audioKey), 100);
      }

      markBriefingAsShown(id);
      activeBriefing.value = null;
    }
  };

  const showBriefing = async (briefingId) => {
    const config = BRIEFING_REGISTRY[briefingId];
    if (!config) {
      console.warn(`[useBriefing] Briefing inconnu "${briefingId}"`);
      return;
    }

    // Fermer tout briefing précédent
    if (activeBriefing.value) {
      closeActiveBriefing();
    }

    activeBriefing.value = config;

    // Jouer le son si disponible et audio activé
    if (config.audioKey && audioState.isEnabled) {
      try {
        await playSound(config.audioKey);
      } catch (err) {
        console.warn(`[useBriefing] Erreur audio pour ${briefingId}:`, err);
      }
    }

    // Timer d'auto-fermeture
    clearTimer();
    autoCloseTimer = setTimeout(() => {
      closeActiveBriefing();
    }, config.duration || 45000);
  };

  const showRoomIntro = async (roomId) => {
    const introKey = ROOM_INTROS[roomId];
    if (introKey && !isBriefingShown(introKey)) {
      await showBriefing(introKey);
    }
  };

  const showRoomFinish = async (roomId) => {
    const finishKey = ROOM_FINISHES[roomId];
    if (finishKey && !isBriefingShown(finishKey)) {
      await showBriefing(finishKey);
    }
  };

  const showMissionBriefing = async () => {
    if (!isBriefingShown('audio')) {
      await showBriefing('audio');
    }
  };

  return {
    activeBriefing,
    showBriefing,
    closeActiveBriefing,
    showRoomIntro,
    showRoomFinish,
    showMissionBriefing,
    isBriefingShown,
    markBriefingAsShown,
  };
}

export default useBriefing;
