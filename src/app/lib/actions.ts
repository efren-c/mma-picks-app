'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function authenticate(
    prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    try {
        await signIn('credentials', {
            ...Object.fromEntries(formData),
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

const RegisterSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function register(
    prevState: { message: string } | undefined,
    formData: FormData
) {
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

        await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        })

        // Automatically sign in the newly created user
        await signIn('credentials', {
            email,
            password,
            redirect: false,
        })
    } catch (error) {
        return { message: 'Database Error: Failed to Create User.' }
    }

    // Redirect to home page after successful registration and login
    redirect('/')
}
