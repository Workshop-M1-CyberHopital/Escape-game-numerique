#!/usr/bin/env bash
# ===============================================
# Script de déploiement — Workshop M1 EISI 2025–2026
# Infrastructure Escape Game sur AKS (Azure Kubernetes Service)
# ===============================================

set -Eeuo pipefail

# Chargement des variables d’environnement depuis un fichier .env local (non versionné)
# -----------------------------------------------------------------
# Fichier lu : .env du dossier courant (lancez le script depuis son dossier, infra/cluster-*/),
# sinon .env à la racine du dépôt (le même que pour Docker Compose). Modèle : .env.example
# Exemple de contenu :
#   REDIS_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# -----------------------------------------------------------------
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE="$(dirname "$0")/../../.env"
fi
if [ -f "$ENV_FILE" ]; then
  echo "Variables chargées depuis : $ENV_FILE"
  export $(grep -v '^#' "$ENV_FILE" | xargs)
else
  echo "Fichier .env introuvable (ni ici, ni à la racine du dépôt). Copiez .env.example en .env et renseignez vos variables sensibles (ex: GANDI_API_TOKEN)."
  exit 1
fi

# Variables principales
rgname="workshop-EISI"
aksname="AKSClusterWorkshop"
rgloc="germanywestcentral"

# Les mots de passe sensibles sont lus depuis le fichier .env
if [ -z "${REDIS_PASSWORD:-}" ]; then
  echo "Erreur : la variable REDIS_PASSWORD n'est pas définie dans le fichier .env."
  exit 1
fi
redpass="$REDIS_PASSWORD"

separator() {
  echo "-----------------------------------------------"
}

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
  echo "Création des secrets Redis, MariaDB et JWT..."
  kubectl create secret generic redis-secret-traefik \
    --from-literal=password="$redpass" --dry-run=client -o yaml | kubectl apply -f -

  kubectl create secret generic mariadb-secret \
    --from-literal=root_password="$MARIADB_ROOT_PASSWORD" \
    --from-literal=user="$MARIADB_USER" \
    --from-literal=password="$MARIADB_PASSWORD" \
    --from-literal=database="$MARIADB_DATABASE" \
    --dry-run=client -o yaml | kubectl apply -f -

  # Secret JWT de l'API (clé jwt-secret, lue par escape.yaml via secretKeyRef).
  # Valeur JWT_SECRET du .env si elle est définie, sinon secret aléatoire généré UNE seule fois
  # (conservé aux redéploiements suivants pour ne pas déconnecter les joueurs).
  if [ -n "${JWT_SECRET:-}" ]; then
    kubectl create secret generic escape-jwt-secret \
      --from-literal=jwt-secret="$JWT_SECRET" --dry-run=client -o yaml | kubectl apply -f -
  elif ! kubectl get secret escape-jwt-secret &>/dev/null; then
    kubectl create secret generic escape-jwt-secret \
      --from-literal=jwt-secret="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  fi

  separator
  echo "Déploiement de Redis, MariaDB et de l’application Escape Game..."
  kubectl apply -f escape.yaml
  # Stockage JSON de l'API = 1 seul réplica : supprime un éventuel autoscaler (HPA) d'un ancien déploiement
  kubectl delete hpa scale-escape --ignore-not-found
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

  WorkshopIngIP=$(az network.public-ip show --resource-group "$MC_RG" --name "$IP_NAME" --query "ipAddress" -o tsv)

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

  sed "s|__PUBLIC_IP__|$WorkshopIngIP|g" traefik-config.yaml > traefik-config-final.yaml

  # -----------------------------------------------------------------
  # Configuration réseau Azure — NSG et ouverture des ports nécessaires
  # -----------------------------------------------------------------
  separator
  echo "Vérification et configuration du groupe de sécurité réseau (NSG)..."
  NSG_NAME=$(az network nsg list --resource-group "$MC_RG" --query "[0].name" -o tsv)

  if [[ -z "$NSG_NAME" ]]; then
    echo "Aucun NSG trouvé dans le groupe de ressources $MC_RG"
  else
    echo "NSG détecté : $NSG_NAME"
    echo "Vérification des règles existantes..."
    az network nsg rule list --resource-group "$MC_RG" --nsg-name "$NSG_NAME" --output table

    echo "Création (ou mise à jour) de la règle pour Let's Encrypt (port 80)..."
    az network nsg rule create \
      --resource-group "$MC_RG" \
      --nsg-name "$NSG_NAME" \
      --name Allow-HTTP-LetsEncrypt \
      --protocol Tcp \
      --priority 150 \
      --destination-port-ranges 80 \
      --access Allow \
      --direction Inbound \
      --source-address-prefixes Internet \
      --description "Temporary: allow Let's Encrypt HTTP-01 challenge"
  fi
  # -----------------------------------------------------------------

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
  az aks create -g "$rgname" -n "$aksname" --enable-managed-identity  --node-count 1 --node-vm-size Standard_B2pls_v2 --generate-ssh-keys

  deploy_workshop

elif [[ "$CHOICE" == "2" ]]; then
  echo "===== Connexion à Azure ====="
  az account show > /dev/null 2>&1 || az login --use-device-code

  separator
  echo "Vérification ou création du cluster AKS..."
  if ! az aks show -g "$rgname" -n "$aksname" &>/dev/null; then
    az aks create -g "$rgname" -n "$aksname" --enable-managed-identity  --node-count 1 --node-vm-size Standard_B2pls_v2 --generate-ssh-keys
  fi

  deploy_workshop

else
  echo "Fermeture du script. Rien n’a été modifié."
  exit 0
fi
