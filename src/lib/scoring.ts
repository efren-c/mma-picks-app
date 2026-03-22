/**
 * Scoring logic for MMA picks
 * 
 * Scoring Rules:
 * - Winner Only: 2 points
 * - Winner + Method (inc. Decision): 5 points (2 + 3)
 * - Winner + Round (wrong method): 7 points (2 + 5)
 * - Perfect Pick (Winner + Method + Round): 10 points (2 + 3 + 5)
 * - Incorrect Winner: 0 points
 */

import { prisma } from "@/lib/prisma"
import { checkAndAwardBadges } from "@/app/lib/gamification-actions"

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

    let points = 2 // Base points for correct winner

    // Method Bonus: +3 points
    if (pickMethod === resultMethod) {
        points += 3
    }

    // Round Bonus: +5 points
    // Only applies if the fight was NOT a decision (since decisions have no round component)
    if (resultMethod !== 'DEC') {
        if (pick.round === result.round) {
            points += 5
        }
    }

    return points

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
        // Convert pick winner from 'A'/'B' to fighter name for comparison
        let pickWinnerName = pick.winner
        if (pick.winner === 'A') pickWinnerName = fight.fighterA
        if (pick.winner === 'B') pickWinnerName = fight.fighterB

        const pickData: Pick = {
            winner: pickWinnerName,
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
        // Check for badges
        await checkAndAwardBadges(userId, fight.eventId)
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
