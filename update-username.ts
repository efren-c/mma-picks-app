import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUsername() {
    const email = process.argv[2];
    const newUsername = process.argv[3];

    if (!email || !newUsername) {
        console.error('❌ Usage: npx tsx update-username.ts <email> <new-username>');
        process.exit(1);
    }

    console.log(`👤 Updating username for ${email}...`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { username: newUsername },
        });

        console.log(`✅ Username updated successfully!`);
        console.log(`   Email: ${user.email}`);
        console.log(`   New Username: ${user.username}`);
    } catch (error: any) {
        if (error.code === 'P2025') {
            console.error('❌ User not found!');
        } else if (error.code === 'P2002') {
            console.error('❌ Username already taken!');
        } else {
            console.error('❌ Failed to update username:', error.message);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

updateUsername();
