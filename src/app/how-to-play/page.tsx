import { getDictionary, getLocale } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Target, Clock, Lock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function HowToPlay() {
    const locale = await getLocale()
    const dict = await getDictionary(locale)

    // Find the next upcoming event
    const nextEvent = await prisma.event.findFirst({
        where: {
            date: {
                gte: new Date()
            }
        },
        orderBy: {
            date: 'asc'
        }
    })

    const ctaHref = nextEvent ? `/events/${nextEvent.id}` : '/dashboard'

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-red-500/30">

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        {dict.howToPlay.title}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        {dict.howToPlay.subtitle}
                    </p>
                </div>

                {/* Scoring System */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                        <Trophy className="w-6 h-6 text-red-500" />
                        <h2 className="text-2xl font-bold text-white">{dict.howToPlay.scoringTitle}</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Winner */}
                        <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <Trophy className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <span className="text-xl font-bold text-blue-400">{dict.howToPlay.winnerPoints}</span>
                                </div>
                                <CardTitle className="text-white mt-4">{dict.howToPlay.winnerTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-400">{dict.howToPlay.winnerDesc}</p>
                            </CardContent>
                        </Card>

                        {/* Method */}
                        <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Target className="w-6 h-6 text-purple-500" />
                                    </div>
                                    <span className="text-xl font-bold text-purple-400">{dict.howToPlay.methodPoints}</span>
                                </div>
                                <CardTitle className="text-white mt-4">{dict.howToPlay.methodTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-400">{dict.howToPlay.methodDesc}</p>
                            </CardContent>
                        </Card>

                        {/* Round */}
                        <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-amber-500/10 rounded-lg">
                                        <Clock className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <span className="text-xl font-bold text-amber-400">{dict.howToPlay.roundPoints}</span>
                                </div>
                                <CardTitle className="text-white mt-4">{dict.howToPlay.roundTitle}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-400">{dict.howToPlay.roundDesc}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Perfect Pick Banner */}
                    <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-900/50 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="p-3 bg-green-500/20 rounded-full shrink-0">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">{dict.howToPlay.perfectPickTitle}</h3>
                            <p className="text-slate-300">{dict.howToPlay.perfectPickDesc}</p>
                        </div>
                    </div>
                </div>

                {/* Locking Rules */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                        <Lock className="w-6 h-6 text-red-500" />
                        <h2 className="text-2xl font-bold text-white">{dict.howToPlay.lockingTitle}</h2>
                    </div>

                    <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-xl">
                                <Clock className="w-12 h-12 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-medium text-white">
                                    {dict.howToPlay.lockingDesc}
                                </p>
                                <p className="text-slate-400 text-sm">
                                    {dict.howToPlay.timeZoneNote}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link href={ctaHref}>
                        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold text-lg px-8">
                            {dict.howToPlay.cta}
                        </Button>
                    </Link>
                </div>
            </main>
        </div>
    )
}
