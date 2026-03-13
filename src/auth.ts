import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { Redis } from "@upstash/redis"
import { randomBytes } from "crypto"

const redis = Redis.fromEnv()

// TTL for refresh tokens in Redis — must match session.maxAge
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

// Rotate only when the refresh token has less than this many seconds left  
// (avoids a Redis write on every single request)
const ROTATE_WITHIN_SECONDS = 24 * 60 * 60 // 1 day

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

/** Stores a new refresh token in Redis. Returns the token string. */
async function createRefreshToken(userId: string, tokenVersion: number): Promise<string> {
    const token = randomBytes(64).toString("hex")
    await redis.set(
        `refresh:${token}`,
        JSON.stringify({ userId, tokenVersion }),
        { ex: REFRESH_TOKEN_TTL_SECONDS }
    )
    return token
}

/** Deletes a refresh token from Redis. */
async function deleteRefreshToken(token: string): Promise<void> {
    await redis.del(`refresh:${token}`)
}

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        if (!user.emailVerified) {
                            return null;
                        }
                        return user;
                    }
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, trigger }) {
            // ── 1. On sign-in: populate token and issue a fresh refresh token ──────
            if (trigger === 'signIn' || trigger === 'signUp') {
                if (user) {
                    token.username = user.username
                    token.role = user.role
                    token.sub = user.id

                    try {
                        const dbUser = await prisma.user.findUnique({
                            where: { id: user.id },
                            select: { tokenVersion: true }
                        })
                        const tokenVersion = dbUser?.tokenVersion ?? 0
                        token.refreshToken = await createRefreshToken(user.id!, tokenVersion)
                    } catch (error) {
                        console.error("Failed to create refresh token on sign-in:", error)
                    }
                }
                return token
            }

            // ── 2. On subsequent validate calls: check refresh token validity ──────
            if (token.sub && token.refreshToken) {
                try {
                    const stored = await redis.get<string>(`refresh:${token.refreshToken}`)

                    // Refresh token not found in Redis (expired or revoked) → sign out
                    if (!stored) {
                        console.warn("Refresh token not found in Redis — invalidating session")
                        return null
                    }

                    const { userId, tokenVersion } = JSON.parse(stored) as {
                        userId: string
                        tokenVersion: number
                    }

                    // Sanity check: token belongs to this user
                    if (userId !== token.sub) {
                        console.warn("Refresh token userId mismatch — invalidating session")
                        await deleteRefreshToken(token.refreshToken)
                        return null
                    }

                    // ── 3. DB check: password changed or global logout (tokenVersion bump) ──
                    const existingUser = await prisma.user.findUnique({
                        where: { id: token.sub },
                        select: {
                            lastPasswordChange: true,
                            username: true,
                            role: true,
                            tokenVersion: true,
                        }
                    })

                    if (!existingUser) {
                        await deleteRefreshToken(token.refreshToken)
                        return null // User deleted
                    }

                    // Global logout: tokenVersion was incremented via revokeAllSessions()
                    if (existingUser.tokenVersion !== tokenVersion) {
                        console.log("Token version mismatch — all sessions revoked for user")
                        await deleteRefreshToken(token.refreshToken)
                        return null
                    }

                    // Password changed after token was issued
                    if (existingUser.lastPasswordChange) {
                        const lastChangeTime = Math.floor(existingUser.lastPasswordChange.getTime() / 1000)
                        const tokenIssuedAt = token.iat as number
                        if (lastChangeTime > tokenIssuedAt + 1) {
                            await deleteRefreshToken(token.refreshToken)
                            return null // Invalidate session
                        }
                    }

                    // Keep token fields fresh from DB
                    token.username = existingUser.username
                    token.role = existingUser.role

                    // ── 4. Rotation: only if the refresh token is within 1 day of expiry ──
                    const ttlRemaining = await redis.ttl(`refresh:${token.refreshToken}`)
                    if (ttlRemaining !== -1 && ttlRemaining < ROTATE_WITHIN_SECONDS) {
                        const oldRefreshToken = token.refreshToken
                        token.refreshToken = await createRefreshToken(token.sub, existingUser.tokenVersion)
                        await deleteRefreshToken(oldRefreshToken)
                    }

                } catch (error) {
                    console.error("Session verification failed:", error)
                    // Don't invalidate on transient Redis/DB errors — fail open
                }
            }

            return token
        },
    },
});
