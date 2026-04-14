"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, TrendingDown, Star } from 'lucide-react';
import Link from 'next/link';

interface EventResult {
    id: string;
    eventId: string;
    score: number;
    rank: number;
    totalPlayers: number;
    isPersonalBest: boolean;
    isPersonalWorst: boolean;
    event: {
        id: string;
        name: string;
    };
}

export function EventResultModal() {
    const [results, setResults] = useState<EventResult[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch('/api/user/event-results');
                if (res.ok) {
                    const data = await res.json();
                    if (data.results && data.results.length > 0) {
                        setResults(data.results);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch event results", err);
            }
        };
        fetchResults();
    }, []);

    const handleDismiss = async () => {
        const currentResult = results[currentIndex];
        try {
            await fetch('/api/user/event-results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resultId: currentResult.id })
            });
        } catch (err) {
            console.error("Failed to dismiss", err);
        }

        if (currentIndex < results.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setResults([]);
        }
    };

    if (results.length === 0) return null;

    const currentResult = results[currentIndex];
    const isTop3 = currentResult.rank <= 3;
    const isFirst = currentResult.rank === 1;
    
    // Calculate percentage beaten (e.g. out of 100 players, rank 20 beats 80 players = 80%)
    let pctBeat = 0;
    if (currentResult.totalPlayers > 1) {
        pctBeat = Math.round(((currentResult.totalPlayers - currentResult.rank) / currentResult.totalPlayers) * 100);
    }

    return (
        <Dialog open={true} onOpenChange={handleDismiss}>
            <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-white">
                <DialogHeader className="flex flex-col items-center pt-6 space-y-4">
                    <DialogDescription className="sr-only">Event finish results showing your rank and score.</DialogDescription>
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 shadow-xl relative top-[-40px] -mb-10 text-white">
                        {isTop3 ? (
                            <Trophy className={`w-8 h-8 ${isFirst ? 'text-yellow-400' : 'text-slate-300'}`} />
                        ) : (
                            <Star className="w-8 h-8 text-blue-400" />
                        )}
                    </div>
                    
                    <div className="text-center">
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{currentResult.event.name}</p>
                        <DialogTitle className="text-3xl font-bold mt-2">
                            {isTop3 ? (
                                <span className={`bg-clip-text text-transparent ${isFirst ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-slate-200 to-slate-400'}`}>
                                    You placed {currentResult.rank}{currentResult.rank === 1 ? 'st' : currentResult.rank === 2 ? 'nd' : 'rd'}!
                                </span>
                            ) : (
                                <span>Event Finished!</span>
                            )}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Score Box */}
                    <div className="bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-800 shadow-inner">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Points</p>
                        <p className="text-4xl font-black text-white">{currentResult.score}</p>
                    </div>

                    {/* Context text */}
                    <p className="text-center text-slate-300 text-lg">
                        {!isTop3 ? (
                            pctBeat > 0 ? (
                                <>You scored higher than <span className="font-bold text-white">{pctBeat}%</span> of the {currentResult.totalPlayers} players!</>
                            ) : (
                                <>Keep practicing! Your next event will be better.</>
                            )
                        ) : null}
                    </p>

                    {/* Historical Banner */}
                    {(currentResult.isPersonalBest || currentResult.isPersonalWorst) && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 border ${
                            currentResult.isPersonalBest 
                                ? 'bg-green-900/20 border-green-800/50 text-green-400' 
                                : 'bg-slate-800/40 border-slate-700 text-slate-400'
                        }`}>
                            {currentResult.isPersonalBest ? <TrendingUp className="w-5 h-5 flex-shrink-0" /> : <TrendingDown className="w-5 h-5 flex-shrink-0" />}
                            <span className="font-medium text-sm">
                                {currentResult.isPersonalBest 
                                    ? "This was your best event yet! Outstanding performance! 🏆" 
                                    : "Tough night compared to your usual! But we know you'll bounce back next time! 💪"}
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-3">
                    <Button onClick={handleDismiss} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold flex-1">
                        Awesome, close
                    </Button>
                    <Link href={`/events/${currentResult.eventId}`} onClick={handleDismiss} className="w-full inline-block">
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white flex-1">
                            View Full Leaderboard
                        </Button>
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
