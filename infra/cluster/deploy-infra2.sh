#!/usr/bin/env bash
# ===============================================
# Script de déploiement — Workshop M1 EISI 2025–2026
# Infrastructure Escape Game sur AKS (Azure Kubernetes Service)
# ===============================================
# Options :
# 1️⃣ Déployer avec création du Resource Group Azure
# 2️⃣ Déployer sans création du Resource Group (réutiliser un existant)
# 3️⃣ Quitter
# ===============================================

set -Eeuo pipefail

# --- Variables principales ---
rgname="workshop-EISI"
aksname="AKSClusterWorkshop"
rgloc="francecentral"
apitoken="ubVqfAcvE7507ZwuTWamvCJe"
redpass="password_redis_519"

# --- Fonction : déploiement complet ---
deploy_workshop() {
  echo "🔑 Récupération des identifiants du cluster..."
  az aks get-credentials --resource-group "$rgname" --name "$aksname" --overwrite-existing

  echo "📁 Création du namespace 'workshop'..."
  kubectl create namespace workshop || true

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

  echo "🚀 Déploiement de Redis, MariaDB et de l’application Escape Game..."
  kubectl apply -f escape.yaml

  echo "⚙️ Installation du contrôleur d’entrée Traefik..."
  helm repo add traefik https://helm.traefik.io/traefik
  helm repo update
  helm install traefik traefik/traefik -n workshop

  echo "⏳ Attente 45 secondes pour laisser Traefik s’initialiser..."
  sleep 45

  echo "🌍 Récupération de l’adresse IP publique du LoadBalancer..."
  WorkshopIngIP=$(kubectl get svc traefik -n workshop -o=jsonpath='{.status.loadBalancer.ingress[0].ip}')
  echo "📡 IP publique : $WorkshopIngIP"

  echo ""
  echo "🧭 Étape DNS : configure ton domaine sur Gandi"
  echo "👉 Crée deux enregistrements A pointant vers : $WorkshopIngIP"
  echo "   - escape.eisi-dune.eu"
  echo "   - traefik.eisi-dune.eu"
  echo ""
  read -n1 -r -p "✅ Appuie sur [Y] quand c'est fait, ou [N] pour arrêter : " key
  echo
  if [[ "$key" =~ ^[Nn]$ ]]; then
    echo "❌ Arrêt du script — configure d’abord les DNS sur Gandi."
    exit 1
  fi

  echo "🧩 Application des configurations Traefik et HTTPS..."
  kubectl apply -f traefik-config.yaml -n workshop
  helm repo add jetstack https://charts.jetstack.io
  helm repo update
  helm install cert-manager jetstack/cert-manager \
    --namespace cert-manager \
    --create-namespace \
    --set installCRDs=true \
    --version v1.10.1

  helm install cert-manager-webhook-gandi \
    --repo https://bwolf.github.io/cert-manager-webhook-gandi \
    --version v0.2.0 \
    --namespace cert-manager

  kubectl apply -f issuer.yaml -n workshop
  kubectl apply -f ingress.yaml -n workshop

  echo "⏳ Attente 2 minutes pour la génération du certificat..."
  sleep 120

  echo "✅ Déploiement terminé avec succès !"
  echo "🌐 Application : https://escape.eisi-dune.eu"
  echo "📊 Dashboard : https://traefik.eisi-dune.eu"
  echo "💡 Commande de supervision : kubectl get all -n workshop"
}

# --- Menu ---
clear
echo "==============================================="
echo "🚀 MENU DÉPLOIEMENT — Workshop EISI 2025–2026"
echo "==============================================="
echo "1️⃣  Déployer avec création du Resource Group"
echo "2️⃣  Déployer sans création du Resource Group"
echo "3️⃣  Quitter"
echo "==============================================="
read -rp "👉 Choisis une option (1-3) : " CHOICE

if [[ "$CHOICE" == "1" ]]; then
  az account show > /dev/null 2>&1 || az login --use-device-code
  echo "📦 Création du Resource Group $rgname..."
  az group create --location "$rgloc" --name "$rgname"

  echo "☸️ Création du cluster AKS ($aksname)..."
  az aks create \
    -g "$rgname" -n "$aksname" \
    --enable-managed-identity \
    --node-count 2 \
    --enable-addons monitoring \
    --generate-ssh-keys

  deploy_workshop
elif [[ "$CHOICE" == "2" ]]; then
  az account show > /dev/null 2>&1 || az login --use-device-code
  echo "☸️ Création du cluster AKS ($aksname) dans le RG existant $rgname..."
  az aks create \
    -g "$rgname" -n "$aksname" \
    --enable-managed-identity \
    --node-count 2 \
    --enable-addons monitoring \
    --generate-ssh-keys

  deploy_workshop
else
  echo "👋 Fermeture du script. Rien n’a été modifié."
fi
