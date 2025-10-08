# ===============================================
# Script : update-dns.ps1
# Objectif : Met à jour les enregistrements DNS A (escape & traefik)
# sur le domaine eisi-dune.eu via l’API Gandi
# ===============================================

# --- Variables principales ---
$apiKey   = "ubVqfAcvE7507ZwuTWamvCJe"   # Ton token API Gandi
$domain   = "eisi-dune.eu"               # Ton domaine
$newIP    = "131.189.254.169"            # Nouvelle IP publique à assigner
$ttl      = 300                          # TTL (en secondes)

# --- En-têtes HTTP pour l’API ---
$headers = @{
    "Authorization" = "Apikey $apiKey"
    "Content-Type"  = "application/json"
}

# --- Corps de la requête ---
$body = @{
    rrset_values = @($newIP)
    rrset_ttl    = $ttl
} | ConvertTo-Json

# --- Fonctions utilitaires ---
function Update-DnsRecord {
    param (
        [string]$subdomain
    )

    Write-Host "➡ Mise à jour de l’enregistrement '$subdomain'..." -ForegroundColor Cyan

    $url = "https://api.gandi.net/v5/livedns/domains/$domain/records/$subdomain/A"
    try {
        $response = Invoke-RestMethod -Method PUT -Uri $url -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "$($response.message)" -ForegroundColor Green
    } catch {
        Write-Host "Erreur lors de la mise à jour de $subdomain : $($_.Exception.Message)" -ForegroundColor Red
    }

    # --- Vérification du résultat ---
    Start-Sleep -Seconds 2
    $check = Invoke-RestMethod -Method GET -Uri $url -Headers $headers
    Write-Host "   → Nom : $($check.rrset_name)"
    Write-Host "   → Type : $($check.rrset_type)"
    Write-Host "   → IP   : $($check.rrset_values -join ', ')"
    Write-Host "-----------------------------------------------"
}

# --- Script principal ---
Write-Host "==============================================="
Write-Host "MISE À JOUR DES ENREGISTREMENTS DNS GANDI"
Write-Host "==============================================="

# --- Vérifie la connectivité à l’API ---
try {
    Invoke-RestMethod -Method GET -Uri "https://api.gandi.net/v5/livedns/domains/$domain" -Headers $headers -ErrorAction Stop | Out-Null
    Write-Host "Connexion à l’API Gandi : OK" -ForegroundColor Green
} catch {
    Write-Host "Erreur : Impossible de se connecter à l’API Gandi. Vérifie ton token ou la connexion Internet." -ForegroundColor Red
    exit 1
}

# --- Mise à jour des enregistrements ---
Update-DnsRecord "escape"
Update-DnsRecord "traefik"

Write-Host "Toutes les mises à jour DNS sont terminées !" -ForegroundColor Green
Write-Host "Les changements peuvent prendre quelques minutes à se propager (TTL = $ttl s)."
