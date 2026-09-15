// Configuration centralisée des salles du jeu (source unique de vérité)
export const ROOMS_CONFIG = [
  {
    id: "server",
    title: "SALLE DU SERVEUR",
    subtitle: "Le pare-feu corrompu",
    shortName: "SERVEUR",
    description: "Décoder un mot de passe à partir d'un log chiffré (substitution, base64, etc.)",
    objective: "Sensibiliser à la sécurité des données de santé",
    color: "#ff0055",
    borderClass: "border-cyber-red",
    icon: "server",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "dna-lab",
    title: "LABORATOIRE ADN",
    subtitle: "Les gènes brouillés",
    shortName: "LAB ADN",
    description: "Reconstituer une séquence ADN (mini puzzle logique)",
    objective: "Comprendre la logique de l'ADN et des données biomédicales",
    color: "#00ffff",
    borderClass: "border-cyber-blue",
    icon: "dna",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "imaging",
    title: "SALLE D'IMAGERIE",
    subtitle: "IRM fantôme",
    shortName: "IMAGERIE",
    description: "Reconstituer une image médicale corrompue (pixels manquants ou puzzle)",
    objective: "Découvrir le rôle de l'imagerie médicale",
    color: "#00ff88",
    borderClass: "border-cyber-green",
    icon: "scan-line",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "heart",
    title: "SALLE DU CŒUR",
    subtitle: "Rythme vital",
    shortName: "CŒUR",
    description: "Mini-jeu basé sur la synchronisation : cliquer ou respirer au bon rythme",
    objective: "Sensibiliser au stress et à la régulation cardiaque",
    color: "#ff00ff",
    borderClass: "border-cyber-purple",
    icon: "heart",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "prosthesis",
    title: "SALLE DES PROTHÈSES",
    subtitle: "Système orthopédique désynchronisé",
    shortName: "PROTHÈSES",
    description: "Réaligner les articulations virtuelles en résolvant une énigme de mécanique logique",
    objective: "Comprendre la biomécanique et les technologies IoT médicales",
    color: "#f97316",
    borderClass: "border-orange-500",
    icon: "settings",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "pathology",
    title: "SALLE DES PATHOLOGIES",
    subtitle: "Diagnostic médical",
    shortName: "PATHOLOGIE",
    description: "Associez chaque pathologie à sa guérison correspondante",
    objective: "Sensibiliser aux pathologies médicales et leurs traitements",
    color: "#ff0055",
    borderClass: "border-cyber-red",
    icon: "heart-pulse",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "audition",
    title: "SALLE DE L'AUDITION",
    subtitle: "Réparation audiométrique",
    shortName: "AUDITION",
    description: "Ajustez l'égaliseur audio pour restaurer les fréquences sonores",
    objective: "Sensibiliser aux troubles auditifs et à l'audiométrie",
    color: "#8b5cf6",
    borderClass: "border-cyber-purple",
    icon: "volume-2",
    lockMessage: "🔒 Complétez la salle des pathologies pour débloquer"
  },
  {
    id: "eye",
    title: "SALLE DES YEUX",
    subtitle: "Diagnostic visuel corrompu",
    shortName: "YEUX",
    description: "Recalibrer le système de diagnostic ophtalmologique avec des tests d'acuité visuelle",
    objective: "Comprendre l'importance des tests visuels en médecine",
    color: "#22d3ee",
    borderClass: "border-cyan-500",
    icon: "eye",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "final",
    title: "SALLE DE FIN",
    subtitle: "Diagnostic final - Patient critique",
    shortName: "FINAL",
    description: "Diagnostiquez et traitez ce patient en état critique, puis sécurisez son dossier médical.",
    objective: "Diagnostiquer le patient et sécuriser son dossier médical",
    color: "#10b981",
    borderClass: "border-cyber-green",
    icon: "shield-check",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  }
];

export const ROOM_IDS = ROOMS_CONFIG.map(room => room.id);

export const getNextRoomId = (currentRoomId) => {
  const index = ROOM_IDS.indexOf(currentRoomId);
  if (index !== -1 && index + 1 < ROOM_IDS.length) {
    return ROOM_IDS[index + 1];
  }
  return null;
};
