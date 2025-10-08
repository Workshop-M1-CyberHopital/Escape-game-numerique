#!/usr/bin/env bash
# ===============================================
# Script de déploiement — Workshop M1 EISI 2025–2026
# Infrastructure Escape Game sur AKS (Azure Kubernetes Service)
# ===============================================
# Options :
# 1. Déployer avec création du Resource Group Azure
# 2. Déployer sans création du Resource Group (réutiliser un existant)
# 3. Quitter
# ===============================================

set -Eeuo pipefail  # Stoppe le script si une commande échoue

# --- Variables principales ---
rgname="workshop-EISI"          # Nom du resource group Azure
aksname="AKSClusterWorkshop"    # Nom du cluster AKS
rgloc="germanywestcentral"      # Région Azure autorisée pour Azure for Students
apitoken="ubVqfAcvE7507ZwuTWamvCJe"
redpass="password_redis_519"    # Mot de passe Redis

# --- Petite fonction visuelle ---
separator() {
  echo "-----------------------------------------------"
}

# --- Fonction : déploiement complet ---
deploy_workshop() {
  separator
  echo "Vérification des outils nécessaires..."

  for tool in az kubectl; do
    if ! command -v $tool &>/dev/null; then
      echo "L’outil '$tool' n’est pas installé ou introuvable dans le PATH."
      echo "Installe-le depuis : https://aka.ms/install-azure-cli ou https://kubernetes.io/docs/tasks/tools/"
      exit 1
    else
      echo "$tool trouvé."
    fi
  done

  separator
  echo "Vérification de la présence de Helm..."

  if ! command -v helm &>/dev/null; then
    echo "Helm n’est pas installé, tentative d’installation automatique..."

    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
      echo "➡ Environnement Linux détecté — installation via le script officiel."
      curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
      chmod +x get_helm.sh
      ./get_helm.sh
      rm -f get_helm.sh

    elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* || "$OS" == "Windows_NT" || -n "$WINDIR" ]]; then
      echo "➡ Environnement Windows détecté."
      if command -v winget &>/dev/null; then
        winget install Helm.Helm -e --accept-package-agreements --accept-source-agreements || {
          echo "Échec de l’installation via winget. Relance en administrateur."
          exit 1
        }
      elif command -v choco &>/dev/null; then
        choco install kubernetes-helm -y
      else
        echo "Merci d’installer Helm manuellement : https://helm.sh/docs/intro/install/"
        exit 1
      fi

    elif [[ "$CLOUD_SHELL" == "true" ]]; then
      echo "➡ Azure Cloud Shell détecté — installation via apt."
      sudo apt-get update -y && sudo apt-get install -y helm
    else
      echo "Environnement non reconnu. Installe Helm manuellement."
      exit 1
    fi

    if command -v helm &>/dev/null; then
      echo "Helm installé avec succès : $(helm version --short)"
    else
      echo "Helm n’a pas pu être installé automatiquement."
      exit 1
    fi
  else
    echo "Helm déjà installé ($(helm version --short))"
  fi

  separator
  echo "Récupération des identifiants du cluster..."
  az aks get-credentials --resource-group "$rgname" --name "$aksname" --overwrite-existing

  separator
  echo "Création des secrets Redis, MariaDB et Gandi..."
  kubectl create secret generic redis-secret-traefik \
    --from-literal=password="$redpass" --dry-run=client -o yaml | kubectl apply -f -

  kubectl create secret generic mariadb-secret \
    --from-literal=root_password=root123 \
    --from-literal=user=escape \
    --from-literal=password=escape123 \
    --from-literal=database=escape_db \
    --dry-run=client -o yaml | kubectl apply -f -

  kubectl create secret generic gandi-credentials \
    --from-literal=api-token="$apitoken" \
    --dry-run=client -o yaml | kubectl apply -f -

  separator
  echo "Déploiement de Redis, MariaDB et de l’application Escape Game..."
  kubectl apply -f escape-compare.yaml
  sleep 15

  separator
  echo "Installation du contrôleur d’entrée Traefik..."
  helm repo add traefik https://helm.traefik.io/traefik
  helm repo update

  if helm status traefik &>/dev/null; then
    echo "Traefik déjà installé."
  else
    helm install traefik traefik/traefik
  fi

  echo ""
  echo "Attente de 45 secondes pour laisser Traefik s’initialiser..."
  sleep 45

  separator
  echo "Attente de l'attribution d'une IP publique Azure pour Traefik..."
  for i in {1..24}; do
    WorkshopIngIP=$(kubectl get svc traefik -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true)
    if [[ $WorkshopIngIP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "IP publique détectée : $WorkshopIngIP"
      break
    fi
    echo "⏳ En attente d'une IP publique (tentative $i/24)..."
    sleep 5
  done

  if [[ -z "$WorkshopIngIP" ]]; then
    echo "Aucune IP publique n’a été attribuée après 2 minutes."
    kubectl get svc traefik
    exit 1
  fi

  echo ""
  echo "Étape DNS : configure ton domaine sur Gandi"
  echo "Crée deux enregistrements A pointant vers : $WorkshopIngIP"
  echo "   - escape.eisi-dune.eu"
  echo "   - traefik.eisi-dune.eu"
  echo ""
  read -r -p "Appuie sur [Y] quand c'est fait, ou [N] pour arrêter : " key
  echo
  if [[ "$key" =~ ^[Nn]$ ]]; then
    echo "Arrêt du script — configure d’abord les DNS sur Gandi."
    exit 1
  fi

  separator
  echo "Application des configurations Traefik et HTTPS..."
  kubectl apply -f traefik-config.yaml

  separator
  echo "Installation de cert-manager..."
  if helm status cert-manager -n cert-manager &>/dev/null; then
    echo "cert-manager déjà installé."
    helm repo update
  else
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    helm install cert-manager jetstack/cert-manager \
      --namespace cert-manager \
      --create-namespace \
      --set installCRDs=true \
      --version v1.10.1
  fi

  kubectl rollout status deployment/cert-manager -n cert-manager --timeout=120s || true

  separator
  echo "Installation du webhook Gandi..."
  if helm status cert-manager-webhook-gandi -n cert-manager &>/dev/null; then
    echo "Webhook déjà installé."
  else
    helm repo add cert-manager-webhook-gandi https://bwolf.github.io/cert-manager-webhook-gandi
    helm repo update
    helm install cert-manager-webhook-gandi \
      cert-manager-webhook-gandi/cert-manager-webhook-gandi \
      --namespace cert-manager \
      --version v0.2.0
  fi

  separator
  echo "Application de la configuration Let's Encrypt (Issuer)..."
  kubectl apply -f issuer.yaml

  separator
  echo "Application des règles d’accès (Ingress)..."
  kubectl apply -f ingress.yaml

  echo "Attente de 2 minutes pour la génération des certificats Let's Encrypt..."
  sleep 120

  separator
  echo "Vérification des ressources..."
  kubectl get pods
  kubectl get svc
  kubectl get ingress
  kubectl get certificate -A | grep True || true

  # separator
  # echo "Vérification des volumes persistants..."
  # kubectl get pvc
  # echo ""
  # echo "Si un PVC est toujours en Pending, vérifie le driver CSI avec :"
  # echo "  az aks show -g \"$rgname\" -n \"$aksname\" --query \"storageProfile.fileCsiDriver\" -o table"
  # echo ""
  
  separator
  echo "Déploiement terminé avec succès !"
  echo "Application : https://escape.eisi-dune.eu"
  echo "Dashboard Traefik : https://traefik.eisi-dune.eu"
  echo ""
  echo "Commande de supervision : kubectl get all"
  echo "Pour supprimer l’infra : ./infra-cleanup.sh"
}

# --- Menu principal ---
clear
echo "==============================================="
echo "MENU DÉPLOIEMENT — Workshop EISI 2025–2026"
echo "==============================================="
echo "1.  Déployer avec création du Resource Group"
echo "2.  Déployer sans création du Resource Group"
echo "3.  Quitter"
echo "==============================================="
read -rp "Choisis une option (1-3) : " CHOICE

if [[ "$CHOICE" == "1" ]]; then
  echo "===== Connexion à Azure ====="
  az account show > /dev/null 2>&1 || az login --use-device-code

  separator
  echo "Création du Resource Group $rgname..."
  az group create --location "$rgloc" --name "$rgname"

  separator
  echo "Création du cluster AKS ($aksname)..."
  az aks create \
    -g "$rgname" -n "$aksname" \
    --enable-managed-identity \
    --node-count 1 \
    --node-vm-size Standard_B2pls_v2 \
    --generate-ssh-keys

  # # Activation du driver CSI Azure File
  # echo "Activation du driver Azure File CSI..."
  # az aks update -g "$rgname" -n "$aksname" --enable-azurefile-csi-driver

  # echo "Vérification du statut du driver CSI..."
  # az aks show -g "$rgname" -n "$aksname" --query "storageProfile.fileCsiDriver" -o table

  deploy_workshop

elif [[ "$CHOICE" == "2" ]]; then
  echo "===== Connexion à Azure ====="
  az account show > /dev/null 2>&1 || az login --use-device-code

  separator
  echo "Vérification ou création du cluster AKS..."
  if ! az aks show -g "$rgname" -n "$aksname" &>/dev/null; then
    az aks create \
      -g "$rgname" -n "$aksname" \
      --enable-managed-identity \
      --node-count 1 \
      --node-vm-size Standard_B2pls_v2 \
      --generate-ssh-keys
  fi

  # # Activation du driver CSI Azure File
  # echo "Activation du driver Azure File CSI..."
  # az aks update -g "$rgname" -n "$aksname" --enable-azurefile-csi-driver

  # echo "Vérification du statut du driver CSI..."
  # az aks show -g "$rgname" -n "$aksname" --query "storageProfile.fileCsiDriver" -o table

  deploy_workshop

else
  echo "Fermeture du script. Rien n’a été modifié."
  exit 0
fi
