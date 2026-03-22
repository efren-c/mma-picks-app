import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, History, Check, X, LockKeyhole, HandFist, Medal } from "lucide-react"
import { DashboardEventCard } from "@/components/DashboardEventCard"
import { Badge } from "@/components/Badge"
import { getGlobalLeaderboard } from "@/app/lib/gamification-actions"
import { getDictionary } from "@/lib/i18n"

export default async function DashboardPage() {
    const session = await auth()
    const dict = await getDictionary()

    if (!session?.user?.email) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            picks: {
                include: {
                    fight: {
                        include: {
                            event: true
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            },
            badges: {
                include: {
                    badge: true
                }
            }
        }
    })

    if (!user) {
        return <div>User not found</div>
    }

    // Group picks by event
    const picksByEvent = user.picks.reduce((acc, pick) => {
        const eventId = pick.fight.event.id
        if (!acc[eventId]) {
            acc[eventId] = {
                event: {
                    ...pick.fight.event,
                    slug: (pick.fight.event as any).slug // Cast to any if typescript complains temporarily or if type isn't updated yet in prisma client check
                },
                picks: [],
                totalPoints: 0
            }
        }
        acc[eventId].picks.push(pick)
        acc[eventId].totalPoints += pick.points || 0
        return acc
    }, {} as Record<string, { event: any; picks: any[]; totalPoints: number }>)

    const events = Object.values(picksByEvent).sort((a, b) =>
        new Date(b.event.date).getTime() - new Date(a.event.date).getTime()
    )

    const leaderboard = await getGlobalLeaderboard()
    const userRank = leaderboard.find(u => u.id === user.id)?.rank
    const rankDisplay = userRank ? `#${userRank}` : '>50'

    return (
        <main className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-white">{dict.dashboard.title}</h1>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                            <CardTitle className="text-xs font-medium text-slate-400">{dict.dashboard.totalPoints}</CardTitle>
                            <Trophy className="h-3 w-3 text-yellow-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold text-white">{user.points}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                            <CardTitle className="text-xs font-medium text-slate-400">{dict.dashboard.totalPicks}</CardTitle>
                            <LockKeyhole className="h-3 w-3 text-blue-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold text-white">{user.picks.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                            <CardTitle className="text-xs font-medium text-slate-400">{dict.dashboard.events}</CardTitle>
                            <HandFist className="h-3 w-3 text-orange-400" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold text-white">{events.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-4">
                            <CardTitle className="text-xs font-medium text-slate-400">{dict.dashboard.rank}</CardTitle>
                            <Medal className="h-3 w-3 text-purple-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-xl font-bold text-white">{rankDisplay}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Badges Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">{dict.dashboard.badges}</h2>
                    {user.badges.length === 0 ? (
                        <div className="text-slate-500">{dict.dashboard.noBadges}</div>
                    ) : (
                        <div className="flex flex-wrap gap-4">
                            {user.badges.map((ub) => (
                                <Badge
                                    key={ub.id}
                                    name={ub.badge.name}
                                    icon={ub.badge.icon}
                                    description={ub.badge.description}
                                    size={24}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Events with Picks */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">{dict.dashboard.pickHistory}</h2>
                    {events.length === 0 ? (
                        <div className="text-slate-500">{dict.dashboard.noPicks}</div>
                    ) : (
                        events.map(({ event, picks, totalPoints }) => (
                            <DashboardEventCard
                                key={event.id}
                                event={event}
                                picks={picks}
                                totalPoints={totalPoints}
                                dict={dict}
                            />
                        ))
                    )}
                </div>
            </div>
        </main>
    )
}
