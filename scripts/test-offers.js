// Script de test pour créer des offres et tester le système de retrait
// À exécuter avec: node scripts/test-offers.js

const BASE_URL = 'http://localhost:3000';

async function createTestOffers() {
  const testOffers = [
    {
      sellerId: 'user_simule_123',
      steamItemId: 'AK-47 | Fire Serpent',
      price: 1599.99
    },
    {
      sellerId: 'user_simule_123',
      steamItemId: 'AWP | Dragon Lore',
      price: 1999.99
    },
    {
      sellerId: 'user_simule_123',
      steamItemId: 'Butterfly | Doppler',
      price: 899.99
    }
  ];

  console.log('Création des offres de test...');

  for (const offer of testOffers) {
    try {
      const response = await fetch(`${BASE_URL}/api/offers/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offer),
      });

      if (response.ok) {
        const createdOffer = await response.json();
        console.log(`✅ Offre créée: ${offer.steamItemId} - ${offer.price}€`);
      } else {
        const error = await response.json();
        console.log(`❌ Erreur création offre ${offer.steamItemId}:`, error);
      }
    } catch (error) {
      console.log(`❌ Erreur réseau pour ${offer.steamItemId}:`, error.message);
    }
  }
}

async function listOffers() {
  console.log('\nRécupération des offres...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/offers/list?sellerId=user_simule_123`);
    if (response.ok) {
      const offers = await response.json();
      console.log(`📋 ${offers.length} offres trouvées:`);
      offers.forEach(offer => {
        console.log(`  - ${offer.itemId} (${offer.status}) - ${offer.price}€`);
      });
    } else {
      console.log('❌ Erreur lors de la récupération des offres');
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
}

async function testCancelOffer() {
  console.log('\nTest de retrait d\'offre...');
  
  try {
    // D'abord, récupérer les offres disponibles
    const listResponse = await fetch(`${BASE_URL}/api/offers/list?sellerId=user_simule_123`);
    if (!listResponse.ok) {
      console.log('❌ Impossible de récupérer les offres pour le test');
      return;
    }
    
    const offers = await listResponse.json();
    const availableOffer = offers.find(o => o.status === 'AVAILABLE');
    
    if (!availableOffer) {
      console.log('❌ Aucune offre disponible pour le test de retrait');
      return;
    }

    console.log(`🔄 Test de retrait de l'offre: ${availableOffer.itemId}`);
    
    const cancelResponse = await fetch(`${BASE_URL}/api/offers/${availableOffer.id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sellerId: 'user_simule_123' }),
    });

    if (cancelResponse.ok) {
      console.log('✅ Offre retirée avec succès');
    } else {
      const error = await cancelResponse.json();
      console.log('❌ Erreur lors du retrait:', error);
    }
  } catch (error) {
    console.log('❌ Erreur réseau lors du test de retrait:', error.message);
  }
}

async function main() {
  console.log('🚀 Test du système d\'offres OPNSKIN\n');
  
  await createTestOffers();
  await listOffers();
  await testCancelOffer();
  
  console.log('\n✅ Tests terminés !');
  console.log('Vous pouvez maintenant aller sur http://localhost:3000/listings pour voir les résultats');
}

// Exécuter les tests
main().catch(console.error); 