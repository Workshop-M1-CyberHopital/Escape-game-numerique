# 🚀 Guide de Démarrage Rapide

## Backend (Port 3001)

### 1. Installer les dépendances
```bash
cd back
npm install
```

### 2. Démarrer le serveur
```bash
npm start
# ou
node main.js
```

### 3. Vérifier que le backend fonctionne
Ouvrir dans le navigateur : http://localhost:3001/api/health

## Frontend (Port 3000)

### 1. Installer les dépendances
```bash
cd front
npm install
```

### 2. Démarrer le serveur de développement
```bash
npm run dev
```

## 🔧 Configuration

### Backend
- Port : 3001
- API : http://localhost:3001/api
- CORS configuré pour http://localhost:3000

### Frontend
- Port : 3000
- API URL : http://localhost:3001/api

## 🧪 Test de l'API

### Vérifier la santé
```bash
curl http://localhost:3001/api/health
```

### Test d'inscription
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "testpassword123",
    "teamName": "Test Team"
  }'
```

## 🐛 Résolution des problèmes

### "Failed to fetch"
1. Vérifier que le backend est démarré sur le port 3001
2. Vérifier la configuration CORS
3. Vérifier l'URL de l'API dans le frontend

### Erreurs de dépendances
```bash
cd back
npm install
```

### Port déjà utilisé
Changer le port dans `back/config.env` :
```
PORT=3002
```
