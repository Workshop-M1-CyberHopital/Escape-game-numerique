# 🐳 Docker - Escape Game Cyber-Hôpital

Ce document explique comment construire, lancer et publier l'image Docker de l'Escape Game Cyber-Hôpital, qui regroupe le frontend et le backend dans un seul conteneur.

## 📋 Prérequis

- Docker (Engine 23+ ou Docker Desktop) avec Docker Compose v2 (`docker compose`)
- Un compte Docker Hub (uniquement pour publier l'image)

## 🏗️ Architecture du Container

```
navigateur ──► :80 Nginx ──► /            fichiers du frontend (build Vite)
                        └──► /api/...     proxy ──► 127.0.0.1:3001 API Node.js/Express
                                                         └──► /app/back/data (users.json, scores.json)
supervisord (PID 1) lance et surveille Nginx et Node.js
```

- **Nginx** (port 80) sert le frontend et relaie `/api/` vers l'API : le frontend de production appelle l'API sur la **même origine**, sans CORS et sans exposer le port 3001.
- **API Node.js** (port 3001, interne) stocke les comptes et les scores dans des fichiers JSON.
- **supervisord** est le processus principal (PID 1) : il reçoit `SIGTERM` (`docker stop`, arrêt d'un pod), arrête proprement Nginx puis Node.js, et envoie leur sortie dans `docker logs`. Sa configuration est dans [`infra/docker/supervisord.conf`](infra/docker/supervisord.conf).

### Ports

- `80` : application complète (frontend + `/api`)
- `3001` : API Node.js en direct, utile seulement pour le debug (docker-compose ne la publie que sur `127.0.0.1`)

### Données et volume

- `/app/back/data` : comptes (`users.json`) et scores (`scores.json`). **Montez toujours un volume** sur ce dossier, sinon tout est perdu à la suppression du conteneur.
- L'image ne contient **aucune donnée** : `.dockerignore` exclut `back/data/*.json`, les fichiers `.env` et `back/config.env`. Au premier démarrage, l'API crée des fichiers vides.
- ⚠️ **Une seule instance** par jeu de données : l'API garde les données en mémoire dans un seul processus. Ne lancez jamais deux conteneurs (ou deux réplicas Kubernetes) sur le même volume.

## 🚀 Utilisation rapide

### 1. Avec Docker Compose (recommandé)

```bash
# Fichier d'environnement (lu automatiquement par docker compose)
cp .env.example .env
openssl rand -hex 32          # à copier dans JWT_SECRET= du fichier .env

# Construire et démarrer
docker compose up -d --build

# Vérifier
docker compose ps                         # état "healthy" après quelques secondes
curl http://localhost/api/health          # API via Nginx
```

`docker compose` refuse de démarrer tant que `JWT_SECRET` n'est pas défini dans `.env`. L'image utilisée / construite est `produn/escape-workshop:latest` (variables `IMAGE_REPO` et `IMAGE_TAG` du `.env`), la même que celle publiée par `push-to-hub.sh` et déployée sur Kubernetes. Sans `--build`, Compose télécharge l'image publiée.

### 2. Avec docker run

```bash
# Build de l'image
docker build -t produn/escape-workshop:dev .

# Lancement du container (volume nommé pour les données, secret JWT obligatoire)
docker run -d --name escape-game \
  -p 80:80 \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  -v escape-game-data:/app/back/data \
  produn/escape-workshop:dev

# Vérification
curl http://localhost/                 # Frontend
curl http://localhost/api/health       # API (via Nginx)
```

> Avec `docker run -e JWT_SECRET="$(openssl rand -hex 32)"`, un nouveau secret est généré à chaque `docker run` : les joueurs devront se reconnecter. Pour un serveur durable, gardez la valeur dans un fichier `.env` (`--env-file .env`).

### 3. Build et push vers Docker Hub

```bash
docker login
./push-to-hub.sh            # tag latest (+ sha-<commit> si le dépôt est propre)
./push-to-hub.sh v1.2       # tag v1.2 (+ sha-<commit>)

# Autre dépôt Docker Hub
IMAGE_REPO=votre-username/escape-workshop ./push-to-hub.sh

# Image sans les DevTools du jeu
VITE_DEV_MODE=false ./push-to-hub.sh
```

Le script construit l'image pour `linux/amd64` et `linux/arm64`, la pousse, puis vérifie les architectures publiées. Il refuse de construire si `.dockerignore` n'exclut plus les données locales du backend ou les fichiers `.env`.

## 🔧 Configuration

### Variables d'environnement

Toutes les variables sont documentées dans [`.env.example`](.env.example). Les principales :

```bash
JWT_SECRET=<openssl rand -hex 32>   # obligatoire
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost        # inutile si le frontend passe par /api (même origine)
TRUST_PROXY=1                       # 1 = Nginx seul ; 2 derrière un Traefik / reverse proxy supplémentaire
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

L'image fixe `NODE_ENV=production`, `PORT=3001` et `DATA_DIR=/app/back/data`.

### Options de build du frontend

Les fichiers `front/.env*` ne sont pas copiés dans l'image. Les variables Vite se passent en build args :

```bash
docker build --build-arg VITE_DEV_MODE=false -t produn/escape-workshop:prod .
```

Avec Docker Compose, renseignez `VITE_DEV_MODE` / `VITE_API_URL` dans `.env` puis `docker compose build`.

### Cache HTTP (Nginx)

- `index.html` : `no-cache` (toujours revalidé, il pointe vers les fichiers du dernier build) ;
- `/assets/*` (fichiers hashés par Vite) : cache d'un an, `immutable` ;
- autres fichiers publics (planches Ishihara, sons, images, favicon) : cache d'une heure.

## 📊 Monitoring

### Logs

Nginx (accès et erreurs), l'API Node.js et supervisord écrivent sur la sortie du conteneur :

```bash
docker compose logs -f              # ou : docker logs -f escape-game
kubectl logs -l app=escape-app -f   # sur Kubernetes
```

### Health Check

L'image déclare un `HEALTHCHECK` sur `http://127.0.0.1/api/health` (Nginx + API). Les manifests Kubernetes utilisent la même route pour leurs sondes.

```bash
curl http://localhost/api/health
docker inspect --format '{{.State.Health.Status}}' escape-game-cyber-hospital

# Dans le container
docker compose exec escape-game supervisorctl status
```

## 🛠️ Développement

Pour développer, utilisez plutôt les serveurs de développement (rechargement à chaud) décrits dans le [README](README.md) : `pnpm run dev:back` et `pnpm run dev:front`.

### Debug

```bash
# Accès au shell du container (image Alpine : sh, pas bash)
docker compose exec escape-game sh

# Redémarrer un service sans redémarrer le conteneur
docker compose exec escape-game supervisorctl restart nginx
docker compose exec escape-game supervisorctl restart nodejs

# Tester l'API sans passer par Nginx
docker compose exec escape-game wget -qO- http://127.0.0.1:3001/api/health
```

## 🚀 Déploiement en production

```bash
# Sur le serveur : récupérer docker-compose.yml et créer le .env (JWT_SECRET...)
docker compose pull
docker compose up -d
```

Pour Kubernetes (AKS), voir [infra/doc_projet.md](infra/doc_projet.md) : 1 seul réplica, `JWT_SECRET` dans le Secret `escape-jwt-secret`, données sur `/app/back/data`.

### Mise à jour depuis une ancienne version du docker-compose.yml

L'ancien fichier montait **deux** volumes sur `/app/back/data` (`escape-game-data` et `escape-game-sessions`) : seul le second était réellement utilisé. Ces volumes ont en outre pu être initialisés avec des comptes de test embarqués dans les anciennes images.

```bash
docker volume ls | grep escape-game

# Option A : repartir de zéro (recommandé si les volumes ne contiennent que des données de test)
docker compose down
docker volume rm escape-game-numerique_escape-game-sessions escape-game-numerique_escape-game-data

# Option B : conserver les comptes et scores existants (copie sessions -> data)
docker compose down
docker run --rm \
  -v escape-game-numerique_escape-game-sessions:/from \
  -v escape-game-numerique_escape-game-data:/to \
  alpine sh -c 'cp -a /from/. /to/'
docker volume rm escape-game-numerique_escape-game-sessions
```

## 🔒 Sécurité

- `JWT_SECRET` : obligatoire, unique par déploiement, jamais commité (`openssl rand -hex 32`).
- `BCRYPT_ROUNDS` : `10` est un bon compromis ; au-delà, l'inscription et la connexion d'une classe entière deviennent lentes sur un petit CPU.
- Le port 3001 n'a pas besoin d'être publié : tout passe par Nginx sur le port 80.
- Les images publiées avant l'ajout de `back/data/*` au `.dockerignore` contenaient les fichiers de données locaux du poste de build : supprimez ces anciens tags de Docker Hub et changez les mots de passe des comptes concernés.

## 🐛 Dépannage

1. **`required variable JWT_SECRET is missing a value`**
   ```bash
   cp .env.example .env    # puis renseignez JWT_SECRET
   ```

2. **Port déjà utilisé**
   ```bash
   # Choisir un autre port dans .env
   HTTP_PORT=8080
   # ou avec docker run
   docker run -p 8080:80 ... produn/escape-workshop:dev
   ```

3. **Container ne démarre pas / "unhealthy"**
   ```bash
   docker compose logs escape-game
   docker compose exec escape-game supervisorctl status
   ```

4. **Frontend non accessible**
   ```bash
   docker compose exec escape-game nginx -t
   docker compose exec escape-game supervisorctl restart nginx
   ```

5. **Backend API non accessible (erreurs 502 sur /api)**
   ```bash
   docker compose exec escape-game supervisorctl status nodejs
   docker compose logs escape-game | grep -i erreur
   docker compose exec escape-game supervisorctl restart nodejs
   ```

### Nettoyage

```bash
# Arrêter et supprimer le container (les données restent dans le volume)
docker compose down

# Supprimer aussi le volume de données (comptes et scores perdus)
docker compose down -v

# Supprimer l'image locale
docker rmi produn/escape-workshop:latest
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Supervisor Documentation](http://supervisord.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
