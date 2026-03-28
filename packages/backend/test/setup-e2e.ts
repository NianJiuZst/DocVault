import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function cleanDatabase() {
  // Disable FK checks temporarily, truncate, re-enable
  await prisma.$executeRaw`
    ALTER TABLE "DocumentShare" DISABLE TRIGGER ALL;
    ALTER TABLE "DocumentVersion" DISABLE TRIGGER ALL;
    ALTER TABLE "Document" DISABLE TRIGGER ALL;
    ALTER TABLE "Template" DISABLE TRIGGER ALL;
    ALTER TABLE "User" DISABLE TRIGGER ALL;
  `;
  await prisma.$executeRaw`TRUNCATE TABLE "DocumentShare" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "DocumentVersion" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Document" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "Template" CASCADE`;
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  await prisma.$executeRaw`
    ALTER TABLE "DocumentShare" ENABLE TRIGGER ALL;
    ALTER TABLE "DocumentVersion" ENABLE TRIGGER ALL;
    ALTER TABLE "Document" ENABLE TRIGGER ALL;
    ALTER TABLE "Template" ENABLE TRIGGER ALL;
    ALTER TABLE "User" ENABLE TRIGGER ALL;
  `;
}

export async function seedTestUser() {
  return prisma.user.upsert({
    where: { githubUserId: 'e2e-test' },
    update: {},
    create: {
      name: 'e2e-test',
      githubUserId: 'e2e-test',
      avatar: '',
    },
  });
}
