// Crée le dossier de données (DATA_DIR, par défaut back/data) et les fichiers JSON vides manquants.
const fs = require('fs');
const path = require('path');
const config = require('../config');

const dataDir = config.storage.dataDir;
fs.mkdirSync(dataDir, { recursive: true });

['users.json', 'scores.json'].forEach((file) => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{}', 'utf8');
        console.log(`✅ Fichier ${file} créé`);
    } else {
        console.log(`📁 Fichier ${file} existe déjà`);
    }
});

console.log(`🎯 Initialisation des données terminée (${dataDir})`);
