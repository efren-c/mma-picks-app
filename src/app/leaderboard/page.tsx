import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award } from "lucide-react"

export default async function LeaderboardPage() {
    const users = await prisma.user.findMany({
        orderBy: {
            points: 'desc'
        },
        select: {
            id: true,
            username: true,
            points: true,
            _count: {
                select: {
                    picks: true
                }
            }
        },
        take: 100 // Top 100 users
    })

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-6 h-6 text-yellow-500" />
            case 2:
                return <Medal className="w-6 h-6 text-slate-400" />
            case 3:
                return <Award className="w-6 h-6 text-amber-700" />
            default:
                return <span className="text-slate-500 font-mono text-sm">#{rank}</span>
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                        Leaderboard
                    </h1>
                    <p className="text-slate-400">Top fighters in the prediction game</p>
                </div>

                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Rankings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                                No users yet. Be the first to make picks!
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {users.map((user, index) => {
                                    const rank = index + 1
                                    const isTopThree = rank <= 3

                                    return (
                                        <div
                                            key={user.id}
                                            className={`
                        flex items-center justify-between p-4 rounded-lg transition-colors
                        ${isTopThree
                                                    ? 'bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700'
                                                    : 'bg-slate-900/30 hover:bg-slate-800/30'}
                      `}
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 flex items-center justify-center">
                                                    {getRankIcon(rank)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-white">
                                                        {user.username}
                                                    </div>
                                                    <div className="text-sm text-slate-400">
                                                        {user._count.picks} {user._count.picks === 1 ? 'pick' : 'picks'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-green-500">
                                                    {user.points}
                                                </div>
                                                <div className="text-xs text-slate-500">points</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-900/30 border-slate-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{users.length}</div>
                                <div className="text-sm text-slate-400">Total Players</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/30 border-slate-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-500">
                                    {users[0]?.points || 0}
                                </div>
                                <div className="text-sm text-slate-400">Highest Score</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-900/30 border-slate-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-500">
                                    {users.reduce((sum, u) => sum + u._count.picks, 0)}
                                </div>
                                <div className="text-sm text-slate-400">Total Picks</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
