#!/usr/bin/env bash
# ===============================================
# Script de nettoyage — Workshop M1 EISI 2025–2026
# ===============================================
# Options :
# 1.  Supprimer uniquement les ressources Kubernetes
# 2. Supprimer uniquement le cluster AKS
# 3. Supprimer le cluster AKS + Azure Files
# 4. Supprimer tout le Resource Group (total)
# 5. Quitter
# ===============================================

set -Eeuo pipefail

rgname="workshop-EISI"
aksname="AKSClusterWorkshop"

pause() {
  echo ""
  read -n1 -r -p "⏸️ Appuie sur une touche pour continuer..." key
  echo ""
}

# --- MENU ---
clear
echo "==============================================="
echo "MENU NETTOYAGE — Workshop EISI 2025–2026"
echo "==============================================="
echo "1.  Supprimer uniquement les ressources Kubernetes"
echo "2.  Supprimer uniquement le cluster AKS"
echo "3.  Supprimer le cluster AKS + Azure Files"
echo "4.  Supprimer tout le Resource Group Azure"
echo "5.  Quitter"
echo "==============================================="
read -rp "Choisis une option (1-5) : " CHOICE

# --- Option 1 ---
if [[ "$CHOICE" == "1" ]]; then
  echo "Suppression des ressources Kubernetes dans 'workshop'..."
  kubectl delete all --all -n workshop || true
  kubectl delete pvc --all -n workshop || true
  kubectl delete secrets --all -n workshop || true
  kubectl delete certificates --all -n workshop || true
  echo "Espace 'workshop' nettoyé (cluster intact)."
  exit 0
fi

# --- Option 2 ---
if [[ "$CHOICE" == "2" ]]; then
  echo "Suppression du cluster AKS..."
  az aks delete -g "$rgname" -n "$aksname" --yes --no-wait
  echo "Cluster supprimé (les Azure Files sont conservés)."
  exit 0
fi

# --- Option 3 ---
if [[ "$CHOICE" == "3" ]]; then
  echo "Suppression du cluster AKS + Azure Files..."
  pause
  az aks delete -g "$rgname" -n "$aksname" --yes --no-wait || true
  echo "Suppression des partages de fichiers Azure..."
  storageAccounts=$(az storage account list -g "$rgname" --query "[].name" -o tsv)
  for sa in $storageAccounts; do
    shares=$(az storage share list --account-name "$sa" --query "[].name" -o tsv 2>/dev/null || true)
    for sh in $shares; do
      echo "Suppression du partage '$sh' dans le compte '$sa'..."
      az storage share delete --name "$sh" --account-name "$sa" || true
    done
  done
  echo "Cluster et fichiers Azure supprimés."
  exit 0
fi

# --- Option 4 ---
if [[ "$CHOICE" == "4" ]]; then
  echo "Suppression complète du Resource Group $rgname..."
  pause
  az group delete -n "$rgname" --yes --no-wait
  echo "Resource Group et toutes les ressources supprimés."
  exit 0
fi

echo "Aucune action effectuée."
exit 0
