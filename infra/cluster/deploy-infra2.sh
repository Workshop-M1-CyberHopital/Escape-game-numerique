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

  # --- Vérification de la présence des outils az, kubectl, helm ---
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

  # --- Vérification et installation automatique de Helm si absent ---
  if ! command -v helm &>/dev/null; then
    echo "Helm n’est pas installé, tentative d’installation automatique..."

    # --- Détection de l’environnement ---
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
      echo "➡ Environnement Linux détecté — installation via le script officiel."
      curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
      chmod +x get_helm.sh
      ./get_helm.sh
      rm -f get_helm.sh

    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OS" == "Windows_NT" || "$WINDIR" != "" ]]; then
      echo "➡ Environnement Windows détecté."

      if command -v winget &>/dev/null; then
        echo "Installation de Helm via winget..."
        winget install Helm.Helm -e --accept-package-agreements --accept-source-agreements || {
          echo "Échec de l’installation via winget. Essaie d’ouvrir un terminal administrateur et relance le script."
          exit 1
        }

      elif command -v choco &>/dev/null; then
        echo "Installation de Helm via Chocolatey..."
        choco install kubernetes-helm -y

      else
        echo "Aucun gestionnaire de paquets détecté (ni winget ni choco)."
        echo "Merci d’installer Helm manuellement depuis : https://helm.sh/docs/intro/install/"
        echo "Puis relance le script une fois Helm installé."
        exit 1
      fi

    elif [[ "$CLOUD_SHELL" == "true" ]]; then
      echo "➡ Azure Cloud Shell détecté — installation de Helm via apt."
      sudo apt-get update -y && sudo apt-get install -y helm

    else
      echo "Environnement non reconnu. Installe Helm manuellement : https://helm.sh/docs/intro/install/"
      exit 1
    fi

    # Vérification finale de l’installation de Helm
    if command -v helm &>/dev/null; then
      echo "Helm installé avec succès : $(helm version --short)"
    else
      echo "Helm n’a pas pu être installé automatiquement. Vérifie ton environnement."
      exit 1
    fi
  else
    echo "Helm déjà installé ($(helm version --short))"
  fi

  separator
  # --- Récupération des credentials du cluster ---
  echo "Récupération des identifiants du cluster..."
  az aks get-credentials --resource-group "$rgname" --name "$aksname" --overwrite-existing

  separator
  # --- Création du namespace ---
  echo "Création du namespace 'workshop'..."
  kubectl create namespace workshop || true

  separator
  # --- Création des secrets nécessaires ---
  echo "Création des secrets Redis, MariaDB et Gandi..."
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

  separator
  # --- Déploiement de l'application, Redis, MariaDB ---
  echo "Déploiement de Redis, MariaDB et de l’application Escape Game..."
  kubectl apply -f escape-compare.yaml

  # --- Attente pour laisser les pods se créer correctement ---
  echo "Attente de 15 secondes pour la création initiale des pods..."
  sleep 15

  separator
  # --- Installation de Traefik ---
  echo "Installation du contrôleur d’entrée Traefik..."
  helm repo add traefik https://helm.traefik.io/traefik
  helm repo update

  if helm status traefik -n workshop &>/dev/null; then
    echo "Traefik déjà installé, on passe à la suite."
  else
    helm install traefik traefik/traefik -n workshop
  fi

  # --- Pause pour laisser Traefik démarrer ---
  echo ""
  echo "Attente de 45 secondes pour laisser Traefik s’initialiser..."
  sleep 45

  separator
  # --- Récupération de l’adresse IP publique ---
  echo "Attente de l'attribution d'une IP publique pour Traefik..."
  until kubectl get svc traefik -n workshop -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null | grep -qE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+'; do
    printf '.'
    sleep 5
  done
  echo ""
  WorkshopIngIP=$(kubectl get svc traefik -n workshop -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
  echo "IP publique : $WorkshopIngIP"

  echo ""
  # --- Pause utilisateur pour configuration DNS ---
  echo "Étape DNS : configure ton domaine sur Gandi"
  echo "Crée deux enregistrements A pointant vers : $WorkshopIngIP"
  echo "   - escape.eisi-dune.eu"
  echo "   - traefik.eisi-dune.eu"
  echo ""
  read -n1 -r -p "Appuie sur [Y] quand c'est fait, ou [N] pour arrêter : " key
  echo
  if [[ "$key" =~ ^[Nn]$ ]]; then
    echo "Arrêt du script — configure d’abord les DNS sur Gandi."
    exit 1
  fi

  separator
  # --- Configuration des middlewares et dashboard Traefik ---
  echo "Application des configurations Traefik et HTTPS..."
  kubectl apply -f traefik-config.yaml -n workshop

  separator
  # --- Installation de cert-manager ---
  if helm status cert-manager -n cert-manager &>/dev/null; then
    echo "cert-manager déjà installé."
    echo "Mises à jour de cert-manager (pour certificats HTTPS)..."
    helm repo update
    echo "on passe à la suite"
  else
    echo "Installation de cert-manager (pour certificats HTTPS)..."
    helm repo add jetstack https://charts.jetstack.io
    helm repo update
    helm install cert-manager jetstack/cert-manager \
      --namespace cert-manager \
      --create-namespace \
      --set installCRDs=true \
      --version v1.10.1
  fi

  separator
  # --- Installation du webhook Gandi ---
  echo "Installation du webhook Gandi..."
  if helm status cert-manager-webhook-gandi -n cert-manager &>/dev/null; then
    echo "Webhook déjà installé, on passe à la suite."
  else
    helm install cert-manager-webhook-gandi \
      --repo https://bwolf.github.io/cert-manager-webhook-gandi \
      --version v0.2.0 \
      --namespace cert-manager
  fi

  separator
  # --- Configuration de Let's Encrypt ---
  echo "Application de la configuration Let's Encrypt (Issuer)..."
  kubectl apply -f issuer.yaml -n workshop

  separator
  # --- Application des règles d’accès (Ingress) ---
  echo "Application des règles d’accès (Ingress)..."
  kubectl apply -f ingress.yaml -n workshop

  echo ""
  # --- Attente de génération des certificats ---
  echo "Attente de 2 minutes pour la génération des certificats Let's Encrypt..."
  sleep 120

  separator
  # --- Vérifications finales ---
  echo "Vérification des ressources dans le namespace 'workshop'..."
  kubectl get pods -n workshop
  kubectl get svc -n workshop
  kubectl get ingress -n workshop
  kubectl get certificate -A | grep True || true

  separator
  # --- Résumé final ---
  echo "Déploiement terminé avec succès !"
  echo "Application : https://escape.eisi-dune.eu"
  echo "Dashboard Traefik : https://traefik.eisi-dune.eu"
  echo ""
  echo "Commande de supervision : kubectl get all -n workshop"
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

# --- Choix 1 : création complète ---
if [[ "$CHOICE" == "1" ]]; then
  # --- Connexion Azure ---
  echo "===== Connexion à Azure ====="
  az account show > /dev/null 2>&1 || az login --use-device-code

  separator
  # --- Création du groupe de ressources ---
  echo "Création du Resource Group $rgname..."
  az group create --location "$rgloc" --name "$rgname"

  separator
  # --- Providers ---
  echo "Vérification de l’enregistrement des providers Azure nécessaires..."

  providers=("Microsoft.ContainerService" "Microsoft.OperationalInsights" "Microsoft.Insights")

  for provider in "${providers[@]}"; do
    state=$(az provider show -n "$provider" --query "registrationState" -o tsv 2>/dev/null || echo "NotRegistered")
    if [[ "$state" != "Registered" ]]; then
      echo "➡ Le provider $provider n’est pas enregistré. Enregistrement en cours..."
      az provider register --namespace "$provider" >/dev/null
    else
      echo "Le provider $provider est déjà enregistré."
    fi
  done

  echo "Attente que tous les providers soient enregistrés..."
  for i in {1..10}; do
    all_registered=true
    for provider in "${providers[@]}"; do
      state=$(az provider show -n "$provider" --query "registrationState" -o tsv)
      [[ "$state" != "Registered" ]] && all_registered=false
    done
    $all_registered && break
    sleep 10
  done

  for provider in "${providers[@]}"; do
    az provider show -n "$provider" -o table | grep -E "RegistrationState|Registered" || true
  done

  separator
  # --- Création du cluster AKS ---
  echo "Vérification ou création du cluster AKS ($aksname)..."
  if az aks show -g "$rgname" -n "$aksname" &>/dev/null; then
    echo "Le cluster $aksname existe déjà."
  else
    echo "Création du cluster AKS ($aksname) dans le RG existant $rgname..."
    az aks create \
      -g "$rgname" -n "$aksname" \
      --enable-managed-identity \
      --node-count 1 \
      --node-vm-size Standard_B2pls_v2 \
      --generate-ssh-keys
  fi

  deploy_workshop

# --- Choix 2 : sans création de Resource Group ---
elif [[ "$CHOICE" == "2" ]]; then
  # --- Connexion Azure ---
  echo "===== Connexion à Azure ====="
  az account show > /dev/null 2>&1 || az login --use-device-code

  separator
  # --- Providers ---
  echo "Vérification de l’enregistrement des providers Azure nécessaires..."

  providers=("Microsoft.ContainerService" "Microsoft.OperationalInsights" "Microsoft.Insights")

  for provider in "${providers[@]}"; do
    state=$(az provider show -n "$provider" --query "registrationState" -o tsv 2>/dev/null || echo "NotRegistered")
    if [[ "$state" != "Registered" ]]; then
      echo "➡ Le provider $provider n’est pas enregistré. Enregistrement en cours..."
      az provider register --namespace "$provider" >/dev/null
    else
      echo "Le provider $provider est déjà enregistré."
    fi
  done

  echo "Attente que tous les providers soient enregistrés..."
  for i in {1..10}; do
    all_registered=true
    for provider in "${providers[@]}"; do
      state=$(az provider show -n "$provider" --query "registrationState" -o tsv)
      [[ "$state" != "Registered" ]] && all_registered=false
    done
    $all_registered && break
    sleep 10
  done

  for provider in "${providers[@]}"; do
    az provider show -n "$provider" -o table | grep -E "RegistrationState|Registered" || true
  done

  separator
  # --- Création du cluster AKS ---
  echo "Vérification ou création du cluster AKS ($aksname) dans le RG $rgname..."
  if az aks show -g "$rgname" -n "$aksname" &>/dev/null; then
    echo "Le cluster $aksname existe déjà."
  else
    echo "Création du cluster AKS ($aksname) dans le RG existant $rgname..."
    az aks create \
      -g "$rgname" -n "$aksname" \
      --enable-managed-identity \
      --node-count 1 \
      --node-vm-size Standard_B2pls_v2 \
      --generate-ssh-keys
  fi

  deploy_workshop

# --- Choix 3 : quitter ---
else
  echo "Fermeture du script. Rien n’a été modifié."
  exit 0
fi
