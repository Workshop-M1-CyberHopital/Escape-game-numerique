import { ref, shallowRef, markRaw, nextTick } from 'vue';
import { useGameState } from './useGameState';
import { useAudio } from './useAudio';

// Marge laissée après la fin d'une voix off avant la fermeture automatique
const AUDIO_GRACE_MS = 1500;
const TICK_MS = 250;
const DEFAULT_DURATION = 45000;
// Garde-fous : une voix bloquée (réseau coupé, synthèse vocale qui ne se termine pas)
// ne peut pas garder le briefing ouvert indéfiniment.
const MAX_VOICE_OVERRUN_MS = 30000;
// Débit d'une voix française de synthèse (caractères par seconde, vitesse 1) : valeur de départ,
// remplacée par le débit mesuré dès la fin de la première phrase lue.
const NARRATION_CHARS_PER_SECOND = 18;
const NARRATION_SLOWEST_CHARS_PER_SECOND = 10;

// Registre des 19 briefings chargés à la demande.
// duration (ms) : durée d'affichage ; pour un briefing voisé elle dépasse la durée du mp3,
// et la fermeture est de toute façon repoussée tant que la voix off n'est pas terminée.
const BRIEFING_REGISTRY = {
  audio: {
    id: 'audio',
    load: () => import('../components/briefing/AudioBriefing.vue'),
    audioKey: 'roomSelection', // RoomSelection.mp3 : 68,4 s
    duration: 70000,
  },
  serverRoom: {
    id: 'serverRoom',
    load: () => import('../components/briefing/ServerRoomBriefing.vue'),
    audioKey: 'serverRoom', // 51,1 s
    duration: 55000,
  },
  finishServerRoom: {
    id: 'finishServerRoom',
    load: () => import('../components/briefing/FinishServerRoomBriefing.vue'),
    audioKey: 'finishServerRoom', // 29,5 s
    duration: 32000,
  },
  dnaRoom: {
    id: 'dnaRoom',
    load: () => import('../components/briefing/DNARoomBriefing.vue'),
    audioKey: 'dnaRoom', // 44,5 s
    duration: 47000,
  },
  finishDNARoom: {
    id: 'finishDNARoom',
    load: () => import('../components/briefing/FinishDNARoomBriefing.vue'),
    audioKey: 'finishDNARoom', // 37,2 s
    duration: 40000,
  },
  imagingRoom: {
    id: 'imagingRoom',
    load: () => import('../components/briefing/ImagingRoomBriefing.vue'),
    audioKey: 'imagingRoom', // 44,1 s
    duration: 47000,
  },
  finishImagingRoom: {
    id: 'finishImagingRoom',
    load: () => import('../components/briefing/FinishImagingRoomBriefing.vue'),
    audioKey: 'finishImagingRoom', // 32,3 s
    duration: 35000,
  },
  heartRoom: {
    id: 'heartRoom',
    load: () => import('../components/briefing/HeartRoomBriefing.vue'),
    audioKey: null,
    duration: 45000,
  },
  finishHeartRoom: {
    id: 'finishHeartRoom',
    load: () => import('../components/briefing/FinishHeartRoomBriefing.vue'),
    audioKey: null,
    duration: 45000,
  },
  prosthesisRoom: {
    id: 'prosthesisRoom',
    load: () => import('../components/briefing/ProsthesisRoomBriefing.vue'),
    audioKey: null,
    duration: 40000,
  },
  finishProsthesisRoom: {
    id: 'finishProsthesisRoom',
    load: () => import('../components/briefing/FinishProsthesisRoomBriefing.vue'),
    audioKey: null,
    duration: 33000,
  },
  pathologyRoom: {
    id: 'pathologyRoom',
    load: () => import('../components/briefing/PathologyRoomBriefing.vue'),
    audioKey: null,
    duration: 33000,
  },
  finishPathologyRoom: {
    id: 'finishPathologyRoom',
    load: () => import('../components/briefing/FinishPathologyRoomBriefing.vue'),
    audioKey: null,
    duration: 35000,
  },
  auditionRoom: {
    id: 'auditionRoom',
    load: () => import('../components/briefing/AuditionRoomBriefing.vue'),
    audioKey: null,
    duration: 40000,
  },
  finishAuditionRoom: {
    id: 'finishAuditionRoom',
    load: () => import('../components/briefing/FinishAuditionRoomBriefing.vue'),
    audioKey: null,
    duration: 45000,
  },
  eyeRoom: {
    id: 'eyeRoom',
    load: () => import('../components/briefing/EyeRoomBriefing.vue'),
    audioKey: null,
    duration: 40000,
  },
  finishEyeRoom: {
    id: 'finishEyeRoom',
    load: () => import('../components/briefing/FinishEyeRoomBriefing.vue'),
    audioKey: null,
    duration: 45000,
  },
  finalRoom: {
    id: 'finalRoom',
    load: () => import('../components/briefing/FinalRoomBriefing.vue'),
    audioKey: null,
    duration: 40000,
  },
  finishFinalRoom: {
    id: 'finishFinalRoom',
    load: () => import('../components/briefing/FinishFinalRoomBriefing.vue'),
    audioKey: null,
    duration: 33000,
  },
};

export const BRIEFING_IDS = Object.keys(BRIEFING_REGISTRY);

// Mappings des salles (ids de roomsConfig) vers leurs briefings d'introduction et de fin
export const ROOM_INTROS = {
  server: 'serverRoom',
  'dna-lab': 'dnaRoom',
  imaging: 'imagingRoom',
  heart: 'heartRoom',
  prosthesis: 'prosthesisRoom',
  pathology: 'pathologyRoom',
  audition: 'auditionRoom',
  eye: 'eyeRoom',
  final: 'finalRoom',
};

export const ROOM_FINISHES = {
  server: 'finishServerRoom',
  'dna-lab': 'finishDNARoom',
  imaging: 'finishImagingRoom',
  heart: 'finishHeartRoom',
  prosthesis: 'finishProsthesisRoom',
  pathology: 'finishPathologyRoom',
  audition: 'finishAuditionRoom',
  eye: 'finishEyeRoom',
  final: 'finishFinalRoom',
};

// État partagé. shallowRef + markRaw : la définition du composant ne doit pas devenir réactive.
const activeBriefing = shallowRef(null);
// Temps restant (ms) avant la fermeture automatique du briefing actif : affiché par le compte à rebours
const briefingTimeRemaining = ref(0);

// Fermeture automatique = max(baseDeadline, voiceDeadline)
let baseDeadline = 0; // affichage + durée du registre
let voiceDeadline = 0; // fin (estimée) de la voix + marge ; figée si la voix est coupée par le joueur
let tickTimer = null;
let showToken = 0; // invalide les chargements / lectures en attente d'un briefing fermé ou remplacé
let pendingId = null; // briefing en cours de chargement
let voiceElement = null; // voix off mp3 en cours pour le briefing actif
let voiceStartedAt = 0; // début de la voix off mp3 (pour le garde-fou)
let narration = null; // synthèse vocale en cours : { total, spoken, startedAt, lastAt, limit }
const loadedComponents = new Map();

// Texte lu par la synthèse vocale : zone [data-briefing-voice], sans les éléments [data-no-voice].
// Un point est inséré entre deux blocs (titre, paragraphe, élément de liste) pour marquer une pause.
const BLOCK_SELECTOR = 'p, li, div, h1, h2, h3, h4';

const extractBriefingText = () => {
  if (typeof document === 'undefined') return '';
  const root = document.querySelector('[data-briefing-voice]');
  if (!root) return '';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest('[data-no-voice]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  let text = '';
  let lastBlock = null;
  while (walker.nextNode()) {
    const value = walker.currentNode.nodeValue || '';
    if (!value.trim()) {
      text += value;
      continue;
    }
    const block = walker.currentNode.parentElement?.closest(BLOCK_SELECTOR) || null;
    if (lastBlock && block !== lastBlock) {
      text = text.trimEnd();
      if (!/[.!?…:;,]$/.test(text)) text += '.';
      text += ' ';
    }
    text += value;
    lastBlock = block;
  }
  return text
    .replace(/[\p{Extended_Pictographic}️‍]/gu, '')
    .replace(/[→↔]/g, ', ')
    .replace(/(\d+)\/(\d+)/g, '$1 sur $2')
    .replace(/(\d)\s?s\b/g, '$1 secondes')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,])/g, '$1')
    .trim();
};

export function useBriefing() {
  const { markBriefingAsShown, isBriefingShown } = useGameState();
  const { audioState, playSound, stopSound, speakText, stopSpeaking, isSpeaking } = useAudio();

  const stopTicking = () => {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  };

  // Fin estimée de la synthèse vocale, d'après le débit mesuré sur les phrases déjà lues
  const estimateNarrationEnd = (current) => {
    const measured =
      current.spoken > 0 && current.lastAt > current.startedAt
        ? current.spoken / (current.lastAt - current.startedAt)
        : 0;
    const charsPerMs = Math.max(measured || NARRATION_CHARS_PER_SECOND / 1000, NARRATION_SLOWEST_CHARS_PER_SECOND / 1000);
    return current.lastAt + Math.max(0, current.total - current.spoken) / charsPerMs;
  };

  // Suit la voix du briefing : l'échéance couvre la fin de la voix off (ou de la synthèse vocale)
  const updateVoiceDeadline = () => {
    const now = Date.now();

    if (voiceElement && !voiceElement.paused && !voiceElement.ended) {
      const total = voiceElement.duration;
      const rate = voiceElement.playbackRate || 1;
      if (Number.isFinite(total) && total > 0) {
        const end = now + (Math.max(0, total - voiceElement.currentTime) * 1000) / rate + AUDIO_GRACE_MS;
        voiceDeadline = Math.min(end, voiceStartedAt + (total * 1000) / rate + MAX_VOICE_OVERRUN_MS);
      } else {
        voiceDeadline = Math.max(voiceDeadline, Math.min(now + AUDIO_GRACE_MS, voiceStartedAt + MAX_VOICE_OVERRUN_MS));
      }
      return;
    }

    if (!narration) return;
    if (isSpeaking()) {
      voiceDeadline = Math.min(Math.max(now, estimateNarrationEnd(narration)) + AUDIO_GRACE_MS, narration.limit);
      return;
    }
    // Lecture terminée d'elle-même : fermeture peu après (si la durée de base est écoulée).
    // Coupée par le joueur (son coupé, voix désactivée) : l'échéance affichée est conservée.
    if (audioState.isEnabled && !audioState.isMuted) {
      voiceDeadline = Math.min(voiceDeadline, now + AUDIO_GRACE_MS);
    }
    narration = null;
  };

  const tick = () => {
    if (!activeBriefing.value) {
      stopTicking();
      return;
    }
    updateVoiceDeadline();
    const remaining = Math.max(baseDeadline, voiceDeadline) - Date.now();
    if (remaining <= 0) {
      // Fermeture automatique : n'annule pas un autre briefing en cours de chargement
      teardown();
      return;
    }
    briefingTimeRemaining.value = remaining;
  };

  const startCountdown = (duration) => {
    stopTicking();
    baseDeadline = Date.now() + duration;
    voiceDeadline = 0;
    briefingTimeRemaining.value = duration;
    tickTimer = setInterval(tick, TICK_MS);
  };

  // Ferme le briefing affiché sans annuler un chargement en cours
  const teardown = () => {
    stopTicking();
    const current = activeBriefing.value;
    if (current?.audioKey) {
      stopSound(current.audioKey);
    }
    // Seuls les briefings utilisent la synthèse vocale : on l'arrête sans condition
    stopSpeaking();
    voiceElement = null;
    narration = null;
    activeBriefing.value = null;
    briefingTimeRemaining.value = 0;
  };

  // Sans effet si aucun briefing n'est ouvert. Le briefing a déjà été marqué « vu » à l'affichage :
  // une fermeture tardive (après une réinitialisation) ne peut donc rien écrire dans la nouvelle partie.
  const closeActiveBriefing = () => {
    showToken++;
    pendingId = null;
    teardown();
  };

  // À appeler lors d'une réinitialisation de partie (alias explicite)
  const resetBriefings = closeActiveBriefing;

  const startNarration = async (token) => {
    await nextTick();
    if (token !== showToken || !activeBriefing.value || activeBriefing.value.audioKey) return;
    if (!audioState.isEnabled || audioState.isMuted) return;
    const text = extractBriefingText();
    const now = Date.now();
    const current = {
      total: text.length,
      spoken: 0,
      startedAt: now,
      lastAt: now,
      limit: now + (text.length * 1000) / NARRATION_SLOWEST_CHARS_PER_SECOND + MAX_VOICE_OVERRUN_MS,
    };
    const onProgress = (spoken) => {
      if (narration !== current) return; // lecture annulée ou remplacée
      current.spoken = spoken;
      current.lastAt = Date.now();
    };
    if (speakText(text, onProgress)) {
      // L'échéance est mise à jour au prochain tick, une fois la lecture réellement commencée
      narration = current;
    }
  };

  const startVoice = async (token) => {
    const current = activeBriefing.value;
    if (!current || !audioState.isEnabled) return;

    if (!current.audioKey) {
      await startNarration(token);
      return;
    }

    const audio = await playSound(current.audioKey);
    if (!audio) return;
    if (token !== showToken || activeBriefing.value !== current) {
      // Briefing fermé ou remplacé pendant le chargement du son
      stopSound(current.audioKey);
      return;
    }
    voiceElement = audio;
    voiceStartedAt = Date.now() - (audio.currentTime || 0) * 1000;
    updateVoiceDeadline();
  };

  const loadComponent = async (config) => {
    if (loadedComponents.has(config.id)) return loadedComponents.get(config.id);
    const module = await config.load();
    const component = markRaw(module.default);
    loadedComponents.set(config.id, component);
    return component;
  };

  // Affiche un briefing. Sans effet s'il est déjà affiché ou en cours de chargement.
  // Le composant est chargé AVANT l'affichage : compte à rebours et voix off démarrent
  // au moment où le briefing apparaît réellement.
  const showBriefing = async (briefingId) => {
    const config = BRIEFING_REGISTRY[briefingId];
    if (!config) {
      console.warn(`[useBriefing] Briefing inconnu "${briefingId}"`);
      return false;
    }

    if (activeBriefing.value?.id === briefingId || pendingId === briefingId) {
      return false;
    }

    const token = ++showToken;
    pendingId = briefingId;

    let component;
    try {
      component = await loadComponent(config);
    } catch (error) {
      console.warn(`[useBriefing] Impossible de charger le briefing "${briefingId}":`, error);
      if (token === showToken) pendingId = null;
      return false;
    }

    // Fermé ou remplacé pendant le chargement
    if (token !== showToken) return false;
    pendingId = null;

    teardown();
    markBriefingAsShown(briefingId);

    const duration = config.duration || DEFAULT_DURATION;
    activeBriefing.value = Object.freeze({
      id: config.id,
      audioKey: config.audioKey,
      duration,
      component,
    });
    startCountdown(duration);
    startVoice(token);
    return true;
  };

  // Lance (ou relance) la voix du briefing affiché, par ex. après activation de l'audio en cours de route
  // (sans effet si la voix off joue déjà ; une synthèse vocale interrompue reprend du début)
  const playActiveBriefingVoice = () => {
    if (!activeBriefing.value) return;
    if (narration && !isSpeaking()) narration = null;
    if (voiceElement || narration) return;
    startVoice(showToken);
  };

  // Coupe la voix du briefing affiché sans le fermer (désactivation de l'audio).
  // L'échéance de fermeture déjà affichée est conservée.
  const stopActiveBriefingVoice = () => {
    const current = activeBriefing.value;
    if (current?.audioKey) stopSound(current.audioKey);
    stopSpeaking();
    voiceElement = null;
    narration = null;
  };

  const showRoomIntro = async (roomId) => {
    const introKey = ROOM_INTROS[roomId];
    if (introKey && !isBriefingShown(introKey)) {
      return showBriefing(introKey);
    }
    return false;
  };

  const showRoomFinish = async (roomId) => {
    const finishKey = ROOM_FINISHES[roomId];
    if (finishKey && !isBriefingShown(finishKey)) {
      return showBriefing(finishKey);
    }
    return false;
  };

  const showMissionBriefing = async () => {
    if (!isBriefingShown('audio')) {
      return showBriefing('audio');
    }
    return false;
  };

  return {
    activeBriefing,
    briefingTimeRemaining,
    showBriefing,
    closeActiveBriefing,
    resetBriefings,
    showRoomIntro,
    showRoomFinish,
    showMissionBriefing,
    playActiveBriefingVoice,
    stopActiveBriefingVoice,
    isBriefingShown,
    markBriefingAsShown,
  };
}

export default useBriefing;
