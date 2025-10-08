# 🐳 Docker - Escape Game Cyber-Hôpital

Ce document explique comment utiliser Docker pour déployer l'Escape Game Cyber-Hôpital avec le frontend et le backend dans un seul container.

## 📋 Prérequis

- Docker installé sur votre machine
- Compte Docker Hub (pour le push)

## 🚀 Utilisation rapide

### 1. Build et test local

```bash
# Build de l'image
docker build -t escape-game-cyber-hospital .

# Lancement du container
docker run -d -p 80:80 -p 3001:3001 --name escape-game escape-game-cyber-hospital

# Vérification
curl http://localhost:80        # Frontend
curl http://localhost:3001/api/health  # Backend API
```

### 2. Avec Docker Compose

```bash
# Lancement avec docker-compose
docker-compose up -d

# Vérification
docker-compose ps
```

### 3. Build et push vers Docker Hub

```bash
# Utiliser le script automatisé
./build-and-push.sh latest votre-username-dockerhub

# Ou manuellement
docker build -t votre-username/escape-game-cyber-hospital:latest .
docker push votre-username/escape-game-cyber-hospital:latest
```

## 🏗️ Architecture du Container

Le container combine :

- **Frontend** : Application Vue.js servie par Nginx sur le port 80
- **Backend** : API Node.js/Express sur le port 3001
- **Supervisor** : Gestionnaire de processus pour orchestrer Nginx et Node.js

### Ports exposés

- `80` : Frontend (Nginx)
- `3001` : Backend API (Node.js)

### Volumes

- `/app/back/data` : Données persistantes (scores, sessions, utilisateurs)

## 🔧 Configuration

### Variables d'environnement

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:80
JWT_SECRET=escape-game-super-secret-key-change-in-production
BCRYPT_ROUNDS=12
```

### Personnalisation

Pour modifier la configuration, éditez le fichier `Dockerfile` ou utilisez des variables d'environnement :

```bash
docker run -e JWT_SECRET=votre-secret -e PORT=3002 escape-game-cyber-hospital
```

## 📊 Monitoring

### Logs

```bash
# Voir tous les logs
docker logs escape-game

# Logs en temps réel
docker logs -f escape-game

# Logs spécifiques
docker exec escape-game cat /var/log/supervisor/nginx.out.log
docker exec escape-game cat /var/log/supervisor/nodejs.out.log
```

### Health Check

```bash
# Vérifier le statut
curl http://localhost:80
curl http://localhost:3001/api/health

# Dans le container
docker exec escape-game supervisorctl status
```

## 🛠️ Développement

### Build en mode développement

```bash
# Build avec cache
docker build --cache-from escape-game-cyber-hospital:latest -t escape-game-cyber-hospital:dev .

# Lancement avec volumes pour le développement
docker run -v $(pwd)/front:/app/front -v $(pwd)/back:/app/back escape-game-cyber-hospital:dev
```

### Debug

```bash
# Accès au shell du container
docker exec -it escape-game sh

# Redémarrer les services
docker exec escape-game supervisorctl restart nginx
docker exec escape-game supervisorctl restart nodejs
```

## 🚀 Déploiement en production

### 1. Build optimisé

```bash
docker build --no-cache -t escape-game-cyber-hospital:prod .
```

### 2. Push vers registry

```bash
# Docker Hub
docker tag escape-game-cyber-hospital:prod votre-username/escape-game-cyber-hospital:latest
docker push votre-username/escape-game-cyber-hospital:latest

# Autre registry
docker tag escape-game-cyber-hospital:prod registry.votre-domaine.com/escape-game:latest
docker push registry.votre-domaine.com/escape-game:latest
```

### 3. Déploiement

```bash
# Sur le serveur de production
docker pull votre-username/escape-game-cyber-hospital:latest
docker run -d -p 80:80 -p 3001:3001 --name escape-game-prod --restart unless-stopped votre-username/escape-game-cyber-hospital:latest
```

## 🔒 Sécurité

### Variables sensibles

⚠️ **Important** : Changez les valeurs par défaut en production :

- `JWT_SECRET` : Clé secrète pour les tokens JWT
- `BCRYPT_ROUNDS` : Nombre de rounds pour le hachage des mots de passe

### Configuration sécurisée

```bash
# Générer une clé JWT sécurisée
openssl rand -base64 32

# Utiliser des variables d'environnement sécurisées
docker run -e JWT_SECRET=$(openssl rand -base64 32) escape-game-cyber-hospital
```

## 🐛 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   netstat -tulpn | grep :80
   netstat -tulpn | grep :3001
   
   # Utiliser d'autres ports
   docker run -p 8080:80 -p 3002:3001 escape-game-cyber-hospital
   ```

2. **Container ne démarre pas**
   ```bash
   # Vérifier les logs
   docker logs escape-game
   
   # Vérifier la configuration
   docker exec escape-game supervisorctl status
   ```

3. **Frontend non accessible**
   ```bash
   # Vérifier Nginx
   docker exec escape-game nginx -t
   docker exec escape-game supervisorctl restart nginx
   ```

4. **Backend API non accessible**
   ```bash
   # Vérifier Node.js
   docker exec escape-game ps aux | grep node
   docker exec escape-game supervisorctl restart nodejs
   ```

### Nettoyage

```bash
# Arrêter et supprimer le container
docker stop escape-game
docker rm escape-game

# Supprimer l'image
docker rmi escape-game-cyber-hospital

# Nettoyage complet
docker system prune -a
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Supervisor Documentation](http://supervisord.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
