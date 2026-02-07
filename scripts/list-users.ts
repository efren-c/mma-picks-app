import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
            },
        })

        console.log('\n📋 Users in database:\n')
        users.forEach((user, index) => {
            console.log(`${index + 1}. Email: ${user.email}`)
            console.log(`   Username: ${user.username}`)
            console.log(`   Role: ${user.role}`)
            console.log(`   ID: ${user.id}\n`)
        })

        if (users.length === 0) {
            console.log('⚠️  No users found in database')
        }
    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

listUsers()
