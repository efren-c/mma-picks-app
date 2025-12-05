import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser() {
    const email = process.argv[2];

    if (!email) {
        console.error('❌ Usage: npx tsx delete-user.ts <email>');
        process.exit(1);
    }

    console.log(`🗑️  Looking for user with email: ${email}...`);

    try {
        // First, find the user to confirm
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                picks: true,
                badges: true,
            },
        });

        if (!user) {
            console.error('❌ User not found!');
            process.exit(1);
        }

        console.log(`\n⚠️  Found user:`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Picks: ${user.picks.length}`);
        console.log(`   Badges: ${user.badges.length}`);

        // Delete related data first (cascading delete)
        console.log(`\n🗑️  Deleting user and all related data...`);

        // Delete in transaction to ensure atomicity
        await prisma.$transaction([
            prisma.userBadge.deleteMany({ where: { userId: user.id } }),
            prisma.pick.deleteMany({ where: { userId: user.id } }),
            prisma.user.delete({ where: { id: user.id } }),
        ]);

        console.log(`✅ User deleted successfully!`);
    } catch (error: any) {
        console.error('❌ Failed to delete user:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

deleteUser();
