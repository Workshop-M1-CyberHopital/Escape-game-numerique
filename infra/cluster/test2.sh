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

rgname="workshop-EISI"
aksname="AKSClusterWorkshop"

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

# --- Option 1 ---
case $choice in
  1)
    echo ""
    echo "Suppression de toutes les ressources du namespace 'workshop'..."
    sleep 3
    kubectl delete all,secrets,configmap,pvc,pv,ingress,certificate --all -n workshop || true
    echo "Namespace nettoyé. Le cluster AKS reste actif."
    ;;
# --- Option 2 ---
  2)
    echo ""
    read -p "Es-tu sûr de vouloir SUPPRIMER le groupe de ressources Azure '$rgname' ? (y/N) : " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      echo "Suppression complète du groupe de ressources Azure..."
      sleep 3
      az group delete -n "$rgname" --yes --no-wait
      echo "Suppression demandée. Cela peut prendre quelques minutes..."
    else
      echo "Suppression annulée."
    fi
    ;;
# --- Option 3 ---
  3)
    echo ""
    read -p "CONFIRMATION FINALE — Supprimer TOUT (Azure + Kubernetes) ? (y/N) : " confirm_all
    if [[ "$confirm_all" =~ ^[Yy]$ ]]; then
      echo "Suppression du namespace 'workshop'..."
      sleep 3
      kubectl delete all,secrets,configmap,pvc,pv,ingress,certificate --all -n workshop || true
      echo "Suppression du cluster et du groupe de ressources Azure..."
      sleep 3
      az group delete -n "$rgname" --yes --no-wait
      echo "L'ensemble de l'infrastructure est en cours de suppression..."
    else
      echo "Suppression complète annulée."
    fi
    ;;
# --- Option 4 ---
  4)
    echo ""
    echo "Sortie sans suppression. Rien n’a été supprimé."
    ;;
# --- Option 5 ---
  5)
    echo ""
    read -p "CONFIRMATION ULTIME — Supprimer TOUT (Azure + Kubernetes + Azure Files) ? (y/N) : " confirm_all
    if [[ "$confirm_all" =~ ^[Yy]$ ]]; then
      echo "Suppression du namespace 'workshop'..."
      sleep 3
      kubectl delete all,secrets,configmap,pvc,pv,ingress,certificate --all -n workshop || true
      echo "Suppression du cluster et du groupe de ressources Azure..."
      sleep 3
      az group delete -n "$rgname" --yes --no-wait
      echo "Suppression des Azure Files (Redis + MariaDB)..."
      sleep 3
      az storage share delete --name "$share_redis" --account-name "$storageaccount" --yes || true
      az storage share delete --name "$share_mariadb" --account-name "$storageaccount" --yes || true
      echo "L'ensemble de l'infrastructure et des volumes persistants est en cours de suppression..."
    else
      echo "Suppression complète annulée."
    fi
    ;;
  *)
    echo ""
    echo "Option invalide. Aucune action effectuée."
    ;;
esac

separator
echo ""
echo "Fin du script."
echo "Merci d’avoir participé au Workshop EISI 2025–2026 !"
