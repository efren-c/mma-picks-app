'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

async function requireAdmin() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (user?.role !== 'ADMIN') {
        redirect('/')
    }

    return user
}

const EventSchema = z.object({
    name: z.string().min(1, 'Event name is required'),
    date: z.string().min(1, 'Date is required'),
    image: z.string().optional(),
})

export async function createEvent(
    prevState: { message?: string } | undefined,
    formData: FormData
) {
    await requireAdmin()

    const validatedFields = EventSchema.safeParse({
        name: formData.get('name'),
        date: formData.get('date'),
        image: formData.get('image'),
    })

    if (!validatedFields.success) {
        return { message: 'Invalid fields' }
    }

    const { name, date, image } = validatedFields.data

    let event
    try {
        event = await prisma.event.create({
            data: {
                name,
                date: new Date(date),
                image: image || null,
            },
        })
    } catch (error) {
        return { message: 'Failed to create event' }
    }

    revalidatePath('/admin')
    redirect(`/admin/events/${event.id}`)
}

export async function updateEvent(
    eventId: string,
    prevState: { message?: string } | undefined,
    formData: FormData
) {
    await requireAdmin()

    const validatedFields = EventSchema.safeParse({
        name: formData.get('name'),
        date: formData.get('date'),
        image: formData.get('image'),
    })

    if (!validatedFields.success) {
        return { message: 'Invalid fields' }
    }

    const { name, date, image } = validatedFields.data

    try {
        await prisma.event.update({
            where: { id: eventId },
            data: {
                name,
                date: new Date(date),
                image: image || null,
            },
        })

        revalidatePath('/admin')
        revalidatePath(`/admin/events/${eventId}`)
        return { message: 'Event updated successfully' }
    } catch (error) {
        return { message: 'Failed to update event' }
    }
}

const FightSchema = z.object({
    fighterA: z.string().min(1, 'Fighter A is required'),
    fighterB: z.string().min(1, 'Fighter B is required'),
    order: z.string().min(1, 'Order is required'),
})

export async function createFight(
    eventId: string,
    prevState: { message?: string } | undefined,
    formData: FormData
) {
    await requireAdmin()

    const fighterA = formData.get('fighterA')
    const fighterB = formData.get('fighterB')
    const scheduledRounds = parseInt(formData.get('scheduledRounds') as string) || 3

    if (!fighterA || !fighterB || typeof fighterA !== 'string' || typeof fighterB !== 'string') {
        return { message: 'Invalid fields' }
    }

    try {
        // Get current max order
        const lastFight = await prisma.fight.findFirst({
            where: { eventId },
            orderBy: { order: 'desc' },
        })

        const nextOrder = (lastFight?.order ?? 0) + 1

        await prisma.fight.create({
            data: {
                eventId,
                fighterA,
                fighterB,
                order: nextOrder,
                scheduledRounds,
            },
        })

        revalidatePath(`/admin/events/${eventId}`)
        return { message: 'Fight added successfully' }
    } catch (error) {
        return { message: 'Failed to create fight' }
    }
}

export async function updateFight(
    fightId: string,
    eventId: string,
    prevState: { message?: string } | undefined,
    formData: FormData
) {
    await requireAdmin()

    const fighterA = formData.get('fighterA')
    const fighterB = formData.get('fighterB')
    const scheduledRounds = parseInt(formData.get('scheduledRounds') as string) || 3

    if (!fighterA || !fighterB || typeof fighterA !== 'string' || typeof fighterB !== 'string') {
        return { message: 'Invalid fields' }
    }

    try {
        await prisma.fight.update({
            where: { id: fightId },
            data: {
                fighterA,
                fighterB,
                scheduledRounds,
            },
        })

        revalidatePath(`/admin/events/${eventId}`)
        return { message: 'Fight updated successfully' }
    } catch (error) {
        return { message: 'Failed to update fight' }
    }
}

const ResultSchema = z.object({
    winner: z.enum(['A', 'B']),
    method: z.enum(['KO', 'SUB', 'DEC']),
    round: z.string().optional(),
}).refine(
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

export async function updateFightResult(
    fightId: string,
    prevState: { message?: string } | undefined,
    formData: FormData
) {
    await requireAdmin()

    const validatedFields = ResultSchema.safeParse({
        winner: formData.get('winner'),
        method: formData.get('method'),
        round: formData.get('round'),
    })

    if (!validatedFields.success) {
        return { message: 'Invalid fields' }
    }

    const { winner, method, round } = validatedFields.data

    try {
        await prisma.fight.update({
            where: { id: fightId },
            data: {
                winner,
                method,
                // For decisions, set round to 0; otherwise parse the round value
                round: method === 'DEC' ? 0 : parseInt(round || '0'),
            },
        })

        // Calculate points for all picks on this fight
        const { calculatePointsForFight } = await import('@/lib/scoring')
        await calculatePointsForFight(fightId)

        revalidatePath('/admin')
        revalidatePath('/events')
        revalidatePath('/dashboard')
        return { message: 'Result updated successfully' }
    } catch (error) {
        return { message: 'Failed to update result' }
    }
}

export async function deleteEvent(eventId: string) {
    await requireAdmin()

    try {
        // First, get all fights for this event
        const fights = await prisma.fight.findMany({
            where: { eventId },
            select: { id: true }
        })

        // Get all picks for these fights to know which users to update
        let affectedUserIds: string[] = []
        if (fights.length > 0) {
            const picks = await prisma.pick.findMany({
                where: {
                    fightId: {
                        in: fights.map(f => f.id)
                    }
                },
                select: { userId: true }
            })

            affectedUserIds = [...new Set(picks.map(p => p.userId))]

            // Delete all picks for these fights
            await prisma.pick.deleteMany({
                where: {
                    fightId: {
                        in: fights.map(f => f.id)
                    }
                }
            })
        }

        // Delete all fights for this event
        await prisma.fight.deleteMany({
            where: { eventId }
        })

        // Finally, delete the event
        await prisma.event.delete({
            where: { id: eventId },
        })

        // Recalculate total points for affected users
        const { recalculateUserTotalPoints } = await import('@/lib/scoring')
        for (const userId of affectedUserIds) {
            await recalculateUserTotalPoints(userId)
        }

        revalidatePath('/admin')
        revalidatePath('/dashboard')

        return { success: true }
    } catch (error) {
        console.error('Error deleting event:', error)
        return { message: 'Failed to delete event' }
    }
}

export async function deleteFight(fightId: string, eventId: string) {
    await requireAdmin()

    try {
        await prisma.fight.delete({
            where: { id: fightId },
        })

        revalidatePath(`/admin/events/${eventId}`)
        return { message: 'Fight deleted successfully' }
    } catch (error) {
        return { message: 'Failed to delete fight' }
    }
}
