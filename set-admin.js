const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setAdmin() {
    try {
        const email = 'topevonteese@gmail.com';

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log(`❌ User with email ${email} not found.`);
            console.log('Please make sure the user has created an account first.');
            return;
        }

        // Update the user role to ADMIN
        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });

        console.log(`✅ Successfully set ${email} as ADMIN`);
        console.log(`User details:`, {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            role: updatedUser.role
        });
    } catch (error) {
        console.error('❌ Error setting admin role:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setAdmin();
