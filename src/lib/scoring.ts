import { prisma } from "@/lib/prisma"

export async function calculatePointsForFight(fightId: string) {
    const fight = await prisma.fight.findUnique({
        where: { id: fightId },
        include: { picks: true }
    })

    if (!fight || !fight.winner || !fight.method) {
        return { error: "Fight not found or not finished" }
    }

    let updates = 0

    for (const pick of fight.picks) {
        let points = 0

        // Winner correct: +10
        if (pick.winner === fight.winner) {
            points += 10
        }

        // Method correct: +5
        if (pick.method === fight.method) {
            points += 5
        }

        // Round correct: +5 (only if not Decision)
        if (fight.method !== 'Decision' && pick.round === fight.round) {
            points += 5
        }

        // Perfect pick bonus: +10
        // If decision: Winner + Method correct
        // If finish: Winner + Method + Round correct
        const isPerfect =
            (fight.method === 'Decision' && pick.winner === fight.winner && pick.method === fight.method) ||
            (fight.method !== 'Decision' && pick.winner === fight.winner && pick.method === fight.method && pick.round === fight.round)

        if (isPerfect) {
            points += 10
        }

        // Update pick points
        await prisma.pick.update({
            where: { id: pick.id },
            data: { points }
        })

        // Update user total points
        await prisma.user.update({
            where: { id: pick.userId },
            data: {
                points: {
                    increment: points
                }
            }
        })

        updates++
    }

    return { success: true, updates }
}
