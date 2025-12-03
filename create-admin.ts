import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = process.argv[2];
    const username = process.argv[3];
    const password = process.argv[4];

    if (!email || !username || !password) {
        console.error('❌ Usage: npx tsx create-admin.ts <email> <username> <password>');
        process.exit(1);
    }

    console.log('👤 Creating admin user...');

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        console.log(`✅ Admin user created successfully!`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   ID: ${admin.id}`);
    } catch (error: any) {
        if (error.code === 'P2002') {
            console.error('❌ User with this email or username already exists!');
        } else {
            console.error('❌ Failed to create admin:', error.message);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
