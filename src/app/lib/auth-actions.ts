'use server'

import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { sendPasswordResetEmail } from '@/lib/email'

export async function requestPasswordReset(
    prevState: { message?: string } | undefined,
    formData: FormData
) {
    const email = formData.get('email')

    if (!email || typeof email !== 'string') {
        return { message: 'Invalid email' }
    }

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
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (!password || !confirmPassword || typeof password !== 'string' || typeof confirmPassword !== 'string') {
        return { message: 'Invalid inputs' }
    }

    if (password !== confirmPassword) {
        return { message: 'Passwords do not match' }
    }

    if (password.length < 6) {
        return { message: 'Password must be at least 6 characters' }
    }

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
        },
    })

    redirect('/login?reset=success')
}
