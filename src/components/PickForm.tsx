"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { submitPick } from "@/app/actions"
import { toast } from "sonner"

interface PickFormProps {
    fightId: string
    fighterA: string
    fighterB: string
    scheduledRounds: number
    existingPick?: {
        winner: string
        method: string
        round: number
    } | null
    isLocked?: boolean
}

export function PickForm({ fightId, fighterA, fighterB, scheduledRounds, existingPick, isLocked = false }: PickFormProps) {
    const [winner, setWinner] = useState<string | null>(existingPick?.winner || null)
    const [method, setMethod] = useState<string | null>(existingPick?.method || null)
    const [round, setRound] = useState<number | null>(existingPick?.round || null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasSubmittedPick, setHasSubmittedPick] = useState(!!existingPick)

    // Update form when existingPick changes
    useEffect(() => {
        if (existingPick) {
            setWinner(existingPick.winner)
            setMethod(existingPick.method)
            setRound(existingPick.round)
            setHasSubmittedPick(true)
        }
    }, [existingPick])

    const handleSubmit = async () => {
        if (!winner || !method || isLocked) return

        setIsSubmitting(true)

        // Default round to 0 if not applicable (e.g. Decision)
        const finalRound = (method === 'Decision') ? 0 : (round || 0)

        const result = await submitPick(fightId, winner, method, finalRound)

        setIsSubmitting(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            setHasSubmittedPick(true) // Update state immediately after successful submission
            toast.success(hasSubmittedPick ? "Pick updated successfully!" : "Pick saved successfully!")
        }
    }

    const FistIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12.035 17.012a3 3 0 0 0-3-3l-.311-.002a.72.72 0 0 1-.505-1.229l1.195-1.195A2 2 0 0 1 10.828 11H12a2 2 0 0 0 0-4H9.243a3 3 0 0 0-2.122.879l-2.707 2.707A4.83 4.83 0 0 0 3 14a8 8 0 0 0 8 8h2a8 8 0 0 0 8-8V7a2 2 0 1 0-4 0v2a2 2 0 1 0 4 0" />
            <path d="M13.888 9.662A2 2 0 0 0 17 8V5A2 2 0 1 0 13 5" />
            <path d="M9 5A2 2 0 1 0 5 5V10" />
            <path d="M9 7V4A2 2 0 1 1 13 4V7.268" />
        </svg>
    )

    const BeltIcon = () => (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            {/* Knot */}
            <path d="M10,10 C10,9 14,9 14,10 C14,11 10,11 10,10 Z" />
            {/* Left side of belt */}
            <path d="M2,11 L10,11 L10,13 L2,13 Z" />
            {/* Right side of belt */}
            <path d="M14,11 L22,11 L22,13 L14,13 Z" />
            {/* Hanging ends */}
            <path d="M11,13 L10,18 L8,17 L9,12 Z" />
            <path d="M13,13 L14,18 L16,17 L15,12 Z" />
            {/* Rank bar on right end */}
            <rect x="19" y="11" width="3" height="2" fill="white" fillOpacity="0.3" />
        </svg>
    )

    const ScorecardIcon = () => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
            <path d="M10 14h4" />
            <path d="M12 10v12" />
            <path d="M7 16h.01" />
            <path d="M7 20h.01" />
            <path d="M17 16h.01" />
            <path d="M17 20h.01" />
        </svg>
    )

    const getMethodIcon = (methodName: string) => {
        switch (methodName) {
            case 'KO/TKO': return <FistIcon />
            case 'Submission': return <BeltIcon />
            case 'Decision': return <ScorecardIcon />
            default: return null
        }
    }

    const getSelectionStatus = (type: 'winner' | 'method' | 'round', value: string | number) => {
        const isSelected = type === 'winner' ? winner === value
            : type === 'method' ? method === value
                : round === value

        if (!isSelected) return 'unselected'

        // Check if it matches existing pick
        if (existingPick) {
            const isSaved = type === 'winner' ? existingPick.winner === value
                : type === 'method' ? existingPick.method === value
                    : existingPick.round === value

            if (isSaved) return 'saved'
        }

        return 'selected'
    }

    return (
        <div className="space-y-4">
            {isLocked && (
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 mb-4">
                    <p className="text-yellow-400 text-sm font-medium">
                        🔒 Event has started. Picks are locked.
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-1 h-3 rounded-full ${existingPick?.winner === winner ? 'bg-green-500' : 'bg-red-600'}`}></span>
                    Who wins?
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {[fighterA, fighterB].map((fighter) => {
                        const status = getSelectionStatus('winner', fighter)
                        return (
                            <button
                                key={fighter}
                                onClick={() => !isLocked && setWinner(fighter)}
                                disabled={isLocked}
                                className={`
                relative p-3 rounded-lg border-2 transition-all duration-200 group
                ${status === 'saved'
                                        ? 'border-green-600 bg-gradient-to-br from-green-600/20 to-green-900/20 text-white shadow-md shadow-green-900/20'
                                        : status === 'selected'
                                            ? 'border-red-600 bg-gradient-to-br from-red-600/20 to-red-900/20 text-white shadow-md shadow-red-900/20'
                                            : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800 text-slate-300'}
                ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
              `}
                            >
                                <span className="text-sm font-bold tracking-tight line-clamp-1">{fighter}</span>
                                {status !== 'unselected' && (
                                    <div className={`absolute top-2 right-2 rounded-full p-0.5 ${status === 'saved' ? 'text-green-500 bg-green-950/50' : 'text-red-500 bg-red-950/50'
                                        }`}>
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {winner && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <span className={`w-1 h-3 rounded-full ${existingPick?.method === method ? 'bg-green-500' : 'bg-red-600'}`}></span>
                            Method
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['KO/TKO', 'Submission', 'Decision'].map((m) => {
                                const status = getSelectionStatus('method', m)
                                return (
                                    <button
                                        key={m}
                                        onClick={() => !isLocked && setMethod(m)}
                                        disabled={isLocked}
                                        className={`
                    flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border-2 transition-all duration-200
                    ${status === 'saved'
                                                ? 'border-green-600 bg-green-600 text-white shadow-md shadow-green-900/20 scale-[1.02]'
                                                : status === 'selected'
                                                    ? 'border-red-600 bg-red-600 text-white shadow-md shadow-red-900/20 scale-[1.02]'
                                                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200'}
                    ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                                    >
                                        <div className={`p-1.5 rounded-full ${status !== 'unselected' ? 'bg-white/20' : 'bg-slate-900/50'}`}>
                                            {getMethodIcon(m)}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wide">{m}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {method && method !== 'Decision' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2"
                        >
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <span className={`w-1 h-3 rounded-full ${existingPick?.round === round ? 'bg-green-500' : 'bg-red-600'}`}></span>
                                Round
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: scheduledRounds }, (_, i) => i + 1).map((r) => {
                                    const status = getSelectionStatus('round', r)
                                    return (
                                        <button
                                            key={r}
                                            onClick={() => !isLocked && setRound(r)}
                                            disabled={isLocked}
                                            className={`
                      w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-all duration-200 border-2
                      ${status === 'saved'
                                                    ? 'border-green-600 bg-green-600 text-white shadow-md shadow-green-900/20 scale-105'
                                                    : status === 'selected'
                                                        ? 'border-red-600 bg-red-600 text-white shadow-md shadow-red-900/20 scale-105'
                                                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:bg-slate-800 hover:text-white'}
                      ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}
                    `}
                                        >
                                            {r}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {!isLocked && (
                        <div className="pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={!winner || !method || (method !== 'Decision' && !round) || isSubmitting}
                                className={`w-full py-3 font-bold uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-[0.98] text-sm disabled:opacity-50 disabled:cursor-not-allowed
                                ${userHasChanges()
                                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-900/20 text-white'
                                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 shadow-green-900/20 text-white'
                                    }`}
                            >
                                {isSubmitting ? "Saving..." : userHasChanges() ? "Submit Pick" : "Pick Saved"}
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )

    function userHasChanges() {
        if (!existingPick) return true
        if (existingPick.winner !== winner) return true
        if (existingPick.method !== method) return true
        if (existingPick.method !== 'Decision' && existingPick.round !== round) return true
        return false
    }
}
