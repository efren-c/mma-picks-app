'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function submitPick(fightId: string, winner: string, method: string, round: number) {
    const session = await auth()

    if (!session?.user?.email) {
        return { error: "You must be logged in to make a pick" }
    }

    // Validate inputs - Import PickSchema at the top if not already done
    const { PickSchema } = await import('@/lib/validation-schemas')
    const validatedFields = PickSchema.safeParse({
        fightId,
        winner,
        method,
        round,
    })

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]
        return { error: firstError?.[0] || 'Invalid pick data' }
    }

    const validatedData = validatedFields.data

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return { error: "User not found" }
    }

    try {
        // Get fight and event details to check start time
        const fight = await prisma.fight.findUnique({
            where: { id: fightId },
            include: { event: true }
        })

        if (!fight) {
            return { error: "Fight not found" }
        }

        // Check if event has started
        if (new Date() > new Date(fight.event.date)) {
            return { error: "Event has already started. Picks are locked." }
        }

        // Check if pick already exists
        const existingPick = await prisma.pick.findFirst({
            where: {
                userId: user.id,
                fightId
            }
        })

        if (existingPick) {
            // Update existing pick
            await prisma.pick.update({
                where: { id: existingPick.id },
                data: {
                    winner,
                    method,
                    round
                }
            })
        } else {
            // Create new pick
            await prisma.pick.create({
                data: {
                    userId: user.id,
                    fightId,
                    winner,
                    method,
                    round
                }
            })
        }

        revalidatePath(`/events/${fight.eventId}`)
        revalidatePath(`/events`)
        return { success: true }
    } catch (error) {
        console.error("Failed to submit pick:", error)
        return { error: "Failed to submit pick" }
    }
}

export async function getUserPick(fightId: string) {
    const session = await auth()

    if (!session?.user?.email) {
        return null
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return null
    }

    const pick = await prisma.pick.findFirst({
        where: {
            userId: user.id,
            fightId
        }
    })

    return pick
}