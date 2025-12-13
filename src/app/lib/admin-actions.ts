'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { EventSchema, FightSchema, ResultSchema } from '@/lib/validation-schemas'
import { fromZonedTime } from 'date-fns-tz'

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

    // Dynamic import to avoid earlier issues if utils wasn't ready, but standard import is fine now
    const { slugify } = await import('@/lib/utils')
    let slug = slugify(name)

    // Simple uniqueness check could be added here similar to migration script, 
    // but for now relying on database constraint to fail if duplicate.
    // In a real app we'd retry with suffix.

    let event
    try {
        event = await prisma.event.create({
            data: {
                name,
                slug,
                date: fromZonedTime(date as string, 'America/Mexico_City'),
                image: image || null,
            },
        })
    } catch (error) {
        console.error("Failed to create event:", error)
        // Fallback for duplicates - append random suffix
        try {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`
            event = await prisma.event.create({
                data: {
                    name,
                    slug,
                    date: fromZonedTime(date as string, 'America/Mexico_City'),
                    image: image || null,
                },
            })
        } catch (retryError) {
            return { message: 'Failed to create event' }
        }
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
    const { slugify } = await import('@/lib/utils')
    const slug = slugify(name)

    try {
        await prisma.event.update({
            where: { id: eventId },
            data: {
                name,
                slug, // Update slug when name changes
                date: fromZonedTime(date as string, 'America/Mexico_City'),
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



export async function createFight(
    eventId: string,
    prevState: { message?: string } | undefined,
    formData: FormData
) {
    await requireAdmin()

    const validatedFields = FightSchema.safeParse({
        fighterA: formData.get('fighterA'),
        fighterB: formData.get('fighterB'),
        order: '1', // Temporary, will calculate actual order
        scheduledRounds: formData.get('scheduledRounds') || '3',
    })

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]
        return { message: firstError?.[0] || 'Invalid fields' }
    }

    const { fighterA, fighterB } = validatedFields.data
    const scheduledRounds = parseInt(formData.get('scheduledRounds') as string) || 3

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

    const validatedFields = FightSchema.safeParse({
        fighterA: formData.get('fighterA'),
        fighterB: formData.get('fighterB'),
        order: '1', // Not changing order in update
        scheduledRounds: formData.get('scheduledRounds') || '3',
    })

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]
        return { message: firstError?.[0] || 'Invalid fields' }
    }

    const { fighterA, fighterB } = validatedFields.data
    const scheduledRounds = parseInt(formData.get('scheduledRounds') as string) || 3

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
        // Find picks associated with this fight to know which users need recalculation
        const picks = await prisma.pick.findMany({
            where: { fightId },
            select: { userId: true }
        })

        const affectedUserIds = [...new Set(picks.map(p => p.userId))]

        // Delete all picks for this fight
        await prisma.pick.deleteMany({
            where: { fightId }
        })

        // Delete the fight
        await prisma.fight.delete({
            where: { id: fightId },
        })

        // Recalculate total points for affected users
        // This ensures if points were already awarded, the user's total is corrected.
        if (affectedUserIds.length > 0) {
            const { recalculateUserTotalPoints } = await import('@/lib/scoring')
            for (const userId of affectedUserIds) {
                await recalculateUserTotalPoints(userId)
            }
        }

        revalidatePath(`/admin/events/${eventId}`)
        return { message: 'Fight deleted successfully' }
    } catch (error) {
        console.error('Error deleting fight:', error)
        return { message: 'Failed to delete fight' }
    }
}

export async function reorderFight(
    fightId: string,
    eventId: string,
    direction: 'UP' | 'DOWN'
) {
    await requireAdmin()

    try {
        const fight = await prisma.fight.findUnique({
            where: { id: fightId },
        })

        if (!fight) return { message: 'Fight not found' }

        const currentOrder = fight.order
        const targetOrder = direction === 'UP' ? currentOrder - 1 : currentOrder + 1

        // Find the fight at the target order
        const otherFight = await prisma.fight.findFirst({
            where: {
                eventId,
                order: targetOrder,
            },
        })

        if (!otherFight) return { message: 'Cannot move further' }

        // Swap orders
        await prisma.$transaction([
            prisma.fight.update({
                where: { id: fightId },
                data: { order: targetOrder },
            }),
            prisma.fight.update({
                where: { id: otherFight.id },
                data: { order: currentOrder },
            }),
        ])

        revalidatePath(`/admin/events/${eventId}`)
        return { message: 'Fight reordered' }
    } catch (error) {
        console.error('Error reordering fight:', error)
        return { message: 'Failed to reorder fight' }
    }
}
