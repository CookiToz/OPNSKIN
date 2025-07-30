import { PrismaClient, TransactionStatus } from '@prisma/client';
import axios from 'axios';
import { creditWallet, debitWallet } from '../lib/wallet';
import { notifyUser } from '../lib/notify';

const prisma = new PrismaClient();
const MAX_ATTEMPTS = 3;

async function getBuyerInventory(steamId: string): Promise<any> {
  const url = `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`;
  const res = await axios.get(url, { timeout: 10000 });
  return res.data;
}

export async function verifyEscrowTransactions() {
  const now = new Date();
  const transactions = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.IN_ESCROW,
      escrowUntil: { lte: now },
      escrowReleased: false,
      refunded: false,
    },
    include: {
      offer: true,
      buyer: true,
      seller: true,
      escrowLogs: true,
    },
  });

  for (const tx of transactions) {
    try {
      const attempts = tx.escrowLogs.filter((log) => log.action === 'error').length;
      if (attempts >= MAX_ATTEMPTS) {
        await prisma.escrowLog.create({
          data: {
            transactionId: tx.id,
            action: 'error',
            details: 'max_attempts_reached',
          },
        });
        await notifyUser(tx.sellerId, "Alerte admin", "Vérification escrow impossible après 3 tentatives.");
        continue;
      }

      // 1. Vérification inventaire Steam
      const inventory = await getBuyerInventory(tx.buyer.steamId);
      const skinAssetId = tx.offer.itemId;
      const skinFound = inventory.assets?.some((item: any) => item.assetid === skinAssetId);

      if (skinFound) {
        // 2. Libération de l’escrow
        let payout = tx.offer.price;
        // TODO: placementPlan si tu ajoutes la relation plus tard
        await creditWallet(tx.sellerId, payout);

        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            status: TransactionStatus.RELEASED,
            escrowReleased: true,
            updatedAt: new Date(),
          },
        });
        await prisma.escrowLog.create({
          data: {
            transactionId: tx.id,
            action: 'escrow_released',
            details: 'Skin found in buyer inventory, escrow released.',
          },
        });
        await notifyUser(tx.sellerId, "Paiement libéré", "Votre vente a été validée, l’argent est disponible.");
        await notifyUser(tx.buyerId, "Achat confirmé", "Le skin est bien dans votre inventaire, transaction finalisée.");
      } else {
        // 3. Refund + soft-ban vendeur
        if (tx.escrowReleased) await debitWallet(tx.sellerId, tx.offer.price);
        await creditWallet(tx.buyerId, tx.offer.price);

        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            status: TransactionStatus.REFUNDED,
            refunded: true,
            refundReason: 'steam_cancel',
            bannedSeller: true,
            updatedAt: new Date(),
          },
        });
        await prisma.user.update({
          where: { id: tx.sellerId },
          data: { isSoftBanned: true, bannedAt: new Date() }
        });
        await prisma.escrowLog.create({
          data: {
            transactionId: tx.id,
            action: 'refunded',
            details: 'Skin not found in buyer inventory, refund + seller soft-banned.',
          },
        });
        await notifyUser(tx.sellerId, "Vente annulée & sanction", "Vous avez été temporairement banni pour annulation de trade.");
        await notifyUser(tx.buyerId, "Achat remboursé", "Le skin n’a pas été reçu, vous avez été remboursé.");
      }
    } catch (err: any) {
      let reason = 'unknown';
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) reason = 'inventory_private';
        else if (err.code === 'ECONNABORTED') reason = 'steam_timeout';
        else reason = 'steam_unavailable';
      }
      await prisma.escrowLog.create({
        data: {
          transactionId: tx.id,
          action: 'error',
          details: reason,
        },
      });
      // La prochaine exécution du CRON retentera automatiquement
    }
  }
}

// Pour node-cron local
if (require.main === module) {
  import('node-cron').then(cron => {
    cron.schedule('*/30 * * * *', async () => {
      console.log('Lancement du job CRON escrow...');
      await verifyEscrowTransactions();
    });
  });
} 