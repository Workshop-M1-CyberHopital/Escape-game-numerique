#!/bin/bash

# Script simple pour build et push vers Docker Hub
# Repository: gaetandev/espace-workshop

set -e

TAG=${1:-"latest"}
IMAGE_NAME="gaetandev/espace-workshop:${TAG}"

echo "🐳 Build et push vers Docker Hub"
echo "📦 Repository: gaetandev/espace-workshop"
echo "🏷️  Tag: ${TAG}"
echo ""

# Build de l'image
echo "🔨 Construction de l'image..."
docker build -t "${IMAGE_NAME}" .

if [ $? -eq 0 ]; then
    echo "✅ Build réussi!"
else
    echo "❌ Échec du build"
    exit 1
fi

# Push vers Docker Hub
echo "📤 Push vers Docker Hub..."
docker push "${IMAGE_NAME}"

if [ $? -eq 0 ]; then
    echo "✅ Push réussi!"
    echo ""
    echo "🎉 Image disponible sur Docker Hub:"
    echo "   https://hub.docker.com/repository/docker/gaetandev/espace-workshop"
    echo ""
    echo "🚀 Pour utiliser l'image:"
    echo "   docker pull gaetandev/espace-workshop:${TAG}"
    echo "   docker run -d -p 80:80 -p 3001:3001 --name escape-game gaetandev/espace-workshop:${TAG}"
else
    echo "❌ Échec du push"
    exit 1
fi
