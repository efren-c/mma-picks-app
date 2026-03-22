import { z } from 'zod'
import validator from 'validator'

// ============================================================================
// SANITIZATION UTILITIES
// ============================================================================

/**
 * Sanitizes HTML to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
    return validator.escape(input.trim())
}

/**
 * Normalizes email addresses
 */
export function normalizeEmail(email: string): string {
    return validator.normalizeEmail(email) || email.toLowerCase().trim()
}

/**
 * Validates and sanitizes username
 */
export function sanitizeUsername(username: string): string {
    return username.trim().replace(/[^a-zA-Z0-9_-]/g, '')
}

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const LoginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .transform(normalizeEmail),
    password: z
        .string()
        .min(1, 'Password is required')
        .max(128, 'Password is too long'),
})

export const RegisterSchema = z.object({
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be at most 30 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
        .transform(sanitizeUsername),
    email: z
        .string()
        .email('Invalid email address')
        .transform(normalizeEmail),
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(128, 'Password is too long'),
})

export const PasswordResetRequestSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address')
        .transform(normalizeEmail),
})

export const PasswordResetSchema = z.object({
    password: z
        .string()
        .min(6, 'Password must be at least 6 characters')
        .max(128, 'Password is too long'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

export const EmailVerificationTokenSchema = z
    .string()
    .length(64, 'Invalid verification token')
    .regex(/^[a-f0-9]+$/, 'Invalid verification token format')

// ============================================================================
// PICK SUBMISSION SCHEMAS
// ============================================================================

export const PickSchema = z.object({
    fightId: z
        .string()
        .min(1, 'Invalid fight ID'),
    winner: z
        .enum(['A', 'B'], {
            message: 'Winner must be either Fighter A or Fighter B',
        }),
    method: z
        .enum(['KO', 'SUB', 'DEC'], {
            message: 'Method must be KO/TKO, Submission, or Decision',
        }),
    round: z
        .number()
        .int('Round must be a whole number')
        .min(0, 'Round must be at least 0')
        .max(5, 'Round must be at most 5'),
})

// ============================================================================
// ADMIN SCHEMAS
// ============================================================================

export const EventSchema = z.object({
    name: z
        .string()
        .min(1, 'Event name is required')
        .max(200, 'Event name is too long')
        .transform(sanitizeHtml),
    date: z
        .string()
        .min(1, 'Date is required')
        .refine((date) => {
            const parsed = new Date(date)
            return !isNaN(parsed.getTime())
        }, 'Invalid date format'),
    image: z
        .string()
        .url('Invalid image URL')
        .optional()
        .or(z.literal('')),
})

export const FightSchema = z.object({
    fighterA: z
        .string()
        .min(1, 'Fighter A is required')
        .max(100, 'Fighter name is too long')
        .transform(sanitizeHtml),
    fighterB: z
        .string()
        .min(1, 'Fighter B is required')
        .max(100, 'Fighter name is too long')
        .transform(sanitizeHtml),
    order: z
        .string()
        .min(1, 'Order is required')
        .refine((val) => {
            const num = parseInt(val, 10)
            return !isNaN(num) && num > 0
        }, 'Order must be a positive number'),
    scheduledRounds: z
        .string()
        .optional()
        .refine((val) => {
            if (!val) return true
            const num = parseInt(val, 10)
            return num === 3 || num === 5
        }, 'Scheduled rounds must be either 3 or 5'),
})

export const ResultSchema = z
    .object({
        winner: z.enum(['A', 'B'], {
            message: 'Winner must be either A or B',
        }),
        method: z.enum(['KO', 'SUB', 'DEC'], {
            message: 'Method must be KO, SUB, or DEC',
        }),
        round: z
            .string()
            .optional(),
    })
    .refine(
        (data) => {
            // Round is required for KO and SUB, but not for DEC
            if (data.method === 'DEC') return true
            return data.round && data.round.length > 0
        },
        {
            message: 'Round is required for KO/TKO and Submission',
            path: ['round'],
        }
    )
    .refine(
        (data) => {
            // Validate round is a number between 1-5 if provided
            if (!data.round) return true
            const num = parseInt(data.round, 10)
            return !isNaN(num) && num >= 1 && num <= 5
        },
        {
            message: 'Round must be between 1 and 5',
            path: ['round'],
        }
    )

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type PasswordResetRequestInput = z.infer<typeof PasswordResetRequestSchema>
export type PasswordResetInput = z.infer<typeof PasswordResetSchema>
export type PickInput = z.infer<typeof PickSchema>
export type EventInput = z.infer<typeof EventSchema>
export type FightInput = z.infer<typeof FightSchema>
export type ResultInput = z.infer<typeof ResultSchema>
