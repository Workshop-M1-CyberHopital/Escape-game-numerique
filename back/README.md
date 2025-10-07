# Escape Game Cyber-Hôpital - Backend API

Backend Node.js/Express pour l'application Escape Game Cyber-Hôpital.
**Focus : Authentification, Gestion des utilisateurs et Système de scores.**

## 🚀 Installation

1. **Installer les dépendances :**
```bash
npm install
```

2. **Configuration :**
```bash
# Copier le fichier de configuration
cp config.js.example config.js

# Modifier les variables d'environnement selon vos besoins
```

3. **Démarrer le serveur :**
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

## 📡 API Endpoints

### Santé du serveur
- `GET /api/health` - Vérifier l'état du serveur

### Authentification
- `POST /api/auth/register` - Inscription d'un utilisateur
- `POST /api/auth/login` - Connexion d'un utilisateur
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/verify` - Vérifier le token JWT
- `PUT /api/auth/change-password` - Changer le mot de passe
- `DELETE /api/auth/account` - Supprimer le compte

### Gestion des utilisateurs
- `GET /api/users/profile` - Profil de l'utilisateur connecté
- `PUT /api/users/profile` - Mettre à jour le profil
- `GET /api/users/stats` - Statistiques de l'utilisateur
- `GET /api/users/games` - Historique des parties
- `GET /api/users/leaderboard` - Classement des utilisateurs
- `GET /api/users/search` - Rechercher des utilisateurs
- `GET /api/users/most-active` - Utilisateurs les plus actifs

### Système de scores
- `POST /api/scores/submit` - Soumettre un score
- `GET /api/scores/user/:userId` - Scores d'un utilisateur
- `GET /api/scores/my-scores` - Mes scores (utilisateur connecté)
- `GET /api/scores/leaderboard` - Classement global des scores
- `GET /api/scores/stats` - Statistiques globales des scores
- `GET /api/scores/recent` - Scores récents
- `GET /api/scores/best` - Meilleurs scores
- `DELETE /api/scores/:scoreId` - Supprimer un score

## 🏗️ Architecture

```
back/
├── main.js              # Point d'entrée du serveur
├── config.js            # Configuration
├── package.json         # Dépendances et scripts
├── routes/              # Routes de l'API
│   ├── auth.js         # Authentification et autorisation
│   ├── users.js        # Gestion des utilisateurs
│   └── scores.js       # Système de scores et classements
└── README.md           # Documentation
```

## 🔧 Configuration

### Variables d'environnement
- `PORT` - Port du serveur (défaut: 3001)
- `NODE_ENV` - Environnement (development/production)
- `FRONTEND_URL` - URL du frontend pour CORS
- `JWT_SECRET` - Clé secrète pour JWT
- `BCRYPT_ROUNDS` - Nombre de rounds pour bcrypt

### Configuration CORS
Le serveur est configuré pour accepter les requêtes depuis le frontend Vue.js.

## 🛡️ Sécurité

- **Helmet** : Headers de sécurité
- **CORS** : Configuration des origines autorisées
- **Rate Limiting** : Limitation du nombre de requêtes
- **Compression** : Compression des réponses
- **Validation** : Validation des données d'entrée

## 📊 Fonctionnalités

### Authentification
- Inscription et connexion des utilisateurs
- Authentification JWT
- Gestion des mots de passe sécurisés
- Protection des routes sensibles

### Gestion des utilisateurs
- Profils utilisateurs complets
- Statistiques personnelles
- Historique des parties
- Recherche et classements

### Système de scores
- Soumission et stockage des scores
- Classements globaux et personnels
- Statistiques détaillées
- Historique des performances

## 🚀 Déploiement

### Production
```bash
# Installer les dépendances de production
npm install --production

# Démarrer le serveur
npm start
```

### Docker (optionnel)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔍 Monitoring

Le serveur expose des endpoints de monitoring :
- `/api/health` - Santé du serveur
- `/api/stats/metrics` - Métriques de performance

## 📝 Logs

Les logs sont configurés avec Morgan pour le développement et Winston pour la production.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.
