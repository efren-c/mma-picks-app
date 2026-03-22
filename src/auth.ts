import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
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
            // 1. Standard token population
            if (trigger === 'signIn' || trigger === 'signUp') {
                if (user) {
                    token.username = user.username
                    token.role = user.role
                    token.sub = user.id
                }
            }

            // 2. Session invalidation: check if password changed after token issuance
            if (token.sub) {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { id: token.sub },
                        select: { lastPasswordChange: true, username: true, role: true }
                    })

                    if (!existingUser) return null; // User deleted

                    // Keep token up to date with DB changes
                    token.username = existingUser.username
                    token.role = existingUser.role

                    if (existingUser.lastPasswordChange) {
                        const lastChangeTime = Math.floor(existingUser.lastPasswordChange.getTime() / 1000)
                        const tokenIssuedAt = token.iat as number

                        // Allow 1 second clock skew
                        if (lastChangeTime > tokenIssuedAt + 1) {
                            return null // Invalidate session
                        }
                    }
                } catch (error) {
                    console.error("Session verification failed", error)
                }
            }

            return token
        },
    },
});
