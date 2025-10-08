#!/usr/bin/env bash
# ===============================================
# Script de pré-vérification de l'environnement Azure
# pour le déploiement AKS — Workshop M1 EISI 2025–2026
# ===============================================

set -Eeuo pipefail

region="francecentral"   # Change si besoin (ex: westeurope)

separator() { echo "-----------------------------------------------"; }

echo "==============================================="
echo " Vérification de ton environnement Azure"
echo "==============================================="

separator
echo "1. Vérification de l'abonnement Azure..."
az account show -o table || { echo " Impossible de récupérer l'abonnement Azure."; exit 1; }
sub_state=$(az account show --query state -o tsv)
sub_name=$(az account show --query name -o tsv)

if [[ "$sub_state" != "Enabled" ]]; then
  echo " Ton abonnement '$sub_name' n'est pas actif (état: $sub_state)."
  echo " Va dans le portail Azure et vérifie ton abonnement."
  exit 1
else
  echo " Abonnement actif : $sub_name"
fi

separator
echo "2. Vérification du crédit étudiant (si disponible)..."
if az billing balance show &>/dev/null; then
  az billing balance show -o table
else
  echo " Impossible de récupérer le solde (commande non supportée sur tous les comptes étudiants)."
  echo " Vérifie sur https://portal.azure.com → Abonnements → Détails du crédit."
fi

separator
echo "3. Vérification des providers nécessaires..."
providers=("Microsoft.ContainerService" "Microsoft.OperationalInsights" "Microsoft.Insights")
not_registered=false
for p in "${providers[@]}"; do
  state=$(az provider show -n "$p" --query registrationState -o tsv 2>/dev/null || echo "NotRegistered")
  if [[ "$state" != "Registered" ]]; then
    echo " Provider $p non enregistré"
    not_registered=true
  else
    echo " Provider $p : OK"
  fi
done
if $not_registered; then
  echo ""
  echo " Certains providers ne sont pas enregistrés. Lancement de l’enregistrement..."
  for p in "${providers[@]}"; do
    az provider register --namespace "$p" >/dev/null 2>&1 || true
  done
  echo " Enregistrement en cours... Attends 45 secondes, puis relance le test."
  exit 1
fi

separator
echo "4. Vérification de la disponibilité d'AKS dans la région '$region'..."
if az aks get-versions --location "$region" -o table >/dev/null 2>&1; then
  echo " AKS est disponible dans $region"
else
  echo " AKS n'est pas disponible dans $region"
  echo " Essaie avec 'westeurope' ou 'northeurope'."
  exit 1
fi

separator
echo "5. Vérification du quota CPU dans la région '$region'..."
if az vm list-usage --location "$region" -o table >/dev/null 2>&1; then
  az vm list-usage --location "$region" -o table | grep -E "vCPUs|BSFamily" || true
  echo " Vérifie que 'CurrentValue' < 'Limit' pour avoir des vCPUs disponibles."
else
  echo " Impossible de vérifier les quotas. Peut-être un compte restreint."
fi

separator
echo " Vérification terminée !"
echo ""
echo "Si tout est vert, tu peux maintenant lancer :"
echo " bash deploy-infra2.sh"
echo "==============================================="
