import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
        console.error('❌ Usage: npx tsx update-password.ts <email> <new-password>');
        process.exit(1);
    }

    console.log(`🔐 Updating password for ${email}...`);

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        console.log(`✅ Password updated successfully!`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
    } catch (error: any) {
        if (error.code === 'P2025') {
            console.error('❌ User not found!');
        } else {
            console.error('❌ Failed to update password:', error.message);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

updatePassword();
