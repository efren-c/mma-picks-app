import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Explicitly load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

async function checkUser() {
    const email = process.argv[2] || 'topevonteese@gmail.com'

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                emailVerified: true,
                password: true,
            },
        })

        if (!user) {
            console.log(`❌ User not found: ${email}`)
            return
        }

        console.log('\n📋 User Details:\n')
        console.log(`Email: ${user.email}`)
        console.log(`Username: ${user.username}`)
        console.log(`Role: ${user.role}`)
        console.log(`Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`)
        console.log(`Password Hash: ${user.password.substring(0, 20)}...`)
        console.log(`\n⚠️  Email verification status: ${user.emailVerified ? 'VERIFIED' : 'NOT VERIFIED'}`)

        if (!user.emailVerified) {
            console.log('\n💡 This user cannot log in because their email is not verified.')
            console.log('   Run the following to verify the email:')
            console.log(`   npx tsx scripts/verify-email.ts ${email}`)
        }
    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUser()
