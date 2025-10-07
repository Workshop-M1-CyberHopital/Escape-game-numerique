#!/bin/bash

echo "🚀 Démarrage du backend Escape Game..."

# Aller dans le dossier back
cd back

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Démarrer le serveur
echo "🌐 Démarrage du serveur sur le port 3001..."
node main.js
