// Configuration centralisée des salles du jeu (source unique de vérité : ordre, noms, cartes de sélection)
// L'ordre du tableau est l'ordre de déblocage des salles.
// `icon` est un nom d'icône Lucide (kebab-case) converti en composant par RoomsSection / GameRoom.
export const ROOMS_CONFIG = [
  {
    id: "server",
    title: "SALLE DU SERVEUR",
    subtitle: "Le pare-feu corrompu",
    shortName: "SERVEUR",
    description: "Identifiez l'encodage utilisé par le pirate dans un journal d'accès, décodez-le puis répondez à la question de sécurité qu'il cache.",
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
    description: "Reconstituez le brin d'ADN complémentaire (A↔T, C↔G), puis traduisez un codon en acide aminé.",
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
    description: "Remettez dans le bon ordre les 4 coupes d'une IRM cérébrale mélangées par le virus.",
    objective: "Découvrir le rôle de l'imagerie médicale",
    color: "#00ff88",
    borderClass: "border-cyber-green",
    icon: "scan-line",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "heart",
    title: "SALLE DU CŒUR",
    subtitle: "Arrêt cardiaque simulé",
    shortName: "CŒUR",
    description: "Réalisez un massage cardiaque : 30 compressions thoraciques en rythme, entre 100 et 120 par minute.",
    objective: "Apprendre les gestes de premiers secours",
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
    description: "Calibrez la flexion du genou d'une prothèse connectée, puis réglez les angles de la hanche, du genou et de la cheville.",
    objective: "Comprendre la biomécanique et les prothèses connectées",
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
    description: "Associez 5 maladies au traitement adapté pour rétablir le système de diagnostic.",
    objective: "Connaître des maladies courantes et leurs traitements",
    color: "#ff0055",
    borderClass: "border-cyber-red",
    icon: "heart-pulse",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "audition",
    title: "SALLE DE L'AUDITION",
    subtitle: "Diagnostic auditif interactif",
    shortName: "AUDITION",
    description: "Écoutez et reconnaissez 3 sons médicaux : un battement de cœur, une respiration sifflante et un acouphène.",
    objective: "Reconnaître des sons médicaux et comprendre les troubles auditifs",
    color: "#8b5cf6",
    borderClass: "border-cyber-purple",
    icon: "volume-2",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "eye",
    title: "SALLE DES YEUX",
    subtitle: "Diagnostic visuel corrompu",
    shortName: "YEUX",
    description: "Lisez une ligne de l'échelle de Snellen, puis déchiffrez 5 planches d'Ishihara pour recalibrer le diagnostic ophtalmologique.",
    objective: "Comprendre les tests d'acuité visuelle et de vision des couleurs",
    color: "#22d3ee",
    borderClass: "border-cyan-500",
    icon: "eye",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  },
  {
    id: "final",
    title: "SALLE DE FIN",
    subtitle: "Diagnostic final - Patiente critique",
    shortName: "FINAL",
    description: "Diagnostiquez cette patiente en état critique, choisissez son traitement, puis sécurisez son dossier médical.",
    objective: "Diagnostiquer la patiente et sécuriser son dossier médical",
    color: "#10b981",
    borderClass: "border-cyber-green",
    icon: "shield-check",
    lockMessage: "🔒 Complétez les salles précédentes pour débloquer"
  }
];

export const ROOM_IDS = ROOMS_CONFIG.map(room => room.id);

export const getRoomConfig = (roomId) => ROOMS_CONFIG.find(room => room.id === roomId) || null;

export const getNextRoomId = (currentRoomId) => {
  const index = ROOM_IDS.indexOf(currentRoomId);
  if (index !== -1 && index + 1 < ROOM_IDS.length) {
    return ROOM_IDS[index + 1];
  }
  return null;
};
