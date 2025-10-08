#!/usr/bin/env bash
echo "Test des régions Azure pour lesquelles ton abonnement peut créer un cluster AKS..."
echo "---------------------------------------------------------------"

# Liste des régions populaires (tu peux en ajouter si tu veux)
regions=(
  eastus westus westus2 southcentralus
  uksouth canadacentral westeurope francecentral northeurope
  swedencentral germanywestcentral
)

for region in "${regions[@]}"; do
  echo -n "Test $region ... "
  if az aks get-versions --location "$region" --output none 2>/dev/null; then
    echo "✅ autorisée"
  else
    echo "❌ bloquée"
  fi
done

echo "---------------------------------------------------------------"
echo "Tests terminés. Les régions marquées ✅ sont utilisables pour ton cluster AKS."
