#!/usr/bin/env bash
# ===============================================
# Script de nettoyage — Workshop M1 EISI 2025–2026
# ===============================================
# Options :
# 1.  Supprimer uniquement les ressources Kubernetes (namespace workshop)
# 2.  Supprimer uniquement l’infrastructure Azure (groupe de ressources complet)
# 3.  Supprimer TOUT (cluster AKS + ressources Kubernetes + groupe Azure)
# 4.  Quitter sans rien supprimer
# 5.  Supprimer TOUT + les Azure Files (volumes persistants)
# ===============================================

set -Eeuo pipefail

# --- Fonctions ---
separator() {
  echo "-----------------------------------------------"
}

# --- Variables principales ---
rgname="workshop-EISI"
aksname="AKSClusterWorkshop"
share_redis="redis-fileshare"
share_mariadb="mariadb-fileshare"
storageaccount="workshopstorageeisi"

# --- Connexion Azure ---
echo "===== Connexion à Azure ====="
az account show > /dev/null 2>&1 || az login --use-device-code

echo "============================"
echo "   MENU DE NETTOYAGE FINAL"
echo "============================"
echo ""
echo "1.  Supprimer uniquement les ressources Kubernetes (namespace, secrets, pvc, ingress, certificats)"
echo "2.  Supprimer uniquement l’infrastructure Azure (groupe de ressources complet)"
echo "3.  Supprimer TOUT (cluster AKS + ressources Kubernetes + groupe Azure)"
echo "4.  Quitter sans rien supprimer"
echo "5.  Supprimer TOUT + les Azure Files (volumes persistants)"
echo ""
read -p "Choisis une option [1-5] : " choice

case $choice in
  1)
    echo ""
    echo "Suppression de toutes les ressources Kubernetes..."
    sleep 5
    kubectl delete all,secrets,configmap,pvc,pv,ingress,certificate --all || true
    echo "Ressources Kubernetes supprimées. Le cluster AKS reste actif."
    ;;
  2)
    echo ""
    read -p "Es-tu sûr de vouloir SUPPRIMER le groupe de ressources Azure '$rgname' ? (y/N) : " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      echo "Suppression complète du groupe de ressources Azure..."
      sleep 5
      az group delete -n "$rgname" --yes --no-wait
      echo "Suppression demandée. Cela peut prendre quelques minutes..."
    else
      echo "Suppression annulée."
    fi
    ;;
  3)
    echo ""
    read -p "CONFIRMATION FINALE — Supprimer TOUT (Azure + Kubernetes) ? (y/N) : " confirm_all
    if [[ "$confirm_all" =~ ^[Yy]$ ]]; then
      echo "Suppression des ressources Kubernetes..."
      sleep 5
      kubectl delete all,secrets,configmap,pvc,pv,ingress,certificate --all || true
      echo "Suppression du cluster et du groupe de ressources Azure..."
      sleep 5
      az group delete -n "$rgname" --yes --no-wait
      echo "L'ensemble de l'infrastructure est en cours de suppression..."
    else
      echo "Suppression complète annulée."
    fi
    ;;
  4)
    echo ""
    echo "Sortie sans suppression. Rien n’a été supprimé."
    ;;
  5)
    echo ""
    read -p "CONFIRMATION ULTIME — Supprimer TOUT (Azure + Kubernetes + Azure Files) ? (y/N) : " confirm_all
    if [[ "$confirm_all" =~ ^[Yy]$ ]]; then
      echo "Suppression des ressources Kubernetes..."
      sleep 5
      kubectl delete all,secrets,configmap,pvc,pv,ingress,certificate --all || true

      echo "Suppression du cluster et du groupe de ressources Azure..."
      sleep 5
      az group delete -n "$rgname" --yes --no-wait

      echo "Suppression de tous les Azure Files présents dans le groupe de ressources $rgname..."
      sleep 5
      storage_accounts=$(az storage account list -g "$rgname" --query "[].name" -o tsv)

      for account in $storage_accounts; do
        echo "→ Suppression des partages de fichiers du compte $account..."
        shares=$(az storage share list --account-name "$account" --query "[].name" -o tsv 2>/dev/null || true)
        for share in $shares; do
          echo "   - Suppression du partage : $share"
          az storage share delete --name "$share" --account-name "$account" --yes || true
        done
      done

      echo "L'ensemble de l'infrastructure et des volumes persistants est en cours de suppression..."
    else
      echo "Suppression complète annulée."
    fi
    ;;
esac

separator
echo ""
echo "Fin du script."
echo "Merci d’avoir participé au Workshop EISI 2025–2026 !"
