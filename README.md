# 🏥 Cyber-Hôpital – Mission Résilience

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Escape Game Numérique et Pédagogique sur la Cybersécurité Médicale.**  
> Projet réalisé dans le cadre du Workshop M1 EISI / EPSI.

---

## 🎬 Synopsis de la Mission

Une cyberattaque coordonnée a frappé un grand centre hospitalier connecté. Les dossiers médicaux des patients et les systèmes biomédicaux vitaux ont été corrompus par un **malware d'intrusion**.

Votre équipe d'intervention rapide en cybersécurité médicale est déployée en urgence pour neutraliser l'attaque, sécuriser les données de santé et sauver les patients avant l'échéance critique.

---

## 🧩 Les 9 Salles Virtuelles

Chaque salle résolue débloque une clé cryptographique de restauration.

| # | Salle | Intitulé de la mission | Compétences & Thématiques abordées |
|---|---|---|---|
| **1** | 🖥️ **Salle du Serveur** | *Pare-feu corrompu* | Décodage de logs d'accès chiffrés, sécurité des accès réseau |
| **2** | 🧬 **Laboratoire ADN** | *Gènes brouillés* | Reconstitution de séquences génétiques, intégrité des données bio |
| **3** | 🩻 **Salle d’Imagerie** | *IRM fantôme* | Reconstruction d'imagerie médicale corrompue, formats DICOM |
| **4** | ❤️ **Salle du Cœur** | *Rythme vital* | Synchronisation cardiaque sous stress, capteurs biomédicaux |
| **5** | 🔬 **Salle des Pathologies** | *Diagnostic compromis* | Corrélation symptômes / pathologies, logique clinique |
| **6** | 🦾 **Salle des Prothèses** | *Articulations désynchronisées* | Calibrage d'implants bioniques et biomécanique |
| **7** | 🎧 **Salle de l’Audition** | *Fréquences brouillées* | Traitement du signal audio, fréquences et spectrogrammes |
| **8** | 👁️ **Salle des Yeux** | *Vision brouillée* | Rétablissement des optotypes, recalibrage visuel |
| **9** | 🚨 **Salle de Fin** | *Patient critique* | Gestion de crise, diagnostic final et stabilisation d'urgence |

À l'issue des salles, un **débriefing pédagogique complet**, une **note sur 20** détaillée et un **diplôme officiel en PDF** téléchargeable sont délivrés aux participants.

---

## 🏗️ Architecture du Projet

```
Escape-game-numerique/
├── front/                  # Application Frontend Vue 3 (Vite + Tailwind/Cyber CSS)
│   ├── src/
│   │   ├── components/     # Composants UI, salles, modales et DevTools
│   │   ├── composables/    # Logique d'état (useGameState, useAudio, useApi, useAuth...)
│   │   └── config/         # Définition des salles, endpoints, briefings
│   ├── nginx.conf          # Configuration serveur Nginx pour conteneurisation
│   └── package.json
│
├── back/                   # API REST Backend (Node.js + Express)
│   ├── routes/             # Endpoints /api/auth, /api/users, /api/scores
│   ├── middleware/         # Middleware d'authentification JWT réutilisable
│   ├── storage/            # DataStore avec persistance fichiers JSON
│   ├── config.js           # Configuration centralisée du serveur
│   └── package.json
│
├── infra/                  # Déploiements Kubernetes AKS & configurations Traefik
│   ├── cluster-acme/       # Manifests Kubernetes avec certificats Let's Encrypt ACME
│   ├── cluster-gandi/      # Manifests avec webhook DNS Gandi
│   └── doc_projet.md       # Documentation d'architecture infrastructure détaillée
│
├── docs/                   # Documentation de référence & Sujet d'évaluation
│   └── SYSTEME_NOTATION.md # Barème précis du calcul de la note sur 20
│
├── Dockerfile              # Multi-stage build Nginx + Node.js (production)
├── docker-compose.yml      # Orchestration conteneurisée locale
├── package.json            # Scripts de commande à la racine
└── README.md
```

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) v18.0.0 ou supérieur
- [pnpm](https://pnpm.io/) recommandé (`npm install -g pnpm`)
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
   *L'API démarre sur : `http://localhost:3001` (Health check : `http://localhost:3001/api/health`)*

4. **Lancer le frontend (Terminal 2) :**
   ```bash
   pnpm run dev:front
   ```
   *L'application s'ouvre sur : `http://localhost:5173`*

---

### Option 2 : Lancement avec Docker Compose

Pour exécuter l'image combinée (Frontend Nginx + API Node.js sous Supervisor) :

```bash
# Construire et démarrer le conteneur
docker compose up -d --build

# Consulter les logs
docker compose logs -f

# Arrêter l'application
docker compose down
```

L'application est disponible sur :
- **Frontend** : [http://localhost:80](http://localhost:80)
- **API Backend** : [http://localhost:3001](http://localhost:3001)

---

## 🔧 Configuration & Variables d'Environnement

Un fichier modèle `.env.example` est fourni à la racine et dans `back/.env.example`.

Pour personnaliser la configuration :
```bash
cp .env.example .env
cp back/.env.example back/.env
```

| Variable | Description | Défaut |
|---|---|---|
| `PORT` | Port d'écoute de l'API Node.js | `3001` |
| `NODE_ENV` | Environnement d'exécution (`development` / `production`) | `development` |
| `FRONTEND_URL` | Origine frontend autorisée pour CORS | `http://localhost:5173` |
| `JWT_SECRET` | Clé secrète de signature des tokens d'authentification | *Clé par défaut de dev* |
| `BCRYPT_ROUNDS` | Nombre de passes de hachage des mots de passe | `12` |

> [!CAUTION]
> En production, veillez à toujours définir une clé `JWT_SECRET` robuste et sécurisée.

---

## 📡 Endpoints Principaux de l'API

- **Santé & Système** :
  - `GET /api/health` : État du serveur et uptime
- **Authentification (`/api/auth`)** :
  - `POST /api/auth/register` : Inscription d'un nouveau compte
  - `POST /api/auth/login` : Connexion et génération du token JWT
  - `GET /api/auth/verify` : Vérification du token actif
- **Utilisateurs & Profils (`/api/users`)** :
  - `GET /api/users/profile` : Données du profil connecté
  - `GET /api/users/leaderboard` : Classement des utilisateurs
- **Système de Scores (`/api/scores`)** :
  - `POST /api/scores/submit` : Enregistrement d'une note de fin de partie
  - `GET /api/scores/leaderboard` : Tableau d'honneur des meilleures équipes

---

## 📊 Barème de Notation

Le système évalue les joueurs sur **20 points** selon 3 composantes :
- ⏱️ **Rapidité (8 pts)** : Temps d'exécution de la mission
- 🎯 **Précision (7 pts)** : Nombre d'erreurs commises (-0.5 pt par erreur)
- 💡 **Autonomie (5 pts)** : Recours aux indices (-1 pt par indice)

Consultez [docs/SYSTEME_NOTATION.md](docs/SYSTEME_NOTATION.md) pour les formules et barèmes complets.

---

## 🛡️ Licence

Ce projet est distribué sous licence MIT.
