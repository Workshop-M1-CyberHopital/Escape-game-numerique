#!/bin/bash

# Script pour build et push de l'image Docker vers Docker Hub
# Usage: ./build-and-push.sh [tag] [dockerhub-username]

set -e

# Configuration
DOCKERHUB_USERNAME="gaetandev"
IMAGE_NAME="espace-workshop"
TAG=${1:-"latest"}
FULL_IMAGE_NAME="${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG}"

echo "🐳 Build et push de l'image Docker"
echo "📦 Image: ${FULL_IMAGE_NAME}"
echo "🏷️  Tag: ${TAG}"
echo ""

# Vérifier que Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker."
    exit 1
fi

# Build de l'image
echo "🔨 Construction de l'image..."
docker build -t "${FULL_IMAGE_NAME}" .

if [ $? -eq 0 ]; then
    echo "✅ Build réussi!"
else
    echo "❌ Échec du build"
    exit 1
fi

# Test de l'image
echo "🧪 Test de l'image..."
docker run --rm -d --name test-escape-game -p 8080:80 -p 3001:3001 "${FULL_IMAGE_NAME}"

# Attendre que le container démarre
sleep 10

# Vérifier que les services répondent
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Frontend accessible sur http://localhost:8080"
else
    echo "⚠️  Frontend non accessible"
fi

if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend API accessible sur http://localhost:3001"
else
    echo "⚠️  Backend API non accessible"
fi

# Arrêter le container de test
docker stop test-escape-game

# Demander confirmation pour le push
echo ""
read -p "🚀 Voulez-vous pousser l'image vers Docker Hub? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Push vers Docker Hub..."
    
    # Login Docker Hub (si nécessaire)
    if ! docker info | grep -q "Username:"; then
        echo "🔐 Connexion à Docker Hub requise"
        docker login
    fi
    
    # Push de l'image
    docker push "${FULL_IMAGE_NAME}"
    
    if [ $? -eq 0 ]; then
        echo "✅ Push réussi!"
        echo ""
        echo "🎉 Image disponible sur Docker Hub:"
        echo "   docker pull ${FULL_IMAGE_NAME}"
        echo ""
        echo "🚀 Pour lancer l'application:"
        echo "   docker run -d -p 80:80 -p 3001:3001 --name escape-game ${FULL_IMAGE_NAME}"
        echo ""
        echo "🌐 Application accessible sur:"
        echo "   Frontend: http://localhost:80"
        echo "   Backend API: http://localhost:3001"
    else
        echo "❌ Échec du push"
        exit 1
    fi
else
    echo "⏭️  Push annulé"
    echo ""
    echo "🔧 Pour tester l'image localement:"
    echo "   docker run -d -p 80:80 -p 3001:3001 --name escape-game ${FULL_IMAGE_NAME}"
fi

echo ""
echo "📋 Commandes utiles:"
echo "   Voir les logs: docker logs escape-game"
echo "   Arrêter: docker stop escape-game"
echo "   Supprimer: docker rm escape-game"
echo "   Supprimer l'image: docker rmi ${FULL_IMAGE_NAME}"
