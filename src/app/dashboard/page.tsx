import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, History } from "lucide-react"

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
                    fight: {
                        event: {
                            date: 'desc'
                        }
                    }
                }
            }
        }
    })

    if (!user) {
        return <div>User not found</div>
    }

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
                </div>

                {/* Pick History */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Pick History</h2>
                    <div className="space-y-4">
                        {user.picks.length === 0 ? (
                            <div className="text-slate-500">No picks made yet.</div>
                        ) : (
                            user.picks.map((pick) => (
                                <Card key={pick.id} className="bg-slate-900/30 border-slate-800">
                                    <div className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-white font-medium">
                                                {pick.fight.fighterA} vs {pick.fight.fighterB}
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                {pick.fight.event.name} • {new Date(pick.fight.event.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-300">
                                                Pick: <span className="font-semibold text-red-500">{pick.winner}</span> via {pick.method}
                                                {pick.method !== 'Decision' && ` (R${pick.round})`}
                                            </div>
                                            {pick.points !== null && (
                                                <div className="text-sm font-bold text-green-500">
                                                    +{pick.points} pts
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
