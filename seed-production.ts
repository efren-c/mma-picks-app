import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const badges = [
    { name: 'First Pick', description: 'Made your first prediction.', icon: 'Target' },
    { name: 'Perfect Event', description: 'Predicted all fights correctly in a single event.', icon: 'Trophy' },
    { name: 'Underdog Hunter', description: 'Correctly predicted an underdog win.', icon: 'Dog' },
    { name: 'Veteran', description: 'Participated in 5 events.', icon: 'Medal' },
];

async function seed() {
    console.log('🌱 Seeding production database...');

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { name: badge.name },
            update: badge,
            create: badge,
        });
        console.log(`✓ Badge created: ${badge.name}`);
    }

    console.log('✅ Badges seeded successfully!');
    await prisma.$disconnect();
}

seed().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
