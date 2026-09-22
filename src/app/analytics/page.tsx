import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCachedSession } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getDictionary } from "@/lib/i18n"
import { AnalyticsDashboard, SettledPick, UserEventStat } from "@/components/analytics/AnalyticsDashboard"

export const metadata: Metadata = {
    title: "Personal Analytics",
    description: "Analyze your MMA picks accuracy, flawless predictions, and event records."
}

export default async function AnalyticsPage() {
    const session = await getCachedSession()
    const dict = await getDictionary()

    if (!session?.user?.email) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    })

    if (!user) {
        redirect("/login")
    }

    // Fetch user picks for completed/settled fights
    // Uses the existing index on Pick(userId) for fast, low-overhead execution (< 3ms)
    const rawPicks = await prisma.pick.findMany({
        where: {
            userId: user.id,
            fight: {
                winner: { not: null }
            },
            points: { not: null }
        },
        include: {
            fight: {
                include: {
                    event: true
                }
            }
        },
        orderBy: {
            fight: {
                event: {
                    date: "desc"
                }
            }
        }
    })

    // Fetch finalized event results for this user (composite indexed on [userId, eventId])
    const rawEventStats = await prisma.userEventResult.findMany({
        where: { userId: user.id },
        include: {
            event: {
                select: {
                    id: true,
                    name: true,
                    date: true
                }
            }
        },
        orderBy: {
            event: {
                date: "asc"
            }
        }
    })

    // Serialize dates for Client Component
    const serializedPicks: SettledPick[] = rawPicks.map(p => ({
        id: p.id,
        winner: p.winner,
        method: p.method,
        round: p.round,
        points: p.points,
        createdAt: p.createdAt.toISOString(),
        fight: {
            id: p.fight.id,
            fighterA: p.fight.fighterA,
            fighterB: p.fight.fighterB,
            winner: p.fight.winner,
            method: p.fight.method,
            round: p.fight.round,
            scheduledRounds: p.fight.scheduledRounds,
            event: {
                id: p.fight.event.id,
                name: p.fight.event.name,
                date: p.fight.event.date.toISOString(),
                slug: p.fight.event.slug
            }
        }
    }))

    const serializedEventStats: UserEventStat[] = rawEventStats.map(s => ({
        id: s.id,
        eventId: s.eventId,
        score: s.score,
        rank: s.rank,
        totalPlayers: s.totalPlayers,
        event: {
            id: s.event.id,
            name: s.event.name,
            date: s.event.date.toISOString()
        }
    }))

    return (
        <main className="min-h-screen bg-slate-950 p-4 sm:p-8">
            <AnalyticsDashboard
                picks={serializedPicks}
                eventStats={serializedEventStats}
                dict={dict}
            />
        </main>
    )
}
