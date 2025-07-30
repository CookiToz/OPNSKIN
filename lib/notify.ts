export async function notifyUser(userId: string, title: string, message: string) {
  // À adapter à ton système de notifications (DB, email, etc.)
  // Ex: await prisma.notification.create({ data: { userId, title, message } });
  console.log(`[NOTIFY] ${userId}: ${title} - ${message}`);
} 