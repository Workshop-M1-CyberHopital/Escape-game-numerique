#!/bin/bash

# Script pour build et push multi-architecture vers Docker Hub
# Repository: produn/escape-workshop

set -e

TAG=${1:-"latest"}
IMAGE_NAME="produn/escape-workshop:${TAG}"

echo "🐳 Build et push multi-architecture vers Docker Hub"
echo "📦 Repository: produn/escape-workshop"
echo "🏷️  Tag: ${TAG}"
echo "🏗️  Architectures: linux/amd64, linux/arm64"
echo ""

# 🧩 1️⃣ Activer le builder multi-architecture
echo "🔧 Configuration du builder multi-architecture..."
# Supprimer le builder existant s'il existe
docker buildx rm multiarch-builder 2>/dev/null || true
# Créer un nouveau builder multi-architecture
docker buildx create --name multiarch-builder --use
docker buildx inspect --bootstrap

if [ $? -eq 0 ]; then
    echo "✅ Builder multi-architecture configuré!"
else
    echo "❌ Échec de la configuration du builder"
    exit 1
fi

# 🧩 2️⃣ Construire et pousser l'image multi-arch
echo "🔨 Construction de l'image multi-architecture..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t "${IMAGE_NAME}" \
  --push .

if [ $? -eq 0 ]; then
    echo "✅ Build et push multi-architecture réussi!"
else
    echo "❌ Échec du build multi-architecture"
    exit 1
fi

# 🧩 3️⃣ Vérifier que tout est bon
echo "🔍 Vérification des architectures..."
docker manifest inspect "${IMAGE_NAME}" | grep architecture

if [ $? -eq 0 ]; then
    echo "✅ Vérification réussie!"
    echo ""
    echo "🎉 Image multi-architecture disponible sur Docker Hub:"
    echo "   https://hub.docker.com/repository/docker/produn/escape-workshop"
    echo ""
    echo "🚀 Pour utiliser l'image:"
    echo "   docker pull produn/escape-workshop:${TAG}"
    echo "   docker run -d -p 80:80 -p 3001:3001 --name escape-game produn/escape-workshop:${TAG}"
else
    echo "❌ Échec de la vérification"
    exit 1
fi
