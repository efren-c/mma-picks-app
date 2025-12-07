import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Calendar, Trophy } from "lucide-react"
import { FightRow } from "@/components/FightRow"
import { auth } from "@/auth"
import { Card } from "@/components/ui/card"

interface EventPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EventPage({ params }: EventPageProps) {
    const { id } = await params
    const session = await auth()

    const event = await prisma.event.findFirst({
        where: {
            OR: [
                { id },
                { slug: id }
            ]
        },
        include: {
            fights: {
                orderBy: { order: 'asc' }
            }
        }
    })

    if (!event) {
        notFound()
    }

    // Fetch user picks for this event if logged in
    let userPicks: Map<string, any> = new Map()
    let totalEventScore = 0

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                picks: {
                    where: {
                        fight: {
                            eventId: id
                        }
                    },
                    include: {
                        fight: true
                    }
                }
            }
        })

        if (user) {
            user.picks.forEach(pick => {
                userPicks.set(pick.fightId, pick)
                totalEventScore += pick.points || 0
            })
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Event Header */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                    <div className="h-64 w-full relative">
                        {event.image ? (
                            <img
                                src={event.image}
                                alt={event.name}
                                className="w-full h-full object-cover opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-800" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-8">
                            <h1 className="text-4xl font-bold text-white mb-2">{event.name}</h1>
                            <div className="flex items-center text-slate-300">
                                <Calendar className="w-5 h-5 mr-2" />
                                {new Date(event.date).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Event Score Card */}
                {session?.user && totalEventScore > 0 && (
                    <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-800/50 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-600/20 rounded-full">
                                    <Trophy className="w-6 h-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Your Event Score</p>
                                    <p className="text-3xl font-bold text-white">{totalEventScore} points</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Fight Card */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white flex items-center">
                        <span className="bg-red-600 w-1 h-8 mr-3 rounded-full"></span>
                        Fight Card
                    </h2>

                    <div className="space-y-3">
                        {event.fights.map((fight) => (
                            <FightRow
                                key={fight.id}
                                fight={fight}
                                userPick={userPicks.get(fight.id)}
                                eventDate={event.date}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}