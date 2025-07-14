import 'dotenv/config';
import fetch from 'node-fetch'; // Si erreur de type, installer @types/node-fetch
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const STEAM_API_KEY = process.env.STEAM_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getPendingTransactions() {
  const { data, error } = await supabase
    .from('Transaction')
    .select('id, offerId, buyerId, escrowAmount, status, startedAt, offer:offerId(itemId, market_hash_name, sellerId), buyer:buyerId(steamId)')
    .eq('status', 'WAITING_TRADE');
  if (error) throw error;
  return data || [];
}

async function getSteamInventory(steamId: string) {
  // Adapter l'URL selon le jeu (ici CS:GO 730)
  const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur API Steam');
  const data = await res.json();
  return data;
}

async function releaseEscrow(transactionId: string, sellerId: string, amount: number, buyerId: string) {
  // 1. Mettre à jour la transaction
  await supabase.from('Transaction').update({ status: 'DONE', completedAt: new Date().toISOString() }).eq('id', transactionId);
  // 2. Crédite le vendeur
  const { data: seller } = await supabase.from('User').select('walletBalance').eq('id', sellerId).single();
  if (seller) {
    await supabase.from('User').update({ walletBalance: (seller.walletBalance || 0) + amount }).eq('id', sellerId);
  }
  // 3. Notifier le vendeur
  await supabase.from('Notification').insert([
    {
      userId: sellerId,
      type: 'ESCROW_RELEASED',
      title: 'Paiement libéré',
      message: 'Le skin a bien été livré. Les fonds ont été ajoutés à votre solde.'
    }
  ]);
  // 4. Notifier l'acheteur
  await supabase.from('Notification').insert([
    {
      userId: buyerId,
      type: 'ESCROW_RELEASED',
      title: 'Achat confirmé',
      message: 'Vous avez bien reçu le skin. La transaction est terminée.'
    }
  ]);
}

async function main() {
  const transactions = await getPendingTransactions();
  for (const tx of transactions) {
    const offer = Array.isArray(tx.offer) ? tx.offer[0] : tx.offer;
    const buyer = Array.isArray(tx.buyer) ? tx.buyer[0] : tx.buyer;
    if (!offer || !buyer) continue;
    const { market_hash_name, sellerId } = offer;
    const { steamId } = buyer;
    if (!market_hash_name || !steamId) continue;
    try {
      const inv = await getSteamInventory(steamId);
      const found = (inv.descriptions || []).some((item: any) => item.market_hash_name === market_hash_name);
      if (found) {
        await releaseEscrow(tx.id, sellerId, tx.escrowAmount, buyer.id);
        console.log(`✅ Transaction ${tx.id} : skin trouvé, escrow libéré.`);
      } else {
        console.log(`⏳ Transaction ${tx.id} : skin non trouvé, en attente.`);
      }
    } catch (e) {
      console.error(`❌ Transaction ${tx.id} : erreur API Steam ou Supabase`, e);
    }
  }
}

main().then(() => process.exit(0)); 