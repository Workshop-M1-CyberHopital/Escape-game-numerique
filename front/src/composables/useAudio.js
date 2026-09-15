import { reactive } from 'vue';

// État global de l'audio
export const audioState = reactive({
  isEnabled: false,
  volume: 0.7,
  isMuted: false,
  hasPermission: false
});

// Registre des fichiers audio réels existants
const SOUND_PATHS = {
  roomSelection: '/RoomSelection.mp3',
  serverRoom: '/ServerRoom.mp3',
  dnaRoom: '/DNARoom.mp3',
  imagingRoom: '/ImagingRoom.mp3',
  finishServerRoom: '/FinishServerRoom.mp3',
  finishDNARoom: '/FinishDNARoom.mp3',
  finishImagingRoom: '/FinishImagingRoom.mp3',
  heartbeat: '/battement_de_coeur.mp3'
};

// Cache d'instances HTMLAudioElement
const audioCache = new Map();

// Récupère ou instancie un élément Audio à la demande
const getOrCreateAudio = (soundName) => {
  if (audioCache.has(soundName)) {
    return audioCache.get(soundName);
  }

  const path = SOUND_PATHS[soundName];
  if (!path) {
    return null;
  }

  try {
    const audio = new Audio(path);
    audio.preload = 'none';
    audio.volume = audioState.isMuted ? 0 : audioState.volume;
    audio.muted = audioState.isMuted;

    audio.addEventListener('error', (e) => {
      console.warn(`[useAudio] Erreur de lecture sur le son "${soundName}":`, e);
    });

    audioCache.set(soundName, audio);
    return audio;
  } catch (error) {
    console.warn(`[useAudio] Impossible de créer l'élément Audio pour "${soundName}":`, error);
    return null;
  }
};

export function useAudio() {
  const requestAudioPermission = async () => {
    try {
      const testAudio = new Audio(SOUND_PATHS.roomSelection);
      testAudio.volume = 0.01;
      testAudio.muted = false;

      const playPromise = testAudio.play();
      if (playPromise !== undefined) {
        await playPromise;
        testAudio.pause();
        testAudio.currentTime = 0;
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

  const playSound = async (soundName, options = {}) => {
    if (audioState.isMuted) {
      return;
    }

    const audio = getOrCreateAudio(soundName);
    if (!audio) {
      // Le son n'a pas de fichier mp3 associé (normal pour certaines salles sans audio)
      return;
    }

    try {
      audio.currentTime = 0;
      audio.volume = options.volume !== undefined ? options.volume : audioState.volume;
      audio.muted = audioState.isMuted;
      audio.loop = Boolean(options.loop);

      await audio.play();
    } catch (error) {
      console.warn(`[useAudio] Échec lecture audio "${soundName}":`, error);
    }
  };

  const stopSound = (soundName) => {
    const audio = audioCache.get(soundName);
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.warn(`[useAudio] Erreur lors de l'arrêt du son "${soundName}":`, error);
      }
    }
  };

  const setVolume = (volume) => {
    const normalized = Math.max(0, Math.min(1, Number(volume) || 0));
    audioState.volume = normalized;
    audioCache.forEach((audio) => {
      audio.volume = audioState.isMuted ? 0 : normalized;
    });
  };

  const toggleMute = () => {
    audioState.isMuted = !audioState.isMuted;
    audioCache.forEach((audio) => {
      audio.muted = audioState.isMuted;
      audio.volume = audioState.isMuted ? 0 : audioState.volume;
    });
  };

  const stopAllSounds = () => {
    audioCache.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (e) {
        // Ignorer les erreurs d'arrêt
      }
    });
  };

  return {
    audioState,
    requestAudioPermission,
    playSound,
    stopSound,
    setVolume,
    toggleMute,
    stopAllSounds
  };
}

export default useAudio;
