/**
 * Script to recalculate points for all fights with results
 * Run this after fixing the scoring bug to update existing picks
 */

import { prisma } from './src/lib/prisma'
import { calculatePointsForFight } from './src/lib/scoring'

async function recalculateAllPoints() {
    console.log('Starting point recalculation...')

    // Find all fights that have results set
    const fightsWithResults = await prisma.fight.findMany({
        where: {
            AND: [
                { winner: { not: null } },
                { method: { not: null } },
                { round: { not: null } }
            ]
        },
        select: {
            id: true,
            fighterA: true,
            fighterB: true,
            winner: true,
            method: true,
            round: true
        }
    })

    console.log(`Found ${fightsWithResults.length} fights with results`)

    for (const fight of fightsWithResults) {
        console.log(`\nRecalculating points for fight: ${fight.fighterA} vs ${fight.fighterB}`)
        console.log(`Result: Winner=${fight.winner}, Method=${fight.method}, Round=${fight.round}`)

        const result = await calculatePointsForFight(fight.id)

        if (result.error) {
            console.error(`Error: ${result.error}`)
        } else {
            console.log(`✓ Updated ${result.updates} picks`)
        }
    }

    console.log('\n✅ Point recalculation complete!')
}

recalculateAllPoints()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
