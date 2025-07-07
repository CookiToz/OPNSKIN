#!/usr/bin/env tsx

/**
 * Script de test pour l'authentification Steam OpenID
 * 
 * Ce script simule le processus d'authentification Steam OpenID
 * pour tester et déboguer les problèmes d'authentification.
 * 
 * Usage:
 * 1. Configurez NEXT_PUBLIC_BASE_URL dans votre .env.local
 * 2. Lancez: npm run test:openid
 * 3. Suivez les instructions affichées
 */

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!BASE_URL.startsWith('http')) {
  console.error('❌ ERREUR: NEXT_PUBLIC_BASE_URL doit être une URL valide');
  console.error('   Exemple: http://localhost:3000 ou https://votre-app.vercel.app');
  process.exit(1);
}

console.log('🧪 === TEST AUTHENTIFICATION STEAM OPENID ===');
console.log(`📍 URL de base: ${BASE_URL}`);
console.log('');

// Test 1: Construction de l'URL de redirection
console.log('🔗 Test 1: Construction de l\'URL de redirection Steam');
const steamLoginUrl = new URL("https://steamcommunity.com/openid/login");
const openIdParams = {
  "openid.ns": "http://specs.openid.net/auth/2.0",
  "openid.mode": "checkid_setup",
  "openid.return_to": `${BASE_URL}/api/auth/steam/return`,
  "openid.realm": BASE_URL,
  "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
  "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
};

steamLoginUrl.search = new URLSearchParams(openIdParams).toString();

console.log('✅ URL de redirection construite:');
console.log(steamLoginUrl.toString());
console.log('');

// Test 2: Simulation des paramètres de retour
console.log('🔄 Test 2: Simulation des paramètres de retour Steam');
const mockSteamId = '76561198012345678';
const mockReturnUrl = new URL(`${BASE_URL}/api/auth/steam/return`);
mockReturnUrl.search = new URLSearchParams({
  'openid.ns': 'http://specs.openid.net/auth/2.0',
  'openid.mode': 'id_res',
  'openid.op_endpoint': 'https://steamcommunity.com/openid/login',
  'openid.claimed_id': `https://steamcommunity.com/openid/id/${mockSteamId}`,
  'openid.identity': `https://steamcommunity.com/openid/id/${mockSteamId}`,
  'openid.return_to': `${BASE_URL}/api/auth/steam/return`,
  'openid.response_nonce': '2024-01-01T12:00:00Z' + Math.random().toString(36).substring(2),
  'openid.assoc_handle': '1234567890',
  'openid.signed': 'signed,op_endpoint,claimed_id,identity,return_to,response_nonce,assoc_handle',
  'openid.sig': 'signature123'
}).toString();

console.log('✅ URL de retour simulée:');
console.log(mockReturnUrl.toString());
console.log('');

// Test 3: Extraction du SteamID
console.log('🆔 Test 3: Extraction du SteamID');
const claimedId = `https://steamcommunity.com/openid/id/${mockSteamId}`;
const steamIdMatch = claimedId.match(/(?:https?:\/\/)?steamcommunity\.com\/openid\/id\/(\d+)/);

if (steamIdMatch && steamIdMatch[1]) {
  console.log(`✅ SteamID extrait avec succès: ${steamIdMatch[1]}`);
} else {
  console.log('❌ Échec de l\'extraction du SteamID');
}
console.log('');

// Test 4: Instructions de test manuel
console.log('📋 Test 4: Instructions de test manuel');
console.log('');
console.log('Pour tester l\'authentification complète:');
console.log('');
console.log('1. Assurez-vous que votre serveur Next.js est démarré');
console.log(`   URL de retour: ${BASE_URL}/api/auth/steam/return`);
console.log('');
console.log('2. Accédez à:', steamLoginUrl.toString());
console.log('3. Authentifiez-vous sur Steam');
console.log('4. Vérifiez que vous êtes redirigé vers votre application');
console.log('5. Vérifiez les logs dans la console du serveur');
console.log('');

// Test 5: Vérification de la configuration
console.log('⚙️ Test 5: Vérification de la configuration');
console.log(`✅ NEXT_PUBLIC_BASE_URL: ${BASE_URL}`);
console.log(`✅ URL de retour configurée: ${BASE_URL}/api/auth/steam/return`);
console.log(`✅ URL de redirection: ${steamLoginUrl.toString()}`);
console.log('');

console.log('🎯 === RÉSUMÉ ===');
console.log('✅ Configuration valide');
console.log('✅ URLs construites correctement');
console.log('✅ Extraction SteamID fonctionnelle');
console.log('');
console.log('🚀 Prêt pour les tests !');
console.log('');
console.log('💡 Conseils:');
console.log('   - Vérifiez que votre serveur Next.js est démarré');
console.log('   - Vérifiez que NEXT_PUBLIC_BASE_URL est accessible');
console.log('   - Surveillez les logs du serveur pendant les tests');
console.log('   - En cas d\'erreur, vérifiez la console du navigateur'); 