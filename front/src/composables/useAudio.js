import { ref, reactive } from 'vue'

// État global de l'audio
const audioState = reactive({
  isEnabled: false,
  volume: 0.7,
  isMuted: false,
  hasPermission: false
})

// Sons disponibles
const sounds = {
  roomSelection: new Audio('/RoomSelection.mp3'),
  serverRoom: new Audio('/ServerRoom.mp3'),
  // Ajouter d'autres sons ici
}

// Fonction pour initialiser les sons avec gestion d'erreur
const initializeSounds = () => {
  try {
    // Utiliser le bon chemin
    sounds.roomSelection = new Audio('/RoomSelection.mp3')
    sounds.roomSelection.preload = 'auto'
    sounds.roomSelection.volume = audioState.volume
    
    sounds.serverRoom = new Audio('/ServerRoom.mp3')
    sounds.serverRoom.preload = 'auto'
    sounds.serverRoom.volume = audioState.volume
    
    sounds.dnaRoom = new Audio('/DNARoom.mp3')
    sounds.dnaRoom.preload = 'auto'
    sounds.dnaRoom.volume = audioState.volume
    
    sounds.finishServerRoom = new Audio('/FinishServerRoom.mp3')
    sounds.finishServerRoom.preload = 'auto'
    sounds.finishServerRoom.volume = audioState.volume
    
    sounds.finishDNARoom = new Audio('/FinishDNARoom.mp3')
    sounds.finishDNARoom.preload = 'auto'
    sounds.finishDNARoom.volume = audioState.volume
    
    sounds.imagingRoom = new Audio('/ImagingRoom.mp3')
    sounds.imagingRoom.preload = 'auto'
    sounds.imagingRoom.volume = audioState.volume
    
    sounds.finishImagingRoom = new Audio('/FinishImagingRoom.mp3')
    sounds.finishImagingRoom.preload = 'auto'
    sounds.finishImagingRoom.volume = audioState.volume
    
    // Gestion des erreurs de chargement
    sounds.roomSelection.addEventListener('error', (e) => {
      console.error('Erreur de chargement du son roomSelection:', e)
    })
    
    sounds.roomSelection.addEventListener('canplaythrough', () => {
      console.log('Son roomSelection prêt à être joué')
    })
    
    sounds.roomSelection.addEventListener('loadstart', () => {
      console.log('Début du chargement du son roomSelection')
    })
    
    sounds.serverRoom.addEventListener('error', (e) => {
      console.error('Erreur de chargement du son serverRoom:', e)
    })
    
    sounds.serverRoom.addEventListener('canplaythrough', () => {
      console.log('Son serverRoom prêt à être joué')
    })
    
    sounds.serverRoom.addEventListener('loadstart', () => {
      console.log('Début du chargement du son serverRoom')
    })
    
    sounds.dnaRoom.addEventListener('error', (e) => {
      console.error('Erreur de chargement du son dnaRoom:', e)
    })
    
    sounds.dnaRoom.addEventListener('canplaythrough', () => {
      console.log('Son dnaRoom prêt à être joué')
    })
    
    sounds.dnaRoom.addEventListener('loadstart', () => {
      console.log('Début du chargement du son dnaRoom')
    })
    
    sounds.finishServerRoom.addEventListener('error', (e) => {
      console.error('Erreur de chargement du son finishServerRoom:', e)
    })
    
    sounds.finishServerRoom.addEventListener('canplaythrough', () => {
      console.log('Son finishServerRoom prêt à être joué')
    })
    
    sounds.finishServerRoom.addEventListener('loadstart', () => {
      console.log('Début du chargement du son finishServerRoom')
    })
    
    sounds.finishDNARoom.addEventListener('error', (e) => {
      console.error('Erreur de chargement du son finishDNARoom:', e)
    })
    
    sounds.finishDNARoom.addEventListener('canplaythrough', () => {
      console.log('Son finishDNARoom prêt à être joué')
    })
    
    sounds.finishDNARoom.addEventListener('loadstart', () => {
      console.log('Début du chargement du son finishDNARoom')
    })
    
    sounds.imagingRoom.addEventListener('error', (e) => {
      console.error('Erreur de chargement du son imagingRoom:', e)
    })
    
    sounds.imagingRoom.addEventListener('canplaythrough', () => {
      console.log('Son imagingRoom prêt à être joué')
    })
    
    sounds.imagingRoom.addEventListener('loadstart', () => {
      console.log('Début du chargement du son imagingRoom')
    })
    
    sounds.finishImagingRoom.addEventListener('error', (e) => {
      console.error('Erreur de chargement du son finishImagingRoom:', e)
    })
    
    sounds.finishImagingRoom.addEventListener('canplaythrough', () => {
      console.log('Son finishImagingRoom prêt à être joué')
    })
    
    sounds.finishImagingRoom.addEventListener('loadstart', () => {
      console.log('Début du chargement du son finishImagingRoom')
    })
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des sons:', error)
  }
}

// Initialiser les sons
initializeSounds()

export function useAudio() {
  const requestAudioPermission = async () => {
    try {
      console.log('🎵 Tentative de demande de permission audio...')
      
      // Créer un son de test avec un fichier audio réel
      const testAudio = new Audio('/RoomSelection.mp3')
      testAudio.volume = 0.01 // Volume très faible
      testAudio.muted = false
      
      // Ajouter des listeners pour le debug
      testAudio.addEventListener('play', () => {
        console.log('✅ Son de test en cours de lecture')
      })
      
      testAudio.addEventListener('error', (e) => {
        console.error('❌ Erreur lors du test audio:', e)
      })
      
      // Tenter de jouer le son pour déclencher la permission
      const playPromise = testAudio.play()
      
      if (playPromise !== undefined) {
        await playPromise
        console.log('✅ Permission audio accordée - Son joué')
        testAudio.pause()
        testAudio.currentTime = 0
        
        audioState.hasPermission = true
        audioState.isEnabled = true
        return true
      } else {
        console.log('✅ Permission audio accordée - Pas de promesse')
        audioState.hasPermission = true
        audioState.isEnabled = true
        return true
      }
    } catch (error) {
      console.warn('❌ Permission audio refusée:', error)
      audioState.hasPermission = false
      audioState.isEnabled = false
      return false
    }
  }

  const playSound = async (soundName, options = {}) => {
    console.log(`Tentative de lecture du son: ${soundName}`)
    console.log('État audio:', { 
      isEnabled: audioState.isEnabled, 
      isMuted: audioState.isMuted, 
      hasPermission: audioState.hasPermission 
    })
    
    if (!audioState.isEnabled || audioState.isMuted) {
      console.log('Audio désactivé ou muet, lecture annulée')
      return
    }

    const audio = sounds[soundName]
    if (!audio) {
      console.warn(`Son "${soundName}" non trouvé`)
      return
    }

    try {
      // Réinitialiser le son
      audio.currentTime = 0
      audio.volume = options.volume || audioState.volume
      
      if (options.loop) {
        audio.loop = true
      }
      
      console.log('Lecture du son en cours...')
      await audio.play()
      console.log('Son joué avec succès')
    } catch (error) {
      console.error('Erreur lors de la lecture audio:', error)
    }
  }

  const stopSound = (soundName) => {
    console.log(`🛑 Arrêt du son: ${soundName}`)
    const audio = sounds[soundName]
    if (audio) {
      console.log(`🛑 État avant arrêt:`, {
        paused: audio.paused,
        currentTime: audio.currentTime,
        volume: audio.volume,
        muted: audio.muted
      })
      
      // Arrêt agressif pour Safari
      audio.pause()
      audio.currentTime = 0
      audio.volume = 0
      audio.muted = true
      
      // Forcer l'arrêt en réinitialisant complètement
      audio.load()
      
      console.log(`🛑 État après arrêt:`, {
        paused: audio.paused,
        currentTime: audio.currentTime,
        volume: audio.volume,
        muted: audio.muted
      })
    } else {
      console.warn(`🛑 Son "${soundName}" non trouvé pour l'arrêt`)
    }
  }

  const setVolume = (volume) => {
    audioState.volume = Math.max(0, Math.min(1, volume))
    Object.values(sounds).forEach(audio => {
      audio.volume = audioState.volume
    })
  }

  const toggleMute = () => {
    audioState.isMuted = !audioState.isMuted
    Object.values(sounds).forEach(audio => {
      audio.muted = audioState.isMuted
    })
  }

  const stopAllSounds = () => {
    console.log('🛑 Arrêt de tous les sons')
    Object.values(sounds).forEach(audio => {
      audio.pause()
      audio.currentTime = 0
      audio.volume = 0
      audio.muted = true
      audio.load()
    })
  }

  return {
    audioState,
    requestAudioPermission,
    playSound,
    stopSound,
    setVolume,
    toggleMute,
    stopAllSounds
  }
}
