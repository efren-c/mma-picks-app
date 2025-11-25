'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function submitPick(fightId: string, winner: string, method: string, round: number) {
    const session = await auth()

    if (!session?.user?.email) {
        return { error: "You must be logged in to make a pick" }
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return { error: "User not found" }
    }

    try {
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
