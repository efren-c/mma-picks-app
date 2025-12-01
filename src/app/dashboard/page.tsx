import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, History, Check, X } from "lucide-react"
import { DashboardEventCard } from "@/components/DashboardEventCard"

export default async function DashboardPage() {
    const session = await auth()

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
                event: pick.fight.event,
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

    return (
        <main className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Points</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{user.points}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Picks</CardTitle>
                            <History className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{user.picks.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/50 border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Events</CardTitle>
                            <Trophy className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{events.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Events with Picks */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Pick History by Event</h2>
                    {events.length === 0 ? (
                        <div className="text-slate-500">No picks made yet.</div>
                    ) : (
                        events.map(({ event, picks, totalPoints }) => (
                            <DashboardEventCard
                                key={event.id}
                                event={event}
                                picks={picks}
                                totalPoints={totalPoints}
                            />
                        ))
                    )}
                </div>
            </div>
        </main>
    )
}
