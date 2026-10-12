import { reactive } from 'vue';

// État global de l'audio
// - isEnabled / hasPermission : briefings vocaux autorisés (voix off mp3 ou synthèse vocale)
// - volume / isMuted : réglages appliqués à tous les sons du jeu (briefings ET sons des salles)
export const audioState = reactive({
  isEnabled: false,
  volume: 0.7,
  isMuted: false,
  hasPermission: false
});

// Registre des fichiers audio réels existants (dossier front/public)
export const SOUND_PATHS = {
  roomSelection: '/RoomSelection.mp3',
  serverRoom: '/ServerRoom.mp3',
  dnaRoom: '/DNARoom.mp3',
  imagingRoom: '/ImagingRoom.mp3',
  finishServerRoom: '/FinishServerRoom.mp3',
  finishDNARoom: '/FinishDNARoom.mp3',
  finishImagingRoom: '/FinishImagingRoom.mp3',
  heartbeat: '/battement_de_coeur.mp3'
};

export const hasSound = (soundName) => Boolean(soundName && SOUND_PATHS[soundName]);

// Un seul élément <audio> partagé pour les voix off : il est « déverrouillé » une fois
// pendant le clic de l'utilisateur (politique d'autoplay de Safari/iOS), puis réutilisé.
let voiceAudio = null;
let currentSound = null;

// Petit WAV silencieux (0,1 s) généré à la volée : sert à déverrouiller l'audio
// sans télécharger le fichier de mission (1 Mo).
let silentClip = null;
const getSilentClip = () => {
  if (silentClip) return silentClip;
  const sampleRate = 8000;
  const samples = 800;
  const bytes = new Uint8Array(44 + samples);
  const view = new DataView(bytes.buffer);
  const writeString = (offset, text) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // taille du bloc fmt
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true); // octets par seconde
  view.setUint16(32, 1, true); // alignement
  view.setUint16(34, 8, true); // 8 bits
  writeString(36, 'data');
  view.setUint32(40, samples, true);
  bytes.fill(128, 44); // silence en PCM 8 bits non signé
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  silentClip = `data:audio/wav;base64,${btoa(binary)}`;
  return silentClip;
};

const applyVolume = (audio, volume = audioState.volume) => {
  try {
    audio.volume = Math.max(0, Math.min(1, Number(volume) || 0));
  } catch {
    // iOS : le volume est en lecture seule
  }
  audio.muted = audioState.isMuted;
};

const getVoiceAudio = () => {
  if (voiceAudio) return voiceAudio;
  if (typeof Audio === 'undefined') return null;

  try {
    voiceAudio = new Audio();
    voiceAudio.preload = 'auto';
    applyVolume(voiceAudio);
    voiceAudio.addEventListener('error', () => {
      if (currentSound) {
        console.warn(`[useAudio] Erreur de lecture sur le son "${currentSound}"`);
      }
    });
    return voiceAudio;
  } catch (error) {
    console.warn("[useAudio] Impossible de créer l'élément Audio:", error);
    return null;
  }
};

// --- Synthèse vocale (repli pour les briefings sans fichier mp3) ---
const speechSupported = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance !== 'undefined';

const getFrenchVoice = () => {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  const french = voices.filter((voice) => /^fr([-_]|$)/i.test(voice.lang || ''));
  return (
    french.find((voice) => /^fr[-_]FR$/i.test(voice.lang) && voice.localService) ||
    french.find((voice) => /^fr[-_]FR$/i.test(voice.lang)) ||
    french[0] ||
    null
  );
};

// Les voix sont chargées de façon asynchrone par Chrome : on amorce la liste dès le chargement.
if (speechSupported()) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', () => window.speechSynthesis.getVoices());
  } catch {
    // Synthèse vocale indisponible
  }
}

// Énoncés de la lecture en cours (voir speakText)
let liveUtterances = [];

// Découpe le texte en phrases (regroupées jusqu'à ~200 caractères) : Chrome coupe parfois les énoncés longs.
const splitIntoChunks = (text, maxLength = 200) => {
  const pieces = [];
  (text.match(/[^.!?…]+[.!?…]*/g) || [text]).forEach((sentence) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    if (trimmed.length <= maxLength) {
      pieces.push(trimmed);
      return;
    }
    // Phrase trop longue : coupure aux deux-points / points-virgules (jamais aux virgules, cf. « 0,5 % »)
    (trimmed.match(/[^:;]+[:;]*/g) || [trimmed]).forEach((part) => {
      if (part.trim()) pieces.push(part.trim());
    });
  });

  const chunks = [];
  let current = '';
  pieces.forEach((piece) => {
    if (current && current.length + 1 + piece.length > maxLength) {
      chunks.push(current);
      current = piece;
    } else {
      current = current ? `${current} ${piece}` : piece;
    }
  });
  if (current) chunks.push(current);
  return chunks;
};

export function useAudio() {
  // Doit être appelée depuis un clic : play() est lancé avant toute attente.
  const requestAudioPermission = async () => {
    const audio = getVoiceAudio();
    if (!audio) {
      audioState.hasPermission = false;
      audioState.isEnabled = false;
      return false;
    }

    try {
      currentSound = null;
      audio.loop = false;
      audio.src = getSilentClip();
      applyVolume(audio);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      // Ne pas couper une voix off lancée entre-temps
      if (!currentSound) {
        audio.pause();
      }

      audioState.hasPermission = true;
      audioState.isEnabled = true;
      return true;
    } catch (error) {
      console.warn('[useAudio] Permission audio non accordée:', error);
      audioState.hasPermission = false;
      audioState.isEnabled = false;
      return false;
    }
  };

  // Désactive les briefings vocaux (les sons des salles restent réglés par isMuted/volume)
  const disableAudio = () => {
    audioState.isEnabled = false;
    stopAllSounds();
  };

  // Lance un son ; renvoie l'élément audio s'il joue réellement, sinon null.
  // Un son coupé (muet) est tout de même lancé : il devient audible dès que l'on réactive le son.
  const playSound = async (soundName, options = {}) => {
    const path = SOUND_PATHS[soundName];
    if (!path) {
      // Le son n'a pas de fichier mp3 associé (normal pour certaines salles sans audio)
      return null;
    }

    const audio = getVoiceAudio();
    if (!audio) return null;

    try {
      currentSound = soundName;
      const absolutePath = new URL(path, window.location.href).href;
      if (audio.src !== absolutePath) {
        audio.src = path;
      } else {
        audio.currentTime = 0;
      }
      audio.loop = Boolean(options.loop);
      applyVolume(audio, options.volume !== undefined ? options.volume : audioState.volume);

      await audio.play();
      return currentSound === soundName ? audio : null;
    } catch (error) {
      // AbortError : lecture interrompue volontairement (fermeture du briefing, autre son)
      if (error?.name !== 'AbortError') {
        console.warn(`[useAudio] Échec lecture audio "${soundName}":`, error);
      }
      if (currentSound === soundName) currentSound = null;
      return null;
    }
  };

  // N'arrête le son que s'il est bien celui en cours (un arrêt tardif ne coupe pas le son suivant)
  const stopSound = (soundName) => {
    if (!voiceAudio || !soundName || currentSound !== soundName) return;
    try {
      voiceAudio.pause();
      voiceAudio.currentTime = 0;
    } catch (error) {
      console.warn(`[useAudio] Erreur lors de l'arrêt du son "${soundName}":`, error);
    }
    currentSound = null;
  };

  const isSpeechAvailable = () => Boolean(getFrenchVoice());

  // Lit un texte avec une voix française ; renvoie false si aucune voix française n'est installée.
  // onProgress(nombre de caractères lus) est appelé à la fin de chaque phrase.
  const speakText = (text, onProgress) => {
    const voice = getFrenchVoice();
    const cleanText = String(text || '').replace(/\s+/g, ' ').trim();
    if (!voice || !cleanText) return false;

    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      let spoken = 0;
      // Références conservées : sinon Chrome peut libérer les énoncés et ne jamais signaler leur fin
      liveUtterances = [];
      splitIntoChunks(cleanText).forEach((chunk) => {
        const utterance = new window.SpeechSynthesisUtterance(chunk);
        utterance.voice = voice;
        utterance.lang = voice.lang || 'fr-FR';
        utterance.rate = 1;
        utterance.volume = audioState.isMuted ? 0 : audioState.volume;
        if (typeof onProgress === 'function') {
          utterance.onend = () => {
            spoken += chunk.length + 1;
            onProgress(Math.min(spoken, cleanText.length));
          };
        }
        liveUtterances.push(utterance);
        synth.speak(utterance);
      });
      return true;
    } catch (error) {
      console.warn('[useAudio] Synthèse vocale impossible:', error);
      return false;
    }
  };

  const stopSpeaking = () => {
    liveUtterances = [];
    if (!speechSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignorer
    }
  };

  const isSpeaking = () => {
    if (!speechSupported()) return false;
    try {
      return window.speechSynthesis.speaking || window.speechSynthesis.pending;
    } catch {
      return false;
    }
  };

  const setVolume = (volume) => {
    const normalized = Math.max(0, Math.min(1, Number(volume) || 0));
    audioState.volume = normalized;
    if (voiceAudio) applyVolume(voiceAudio, normalized);
  };

  const toggleMute = () => {
    audioState.isMuted = !audioState.isMuted;
    if (voiceAudio) applyVolume(voiceAudio);
    // La synthèse vocale ne peut pas être rendue muette en cours de lecture : on l'arrête
    if (audioState.isMuted) stopSpeaking();
  };

  const stopAllSounds = () => {
    if (voiceAudio) {
      try {
        voiceAudio.pause();
        voiceAudio.currentTime = 0;
      } catch {
        // Ignorer les erreurs d'arrêt
      }
    }
    currentSound = null;
    stopSpeaking();
  };

  return {
    audioState,
    requestAudioPermission,
    disableAudio,
    playSound,
    stopSound,
    hasSound,
    speakText,
    stopSpeaking,
    isSpeaking,
    isSpeechAvailable,
    setVolume,
    toggleMute,
    stopAllSounds
  };
}

export default useAudio;
