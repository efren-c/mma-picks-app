
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Marking all existing users as verified...');

    const result = await prisma.user.updateMany({
        where: {
            emailVerified: null
        },
        data: {
            emailVerified: new Date(),
            verificationToken: null
        }
    });

    console.log(`Updated ${result.count} users.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
