# Escape Game Cyber-Hôpital - Backend API

Backend Node.js/Express pour l'application Escape Game Cyber-Hôpital.
**Focus : Authentification, Gestion des utilisateurs et Système de scores (note sur 20).**

## 🚀 Installation

1. **Installer les dépendances :**
```bash
pnpm install
```

2. **Configuration (facultatif en développement) :**
```bash
# Valeurs personnelles (non commitées, prioritaires sur config.env)
cp .env.example .env
```
`config.env` contient les valeurs de développement commitées ; il n'est **jamais** chargé quand `NODE_ENV=production`.

3. **Démarrer le serveur :**
```bash
# Mode développement (avec nodemon)
pnpm dev

# Mode production
NODE_ENV=production JWT_SECRET=$(openssl rand -hex 32) pnpm start
```

## 🔧 Variables d'environnement

Toute la configuration est lue dans `config.js`.

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3001` | Port d'écoute |
| `NODE_ENV` | `development` | `production` active les protections ci-dessous |
| `JWT_SECRET` | secret de dev (hors production) | **Obligatoire en production.** Absent ou égal à une valeur publique du dépôt : avertissement bruyant et secret aléatoire par processus (sessions perdues au redémarrage) |
| `JWT_EXPIRES_IN` | `24h` | Durée de validité des jetons (`24h`, `7d`, ou un nombre de secondes) |
| `BCRYPT_ROUNDS` | `10` | Coût du hachage des mots de passe |
| `CORS_ORIGIN` | _(vide)_ | Origines autorisées, séparées par des virgules (`*` = toutes). `FRONTEND_URL` est aussi accepté. En développement, localhost et le réseau local sont toujours autorisés |
| `TRUST_PROXY` | `1` en production, `false` sinon | Valeur `trust proxy` d'Express (nombre de proxies : 1 = nginx, 2 = Ingress + nginx) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Fenêtre de limitation (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` | Requêtes `/api` par IP et par fenêtre (une classe peut partager une IP) |
| `AUTH_RATE_LIMIT_MAX` | `50` | Échecs de connexion / inscription tolérés par IP et par fenêtre |
| `DATA_DIR` | `back/data` | Dossier des fichiers JSON (absolu ou relatif à `back/`) |

En production, le front appelle l'API sur la même origine (`/api`, relayé par nginx vers `127.0.0.1:3001`).

## 💾 Stockage

- Fichiers `users.json` et `scores.json` dans `DATA_DIR`, chargés en mémoire au démarrage.
- Écritures atomiques (fichier temporaire + `fsync` + renommage) : un arrêt brutal ne tronque jamais un fichier.
- Un fichier illisible n'est jamais écrasé : il est renommé en `<fichier>.corrupt-<horodatage>` et un message bien visible est journalisé.
- Au démarrage, les anciens scores « en points » sont convertis en note /20 (ancienne valeur dans `legacyScore`, sauvegarde `scores.json.bak-v1-<horodatage>`) et les statistiques des joueurs sont recalculées à partir de leurs scores réels.
- **Un seul processus** doit utiliser un même `DATA_DIR` : en Kubernetes, exactement 1 réplica (pas d'autoscaling) tant qu'aucune vraie base de données n'est utilisée.

## 📡 API Endpoints

### Santé du serveur
- `GET /api/health` - Vérifier l'état du serveur

### Authentification
- `POST /api/auth/register` - Inscription (email et nom d'utilisateur uniques, sans tenir compte de la casse ni des espaces)
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion (JWT sans état : le client supprime son jeton)
- `GET /api/auth/verify` - Vérifier le token JWT
- `PUT /api/auth/change-password` - Changer le mot de passe (renvoie un nouveau jeton, les anciens sont invalidés)
- `DELETE /api/auth/account` - Supprimer **définitivement** le compte et tous ses scores (corps JSON `{ "password": "..." }`)

Les réponses `register`, `login`, `verify` et `/users/profile` renvoient le même objet utilisateur :
`id, username, email, teamName, createdAt, lastLogin, updatedAt, gamesPlayed, bestScore, totalScore, averageScore`.

Les erreurs ont la forme `{ error, message?, code }`. Codes de session invalide (le front déconnecte le joueur) :
`TOKEN_MISSING`, `TOKEN_INVALID`, `TOKEN_EXPIRED`, `USER_NOT_FOUND`. Un mauvais mot de passe renvoie `INVALID_CREDENTIALS`.

### Gestion des utilisateurs
- `GET /api/users/profile` - Profil de l'utilisateur connecté
- `PUT /api/users/profile` - Mettre à jour le profil (`username`, `teamName`)
- `GET /api/users/stats` - Statistiques de l'utilisateur (calculées à partir de ses scores)
- `GET /api/users/games` - Historique réel des parties (`limit`, `offset`)
- `GET /api/users/leaderboard` - Classement des utilisateurs
- `GET /api/users/search` - Rechercher des utilisateurs
- `GET /api/users/most-active` - Utilisateurs les plus actifs (`period` = day | week | month | all)

### Système de scores
- `POST /api/scores/submit` - Soumettre une partie. Corps : `duration` (s, entier 0..86400, temps + pénalités), `errors` (0..1000),
  `hints` (0..100), `roomsCompleted` (0..9), `completed` (booléen), `teamName` (≤ 50 caractères),
  `gameData` (`roomTimes`, `roomErrors`, `roomHints`, `players` ; 10 Ko max). **La note /20 est recalculée par le serveur**
  (`utils/scoring.js`), la valeur `score` envoyée par le client est ignorée. Une même partie renvoyée dans les 10 minutes n'est pas dupliquée.
  Une mission complète (`completed: true`, 9 salles) de moins de 60 s est refusée (400).
- `GET /api/scores/user/:userId` - Scores d'un utilisateur
- `GET /api/scores/my-scores` - Mes scores (utilisateur connecté, détail complet)
- `GET /api/scores/leaderboard` - Classement global (`sortBy` = score | duration | date | rooms, `period` = all | day | week | month)
- `GET /api/scores/stats` - Statistiques globales des scores
- `GET /api/scores/recent` - Scores récents
- `GET /api/scores/best` - Meilleurs scores
- `DELETE /api/scores/:scoreId` - Supprimer un de ses scores (les statistiques du joueur sont recalculées)

Les classements publics n'exposent ni `userId` ni `gameData` (prénoms des joueurs).
Tri par défaut : note décroissante, puis durée croissante.

## 🏗️ Architecture

```
back/
├── main.js              # Point d'entrée du serveur (sécurité, CORS, rate limit, routes)
├── config.js            # Configuration centralisée (variables d'environnement)
├── config.env           # Valeurs de développement (jamais chargé en production)
├── .env.example         # Modèle de configuration
├── middleware/auth.js   # Vérification des JWT
├── routes/              # Routes de l'API
│   ├── auth.js          # Authentification et compte
│   ├── users.js         # Profils, statistiques, classements utilisateurs
│   └── scores.js        # Scores et classements
├── storage/dataStore.js # Stockage JSON (écritures atomiques, migration)
├── utils/               # Notation /20 (copie de front/src/utils/scoring.js), validation, sérialisation
└── scripts/init-data.js # Création des fichiers de données vides
```

## 🛡️ Sécurité

- **Helmet** : en-têtes de sécurité
- **CORS** : liste d'origines explicite en production
- **Rate limiting** : limite globale large + limite stricte sur les échecs de connexion
- **Validation** : toutes les entrées sont typées et bornées ; corps JSON limités à 100 Ko
- **Mots de passe** : bcrypt ; jamais renvoyés ni journalisés
