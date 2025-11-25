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
    existingPick?: {
        winner: string
        method: string
        round: number
    } | null
}

export function PickForm({ fightId, fighterA, fighterB, existingPick }: PickFormProps) {
    const [winner, setWinner] = useState<string | null>(existingPick?.winner || null)
    const [method, setMethod] = useState<string | null>(existingPick?.method || null)
    const [round, setRound] = useState<number | null>(existingPick?.round || null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Update form when existingPick changes
    useEffect(() => {
        if (existingPick) {
            setWinner(existingPick.winner)
            setMethod(existingPick.method)
            setRound(existingPick.round)
        }
    }, [existingPick])

    const handleSubmit = async () => {
        if (!winner || !method) return

        setIsSubmitting(true)

        // Default round to 0 if not applicable (e.g. Decision)
        const finalRound = (method === 'Decision') ? 0 : (round || 0)

        const result = await submitPick(fightId, winner, method, finalRound)

        setIsSubmitting(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(existingPick ? "Pick updated successfully!" : "Pick saved successfully!")
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Who wins?</label>
                <div className="grid grid-cols-2 gap-4">
                    {[fighterA, fighterB].map((fighter) => (
                        <button
                            key={fighter}
                            onClick={() => setWinner(fighter)}
                            className={`
                relative p-4 rounded-lg border-2 transition-all
                ${winner === fighter
                                    ? 'border-red-600 bg-red-600/10 text-white'
                                    : 'border-slate-700 hover:border-slate-600 text-slate-300'}
              `}
                        >
                            <span className="font-semibold">{fighter}</span>
                            {winner === fighter && (
                                <div className="absolute top-2 right-2 text-red-500">
                                    <Check className="w-4 h-4" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {winner && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Method of Victory</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['KO/TKO', 'Submission', 'Decision'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMethod(m)}
                                    className={`
                    p-3 rounded-md text-sm font-medium transition-all
                    ${method === m
                                            ? 'bg-slate-100 text-slate-900'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
                  `}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {method && method !== 'Decision' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Round</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRound(r)}
                                        className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                      ${round === r
                                                ? 'bg-red-600 text-white'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
                    `}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <div className="pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={!winner || !method || (method !== 'Decision' && !round) || isSubmitting}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                        >
                            {isSubmitting ? "Saving..." : existingPick ? "Update Pick" : "Submit Pick"}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
