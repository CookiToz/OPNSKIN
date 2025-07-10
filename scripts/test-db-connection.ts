import { PrismaClient } from '@prisma/client';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL non définie');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    // Test simple : compter les utilisateurs
    const count = await prisma.user.count();
    console.log('✅ Connexion réussie à la base ! Nombre d’utilisateurs :', count);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur de connexion à la base :', err);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 