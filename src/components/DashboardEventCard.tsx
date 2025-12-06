"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, ChevronDown } from "lucide-react"
import Link from "next/link"

interface DashboardEventCardProps {
    event: {
        id: string
        name: string
        date: Date
    }
    picks: Array<{
        id: string
        winner: string
        method: string
        round: number
        points: number | null
        fight: {
            fighterA: string
            fighterB: string
            winner: string | null
            method: string | null
        }
    }>
    totalPoints: number
}

export function DashboardEventCard({ event, picks, totalPoints }: DashboardEventCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <Card className="bg-slate-900/30 border-slate-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <Link href={`/events/${event.id}`} className="hover:text-red-500 transition-colors">
                            <CardTitle className="text-white">{event.name}</CardTitle>
                        </Link>
                        <p className="text-sm text-slate-400 mt-1">
                            {new Date(event.date).toLocaleDateString()}
                        </p>
                    </div>
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="text-right">
                            <p className="text-sm text-slate-400">Event Score</p>
                            <p className="text-2xl font-bold text-green-400">{totalPoints} pts</p>
                        </div>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-slate-400 group-hover:text-white transition-colors"
                        >
                            <ChevronDown className="w-5 h-5" />
                        </motion.div>
                    </div>
                </div>
            </CardHeader>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CardContent>
                            <div className="space-y-2">
                                {picks.map((pick) => {
                                    const hasFightResult = pick.fight.winner && pick.fight.method

                                    // Resolve fight winner from 'A'/'B' to actual fighter name
                                    const actualWinner = pick.fight.winner === 'A'
                                        ? pick.fight.fighterA
                                        : pick.fight.winner === 'B'
                                            ? pick.fight.fighterB
                                            : pick.fight.winner
                                    const isCorrect = hasFightResult && pick.winner === actualWinner

                                    return (
                                        <div
                                            key={pick.id}
                                            className={`p-3 rounded-lg border ${hasFightResult
                                                ? isCorrect
                                                    ? 'bg-green-900/10 border-green-800/50'
                                                    : 'bg-red-900/10 border-red-800/50'
                                                : 'bg-slate-800/30 border-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="text-white font-medium text-sm">
                                                        {pick.fight.fighterA} vs {pick.fight.fighterB}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1">
                                                        Your pick: <span className="font-semibold text-red-400">
                                                            {pick.winner === 'A' ? pick.fight.fighterA : pick.fight.fighterB}
                                                        </span> via {pick.method === 'KO' ? 'KO/TKO' : pick.method === 'SUB' ? 'Submission' : 'Decision'}
                                                        {pick.method !== 'DEC' && ` (R${pick.round})`}
                                                    </div>
                                                </div>
                                                {hasFightResult && (
                                                    <div className="flex items-center gap-2">
                                                        {isCorrect ? (
                                                            <>
                                                                <Check className="w-4 h-4 text-green-400" />
                                                                <span className="text-sm font-bold text-green-400">
                                                                    +{pick.points || 0} pts
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <X className="w-4 h-4 text-red-400" />
                                                                <span className="text-sm font-bold text-red-400">
                                                                    0 pts
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
