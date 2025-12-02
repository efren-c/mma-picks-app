import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const badges = [
  {
    name: 'First Pick',
    description: 'Made your first prediction.',
    icon: 'Target', // Lucide icon name
  },
  {
    name: 'Perfect Event',
    description: 'Predicted all fights correctly in a single event.',
    icon: 'Trophy',
  },
  {
    name: 'Underdog Hunter',
    description: 'Correctly predicted an underdog win.',
    icon: 'Dog',
  },
  {
    name: 'Veteran',
    description: 'Participated in 5 events.',
    icon: 'Medal',
  },
];

async function main() {
  console.log('Seeding badges...');
  for (const badge of badges) {
    const existing = await prisma.badge.findUnique({
      where: { name: badge.name },
    });
    if (!existing) {
      await prisma.badge.create({
        data: badge,
      });
      console.log(`Created badge: ${badge.name}`);
    } else {
      console.log(`Badge already exists: ${badge.name}`);
    }
  }
  console.log('Badge seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
