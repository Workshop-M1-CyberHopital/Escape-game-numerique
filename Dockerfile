# Multi-stage Dockerfile pour Escape Game Cyber-Hôpital
# Un seul conteneur : Nginx (frontend Vue + proxy /api/) et l'API Node.js, orchestrés par supervisord.
#
# Build local   : docker build -t produn/escape-workshop:dev .
# Multi-arch    : ./push-to-hub.sh <tag>
#
# Aucune donnée d'exécution n'est embarquée : back/data/*.json et les fichiers .env sont exclus
# du contexte par .dockerignore. Les comptes et scores vivent dans le volume monté sur /app/back/data.

# Node 22 LTS (Node 20 est en fin de vie ; Vite 7 exige Node >= 20.19)
ARG NODE_IMAGE=node:22-alpine
# Même version de pnpm que celle qui a produit les pnpm-lock.yaml (lockfileVersion 9.0)
ARG PNPM_VERSION=9.12.0

# ------------------------------------------------------------------------------
# Stage 1 : build du frontend
# ------------------------------------------------------------------------------
# Le résultat (HTML/JS/CSS statiques) ne dépend pas de l'architecture : en build multi-arch
# (push-to-hub.sh), ce stage tourne une seule fois sur la plateforme de la machine de build,
# sans émulation QEMU (lente et parfois instable avec Node.js).
FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS frontend-builder
ARG PNPM_VERSION
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    COREPACK_ENABLE_AUTO_PIN=0
RUN corepack enable pnpm && corepack install -g "pnpm@${PNPM_VERSION}" && pnpm --version

WORKDIR /app/front

# Dépendances d'abord (couche mise en cache tant que package.json / le lockfile ne changent pas).
# --frozen-lockfile : le build échoue si pnpm-lock.yaml n'est pas synchronisé avec package.json.
COPY front/package.json front/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Code source puis build de production (sortie : /app/front/dist)
COPY front/ .

# Options de build Vite facultatives (les fichiers front/.env* ne sont pas copiés) :
#   docker build --build-arg VITE_DEV_MODE=false .   -> masque les DevTools du jeu
#   --build-arg VITE_API_URL=https://api.exemple/api -> API sur une autre origine (défaut : /api)
# Une valeur vide est retirée de l'environnement : le comportement par défaut du frontend s'applique.
ARG VITE_DEV_MODE
ARG VITE_API_URL
RUN if [ -z "${VITE_DEV_MODE}" ]; then unset VITE_DEV_MODE; fi; \
    if [ -z "${VITE_API_URL}" ]; then unset VITE_API_URL; fi; \
    pnpm run build

# ------------------------------------------------------------------------------
# Stage 2 : dépendances de production du backend
# ------------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS backend-builder
ARG PNPM_VERSION
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    COREPACK_ENABLE_AUTO_PIN=0
RUN corepack enable pnpm && corepack install -g "pnpm@${PNPM_VERSION}" && pnpm --version

WORKDIR /app/back

COPY back/package.json back/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Code source du backend (sans back/data/*.json ni back/config.env, cf. .dockerignore)
COPY back/ .

# ------------------------------------------------------------------------------
# Stage 3 : image finale Nginx + Node.js
# ------------------------------------------------------------------------------
FROM ${NODE_IMAGE}

RUN apk add --no-cache nginx supervisor \
    && mkdir -p /run/nginx /var/lib/nginx/tmp /var/log/nginx /app/back/data

# Configuration Nginx (frontend + proxy /api/) et supervisord (PID 1, logs sur stdout/stderr)
COPY front/nginx.conf /etc/nginx/nginx.conf
COPY infra/docker/supervisord.conf /etc/supervisord.conf

# Frontend buildé et backend avec ses dépendances de production
COPY --from=frontend-builder /app/front/dist /usr/share/nginx/html
COPY --from=backend-builder /app/back /app/back

# Variables par défaut. JWT_SECRET n'a volontairement PAS de valeur par défaut : passez-le à
# l'exécution (docker run -e, docker-compose + .env, Secret Kubernetes). Voir .env.example.
ENV NODE_ENV=production \
    PORT=3001 \
    DATA_DIR=/app/back/data

# 80 : application (frontend + /api). 3001 : API Node.js en direct (debug uniquement, non nécessaire).
EXPOSE 80 3001

# Vérifie toute la chaîne Nginx -> API (la route de santé n'est pas soumise au rate limiting)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/api/health || exit 1

# supervisord en PID 1 (forme exec, sans shell) : il reçoit SIGTERM et arrête proprement Nginx et Node.js
STOPSIGNAL SIGTERM
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
