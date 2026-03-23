import { authConfig } from '@/auth.config'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Redis } from '@upstash/redis'
import { randomBytes } from 'crypto'

const redis = Redis.fromEnv()

async function getUser(email: string) {
    return prisma.user.findUnique({ where: { email } })
}

// Emulate token issuance
async function test() {
    console.log("Starting backend test...")
    const user = await getUser("admin@mmapicks.com") || await getUser("test@example.com")
    if (!user) {
        console.error("No test user found in DB")
        return
    }

    console.log(`Found test user: ${user.email} (ID: ${user.id})`)

    // Emulate "signIn" trigger in JWT callback
    const token: any = {}
    token.username = user.username
    token.role = user.role
    token.sub = user.id

    const tokenVersion = user.tokenVersion ?? 0
    const refreshToken = randomBytes(64).toString("hex")
    console.log(`Generated refresh token: ${refreshToken.substring(0, 10)}...`)

    await redis.set(`refresh:${refreshToken}`, JSON.stringify({ userId: user.id, tokenVersion }), { ex: 604800 })
    console.log("Saved refresh token to Upstash Redis.")

    // Verify it exists in Redis
    const stored = await redis.get(`refresh:${refreshToken}`)
    console.log("Read back from Redis:", stored)

    // Clean up test token
    await redis.del(`refresh:${refreshToken}`)
    console.log("Cleaned up test token from Redis.")
}

test().catch(console.error)
