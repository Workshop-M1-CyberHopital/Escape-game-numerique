#!/usr/bin/env bash
# ===============================================
# Script de déploiement complet — Workshop M1 EISI 2025–2026
# Infrastructure Escape Game sur AKS (Azure Kubernetes Service)
# ===============================================
# Étapes :
# 1. Création du cluster AKS
# 2. Configuration du namespace et des secrets
# 3. Installation de Traefik (Ingress Controller)
# 4. Installation de cert-manager + Gandi webhook
# 5. Déploiement de l’application Escape Game (Redis + base Azure)
# 6. Configuration HTTPS (Let's Encrypt)
# ===============================================

set -Eeuo pipefail  # Stop le script si une commande échoue

# --- Variables principales ---
rgname="workshop-EISI"          # Nom du resource group Azure
aksname="AKSClusterWorkshop"    # Nom du cluster AKS
rgloc="francecentral"           # Région Azure
apitoken="ubVqfAcvE7507ZwuTWamvCJe"
redpass="password_redis_519"    # Mot de passe Redis

# --- Connexion Azure ---
echo "===== Connexion à Azure ====="
az account show > /dev/null 2>&1 || az login --use-device-code

# --- Création du Resource Group ---
echo "📦 Création du resource group $rgname..."
az group create --location "$rgloc" --name "$rgname"

# --- Création du cluster AKS ---
echo "☸️  Création du cluster AKS ($aksname)..."
az aks create \
  -g "$rgname" -n "$aksname" \
  --enable-managed-identity \
  --node-count 2 \
  --enable-addons monitoring \
  --generate-ssh-keys

# --- Récupération des credentials du cluster ---
echo "🔑 Récupération des identifiants du cluster..."
az aks get-credentials --resource-group "$rgname" --name "$aksname"

# --- Création du namespace ---
echo "📁 Création du namespace 'workshop'..."
kubectl create namespace workshop || true

# --- Création des secrets nécessaires ---
echo "🔐 Création des secrets Redis, MariaDB et Gandi..."
kubectl -n workshop create secret generic redis-secret-traefik \
  --from-literal=password="$redpass" --dry-run=client -o yaml | kubectl apply -f -

kubectl -n workshop create secret generic mariadb-secret \
  --from-literal=root_password=root123 \
  --from-literal=user=escape \
  --from-literal=password=escape123 \
  --from-literal=database=escape_db \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl -n workshop create secret generic gandi-credentials \
  --from-literal=api-token="$apitoken" \
  --dry-run=client -o yaml | kubectl apply -f -


# --- Déploiement de l'application ---
echo "🚀 Déploiement de Redis et de l’application Escape Game (base externe Azure)..."
kubectl apply -f escape.yaml

# --- Installation de Traefik ---
echo "⚙️  Installation du contrôleur d’entrée Traefik..."
helm repo add traefik https://helm.traefik.io/traefik
helm repo update
helm install traefik traefik/traefik -n workshop

# --- Pause pour laisser Traefik démarrer ---
echo ""
echo "⏳ Pause de 45 secondes pour permettre à Traefik de s’initialiser..."
sleep 45
echo "✅ Traefik devrait maintenant être en cours d’exécution."

# --- Récupération de l’adresse IP publique ---
echo "🌍 Extraction de l’adresse IP publique du LoadBalancer Traefik..."
WorkshopIngIP=$(kubectl get svc traefik -n workshop -o=jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "📡 Adresse IP détectée : $WorkshopIngIP"

# --- Pause utilisateur pour configuration DNS ---
echo ""
echo "🧭 Étape DNS : connecte ton domaine à ton Ingress Azure"
echo "👉 Sur Gandi, crée deux enregistrements A pointant vers : $WorkshopIngIP"
echo "   - escape.eisi-dune.eu"
echo "   - traefik.eisi-dune.eu"
echo ""
read -n1 -r -p "✅ Appuie sur [Y] quand c'est fait, ou [N] pour arrêter : " key
echo
if [[ "$key" =~ ^[Nn]$ ]]; then
  echo "❌ Arrêt du script — configure d’abord les DNS sur Gandi."
  exit 1
fi

# --- Configuration des middlewares et dashboard Traefik ---
echo "🧩 Application de la configuration Traefik (middlewares + dashboard)..."
kubectl apply -f traefik-config.yaml -n workshop

# --- Installation de cert-manager ---
echo "🔐 Installation de cert-manager (pour certificats HTTPS)..."
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true \
  --version v1.10.1

# --- Installation du webhook Gandi ---
echo "📡 Installation du webhook cert-manager pour Gandi..."
helm install cert-manager-webhook-gandi \
  --repo https://bwolf.github.io/cert-manager-webhook-gandi \
  --version v0.2.0 \
  --namespace cert-manager

# --- Configuration de Let's Encrypt ---
echo "📜 Application de la configuration Let's Encrypt (Issuer)..."
kubectl apply -f issuer.yaml -n workshop

# --- Application des règles d’accès (Ingress) ---
echo "🔗 Application des routes HTTPS (Ingress)..."
kubectl apply -f ingress.yaml -n workshop

# --- Attente de génération des certificats ---
echo ""
echo "⏳ Attente de 2 minutes pour la génération automatique des certificats Let's Encrypt..."
sleep 120

# --- Vérifications finales ---
echo ""
echo "🔍 Vérification des ressources dans le namespace 'workshop'..."
kubectl get pods -n workshop
kubectl get svc -n workshop
kubectl get ingress -n workshop
kubectl get certificate -A | grep True || true

# --- Résumé final ---
echo ""
echo "✅ Déploiement complet terminé avec succès !"
echo "🌐 Application : https://escape.eisi-dune.eu"
echo "📊 Dashboard Traefik : https://traefik.eisi-dune.eu"
echo ""
echo "💡 Adresse IP utilisée : $WorkshopIngIP"
echo "💡 Commande de supervision : kubectl get all -n workshop"
echo "🧩 Pense à supprimer le cluster après le workshop : az group delete -n $rgname --yes --no-wait"