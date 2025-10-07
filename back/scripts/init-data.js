const fs = require('fs');
const path = require('path');

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialiser les fichiers JSON vides s'ils n'existent pas
const files = ['users.json', 'scores.json', 'sessions.json'];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{}', 'utf8');
        console.log(`✅ Fichier ${file} créé`);
    } else {
        console.log(`📁 Fichier ${file} existe déjà`);
    }
});

console.log('🎯 Initialisation des données terminée');
