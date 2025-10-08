🧩 Workshop M1 EISI 2025–2026

Déploiement de l’infrastructure Escape Game sur AKS (Azure Kubernetes Service)
📘 Sommaire

Objectif du projet

Architecture globale

Fichiers du projet

Étapes de déploiement

Vérifications post-déploiement

Commandes utiles

Nettoyage de l’environnement

🎯 Objectifs du projet

Mettre en place une infrastructure Kubernetes complète sur Azure (AKS) pour héberger une application web d’escape game développée par l’équipe Dev.

L’objectif est de permettre :

* l’accès sécurisé via HTTPS (Let's Encrypt),

* la gestion du trafic via Traefik,

* la persistance des données (Redis + stockage Azure Files),

* l’utilisation d’une base de données managée Azure

🏗️ Architecture globale
🔹 Schéma d’infrastructure


                      ┌──────────────────────────────┐
                      │        Utilisateurs          │
                      └──────────────┬───────────────┘
                                     │
                           HTTPS (Let's Encrypt)
                                     │
                      ┌──────────────▼───────────────┐
                      │   Traefik Ingress Controller │
                      │ (AKS, ports 80/443, HTTPS)  │
                      └──────┬──────────┬───────────┘
                             │          │
               ┌─────────────▼─┐      ┌─▼─────────────────────┐
               │ Escape Game App│      │ Traefik Dashboard     │
               │ (Pods AKS)     │      │ + Auth/Whitelist IP   │
               └──────────┬─────┘      └───────────────────────┘
                          │
        ┌─────────────────┼──────────────────┐
        │                 │                  │
 ┌──────▼───────┐   ┌─────▼──────────┐   ┌───▼────────────────────┐
 │ Redis (cache)│   │ Azure Files PVC│   │ Azure Database (PaaS)  │
 │ (Pod K8S)    │   │ Persistance     │   │ for MariaDB            │
 └──────────────┘   └────────────────┘   └────────────────────────┘

📂 Fichiers du projet

| Fichier               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `infra_creation.sh`   | Script principal de déploiement de l’infra            |
| `escape.yaml`         | Déploiement de l’app Escape Game + Redis              |
| `ingress.yaml`        | Accès public HTTPS à l’application                    |
| `issuer.yaml`         | Configuration Let's Encrypt (certificats SSL)         |
| `traefik-config.yaml` | Traefik : dashboard, authentification et whitelist IP |
| `README.md`           | Documentation complète (ce fichier)                   |

Ajout des droits d'exécution pour les scripts .sh :
```chmod +x check-azure-env.sh```

🧩 Justification de l’utilisation de MariaDB et Redis

L’infrastructure de l’application repose sur deux systèmes complémentaires de gestion des données : Redis et MariaDB.
Redis est utilisé comme cache en mémoire pour accélérer les échanges et stocker les informations temporaires (sessions de jeu, scores en cours, etc.), tandis que MariaDB agit comme base de données relationnelle persistante, garantissant la sauvegarde durable des données critiques telles que les joueurs, les scores finaux et la configuration du jeu.
Cette séparation des rôles permet de combiner performance et fiabilité, en optimisant à la fois la rapidité d’exécution et la cohérence des données à long terme.

🚀 Étapes de déploiement
🔧 1. Prérequis

* Un compte Azure (ex. étudiant)
* Docker Hub avec l’image monrepo/escape-game:latest
* Gandi (ou autre registrar) configuré pour ton domaine
→ escape.eisi-dune.eu et traefik.eisi-dune.eu
* Azure Database for MariaDB déployée et accessible publiquement

⚙️ 2. Lancer le déploiement

Ouvre ton terminal / VSCode / WSL Ubuntu

Donne les droits d’exécution :
```chmod +x infra_creation.sh```

Lance le script :
```./infra_creation.sh```

Le script va :

* créer le groupe de ressources Azure et le cluster AKS,
* déployer Redis et ton application,
* installer Traefik et cert-manager,
* récupérer l’IP publique,
* t’inviter à configurer tes enregistrements DNS,
* puis générer automatiquement les certificats HTTPS.

🌍 3. Configurer ton DNS sur Gandi

Quand le script affiche :

📡 Adresse IP détectée : XX.XX.XX.XX


→ Crée deux enregistrements A dans ton domaine Gandi :
| Nom       | Type | Valeur                |
| --------- | ---- | --------------------- |
| `escape`  | A    | (adresse IP affichée) |
| `traefik` | A    | (même adresse IP)     |

Puis confirme dans le script [Y].

🧪 Vérifications post-déploiement

Une fois le script terminé, vérifie que tout fonctionne :
# Pods déployés
kubectl get pods -n workshop

# Services et IP internes
kubectl get svc -n workshop

# Vérifie que Traefik est bien exposé
kubectl get svc traefik -n workshop -o wide

# Vérifie les certificats HTTPS
kubectl get certificate -A

# Vérifie les routes externes
kubectl get ingress -n workshop

Si tout est correct :

L’application est disponible sur https://escape.eisi-dune.eu
Le tableau de bord Traefik sur https://traefik.eisi-dune.eu

🧰 Commandes utiles
# Voir les logs de l’application
kubectl logs -n workshop -l app=escape-app --tail=50

# Accéder au shell d’un pod
kubectl exec -it -n workshop deploy/escape-app -- /bin/bash

# Liste complète des objets K8S
kubectl get all -n workshop

🧹 Nettoyage de l’environnement

Quand le workshop est terminé, libère les ressources Azure :
az group delete -n workshop-EISI --yes --no-wait

💡 Points forts du déploiement

✅ Infrastructure Cloud-Native complète sur Azure
✅ Application sécurisée par HTTPS + Let's Encrypt
✅ Traefik pour la gestion du trafic et le dashboard d’administration
✅ Redis + Azure Files pour la persistance des données
✅ Base MariaDB managée Azure, haute disponibilité garantie
✅ Script de déploiement automatisé et commenté


Topologies :

