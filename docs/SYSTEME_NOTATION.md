# Système de Notation sur 20

## Vue d'ensemble

Chaque partie est notée sur **20 points**. La note est calculée automatiquement à la fin de la mission, lorsque les **9 salles** sont terminées :

1. Salle du Serveur (`server`)
2. Laboratoire ADN (`dna-lab`)
3. Salle d'Imagerie (`imaging`)
4. Salle du Cœur (`heart`)
5. Salle des Prothèses (`prosthesis`)
6. Salle des Pathologies (`pathology`)
7. Salle de l'Audition (`audition`)
8. Salle des Yeux (`eye`)
9. Salle de Fin (`final`)

C'est la **seule** note du jeu : elle s'affiche partout au format `x.x/20` (écran de fin, classement, profil, diplôme). Il n'existe plus de « points ».

La formule est définie à un seul endroit côté client, `front/src/utils/scoring.js`, et recopiée à l'identique côté serveur dans `back/utils/scoring.js` : le serveur **recalcule** la note de chaque partie enregistrée (voir [Recalcul côté serveur](#recalcul-côté-serveur)).

## Temps total et compte à rebours

```
temps total = temps réel écoulé + pénalités          (en secondes)
pénalités   = nombre d'erreurs × 30 s                (PENALTY_PER_ERROR)
temps restant = 60 min − temps total                 (MISSION_DURATION)
```

- Le **compte à rebours de la mission** part de **60 minutes** et décompte le temps total : chaque erreur le fait donc reculer de 30 secondes.
- Quand il atteint 0, l'affichage passe en **« TEMPS DÉPASSÉ »** : la partie **continue** normalement jusqu'à la dernière salle, seule la note de rapidité vaut alors 0.
- Le chronomètre tourne dès le lancement de la partie, y compris sur l'écran de sélection des salles. Le temps passé onglet fermé n'est pas compté (voir [Sauvegarde](#sauvegarde-et-reprise)).

## Composition de la note finale

### 1. Rapidité (8 points)

- **Critère** : temps total (temps réel + pénalités)
- **Formule** :
  - temps total ≤ **20 min** (`TIME_FULL_SCORE`) : **8 points** (note pleine) ;
  - entre 20 et 60 min : baisse linéaire, `8 × (3600 − tempsTotal) / (3600 − 1200)` ;
  - temps total ≥ **60 min** (`MISSION_DURATION`) : **0 point**.

| Temps total | ≤ 20 min | 25 min | 30 min | 40 min | 50 min | ≥ 60 min |
|---|---|---|---|---|---|---|
| Rapidité | 8,00 | 7,00 | 6,00 | 4,00 | 2,00 | 0,00 |

### 2. Précision (7 points)

- **Critère** : nombre total d'erreurs
- **Formule** : `max(0, 7 − erreurs × 0,5)` : chaque erreur retire 0,5 point (14 erreurs ou plus : 0 point)
- Chaque erreur ajoute **aussi 30 secondes** au temps total, ce qui peut réduire la note de rapidité.

### 3. Autonomie (5 points)

- **Critère** : nombre total d'indices révélés
- **Formule** : `max(0, 5 − indices × 1)` : chaque indice retire 1 point (5 indices ou plus : 0 point)
- Un indice déjà payé reste affiché **gratuitement** si l'équipe quitte la salle puis y revient (même après un rechargement de la page) : seul un **nouvel** indice coûte un point.

### Note finale

```
note = min(20, max(0, rapidité + précision + autonomie))
```

La note finale est arrondie au **dixième** (`15.0/20`), les sous-notes au centième.

## Barème d'appréciation

| Note      | Appréciation      | Commentaire                                                    |
|-----------|-------------------|----------------------------------------------------------------|
| 18-20     | 🏆 EXCELLENT      | Performance exceptionnelle ! Experts en cybersécurité médicale |
| 16-17.9   | 🌟 TRÈS BIEN      | Excellente maîtrise ! Protection efficace des données          |
| 14-15.9   | ✨ BIEN           | Bonne performance ! Solides compétences                        |
| 12-13.9   | 👍 ASSEZ BIEN     | Travail satisfaisant. Continuez à vous améliorer !             |
| 10-11.9   | 💪 PASSABLE       | Résultat correct. Vous pouvez faire mieux                      |
| 0-9.9     | 📚 À AMÉLIORER    | Place à l'amélioration. Retentez l'expérience !                |

Source : `getAppreciation(note)` dans `front/src/utils/scoring.js`.

## Exemples de calcul

### Exemple 1 : Mission parfaite
```
Temps réel : 15:00 (900 s)
Erreurs : 0           → pénalités : 0 s
Indices : 0
Temps total : 900 s (15:00) ≤ 20 min

- Rapidité  : 8.00 (note pleine)
- Précision : 7 − 0 × 0.5 = 7.00
- Autonomie : 5 − 0 × 1   = 5.00

Note finale : 20.0/20 🏆 EXCELLENT
```

### Exemple 2 : Très bonne équipe, une erreur
```
Temps réel : 21:00 (1260 s)
Erreurs : 1           → pénalités : 30 s
Indices : 0
Temps total : 1290 s (21:30)

- Rapidité  : 8 × (3600 − 1290) / 2400 = 8 × 2310 / 2400 = 7.70
- Précision : 7 − 1 × 0.5 = 6.50
- Autonomie : 5 − 0 × 1   = 5.00

Note finale : 19.2/20 🏆 EXCELLENT
```

### Exemple 3 : Performance moyenne
```
Temps réel : 25:00 (1500 s)
Erreurs : 5           → pénalités : 5 × 30 = 150 s
Indices : 3
Temps total : 1650 s (27:30)

- Rapidité  : 8 × (3600 − 1650) / 2400 = 8 × 1950 / 2400 = 6.50
- Précision : 7 − 5 × 0.5 = 4.50
- Autonomie : 5 − 3 × 1   = 2.00

Note finale : 13.0/20 👍 ASSEZ BIEN
```

### Exemple 4 : Mission terminée de justesse
```
Temps réel : 50:00 (3000 s)
Erreurs : 4           → pénalités : 4 × 30 = 120 s
Indices : 2
Temps total : 3120 s (52:00)

- Rapidité  : 8 × (3600 − 3120) / 2400 = 8 × 480 / 2400 = 1.60
- Précision : 7 − 4 × 0.5 = 5.00
- Autonomie : 5 − 2 × 1   = 3.00

Note finale : 9.6/20 📚 À AMÉLIORER
```

### Exemple 5 : Temps dépassé
```
Temps réel : 58:00 (3480 s)
Erreurs : 10          → pénalités : 10 × 30 = 300 s
Indices : 6
Temps total : 3780 s (63:00) → « TEMPS DÉPASSÉ » affiché, la partie a continué

- Rapidité  : 0.00 (temps total ≥ 60 min)
- Précision : 7 − 10 × 0.5 = 2.00
- Autonomie : max(0, 5 − 6 × 1) = 0.00

Note finale : 2.0/20 📚 À AMÉLIORER
```

Ces valeurs sont celles renvoyées par `computeScoreBreakdown()` (identiques côté client et côté serveur).

## Tracking des données

### Données globales (`gameState`, `front/src/composables/useGameState.js`)
```javascript
gameState = {
  timer: 0,              // Temps réel écoulé en secondes
  penaltyTime: 0,        // Pénalités en secondes (30 s par erreur)
  errors: 0,             // Nombre total d'erreurs
  hintsUsed: 0,          // Nombre total d'indices payés
  completedRooms: [],    // Salles terminées (ordre de ROOM_IDS)
  unlockedRooms: [],     // Salles accessibles (la suivante se débloque à chaque réussite)
  devToolsUsed: false,   // true si les DevTools du jeu ont servi : la partie ne sera pas enregistrée
}
```

### Données par salle
```javascript
gameState = {
  roomTimes: {           // Temps passé dans la salle (s), CUMULÉ sur toutes les visites
    'server': 240,
    'dna-lab': 180,
  },
  roomErrors: {          // Erreurs commises dans la salle
    'server': 2,
    'dna-lab': 1,
  },
  roomHints: {           // Indices déjà payés dans la salle (réaffichés gratuitement ensuite)
    'server': 1,
    'imaging': 2,
  }
}
```

### Sauvegarde et reprise

L'état de la partie est enregistré en continu dans le `localStorage` du navigateur (clé `cyberhopital:save:v1`) : après un rechargement ou une fermeture d'onglet, la partie reprend sur l'écran de sélection des salles avec le même temps, les mêmes erreurs et les mêmes indices. Le temps passé onglet fermé n'est pas compté, une sauvegarde de plus de 12 h est ignorée, et la sauvegarde est effacée à la fin de la partie.

## Affichage du score final

Le composant `FinalScore.vue` s'affiche quand les 9 salles sont terminées. Il reçoit un instantané figé de la partie (note et sous-notes, temps total, temps réel, pénalités, erreurs, indices, détails par salle) et affiche :

1. **Header** : nom de l'équipe et message de félicitations
2. **Note principale** : `x.x/20` en grand format, avec l'appréciation
3. **Détail de la note** : rapidité (/8), précision (/7), autonomie (/5), temps total et pénalités
4. **Détails par salle** : temps passé, erreurs, indices
5. **Débriefing de mission** : ce qu'il faut retenir de chacune des 9 salles et comment l'appliquer dans la vie réelle
6. **Diplôme PDF** téléchargeable
7. **Enregistrement du score** : état de la sauvegarde (en cours, enregistré, échec, non connecté, DevTools) et bouton « SAUVEGARDER MON SCORE » si besoin
8. **Actions** : rejouer ou fermer

## Recalcul côté serveur

À la fin de la partie, le frontend envoie `POST /api/scores/submit` (utilisateur connecté) :

```javascript
{
  score,            // note calculée par le client (indicative, IGNORÉE par le serveur)
  duration,         // temps total en secondes (temps réel + pénalités)
  roomsCompleted,   // 0 à 9
  errors,
  hints,
  completed: true,
  teamName,
  gameData: { roomTimes, roomErrors, roomHints, players }
}
```

Le serveur valide les valeurs (`duration` entier de 0 à 86 400 s, `errors` de 0 à 1 000, `hints` de 0 à 100, `roomsCompleted` de 0 à 9, `teamName` de 50 caractères au plus, `gameData` de 10 Ko au plus ; une mission complète - `completed: true` et 9 salles - de moins de 60 s est refusée car physiquement impossible) puis **recalcule** la note :

```javascript
// back/utils/scoring.js
const { total } = computeScoreBreakdown({ totalTime: duration, errors, hints });
```

C'est cette note recalculée qui est stockée et renvoyée. Les classements sont triés par note décroissante puis par durée croissante ; les moyennes sont arrondies au dixième. Une partie pendant laquelle les DevTools du jeu ont été utilisés n'est jamais envoyée au serveur.

## Implémentation technique

### Calcul de la note (`front/src/utils/scoring.js`)

```javascript
export const MISSION_DURATION = 60 * 60; // 60 min
export const TIME_FULL_SCORE = 20 * 60;  // 20 min

export const computeTimeScore = (totalTime) => {
  const t = Math.max(0, Number(totalTime) || 0);
  if (t <= TIME_FULL_SCORE) return MAX_TIME_SCORE;
  const ratio = (MISSION_DURATION - t) / (MISSION_DURATION - TIME_FULL_SCORE);
  return Math.max(0, MAX_TIME_SCORE * ratio);
};

// { timeScore, errorScore, hintScore, total }
export const computeScoreBreakdown = ({ totalTime, errors, hints }) => { /* ... */ };
```

Dans le jeu, `useGameState()` expose `getTotalTime()` (temps réel + pénalités), `getRemainingTime()` (compte à rebours, peut être négatif), `getScoreBreakdown()` et `calculateFinalScore()`.

### Intégration dans les salles

```javascript
const { gameState, addError, addHint, completeRoom, PENALTY_PER_ERROR } = useGameState();
const { showError } = useToast();

// Erreur : +1 erreur et +30 s de pénalité (le message ne révèle jamais la réponse)
addError("server");
showError("Réponse incorrecte. Essayez encore !", `+${PENALTY_PER_ERROR}s de pénalité`);

// Indices : ceux déjà payés sont réaffichés gratuitement, seul un nouvel indice est facturé
const hintsShown = ref(gameState.roomHints["server"] || 0);
const showHint = () => {
  if (hintsShown.value >= hints.length) return; // bouton désactivé : « Plus d'indice disponible »
  hintsShown.value++;
  if (hintsShown.value > (gameState.roomHints["server"] || 0)) addHint("server");
};

// Réussite : une seule fois, de façon synchrone
if (!isCompleted.value) {
  isCompleted.value = true;
  completeRoom("server");           // idempotent : enregistre le temps et débloque la salle suivante
  emit("room-completed", "server");
}
```

## Configuration

### Constantes

Dans `front/src/utils/scoring.js` **et** `back/utils/scoring.js` (à garder identiques) :

```javascript
const MISSION_DURATION = 60 * 60;  // Durée du compte à rebours (s) ; rapidité nulle au-delà
const TIME_FULL_SCORE = 20 * 60;   // Rapidité pleine jusqu'à ce temps total (s)
const PENALTY_PER_ERROR = 30;      // Secondes ajoutées par erreur (front uniquement)
const ERROR_POINT_PENALTY = 0.5;   // Points de précision retirés par erreur
const PENALTY_PER_HINT = 1;        // Points d'autonomie retirés par indice
const MAX_TIME_SCORE = 8;
const MAX_ERROR_SCORE = 7;
const MAX_HINT_SCORE = 5;          // MAX_SCORE = 20
```

### Ajuster la difficulté

Pour rendre le jeu plus difficile :
- Diminuer `TIME_FULL_SCORE` (ex. 15 min) ou `MISSION_DURATION` (ex. 45 min)
- Augmenter `PENALTY_PER_ERROR` (ex. 45 ou 60 secondes) ou `ERROR_POINT_PENALTY`
- Augmenter `PENALTY_PER_HINT` (ex. 1,5 ou 2 points)

Pour rendre le jeu plus facile :
- Augmenter `TIME_FULL_SCORE` (ex. 30 min)
- Diminuer `PENALTY_PER_ERROR` (ex. 20 secondes)
- Diminuer `PENALTY_PER_HINT` (ex. 0,5 point)

⚠️ Toute modification doit être reportée dans les deux fichiers, sinon la note affichée en fin de partie différera de celle enregistrée par le serveur. Les scores déjà enregistrés ne sont pas recalculés.

## Notes importantes

- La note est calculée une seule fois, à la fin de la partie, à partir d'un instantané figé.
- Les pénalités de temps comptent dans le compte à rebours **et** dans la note de rapidité.
- Le temps de chaque salle est cumulé sur toutes les visites ; les statistiques sont conservées quand on quitte une salle.
- Démarrer une nouvelle partie remet toutes les statistiques à zéro.

## Support et maintenance

Fichiers de référence :
- `front/src/utils/scoring.js` - formule de la note et appréciations
- `back/utils/scoring.js` - copie serveur de la formule (recalcul à l'enregistrement)
- `front/src/composables/useGameState.js` - état de la partie, temps, erreurs, indices, sauvegarde
- `front/src/components/FinalScore.vue` - écran de fin, débriefing et diplôme
- `back/routes/scores.js` - validation et enregistrement des scores
