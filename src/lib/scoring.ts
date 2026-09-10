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

    // Group picks by calculated score for batch updating
    const picksByPoints = new Map<number, string[]>()

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
        const ids = picksByPoints.get(points) || []
        ids.push(pick.id)
        picksByPoints.set(points, ids)
    }

    // Execute batch updates for picks in a single transaction
    const updateOperations = Array.from(picksByPoints.entries()).map(([points, ids]) =>
        prisma.pick.updateMany({
            where: { id: { in: ids } },
            data: { points }
        })
    )

    if (updateOperations.length > 0) {
        await prisma.$transaction(updateOperations)
    }

    // Recalculate total points for all users who made picks on this fight
    const userIds = [...new Set(fight.picks.map(p => p.userId))]

    if (userIds.length > 0) {
        // Grouped aggregation to get total points for all affected users in 1 query
        const userPointAggregations = await prisma.pick.groupBy({
            by: ['userId'],
            where: { userId: { in: userIds } },
            _sum: { points: true }
        })

        const userUpdates = userPointAggregations.map(agg =>
            prisma.user.update({
                where: { id: agg.userId },
                data: { points: agg._sum.points || 0 }
            })
        )

        // Ensure any user without scored picks is accounted for
        const coveredUserIds = new Set(userPointAggregations.map(a => a.userId))
        for (const uid of userIds) {
            if (!coveredUserIds.has(uid)) {
                userUpdates.push(
                    prisma.user.update({
                        where: { id: uid },
                        data: { points: 0 }
                    })
                )
            }
        }

        if (userUpdates.length > 0) {
            await prisma.$transaction(userUpdates)
        }

        // Pre-fetch event fights once for all badge checks
        const eventFights = await prisma.fight.findMany({ where: { eventId: fight.eventId } })

        for (const userId of userIds) {
            await checkAndAwardBadges(userId, fight.eventId, eventFights)
        }
    }

    return { success: true, updates: fight.picks.length }
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
