# Système de Notation sur 20

## Vue d'ensemble

Le jeu dispose d'un système de notation complet qui évalue les performances des joueurs sur 20 points. La note finale est calculée automatiquement à la fin de la partie, lorsque les trois salles principales sont complétées.

## Composition de la note finale

La note sur 20 est répartie comme suit :

### 1. Score de Rapidité (8 points)
- **Critère** : Temps total de la partie (temps réel + pénalités)
- **Formule** : `max(0, 8 - tempsTotal / 120)`
- **Principe** : Plus vous êtes rapide, plus vous gagnez de points
- **Maximum** : 8 points (temps optimal)
- **Minimum** : 0 point

### 2. Score de Précision (7 points)
- **Critère** : Nombre d'erreurs commises
- **Formule** : `max(0, 7 - nombreErreurs × 0.5)`
- **Principe** : Chaque erreur retire 0.5 point
- **Maximum** : 7 points (aucune erreur)
- **Minimum** : 0 point
- **Pénalité** : +30 secondes par erreur sur le temps total

### 3. Score d'Autonomie (5 points)
- **Critère** : Nombre d'indices utilisés
- **Formule** : `max(0, 5 - nombreIndices × 1)`
- **Principe** : Chaque indice utilisé retire 1 point
- **Maximum** : 5 points (aucun indice)
- **Minimum** : 0 point

## Barème d'appréciation

| Note      | Appréciation      | Commentaire                                                    |
|-----------|-------------------|----------------------------------------------------------------|
| 18-20     | 🏆 EXCELLENT      | Performance exceptionnelle ! Experts en cybersécurité médicale |
| 16-17.99  | 🌟 TRÈS BIEN      | Excellente maîtrise ! Protection efficace des données         |
| 14-15.99  | ✨ BIEN           | Bonne performance ! Solides compétences                        |
| 12-13.99  | 👍 ASSEZ BIEN     | Travail satisfaisant. Continuez à vous améliorer !             |
| 10-11.99  | 💪 PASSABLE       | Résultat correct. Vous pouvez faire mieux                      |
| 0-9.99    | 📚 À AMÉLIORER    | Place à l'amélioration. Retentez l'expérience !                |

## Tracking des données

### Données globales
```javascript
gameState = {
  timer: 0,              // Temps écoulé en secondes
  errors: 0,             // Nombre total d'erreurs
  hintsUsed: 0,          // Nombre total d'indices utilisés
  penaltyTime: 0,        // Temps de pénalité en secondes
  completedRooms: []     // Salles complétées
}
```

### Données par salle
```javascript
gameState = {
  roomTimes: {
    'server': 240,       // Temps passé dans la salle (en secondes)
    'dna-lab': 180,
    'imaging': 120
  },
  roomErrors: {
    'server': 2,         // Erreurs dans la salle
    'dna-lab': 1,
    'imaging': 0
  },
  roomHints: {
    'server': 1,         // Indices utilisés dans la salle
    'dna-lab': 0,
    'imaging': 2
  }
}
```

## Affichage du score final

### Composant FinalScore

Le composant `FinalScore.vue` s'affiche automatiquement lorsque les trois salles sont complétées :
- **Salle du Serveur** (server)
- **Laboratoire ADN** (dna-lab)
- **Salle d'Imagerie** (imaging)

### Contenu affiché

1. **Header** : Nom de l'équipe et message de félicitations
2. **Score principal** : Note sur 20 en grand format
3. **Appréciation** : Message contextuel selon la note
4. **Détails du score** : 
   - Score de rapidité (/8)
   - Score de précision (/7)
   - Score d'autonomie (/5)
5. **Détails par salle** :
   - Temps passé
   - Nombre d'erreurs
   - Nombre d'indices utilisés
6. **Barème** : Explication de la notation
7. **Actions** : Boutons "Rejouer" et "Fermer"

## Exemples de calcul

### Exemple 1 : Performance excellente
```
Temps réel : 10:00 (600 secondes)
Erreurs : 0
Indices : 0
Pénalités : 0 secondes

Calculs :
- Rapidité : 8 - (600/120) = 8 - 5 = 3.00 points
- Précision : 7 - (0 × 0.5) = 7.00 points
- Autonomie : 5 - (0 × 1) = 5.00 points

Note finale : 15.00/20 ✨ BIEN
```

### Exemple 2 : Performance moyenne
```
Temps réel : 15:30 (930 secondes)
Erreurs : 5
Indices : 3
Pénalités : 5 × 30 = 150 secondes
Temps total : 1080 secondes (18 minutes)

Calculs :
- Rapidité : 8 - (1080/120) = 8 - 9 = 0.00 points (max avec 0)
- Précision : 7 - (5 × 0.5) = 7 - 2.5 = 4.50 points
- Autonomie : 5 - (3 × 1) = 5 - 3 = 2.00 points

Note finale : 6.50/20 📚 À AMÉLIORER
```

### Exemple 3 : Performance parfaite (théorique)
```
Temps réel : 5:00 (300 secondes)
Erreurs : 0
Indices : 0
Pénalités : 0 secondes

Calculs :
- Rapidité : 8 - (300/120) = 8 - 2.5 = 5.50 points
- Précision : 7 - (0 × 0.5) = 7.00 points
- Autonomie : 5 - (0 × 1) = 5.00 points

Note finale : 17.50/20 🏆 EXCELLENT
```

## Composant GameStats (statistiques en temps réel)

### Fonctionnalité collapsible

Le composant `GameStats` affiche les statistiques en cours de partie :

#### Vue réduite (par défaut)
- Barre cliquable avec titre "STATISTIQUES"
- Résumé compact : temps, erreurs, indices
- Icône chevron pour indiquer l'état (haut/bas)

#### Vue détaillée (après clic)
- Temps écoulé détaillé
- Nombre d'erreurs
- Nombre d'indices utilisés
- Pénalités de temps (si > 0)
- Temps total (si pénalités > 0)
- Nom de l'équipe
- Détails par salle complétée

### Utilisation
```vue
<!-- Dans App.vue -->
<GameStats v-if="gameState.isGameStarted" />
```

Le composant est :
- Positionné en haut à droite de l'écran (fixed)
- Visible uniquement quand le jeu est démarré
- Cliquable pour déplier/replier les détails
- Met à jour les icônes Lucide dynamiquement

## Implémentation technique

### Fonction de calcul du score

```javascript
const calculateFinalScore = () => {
  const totalTime = getTotalTime(); // timer + penaltyTime

  // Calcul des scores individuels
  const timeScore = Math.max(0, 8 - totalTime / 120);
  const errorScore = Math.max(0, 7 - gameState.errors * 0.5);
  const hintScore = Math.max(0, 5 - gameState.hintsUsed * 1);

  // Score total (limité entre 0 et 20)
  const score = Math.min(20, Math.max(0, timeScore + errorScore + hintScore));

  return {
    total: parseFloat(score.toFixed(2)),
    timeScore: parseFloat(timeScore.toFixed(2)),
    errorScore: parseFloat(errorScore.toFixed(2)),
    hintScore: parseFloat(hintScore.toFixed(2)),
    totalTime: totalTime,
    errors: gameState.errors,
    hints: gameState.hintsUsed,
    roomDetails: {
      times: { ...gameState.roomTimes },
      errors: { ...gameState.roomErrors },
      hints: { ...gameState.roomHints }
    }
  };
};
```

### Vérification de fin de partie

```javascript
const isGameComplete = () => {
  const requiredRooms = ['server', 'dna-lab', 'imaging'];
  return requiredRooms.every(room => 
    gameState.completedRooms.includes(room)
  );
};
```

### Déclenchement de l'affichage

```javascript
// Dans handleRoomCompleted()
if (isGameComplete()) {
  setTimeout(() => {
    const score = calculateFinalScore();
    finalScoreData.value = {
      ...score,
      teamName: gameState.teamName
    };
    showFinalScore.value = true;
  }, 2000); // Délai de 2 secondes après la dernière salle
}
```

## Intégration dans les salles

### Ajout d'une erreur
```javascript
// Dans ServerRoom.vue, DNARoom.vue, ImagingRoom.vue
if (answerIsWrong) {
  addError("server"); // ou "dna-lab", "imaging"
  showError(
    "Réponse incorrecte. Essayez encore !",
    `+${PENALTY_PER_ERROR}s de pénalité`
  );
}
```

### Ajout d'un indice
```javascript
const showHint = () => {
  hintsShown.value++;
  addHint("server"); // ou "dna-lab", "imaging"
};
```

### Complétion d'une salle
```javascript
if (isCorrect) {
  puzzleSolved.value = true;
  completeRoom("server"); // ou "dna-lab", "imaging"
  createFireworks(3000);
  // ...
}
```

## Configuration

### Constantes modifiables

Dans `useGameState.js` :
```javascript
const PENALTY_PER_ERROR = 30;  // Secondes ajoutées par erreur
const PENALTY_PER_HINT = 1;    // Points retirés par indice
const MAX_SCORE = 20;          // Score maximum
```

### Ajuster la difficulté

Pour rendre le jeu plus difficile :
- Augmenter `PENALTY_PER_ERROR` (ex: 45 ou 60 secondes)
- Augmenter `PENALTY_PER_HINT` (ex: 1.5 ou 2 points)
- Modifier la formule de `timeScore` pour être plus stricte

Pour rendre le jeu plus facile :
- Diminuer `PENALTY_PER_ERROR` (ex: 20 secondes)
- Diminuer `PENALTY_PER_HINT` (ex: 0.5 point)
- Modifier la formule de `timeScore` pour être plus généreuse

## Améliorations futures

1. **Système de badges** : Débloquer des badges selon les performances
2. **Classement en ligne** : Enregistrer les meilleurs scores
3. **Modes de difficulté** : Facile, Normal, Difficile, Expert
4. **Statistiques avancées** : Graphiques et analyses détaillées
5. **Replay** : Revoir la partie avec un récapitulatif animé
6. **Comparaison** : Comparer avec d'autres équipes
7. **Export PDF** : Télécharger un certificat avec le score
8. **Objectifs secondaires** : Missions bonus pour points supplémentaires

## Notes importantes

- Le score est calculé uniquement à la fin de la partie
- Les pénalités de temps sont comptabilisées dans le score de rapidité
- Le tracking commence dès l'entrée dans une salle
- Les statistiques sont préservées même si on quitte une salle
- Le reset du jeu efface toutes les statistiques
- Le composant GameStats est indépendant du score final
- Les détails par salle sont visibles dans GameStats dès qu'une salle est complétée

## Support et maintenance

Le système de notation est autonome et ne nécessite aucune configuration additionnelle. Pour toute question ou amélioration, référez-vous aux fichiers suivants :
- `front/src/composables/useGameState.js` - Logique de notation
- `front/src/components/FinalScore.vue` - Affichage du score final
- `front/src/components/GameStats.vue` - Statistiques en temps réel