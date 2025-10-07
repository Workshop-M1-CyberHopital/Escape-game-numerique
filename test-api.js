// Script de test pour vérifier la connectivité API
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api';

async function testAPI() {
    console.log('🧪 Test de connectivité API...');
    
    try {
        // Test de santé
        console.log('1. Test de santé...');
        const healthResponse = await fetch(`${API_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test d'inscription
        console.log('2. Test d\'inscription...');
        const registerResponse = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com',
                password: 'testpassword123',
                teamName: 'Test Team'
            })
        });
        
        if (registerResponse.ok) {
            const registerData = await registerResponse.json();
            console.log('✅ Inscription réussie:', registerData);
        } else {
            const errorData = await registerResponse.json();
            console.log('❌ Erreur inscription:', errorData);
        }
        
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.log('💡 Vérifiez que le backend est démarré sur le port 3001');
    }
}

testAPI();
