"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { PickForm } from "@/components/PickForm"
import { getUserPick } from "@/app/actions"

interface FightRowProps {
    fight: {
        id: string
        fighterA: string
        fighterB: string
        order: number
    }
}

export function FightRow({ fight }: FightRowProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [existingPick, setExistingPick] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoadedPick, setHasLoadedPick] = useState(false)

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

    return (
        <Card className="overflow-hidden border-slate-800 bg-slate-900/40">
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={handleExpand}
            >
                <div className="flex items-center flex-1">
                    <span className="text-slate-500 font-mono text-sm mr-4 w-6">#{fight.order}</span>
                    <div className="flex items-center justify-between flex-1 max-w-md">
                        <span className="text-lg font-semibold text-white">{fight.fighterA}</span>
                        <span className="text-slate-500 text-sm px-4">vs</span>
                        <span className="text-lg font-semibold text-white">{fight.fighterB}</span>
                    </div>
                </div>

                <div className="flex items-center text-slate-400">
                    <span className="mr-4 text-sm hidden sm:inline-block">
                        {existingPick ? "Edit Pick" : "Make Pick"}
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
                        <div className="p-6 border-t border-slate-800 bg-slate-900/60">
                            {isLoading ? (
                                <div className="text-center text-slate-400 py-8">Loading...</div>
                            ) : (
                                <PickForm
                                    fightId={fight.id}
                                    fighterA={fight.fighterA}
                                    fighterB={fight.fighterB}
                                    existingPick={existingPick}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
