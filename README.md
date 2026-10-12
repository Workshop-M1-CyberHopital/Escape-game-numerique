# 🏥 Cyber-Hôpital – Mission Résilience

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.19%2B%20%7C%2022.12%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Escape Game Numérique et Pédagogique sur la Cybersécurité Médicale.**  
> Projet réalisé dans le cadre du Workshop M1 EISI / EPSI.

---

## 🎬 Synopsis de la Mission

Une cyberattaque coordonnée a frappé un grand centre hospitalier connecté. Les dossiers médicaux des patients et les systèmes biomédicaux vitaux ont été corrompus par un **malware d'intrusion**.

Votre équipe d'intervention rapide en cybersécurité médicale est déployée en urgence pour neutraliser l'attaque, sécuriser les données de santé et sauver les patients avant l'échéance critique : **60 minutes**.

---

## 🧩 Les 9 Salles Virtuelles

Les salles se débloquent **l'une après l'autre**, dans cet ordre. Chaque salle résolue débloque une clé de restauration et la salle suivante.

| # | Salle | Mission | Énigme | Thématiques abordées |
|---|---|---|---|---|
| **1** | 🖥️ **Salle du Serveur** | *Le pare-feu corrompu* | Identifier l'encodage d'un journal d'accès intercepté (Base64), le décoder, puis répondre à la question qu'il contient (don du sang) | Encodage ≠ chiffrement, sécurité des données de santé |
| **2** | 🧬 **Laboratoire ADN** | *Les gènes brouillés* | Reconstituer le brin d'ADN complémentaire, puis traduire un codon en acide aminé | Appariement des bases (A-T, C-G), code génétique |
| **3** | 🩻 **Salle d'Imagerie** | *IRM fantôme* | Remettre dans le bon ordre 4 coupes d'IRM | Imagerie médicale, lecture de coupes anatomiques |
| **4** | ❤️ **Salle du Cœur** | *Arrêt cardiaque simulé* | Massage cardiaque : 30 compressions à 100-120 par minute, en rythme (Espace, Entrée, toucher ou manette) | Gestes qui sauvent, réanimation cardio-pulmonaire |
| **5** | 🦾 **Salle des Prothèses** | *Système orthopédique désynchronisé* | Calibrer la flexion du genou, puis régler les angles hanche / genou / cheville | Biomécanique, dispositifs médicaux connectés |
| **6** | 🔬 **Salle des Pathologies** | *Diagnostic médical* | Associer 5 maladies à leur traitement | Pathologies courantes et traitements |
| **7** | 🎧 **Salle de l'Audition** | *Diagnostic auditif interactif* | Reconnaître 3 sons médicaux : battements cardiaques, respiration sifflante, acouphènes | Auscultation, troubles de l'audition |
| **8** | 👁️ **Salle des Yeux** | *Diagnostic visuel corrompu* | Lire une ligne de l'échelle de Snellen, puis déchiffrer 5 planches d'Ishihara | Acuité visuelle, vision des couleurs |
| **9** | 🚨 **Salle de Fin** | *Diagnostic final : patiente critique* | Diagnostiquer une patiente en état critique, choisir son traitement, puis sécuriser son dossier médical | Raisonnement clinique, protection des données de santé |

Chaque salle est jouable à la souris, au toucher et au clavier, et se termine par un court message « à retenir ».

---

## ⏱️ Déroulement d'une partie

- **Équipe** : l'équipe choisit un nom et ajoute ses joueurs avant de commencer.
- **Compte à rebours de 60 minutes** : il décompte le temps réel **plus les pénalités** (+30 s par erreur). À zéro, l'affichage passe en **« TEMPS DÉPASSÉ »** : la partie continue normalement, seule la note de rapidité tombe à 0.
- **Indices** : chaque indice révélé coûte 1 point d'autonomie. Un indice déjà payé reste affiché gratuitement si l'équipe quitte la salle puis y revient.
- **Sauvegarde et reprise automatiques** : la progression (salles terminées, temps, erreurs, indices) est enregistrée en continu dans le navigateur (`localStorage`, clé `cyberhopital:save:v1`). Après un rechargement ou une fermeture d'onglet, la partie reprend sur l'écran de sélection des salles, sur le même appareil et le même navigateur. Le temps passé onglet fermé n'est pas décompté ; une sauvegarde de plus de 12 h est ignorée ; elle est effacée en fin de partie.
- **Fin de mission** : après la 9ᵉ salle, l'équipe obtient un **débriefing pédagogique** (ce qu'il faut retenir de chaque salle et comment l'appliquer dans la vie réelle), sa **note sur 20** détaillée et un **diplôme en PDF** téléchargeable.
- **Classement** : un joueur connecté enregistre le score de l'équipe ; sinon, le bouton « SAUVEGARDER MON SCORE » permet de se connecter puis d'enregistrer. Le serveur **recalcule** la note à partir du temps, des erreurs et des indices. Une partie où les DevTools du jeu ont été utilisés n'est jamais enregistrée.

---

## 📊 Barème de Notation

La note sur **20** comporte 3 composantes (formule unique : `front/src/utils/scoring.js`, recopiée côté serveur dans `back/utils/scoring.js`) :

| Composante | Points | Calcul |
|---|---|---|
| ⏱️ **Rapidité** | 8 | Note pleine jusqu'à **20 min** de temps total (temps réel + pénalités), puis baisse linéaire jusqu'à **0 à 60 min** |
| 🎯 **Précision** | 7 | −0,5 point par erreur (chaque erreur ajoute aussi 30 s au temps total) |
| 💡 **Autonomie** | 5 | −1 point par indice utilisé |

La note finale est arrondie au dixième (ex. `15.0/20`). Formules, exemples et appréciations : [docs/SYSTEME_NOTATION.md](docs/SYSTEME_NOTATION.md).

---

## 🏗️ Architecture du Projet

```
Escape-game-numerique/
├── front/                  # Application Frontend Vue 3 (Vite + Tailwind CDN)
│   ├── public/             # Fichiers statiques (planches Ishihara, sons, mascotte…)
│   ├── src/
│   │   ├── components/     # Composants UI, 9 salles (rooms/), briefings, modales, DevTools
│   │   ├── composables/    # Logique d'état (useGameState, useBriefing, useAudio, useApi, useAuth…)
│   │   ├── config/         # Définition des salles, endpoints de l'API, environnement
│   │   └── utils/          # scoring.js (note /20), animations, effets
│   ├── nginx.conf          # Nginx du conteneur : frontend + proxy /api/ vers l'API
│   └── package.json
│
├── back/                   # API REST Backend (Node.js + Express)
│   ├── routes/             # Endpoints /api/auth, /api/users, /api/scores
│   ├── middleware/         # Authentification JWT
│   ├── storage/            # DataStore : persistance en fichiers JSON (back/data/)
│   ├── utils/              # scoring.js (recalcul serveur de la note), validation
│   ├── config.js           # Configuration centralisée (variables d'environnement)
│   └── package.json
│
├── infra/                  # Déploiements Kubernetes AKS & configurations Traefik
│   ├── cluster-acme/       # Manifests avec certificats Let's Encrypt ACME (HTTP-01)
│   ├── cluster-gandi/      # Manifests avec webhook DNS Gandi
│   ├── docker/             # supervisord.conf du conteneur
│   └── doc_projet.md       # Documentation d'architecture de l'infrastructure
│
├── docs/                   # Documentation de référence & sujet du workshop
│   └── SYSTEME_NOTATION.md # Barème détaillé de la note sur 20
│
├── Dockerfile              # Build multi-stage : Nginx + Node.js sous supervisord
├── docker-compose.yml      # Lancement local du conteneur
├── push-to-hub.sh          # Build multi-architecture et push vers Docker Hub
├── DOCKER.md               # Guide Docker détaillé
├── package.json            # Scripts de commande à la racine
└── README.md
```

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) **20.19+ ou 22.12+** (exigé par Vite 7)
- [pnpm](https://pnpm.io/) 9 (`corepack enable` active la version déclarée dans `package.json`, ou `npm install -g pnpm@9`)
- [Docker](https://www.docker.com/) & Docker Compose (optionnel, pour l'exécution conteneurisée)

---

### Option 1 : Développement Local (Sans Docker)

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/Workshop-M1-CyberHopital/Escape-game-numerique.git
   cd Escape-game-numerique
   ```

2. **Installer les dépendances (Front + Back) :**
   ```bash
   pnpm run install:all
   ```

3. **Lancer le backend (Terminal 1) :**
   ```bash
   pnpm run dev:back
   ```
   *L'API démarre sur : `http://localhost:3001` (Health check : `http://localhost:3001/api/health`). En développement, elle utilise `back/config.env` (ou `back/.env` s'il existe) et stocke ses données dans `back/data/`.*

4. **Lancer le frontend (Terminal 2) :**
   ```bash
   pnpm run dev:front
   ```
   *L'application s'ouvre sur : `http://localhost:5173`. En développement, le frontend appelle l'API sur `http://<hôte>:3001/api`, ce qui permet aussi de jouer depuis un autre poste du réseau local.*

---

### Option 2 : Lancement avec Docker Compose

Le conteneur combine **Nginx** (frontend + proxy `/api/`) et l'**API Node.js**, orchestrés par **supervisord**.

```bash
# 1. Créer le fichier d'environnement et définir JWT_SECRET (obligatoire)
cp .env.example .env
openssl rand -hex 32        # copiez la valeur dans JWT_SECRET= du fichier .env

# 2. Construire et démarrer le conteneur
docker compose up -d --build

# Consulter les logs (Nginx + API)
docker compose logs -f

# Arrêter l'application (les comptes et scores restent dans le volume escape-game-data)
docker compose down
```

L'application est disponible sur :
- **Jeu** : [http://localhost](http://localhost)
- **API** (même origine, via Nginx) : [http://localhost/api/health](http://localhost/api/health)
- API en direct (debug, uniquement depuis la machine hôte) : `http://127.0.0.1:3001/api/health`

Voir [DOCKER.md](DOCKER.md) pour le détail (logs, supervisorctl, volumes, publication sur Docker Hub).

---

## 🔧 Configuration & Variables d'Environnement

- **Docker Compose** : fichier `.env` à la racine du dépôt (modèle commenté : [`.env.example`](.env.example)).
- **Kubernetes** : les scripts `infra/cluster-*/deploy-infra*.sh` lisent le `.env` du dossier depuis lequel ils sont lancés, sinon celui de la racine du dépôt.
- **Développement local de l'API** : `back/.env` (modèle : `back/.env.example`), sinon `back/config.env` (valeurs de développement, ignorées en production).

```bash
cp .env.example .env
cp back/.env.example back/.env   # optionnel, pour le développement local
```

| Variable | Description | Défaut |
|---|---|---|
| `PORT` | Port d'écoute de l'API Node.js | `3001` |
| `NODE_ENV` | Environnement d'exécution (`development` / `production`) | `development` (`production` dans l'image Docker) |
| `JWT_SECRET` | Secret de signature des tokens. **Obligatoire en production** (`openssl rand -hex 32`) : absent ou égal à une valeur publique du dépôt, il est remplacé par un secret aléatoire par processus (sessions perdues à chaque redémarrage) | secret de dev hors production |
| `JWT_EXPIRES_IN` | Durée de validité d'un token (`24h`, `7d`, secondes) | `24h` |
| `BCRYPT_ROUNDS` | Coût du hachage bcrypt des mots de passe | `10` |
| `CORS_ORIGIN` | Origines autorisées, séparées par des virgules (`FRONTEND_URL` est aussi accepté). En développement, localhost et le réseau local sont toujours autorisés | aucune (même origine) |
| `TRUST_PROXY` | Valeur `trust proxy` d'Express : nombre de proxies devant Node.js (`1` = Nginx, `2` = Traefik + Nginx) | `1` en production, `false` sinon |
| `RATE_LIMIT_WINDOW_MS` | Fenêtre de limitation de débit sur `/api` | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Requêtes autorisées par IP et par fenêtre (une classe entière peut partager une IP) | `1000` |
| `AUTH_RATE_LIMIT_MAX` | Échecs de connexion / inscription tolérés par IP et par fenêtre | `50` |
| `DATA_DIR` | Dossier des fichiers JSON (`users.json`, `scores.json`) | `back/data` |
| `VITE_DEV_MODE` | *(build du frontend)* `false` masque les DevTools du jeu | DevTools affichés |
| `VITE_API_URL` | *(build du frontend)* URL de l'API | `:3001/api` en dev, `/api` en production |

> [!CAUTION]
> En production, définissez toujours un `JWT_SECRET` robuste et ne commitez jamais le fichier `.env`.

> [!IMPORTANT]
> L'API stocke ses données dans des fichiers JSON gérés par **un seul processus** : ne lancez qu'**une seule instance** (1 conteneur, 1 réplica Kubernetes, pas d'autoscaling) sur un même jeu de données.

---

## ☸️ Déploiement Kubernetes (AKS)

Les manifests et scripts sont dans `infra/cluster-acme/` (certificats Let's Encrypt HTTP-01) et `infra/cluster-gandi/` (webhook DNS Gandi) :

- l'image `produn/escape-workshop` est publiée par `./push-to-hub.sh` (tag demandé + tag immuable `sha-<commit>` si le dépôt git est propre) ;
- `escape-app` tourne avec **exactement 1 réplica** (stratégie `Recreate`, HPA bridé à 1) car le stockage est en JSON ; les données sont conservées sur le nœud (`hostPath`, comme MariaDB) ;
- `JWT_SECRET` provient du Secret `escape-jwt-secret` créé par `deploy-infra*.sh` (à partir du `.env`, ou généré aléatoirement une seule fois) ;
- Traefik route tout vers le port 80 du conteneur, Nginx relaie `/api/` vers l'API.

Détails : [infra/doc_projet.md](infra/doc_projet.md).

---

## 📡 Endpoints Principaux de l'API

- **Santé & Système** :
  - `GET /api/health` : État du serveur et uptime
- **Authentification (`/api/auth`)** :
  - `POST /api/auth/register` : Inscription d'un nouveau compte
  - `POST /api/auth/login` : Connexion et génération du token JWT
  - `GET /api/auth/verify` : Vérification du token actif
  - `PUT /api/auth/change-password` / `DELETE /api/auth/account` : Gestion du compte
- **Utilisateurs & Profils (`/api/users`)** :
  - `GET /api/users/profile` / `PUT /api/users/profile` : Profil connecté
  - `GET /api/users/stats`, `GET /api/users/games` : Statistiques et historique des parties
  - `GET /api/users/leaderboard` : Classement des utilisateurs
- **Système de Scores (`/api/scores`)** :
  - `POST /api/scores/submit` : Enregistrement d'une fin de partie (authentifié, note recalculée par le serveur)
  - `GET /api/scores/leaderboard` : Tableau d'honneur des meilleures équipes
  - `GET /api/scores/my-scores`, `GET /api/scores/stats`, `GET /api/scores/recent`, `GET /api/scores/best`

---

## 🛡️ Licence

Ce projet est distribué sous licence MIT.
