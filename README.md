## ⚙️ Projet : **Cyber-Hôpital – Mission Résilience**

### 🎬 Concept général

Une cyberattaque a frappé un grand hôpital connecté.
Les dossiers médicaux des patients sont corrompus par un **virus informatique intelligent**.
Votre équipe (les joueurs) est une **unité spéciale de cybersécurité médicale** chargée de rétablir le système avant que les patients ne soient en danger.

🎯 **Objectif du jeu** :
Réparer les systèmes vitaux (**9 salles virtuelles**) en résolvant des énigmes liées à :

* la **cybersécurité médicale**,
* la **santé humaine (données, ADN, IRM, rythme cardiaque, etc.)**,
* la **collaboration et la logique**.

---

## 🧩 Structure du jeu (Escape game numérique)

| Salle                      | Nom                        | Enigme principale                                             | Objectif pédagogique                                      |
| -------------------------- | -------------------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| **1. Salle du Serveur**    | Pare-feu corrompu          | Décoder des logs chiffrés                                     | Sensibiliser à la sécurité des données de santé           |
| **2. Laboratoire ADN**     | Gènes brouillés            | Reconstituer une séquence ADN                                 | Comprendre la logique ADN et la gestion des données bio   |
| **3. Salle d’Imagerie**    | IRM fantôme                | Restaurer une image médicale corrompue                        | Découvrir le rôle de l’imagerie médicale                  |
| **4. Salle du Cœur**       | Rythme vital               | Mini-jeu de synchronisation (cliquer/respirer au bon rythme)  | Sensibiliser au stress et à la régulation cardiaque       |
| **5. Salle des Pathologies**| Diagnostic compromis       | Associer pathologies et symptômes                             | Apprendre la logique médicale et les diagnostics          |
| **6. Salle des Prothèses** | Articulations désynchronisées| Réaligner des prothèses/articulations                        | Comprendre la biomécanique et les dispositifs médicaux    |
| **7. Salle de l’Audition** | Fréquences brouillées      | Ajuster des fréquences audio                                  | Sensibiliser à l’audition et au traitement du signal      |
| **8. Salle des Yeux**      | Vision brouillée           | Recalibrer un diagnostic visuel/ophtalmo                      | Comprendre l’importance du dépistage visuel               |
| **9. Salle de Fin**        | Patient critique           | Diagnostiquer et sécuriser un patient en urgence              | Synthèse des apprentissages, gestion de crise             |

Chaque énigme réussie **débloque une clé** pour restaurer une partie du système.
À la fin, un **débriefing** montre ce qu’ils ont appris (protection des données, santé, émotion, etc.).

---

## 🧑‍💻 Partie technique

**Technos recommandées :**

* **Front-end** : Vue.js (interface claire, chronomètre, navigation entre salles).
* **Back-end** : Node.js pour la logique serveur.
* **Communication multi-joueurs** : Firebase Realtime DB ou WebSocket simple.
* **Hébergement rapide** : Vercel ou Netlify.
* **Stockage / sauvegarde** : localStorage ou Firebase.
* **Sécurité** : chiffrer les échanges simples (hash, base64, pas de vraies données personnelles).

Option bonus 💡 :
👉 connecter un **capteur cardiaque Arduino** (ou simulateur via micro) pour la salle du Cœur.
Exemple : si le joueur calme son rythme → LED verte, sinon rouge.

---

## 🎨 UX / UI

* Interface “terminal médical futuriste” (fond sombre, verts/bleus lumineux).
* Sons d’alerte, sirène, battement de cœur.
* Chronomètre visible (compte à rebours 20-30 minutes).
* Indices progressifs (chat intégré ou bouton “Help”).

---

## 🧠 Message éducatif final

À la fin du jeu, un **écran de débriefing** explique :

* Pourquoi la cybersécurité médicale est cruciale,
* Les dangers des fuites de données de santé,
* L’importance de la gestion du stress pour la performance cognitive.

---

## 🎤 Présentation orale (5 min)

Plan conseillé :

1. **Intro (en anglais)** : présentation de l’équipe + mission.
2. **Storytelling** : “Un hôpital attaqué, des patients en danger…”
3. **Démonstration** du jeu (montrer 2-3 salles).
4. **Apport pédagogique** : cybersécurité + santé mentale.
5. **Conclusion & originalité** : “Notre jeu sensibilise en rendant l’éducation médicale interactive.”
