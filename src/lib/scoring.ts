/**
 * Scoring logic for MMA picks
 * 
 * Scoring Rules:
 * - Correct Winner only: 1 point
 * - Correct Winner + Method: 3 points
 * - Correct Winner + Method + Round (for KO/SUB): 5 points
 * - Incorrect Winner: 0 points
 * 
 * Note: Decision picks have no round component, so max is 3 points
 */

import { prisma } from "@/lib/prisma"

interface Pick {
    winner: string
    method: string
    round: number
}

interface FightResult {
    winner: string
    method: string
    round: number
}

/**
 * Calculate points for a pick based on the actual fight result
 */
export function calculatePickScore(pick: Pick, result: FightResult): number {
    // Normalize method values for comparison
    const normalizeMethod = (method: string): string => {
        const m = method.toUpperCase()
        if (m === 'KO' || m === 'KO/TKO') return 'KO'
        if (m === 'SUB' || m === 'SUBMISSION') return 'SUB'
        if (m === 'DEC' || m === 'DECISION') return 'DEC'
        return m
    }

    const pickMethod = normalizeMethod(pick.method)
    const resultMethod = normalizeMethod(result.method)

    // Wrong winner = 0 points
    if (pick.winner !== result.winner) {
        return 0
    }

    // Correct winner + method
    if (pickMethod === resultMethod) {
        // For Decision, there's no round to predict, so max is 3 points
        if (resultMethod === 'DEC') {
            return 3
        }

        // For KO/SUB, check if round also matches
        if (pick.round === result.round) {
            return 5 // Perfect pick: winner + method + round
        }

        return 3 // Correct winner + method, wrong round
    }

    // Wrong method, but check if round is correct (only for non-Decision results)
    if (resultMethod !== 'DEC' && pick.round === result.round) {
        return 2 // Correct winner + round, wrong method
    }

    // Correct winner only
    return 1
}

/**
 * Calculate and update points for all picks on a fight after result is set
 */
export async function calculatePointsForFight(fightId: string) {
    const fight = await prisma.fight.findUnique({
        where: { id: fightId },
        include: { picks: true }
    })

    if (!fight || !fight.winner || !fight.method || fight.round === null) {
        return { error: "Fight not found or result not complete" }
    }

    // Resolve winner name if stored as 'A' or 'B'
    let winnerName = fight.winner
    if (fight.winner === 'A') winnerName = fight.fighterA
    if (fight.winner === 'B') winnerName = fight.fighterB

    const fightResult: FightResult = {
        winner: winnerName,
        method: fight.method,
        round: fight.round
    }

    let updates = 0

    for (const pick of fight.picks) {
        const pickData: Pick = {
            winner: pick.winner,
            method: pick.method,
            round: pick.round
        }

        const points = calculatePickScore(pickData, fightResult)

        // Update pick points
        await prisma.pick.update({
            where: { id: pick.id },
            data: { points }
        })

        updates++
    }

    // Recalculate total points for all users who made picks on this fight
    const userIds = [...new Set(fight.picks.map(p => p.userId))]

    for (const userId of userIds) {
        await recalculateUserTotalPoints(userId)
    }

    return { success: true, updates }
}

/**
 * Recalculate total points for a user based on all their picks
 */
export async function recalculateUserTotalPoints(userId: string) {
    const picks = await prisma.pick.findMany({
        where: { userId },
        select: { points: true }
    })

    const totalPoints = picks.reduce((sum, pick) => sum + (pick.points || 0), 0)

    await prisma.user.update({
        where: { id: userId },
        data: { points: totalPoints }
    })

    return totalPoints
}
