'use server'

import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { sendPasswordResetEmail } from '@/lib/email'
import { headers } from 'next/headers'
import { passwordResetRateLimit } from '@/lib/rate-limit'
import {
    PasswordResetRequestSchema,
    PasswordResetSchema,
    EmailVerificationTokenSchema,
} from '@/lib/validation-schemas'


export async function requestPasswordReset(
    prevState: { message?: string } | undefined,
    formData: FormData
) {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown'
    const { success } = await passwordResetRateLimit.limit(ip)

    if (!success) {
        return { message: 'Too many password reset attempts. Please try again later.' }
    }

    const validatedFields = PasswordResetRequestSchema.safeParse({
        email: formData.get('email'),
    })

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]
        return { message: firstError?.[0] || 'Invalid email' }
    }

    const { email } = validatedFields.data

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        // Don't reveal if user exists
        return { message: 'If an account exists with this email, you will receive a password reset link.' }
    }

    // Generate token
    const token = randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 3600000) // 1 hour from now

    await prisma.user.update({
        where: { email },
        data: {
            resetToken: token,
            resetTokenExpiry: expiry,
        },
    })

    // Send email via Resend
    const emailResult = await sendPasswordResetEmail({
        to: user.email,
        resetToken: token,
        username: user.username,
    })

    if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error)
        // Still return success message for security (don't reveal email exists)
    }

    return { message: 'If an account exists with this email, you will receive a password reset link.' }
}

export async function resetPassword(
    token: string,
    prevState: { message?: string } | undefined,
    formData: FormData
) {
    const validatedFields = PasswordResetSchema.safeParse({
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    })

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]
        return { message: firstError?.[0] || 'Invalid password' }
    }

    const { password } = validatedFields.data

    const user = await prisma.user.findUnique({
        where: { resetToken: token },
    })

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return { message: 'Invalid or expired token' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
            lastPasswordChange: new Date(),
        },
    })


    redirect('/login?reset=success')
}

export async function verifyEmail(token: string) {
    const validatedToken = EmailVerificationTokenSchema.safeParse(token)

    if (!validatedToken.success) {
        return { success: false, message: 'Invalid verification token' }
    }

    const user = await prisma.user.findUnique({
        where: { verificationToken: validatedToken.data },
    })

    if (!user) {
        return { success: false, message: 'Invalid token' }
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: new Date(),
            verificationToken: null,
        },
    })

    return { success: true, message: 'Email verified successfully' }
}
