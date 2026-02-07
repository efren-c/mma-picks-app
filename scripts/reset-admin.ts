import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

import fs from 'fs'

// Manually parse .env.local to force override
const envLocalPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envLocalPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envLocalPath))
    for (const k in envConfig) {
        process.env[k] = envConfig[k]
    }
}

const prisma = new PrismaClient()

async function resetAndTest() {
    const email = 'topevonteese@gmail.com'
    const newPassword = 'admin123'

    console.log(`\n🔄 Resetting password for: ${email}\n`)

    try {
        // Generate new hash
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        console.log(`New password hash: ${hashedPassword.substring(0, 30)}...`)

        // Update user
        const user = await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                role: 'ADMIN',
                emailVerified: new Date(), // Ensure email is verified
            },
        })

        console.log('\n✅ Password reset successful!')
        console.log(`Email: ${user.email}`)
        console.log(`Username: ${user.username}`)
        console.log(`Role: ${user.role}`)
        console.log(`Email Verified: ${user.emailVerified ? 'Yes' : 'No'}`)

        // Test the password
        const testMatch = await bcrypt.compare(newPassword, hashedPassword)
        console.log(`\n🧪 Password verification test: ${testMatch ? '✅ PASS' : '❌ FAIL'}`)

        if (testMatch) {
            console.log('\n🎉 You can now log in with:')
            console.log(`   Email: ${email}`)
            console.log(`   Password: ${newPassword}`)
        }
    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

resetAndTest()
