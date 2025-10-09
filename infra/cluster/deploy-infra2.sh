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
rgname="workshop-EISI"           # Nom du resource group Azure
aksname="AKSClusterWorkshop"     # Nom du cluster AKS
rgloc="germanywestcentral"       # Région Azure autorisée pour Azure for Students
apitoken="e9534d0da979a255469024a375909df5a3824a99" # PAT sur gandi, token déprécié
redpass="password_redis_519"     # Mot de passe Redis


# --- Petite fonction visuelle ---
separator() {
  echo "-----------------------------------------------"
}


# --- Fonction : déploiement complet ---
deploy_workshop() {
  separator
  echo "Vérification des outils nécessaires..."

  for tool in az kubectl helm; do
    if ! command -v $tool &>/dev/null; then
      echo "L’outil '$tool' n’est pas installé ou introuvable dans le PATH."
      echo "Installe-le depuis : https://aka.ms/install-azure-cli ou https://kubernetes.io/docs/tasks/tools/ (kubectl et helm)"
      exit 1
    else
      echo "$tool trouvé."
    fi
  done

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
  kubectl apply -f escape.yaml
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
  echo "Création ou récupération de l'IP publique Azure statique pour Traefik..."

  MC_RG="MC_${rgname}_${aksname}_${rgloc}"
  IP_NAME="traefik-public-ip"

  # Création si elle n’existe pas encore
  if ! az network public-ip show --resource-group "$MC_RG" --name "$IP_NAME" &>/dev/null; then
    echo "Création de l'adresse IP publique statique Azure..."
    az network public-ip create \
      --resource-group "$MC_RG" \
      --name "$IP_NAME" \
      --sku Standard \
      --allocation-method static \
      --query "publicIp.ipAddress" -o tsv >/dev/null
    if [[ $? -ne 0 ]]; then
      echo "Erreur lors de la création de l'IP publique Azure."
      exit 1
    fi
  fi

  WorkshopIngIP=$(az network public-ip show \
    --resource-group "$MC_RG" \
    --name "$IP_NAME" \
    --query "ipAddress" -o tsv)

  if [[ -z "$WorkshopIngIP" ]]; then
    echo "Impossible de récupérer l'IP publique Azure."
    echo "Vérifie dans le portail Azure ou avec la commande suivante :"
    echo "  az network public-ip list -g \"$MC_RG\" -o table"
    read -r -p "Souhaites-tu continuer malgré tout ? (Y/n) : " choice
    if [[ "$choice" =~ ^[Nn]$ ]]; then
      echo "Arrêt du script à ta demande."
      exit 0
    else
      WorkshopIngIP="Non détectée"
    fi
  else
    echo "IP publique statique détectée : $WorkshopIngIP"
    read -r -p "Souhaites-tu continuer avec cette IP ? (Y/n) : " choice
    if [[ "$choice" =~ ^[Nn]$ ]]; then
      echo "Arrêt du script à ta demande."
      exit 0
    fi
  fi

  # Remplacement dynamique de l’adresse IP dans le fichier Traefik
  sed "s|__PUBLIC_IP__|$WorkshopIngIP|g" traefik-config.yaml > traefik-config-final.yaml

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
  kubectl apply -f traefik-config-final.yaml

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
  separator
  echo "Génération d’un certificat TLS auto-signé pour le webhook Gandi..."

  # Suppression d’anciens fichiers si présents
  rm -f tls.key tls.crt

  # Génération du certificat auto-signé (compatible Git Bash / Linux / WSL)
  if [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* ]]; then
    openssl req -x509 -newkey rsa:2048 -nodes \
      -keyout tls.key -out tls.crt -subj "//CN=cert-manager-webhook-gandi.cert-manager.svc"
  else
    openssl req -x509 -newkey rsa:2048 -nodes \
      -keyout tls.key -out tls.crt -subj "/CN=cert-manager-webhook-gandi.cert-manager.svc"
  fi

  # Création du secret TLS dans le namespace cert-manager
  echo "Création du secret cert-manager-webhook-tls..."
  kubectl create secret tls cert-manager-webhook-tls \
    --cert=tls.crt --key=tls.key -n cert-manager --dry-run=client -o yaml | kubectl apply -f -

  # Nettoyage local (optionnel)
  rm -f tls.key tls.crt

  separator
  echo "Déploiement du webhook cert-manager-webhook-gandi officiel via Helm avec PAT..."

  # Désinstallation ancienne version si présente
  helm uninstall cert-manager-webhook-gandi -n cert-manager --ignore-not-found || true

  # Ajout du repo Helm officiel SINTEF
  helm repo add cert-manager-webhook-gandi https://sintef.github.io/cert-manager-webhook-gandi
  helm repo update

  # Installation avec token PAT via fichier values.yaml généré dynamiquement
  cat > webhook-values.yaml <<EOF
gandiApiToken: "$apitoken"

image:
  repository: ghcr.io/sintef/cert-manager-webhook-gandi
  tag: v0.5.2
  pullPolicy: IfNotPresent

tls:
  enabled: true
  secretName: cert-manager-webhook-tls

resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 256Mi
EOF

  helm install cert-manager-webhook-gandi cert-manager-webhook-gandi/cert-manager-webhook-gandi \
    --namespace cert-manager \
    --create-namespace \
    --values webhook-values.yaml

  rm -f webhook-values.yaml

  echo "Attente de la disponibilité du webhook..."
  kubectl rollout status deployment/cert-manager-webhook-gandi -n cert-manager --timeout=120s || true

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

  deploy_workshop

else
  echo "Fermeture du script. Rien n’a été modifié."
  exit 0
fi
