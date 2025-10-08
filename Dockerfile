# Multi-stage Dockerfile pour Escape Game Cyber-Hôpital
# Combine le frontend Vue.js et le backend Node.js dans un seul container

# Stage 1: Build du frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/front

# Copier les fichiers de configuration du frontend
COPY front/package*.json ./
COPY front/pnpm-lock.yaml ./

# Installer pnpm et les dépendances
RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile

# Copier le code source du frontend
COPY front/ .

# Build du frontend pour la production
RUN pnpm run build

# Stage 2: Build du backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/back

# Copier les fichiers de configuration du backend
COPY back/package*.json ./
COPY back/pnpm-lock.yaml ./

# Installer pnpm et les dépendances
RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile --production

# Copier le code source du backend
COPY back/ .

# Stage 3: Image finale avec Nginx + Node.js
FROM node:20-alpine

# Installer nginx et autres dépendances
RUN apk add --no-cache nginx supervisor

# Créer les répertoires nécessaires
RUN mkdir -p /var/log/supervisor /var/log/nginx /var/lib/nginx/tmp /run/nginx /etc/supervisor/conf.d

# Configuration de Nginx
COPY front/nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés du frontend
COPY --from=frontend-builder /app/front/dist /usr/share/nginx/html

# Copier le backend
COPY --from=backend-builder /app/back /app/back

# Copier les fichiers de données
COPY back/data /app/back/data

# Configuration de Supervisor pour gérer Nginx et Node.js
RUN echo '[supervisord]' > /etc/supervisor/conf.d/supervisord.conf && \
    echo 'nodaemon=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:nginx]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=nginx -g "daemon off;"' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/var/log/supervisor/nginx.err.log' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/var/log/supervisor/nginx.out.log' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo '[program:nodejs]' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'command=node main.js' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'directory=/app/back' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autostart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'autorestart=true' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stderr_logfile=/var/log/supervisor/nodejs.err.log' >> /etc/supervisor/conf.d/supervisord.conf && \
    echo 'stdout_logfile=/var/log/supervisor/nodejs.out.log' >> /etc/supervisor/conf.d/supervisord.conf

# Configuration des variables d'environnement
ENV NODE_ENV=production
ENV PORT=3001
ENV FRONTEND_URL=http://localhost:80

# Exposer les ports
EXPOSE 80 3001

# Créer un script de démarrage
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "🚀 Démarrage de l'\''Escape Game Cyber-Hôpital..."' >> /start.sh && \
    echo 'echo "📦 Frontend: Nginx sur le port 80"' >> /start.sh && \
    echo 'echo "🔧 Backend: Node.js sur le port 3001"' >> /start.sh && \
    echo 'echo "🌐 Application accessible sur http://localhost:80"' >> /start.sh && \
    echo 'echo "📊 API accessible sur http://localhost:3001"' >> /start.sh && \
    echo 'supervisord -c /etc/supervisor/conf.d/supervisord.conf' >> /start.sh && \
    chmod +x /start.sh

# Point d'entrée
CMD ["/start.sh"]
