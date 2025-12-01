
import { prisma } from "@/lib/prisma"

async function main() {
    const event = await prisma.event.findFirst({
        where: { name: "UFC 111" },
        include: {
            fights: {
                include: {
                    picks: true
                },
                orderBy: { order: 'asc' }
            }
        }
    })

    if (!event) {
        console.log("Event not found")
        return
    }

    console.log(`Event: ${event.name}`)

    for (const fight of event.fights) {
        console.log(`\nFight ${fight.order}: ${fight.fighterA} vs ${fight.fighterB}`)
        console.log(`Result: Winner=${fight.winner}, Method=${fight.method}, Round=${fight.round}`)

        for (const pick of fight.picks) {
            console.log(`  Pick (User ${pick.userId}): Winner=${pick.winner}, Method=${pick.method}, Round=${pick.round}, Points=${pick.points}`)
        }
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
