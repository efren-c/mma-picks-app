'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { randomBytes } from 'crypto'
import { sendVerificationEmail } from '@/lib/email'
import { loginRateLimit, registrationRateLimit } from '@/lib/rate-limit'
import { LoginSchema, RegisterSchema } from '@/lib/validation-schemas'

export async function authenticate(
    prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    try {
        const ip = (await headers()).get('x-forwarded-for') || 'unknown'
        const { success } = await loginRateLimit.limit(ip)

        if (!success) {
            return { error: 'Too many login attempts. Please try again later.' }
        }

        // Validate input
        const validatedFields = LoginSchema.safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        })

        if (!validatedFields.success) {
            const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]
            return { error: firstError?.[0] || 'Invalid credentials' }
        }

        const { email, password } = validatedFields.data

        await signIn('credentials', {
            email,
            password,
            redirect: false,
        })
        return { success: true }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid credentials.' }
                default:
                    return { error: 'Something went wrong.' }
            }
        }
        throw error
    }
}



export async function register(
    prevState: { message: string } | undefined,
    formData: FormData
) {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const { success } = await registrationRateLimit.limit(ip)

    if (!success) {
        return { message: 'Too many registration attempts. Please try again later.' }
    }

    const validatedFields = RegisterSchema.safeParse(
        Object.fromEntries(formData.entries())
    )

    if (!validatedFields.success) {
        return {
            message: validatedFields.error.flatten().fieldErrors.password?.[0] || 'Invalid fields',
        }
    }

    const { username, email, password } = validatedFields.data

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        })

        if (existingUser) {
            return { message: 'User already exists' }
        }


        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationToken = randomBytes(32).toString('hex')

        await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                verificationToken,
            },
        })

        await sendVerificationEmail({
            to: email,
            token: verificationToken,
            username,
        })

    } catch (error) {
        console.error('Registration error:', error)
        return { message: 'Database Error: Failed to Create User.' }
    }

    // Redirect to verification page
    redirect('/verify-email')
}
