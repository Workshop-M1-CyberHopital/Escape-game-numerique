# Workshop M1 EISI 2025–2026 - Documentation

## Objectif du projet

Mettre en place une infrastructure Kubernetes complète sur Azure (AKS) pour héberger une application web d’escape game développée par l’équipe Dev.

L’objectif est de permettre :

- un accès sécurisé via HTTPS (Let's Encrypt),
- la gestion du trafic via Traefik,
- la persistance des données (Redis + stockage local Kubernetes),
- l’utilisation d’une base de données MariaDB avec stockage local sur les nœuds Kubernetes (compte étudiant Azure gratuit ne supportant pas la persistance Azure Files CSI).

## Architecture globale

Architecture globale de l'infrastructure Escape Game déployée sur AKS, sécurisée via Traefik et TLS Let’s Encrypt.

![Architecture diagram of Escape Game infrastructure on AKS with Traefik, Redis, MariaDB, and HTTPS.](https://user-gen-media-assets.s3.amazonaws.com/seedream_images/ad2a8052-1146-418d-a320-6e8ddf5aa084.png)

Topologie détaillée comme suit :

Utilisateurs --> HTTPS --> Traefik Ingress Controller --> Application Escape Game Pods  
&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;---> Redis Pod (cache)  
&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;---> MariaDB Pod (stockage local K8s hostPath)  
&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;---> Traefik Dashboard (auth + whitelisting)  

## Fichiers du projet

- `infra_creation.sh` : Script principal déploiement infra  
- `infra_deploy2.sh` : Script version chart.yaml + values.yaml  
- `escape.yaml` : Déploiement app Escape Game + Redis + MariaDB  
- `ingress.yaml` : Configuration accès HTTPS  
- `issuer.yaml` : Configuration Let's Encrypt  
- `certif.yaml` : Certificat TLS Traefik  
- `traefik-config.yaml` : Configuration Traefik dashboard + auth + IP  
- `chart.yaml` et `values.yaml` : Helm chart webhook-gandi  
- Scripts auxiliaires : Nettoyage et vérification infra  

## Documentation PAT Gandi

Le déploiement utilise un Personal Access Token (PAT) pour remplacer l’ancien token API déprécié de Gandi, suivant la documentation officielle Gandi :  
<https://docs.gandi.net/en/managing_an_organization/organizations/personal_access_token.html>

## Particularités techniques

- **Persistance MariaDB** :  
  Compte étudiant Azure gratuit interdit d’utiliser Azure Files CSI. Le stockage se fait via Kubernetes `hostPath` local (semi-persistant, pertes de données possibles si pods migrent).

- **Redis** :  
  Stockage `emptyDir` éphémère utilisé, adapté pour cache.

- **Autoscaling et monitoring** :  
  Limités sur compte gratuit Azure (addons non disponibles).

- **Image Docker multi-architecture** :  
  Construction multiarchi effectuée avec Builder Docker, image poussée sur Docker Hub.

## Étapes de déploiement

### Prérequis

- Compte Azure (étudiant ou autre)  
- Docker Hub avec l’image Docker multi-archi `produn/escape-workshop:latest`  
- Domaine Gandi configuré (`escape.eisi-dune.eu`, `traefik.eisi-dune.eu`)  
- Compte Azure Database for MariaDB (utilisé localement sur AKS via `hostPath`)

### Exécution

- Donner les droits :  

`
chmod +x infra_creation.sh
chmod +x infra_deploy2.sh
`

- Lancer le script voulu :  

`
./infra_creation.sh # Version simple sans helm chart local
./infra_deploy2.sh # Version avec Helm chart et values.yaml
`

## Vérifications post-déploiement

- `kubectl get pods -n default`  
- `kubectl get svc -n default`  
- `kubectl get ingress -n default`  
- `kubectl get certificate -A`  
- Accès application HTTPS : <https://escape.eisi-dune.eu>  
- Dashboard Traefik sécurisé : <https://traefik.eisi-dune.eu>

## Commandes utiles

- Logs app Escape Game :  

`kubectl logs -n default -l app=escape-app --tail=50`

- Accès shell pod :  
  
`kubectl exec -it -n default deploy/escape-app -- /bin/bash`

- Liste objets Kubernetes :  

`kubectl get all -n default`


- Nettoyage Azure :  

`az group delete -n workshop-EISI --yes --no-wait`
