#!/usr/bin/env bash

# Build et push multi-architecture (linux/amd64 + linux/arm64) vers Docker Hub.
#
# Usage :
#   ./push-to-hub.sh [tag]                              # tag par défaut : latest
#   IMAGE_REPO=moncompte/escape-workshop ./push-to-hub.sh v1.2
#
# L'image est poussée avec le tag demandé ET, si le dépôt git est propre, avec un tag immuable
# sha-<commit>. Utilisez ce tag dans infra/cluster-*/escape.yaml pour figer la version déployée.
# Le même dépôt d'image est utilisé par docker-compose.yml (variable IMAGE_REPO).
# Options de build du frontend reprises de l'environnement si elles sont définies :
#   VITE_DEV_MODE=false ./push-to-hub.sh     # image sans DevTools

set -Eeuo pipefail

cd "$(dirname "$0")"

IMAGE_REPO="${IMAGE_REPO:-produn/escape-workshop}"
TAG="${1:-latest}"
PLATFORMS="${PLATFORMS:-linux/amd64,linux/arm64}"
BUILDER="multiarch-builder"

# 🛡️ L'image est publique : on refuse de construire si .dockerignore n'exclut plus les données
# locales du backend (comptes, hachages de mots de passe, scores) ni les fichiers .env.
for pattern in 'back/data/*' '**/.env' '**/*.env'; do
  if ! grep -qxF "$pattern" .dockerignore; then
    echo "❌ .dockerignore doit contenir la ligne '${pattern}' (données ou secrets locaux exclus de l'image)."
    exit 1
  fi
done

# Tag immuable basé sur le commit (seulement si aucune modification locale non commitée)
GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || true)"
TAGS=(-t "${IMAGE_REPO}:${TAG}")
if [ -n "${GIT_SHA}" ] && [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  TAGS+=(-t "${IMAGE_REPO}:sha-${GIT_SHA}")
  SHA_TAG="sha-${GIT_SHA}"
else
  SHA_TAG=""
  echo "⚠️  Modifications locales non commitées : pas de tag sha-<commit> pour ce build."
fi

echo "🐳 Build et push multi-architecture vers Docker Hub"
echo "📦 Repository: ${IMAGE_REPO}"
echo "🏷️  Tag(s): ${TAG}${SHA_TAG:+, ${SHA_TAG}}"
echo "🏗️  Architectures: ${PLATFORMS}"
echo ""

# 🧩 1️⃣ Builder multi-architecture (réutilisé s'il existe déjà)
echo "🔧 Configuration du builder multi-architecture..."
if ! docker buildx inspect "${BUILDER}" >/dev/null 2>&1; then
  docker buildx create --name "${BUILDER}" --driver docker-container >/dev/null
fi
if ! docker buildx inspect "${BUILDER}" --bootstrap >/dev/null; then
  echo "❌ Échec de la configuration du builder"
  exit 1
fi
echo "✅ Builder multi-architecture configuré!"

# 🧩 2️⃣ Construire et pousser l'image multi-arch
echo "🔨 Construction de l'image multi-architecture..."
if ! docker buildx build \
  --builder "${BUILDER}" \
  --platform "${PLATFORMS}" \
  --provenance=false --sbom=false \
  --build-arg VITE_DEV_MODE --build-arg VITE_API_URL \
  --label "org.opencontainers.image.revision=${GIT_SHA:-unknown}" \
  --label "org.opencontainers.image.source=https://github.com/Workshop-M1-CyberHopital/Escape-game-numerique" \
  "${TAGS[@]}" \
  --push .; then
  echo "❌ Échec du build multi-architecture"
  exit 1
fi
echo "✅ Build et push multi-architecture réussi!"

# 🧩 3️⃣ Vérifier que tout est bon
echo "🔍 Vérification des architectures..."
if ! docker buildx imagetools inspect "${IMAGE_REPO}:${TAG}" | grep -i "platform"; then
  echo "❌ Échec de la vérification"
  exit 1
fi

echo "✅ Vérification réussie!"
echo ""
echo "🎉 Image multi-architecture disponible sur Docker Hub:"
echo "   https://hub.docker.com/r/${IMAGE_REPO}"
echo ""
echo "🚀 Pour utiliser l'image:"
echo "   docker pull ${IMAGE_REPO}:${TAG}"
echo "   docker run -d -p 80:80 -e JWT_SECRET=\"\$(openssl rand -hex 32)\" \\"
echo "     -v escape-game-data:/app/back/data --name escape-game ${IMAGE_REPO}:${TAG}"
if [ -n "${SHA_TAG}" ]; then
  echo ""
  echo "📌 Version figée pour Kubernetes (infra/cluster-*/escape.yaml) : ${IMAGE_REPO}:${SHA_TAG}"
fi
