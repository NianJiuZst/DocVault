import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function cleanDatabase() {
  // Delete in correct order to respect FK constraints (children first, then parents)
  await prisma.documentShare.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();
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
