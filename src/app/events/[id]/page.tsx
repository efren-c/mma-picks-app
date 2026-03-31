import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Clock, Calendar, Trophy, Lock } from "lucide-react"
import { FightRow } from "@/components/FightRow"
import { auth } from "@/auth"
import { Card } from "@/components/ui/card"
import { ClientDate } from "@/components/ClientDate"
import { getDictionary } from "@/lib/i18n"

interface EventPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function EventPage({ params }: EventPageProps) {
    const { id } = await params
    const session = await auth()
    const dict = await getDictionary()

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

    // Calculate if event is completed (same logic as EventCard)
    const eventDate = new Date(event.date)
    const now = new Date()
    // Adjust "now" to ensure we capture late night events as "today" even after UTC midnight
    const adjustedNow = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    const todayStart = new Date(adjustedNow.getFullYear(), adjustedNow.getMonth(), adjustedNow.getDate())
    const isEventCompleted = eventDate < todayStart

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
                                className="w-full h-full object-cover object-top opacity-60"
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-800" />
                        )}
                        <div className="absolute" />
                        <div className="absolute bottom-0 left-0 p-8">
                            <h1 className="text-4xl font-bold text-white mb-2">{event.name}</h1>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
                                <div className="flex items-center text-slate-300 text-lg">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    <span>
                                        <ClientDate date={event.date} format="date" />
                                    </span>
                                </div>
                                {!isEventCompleted ? (
                                    eventDate <= now ? (
                                        <div className="flex items-center text-base font-semibold px-3 py-1.5 rounded-lg w-fit border shadow-lg text-red-400 bg-red-400/10 border-red-400/20 backdrop-blur-sm">
                                            <Lock className="w-5 h-5 mr-2" />
                                            <span>
                                                {dict.pickForm.lockedMessage || "Event started, picks locked."}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-base font-semibold px-3 py-1.5 rounded-lg w-fit border shadow-lg text-amber-400 bg-amber-400/10 border-amber-400/20 backdrop-blur-sm">
                                            <Clock className="w-5 h-5 mr-2" />
                                            <span>
                                                {dict.eventCard.picksLock || "Picks Lock:"} <ClientDate date={event.date} format="time" />
                                            </span>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex items-center text-base font-semibold px-3 py-1.5 rounded-lg w-fit border shadow-lg text-slate-400 bg-slate-800/50 border-slate-700">
                                        <Clock className="w-5 h-5 mr-2" />
                                        <span>
                                            <ClientDate date={event.date} format="time" />
                                        </span>
                                    </div>
                                )}
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
                        {dict.eventPage.card}
                    </h2>

                    <div className="space-y-3">
                        {event.fights.map((fight) => (
                            <FightRow
                                key={fight.id}
                                fight={fight}
                                userPick={userPicks.get(fight.id)}
                                eventDate={event.date}
                                isEventCompleted={isEventCompleted}
                                dict={dict}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
