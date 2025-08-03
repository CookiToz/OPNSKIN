import { prisma } from '../lib/prisma';

export async function creditWallet(userId: string, amount: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { walletBalance: { increment: amount } }
  });
}

export async function debitWallet(userId: string, amount: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { walletBalance: { decrement: amount } }
  });
} 