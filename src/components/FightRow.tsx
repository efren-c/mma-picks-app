"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check, X, Trophy } from "lucide-react"
import { Card } from "@/components/ui/card"
import { PickForm } from "@/components/PickForm"
import { getUserPick } from "@/app/actions"

interface FightRowProps {
    fight: {
        id: string
        fighterA: string
        fighterB: string
        order: number
        scheduledRounds: number
        winner: string | null
        method: string | null
        round: number | null
    }
    userPick?: {
        winner: string
        method: string
        round: number
        points: number | null
    } | null
    eventDate: Date
}

export function FightRow({ fight, userPick: initialUserPick, eventDate }: FightRowProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [existingPick, setExistingPick] = useState<any>(initialUserPick || null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoadedPick, setHasLoadedPick] = useState(!!initialUserPick)

    const isLocked = new Date() > new Date(eventDate)

    const handleExpand = async () => {
        const newExpandedState = !isExpanded
        setIsExpanded(newExpandedState)

        // Only fetch pick when expanding and haven't loaded it yet
        if (newExpandedState && !hasLoadedPick) {
            setIsLoading(true)
            try {
                const pick = await getUserPick(fight.id)
                setExistingPick(pick)
                setHasLoadedPick(true)
            } catch (error) {
                console.error("Error loading pick:", error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    const hasFightResult = fight.winner && fight.method && fight.round !== null
    const hasUserPick = existingPick !== null

    // Resolve fight winner from 'A'/'B' to actual fighter name
    const actualWinner = fight.winner === 'A'
        ? fight.fighterA
        : fight.winner === 'B'
            ? fight.fighterB
            : fight.winner
    const isCorrectPick = hasUserPick && hasFightResult && existingPick.winner === actualWinner
    const points = existingPick?.points || 0

    // Format method display
    const formatMethod = (method: string | null) => {
        if (!method) return ''
        if (method === 'KO') return 'KO/TKO'
        if (method === 'SUB') return 'Submission'
        if (method === 'DEC') return 'Decision'
        return method
    }

    // Get winner name
    const getWinnerName = (winner: string | null) => {
        if (!winner) return ''
        return winner === 'A' ? fight.fighterA : fight.fighterB
    }

    return (
        <Card className={`overflow-hidden border-slate-800 ${hasFightResult && hasUserPick
            ? isCorrectPick
                ? 'bg-green-900/10 border-green-800/50'
                : 'bg-red-900/10 border-red-800/50'
            : 'bg-slate-900/40'
            }`}>
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={handleExpand}
            >
                <div className="flex items-center flex-1 gap-4">
                    <span className="text-slate-500 font-mono text-sm w-6">#{fight.order}</span>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 flex-1 max-w-2xl">
                        <span className={`text-lg font-semibold text-right ${hasFightResult && fight.winner === 'A' ? 'text-green-400' : 'text-white'
                            }`}>
                            {fight.fighterA}
                        </span>
                        <span className="text-slate-500 text-sm px-2">vs</span>
                        <span className={`text-lg font-semibold text-left ${hasFightResult && fight.winner === 'B' ? 'text-green-400' : 'text-white'
                            }`}>
                            {fight.fighterB}
                        </span>
                    </div>

                    {/* Result and Score Indicators */}
                    <div className="flex items-center gap-3">
                        {hasFightResult && hasUserPick && (
                            <>
                                {isCorrectPick ? (
                                    <div className="flex items-center gap-2 mr-4 bg-green-600/20 px-3 py-1 rounded-full">
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-bold text-green-400">+{points} pts</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mr-4 bg-red-600/20 px-3 py-1 rounded-full">
                                        <X className="w-4 h-4 text-red-400" />
                                        <span className="text-sm font-bold text-red-400">0 pts</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center text-slate-400">
                    <span className="mr-4 text-sm hidden sm:inline-block">
                        {isLocked
                            ? (existingPick ? "View Pick" : "Locked")
                            : (existingPick ? "Edit Pick" : "Make Pick")
                        }
                    </span>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-6 border-t border-slate-800 bg-slate-900/60 space-y-4">
                            {/* Fight Result Display */}
                            {hasFightResult && (
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Official Result</p>
                                    <p className="text-white font-semibold">
                                        {getWinnerName(fight.winner)} wins via {formatMethod(fight.method)}
                                        {fight.method !== 'DEC' && fight.round && ` (Round ${fight.round})`}
                                    </p>
                                </div>
                            )}

                            {/* Pick Form */}
                            {isLoading ? (
                                <div className="text-center text-slate-400 py-8">Loading...</div>
                            ) : (
                                <PickForm
                                    fightId={fight.id}
                                    fighterA={fight.fighterA}
                                    fighterB={fight.fighterB}
                                    scheduledRounds={fight.scheduledRounds}
                                    existingPick={existingPick}
                                    isLocked={isLocked}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
