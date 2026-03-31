import { getDictionary, getLocale } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Target, Clock, Lock, CheckCircle2, Sparkles } from "lucide-react"
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
                    <div className="mt-12 relative group rounded-2xl overflow-hidden">
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div>
                        
                        <div className="relative p-1 rounded-2xl bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-red-500/30">
                            <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-slate-950/90 backdrop-blur-xl rounded-xl border border-white/5 relative overflow-hidden">
                                {/* Sparkle/glow effects */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full -ml-16 -mb-16 pointer-events-none" />

                                <div className="relative z-10 p-4 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-2xl border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)] shrink-0 group-hover:scale-110 transition-transform duration-500">
                                    <Trophy className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
                                </div>
                                <div className="relative z-10 flex-1 text-center md:text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold tracking-wider uppercase mb-3">
                                        <Sparkles className="w-4 h-4" />
                                        Max Points
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-400 mb-2">
                                        {dict.howToPlay.perfectPickTitle}
                                    </h3>
                                    <p className="text-lg text-slate-300 font-medium">
                                        {dict.howToPlay.perfectPickDesc}
                                    </p>
                                </div>
                                <div className="relative z-10 shrink-0 mt-4 md:mt-0 text-center md:text-right">
                                    <span className="block text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.3)] group-hover:text-amber-300 transition-colors duration-300">
                                        10
                                    </span>
                                    <span className="text-amber-400 font-semibold uppercase tracking-widest text-sm">
                                        Points
                                    </span>
                                </div>
                            </div>
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
