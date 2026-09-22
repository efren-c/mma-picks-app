"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Trophy,
    Target,
    Zap,
    Clock,
    Flame,
    TrendingDown,
    TrendingUp,
    Filter,
    RotateCcw,
    Award,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronUp,
    ChevronDown,
    Layers,
    Sparkles,
    CheckCircle2,
    XCircle
} from "lucide-react"

export interface SettledPick {
    id: string
    winner: string
    method: string
    round: number
    points: number | null
    createdAt: string | Date
    fight: {
        id: string
        fighterA: string
        fighterB: string
        winner: string | null
        method: string | null
        round: number | null
        scheduledRounds: number
        event: {
            id: string
            name: string
            date: string | Date
            slug?: string | null
        }
    }
}

export interface UserEventStat {
    id: string
    eventId: string
    score: number
    rank: number
    totalPlayers: number
    event: {
        id: string
        name: string
        date: string | Date
    }
}

interface AnalyticsDashboardProps {
    picks: SettledPick[]
    eventStats: UserEventStat[]
    dict: any
}

export function AnalyticsDashboard({ picks, eventStats, dict }: AnalyticsDashboardProps) {
    // ── Filter & Explorer States ──────────────────────────────────────────────
    const [pageSize, setPageSize] = useState<number>(10)
    const [selectedYear, setSelectedYear] = useState<string>("all")
    const [selectedEventId, setSelectedEventId] = useState<string>("all")
    const [selectedFightLength, setSelectedFightLength] = useState<string>("all")
    const [selectedOutcome, setSelectedOutcome] = useState<string>("all")
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(true)

    const handlePreset = (preset: "flawless" | "title" | "winners" | "misses" | "all") => {
        setIsExplorerOpen(true)
        setCurrentPage(1)
        if (preset === "flawless") {
            setSelectedOutcome("10")
            setSelectedFightLength("all")
        } else if (preset === "title") {
            setSelectedFightLength("5")
            setSelectedOutcome("all")
        } else if (preset === "winners") {
            setSelectedOutcome("winner")
            setSelectedFightLength("all")
        } else if (preset === "misses") {
            setSelectedOutcome("miss")
            setSelectedFightLength("all")
        } else {
            setSelectedOutcome("all")
            setSelectedFightLength("all")
        }
    }

    // Extract unique available years from settled picks and event stats
    const availableYears = useMemo(() => {
        const yearsSet = new Set<number>()
        picks.forEach(p => {
            const date = new Date(p.fight.event.date)
            if (!isNaN(date.getFullYear())) yearsSet.add(date.getFullYear())
        })
        eventStats.forEach(e => {
            const date = new Date(e.event.date)
            if (!isNaN(date.getFullYear())) yearsSet.add(date.getFullYear())
        })
        return Array.from(yearsSet).sort((a, b) => b - a)
    }, [picks, eventStats])

    // Available events filtered by current selected year
    const availableEvents = useMemo(() => {
        const eventMap = new Map<string, { id: string; name: string; date: Date }>()
        picks.forEach(p => {
            const ev = p.fight.event
            const evDate = new Date(ev.date)
            if (selectedYear === "all" || evDate.getFullYear().toString() === selectedYear) {
                if (!eventMap.has(ev.id)) {
                    eventMap.set(ev.id, { id: ev.id, name: ev.name, date: evDate })
                }
            }
        })
        return Array.from(eventMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime())
    }, [picks, selectedYear])

    // ── Filter Application ─────────────────────────────────────────────────────
    const filteredPicks = useMemo(() => {
        return picks.filter(pick => {
            const evDate = new Date(pick.fight.event.date)

            // Year filter
            if (selectedYear !== "all" && evDate.getFullYear().toString() !== selectedYear) {
                return false
            }

            // Event filter
            if (selectedEventId !== "all" && pick.fight.event.id !== selectedEventId) {
                return false
            }

            // Fight Length filter
            if (selectedFightLength === "5" && pick.fight.scheduledRounds !== 5) {
                return false
            }
            if (selectedFightLength === "3" && pick.fight.scheduledRounds !== 3) {
                return false
            }

            // Outcome filter
            const points = pick.points ?? 0
            if (selectedOutcome === "10" && points !== 10) return false
            if (selectedOutcome === "winner" && points === 0) return false
            if (selectedOutcome === "miss" && points > 0) return false

            return true
        })
    }, [picks, selectedYear, selectedEventId, selectedFightLength, selectedOutcome])

    // Reset filters
    const handleResetFilters = () => {
        setSelectedYear("all")
        setSelectedEventId("all")
        setSelectedFightLength("all")
        setSelectedOutcome("all")
        setCurrentPage(1)
    }

    const isFiltered =
        selectedYear !== "all" ||
        selectedEventId !== "all" ||
        selectedFightLength !== "all" ||
        selectedOutcome !== "all"

    // Pagination calculations
    const totalPages = Math.max(Math.ceil(filteredPicks.length / pageSize), 1)
    const paginatedPicks = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredPicks.slice(start, start + pageSize)
    }, [filteredPicks, currentPage, pageSize])
    const startItem = filteredPicks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, filteredPicks.length)

    // ── Metric Calculations ────────────────────────────────────────────────────
    const totalPicksCount = filteredPicks.length

    // Helper to evaluate fighter name match
    const isFighterPickedCorrectly = (pick: SettledPick) => {
        return (pick.points ?? 0) > 0
    }

    // Flawless picks: strictly 10 points (Winner + Method + Round)
    const flawlessPicksCount = filteredPicks.filter(p => (p.points ?? 0) === 10).length
    const flawlessPicksRate = totalPicksCount > 0 ? (flawlessPicksCount / totalPicksCount) * 100 : 0

    // Fighter Win Rate
    const correctFighterCount = filteredPicks.filter(isFighterPickedCorrectly).length
    const fighterWinRate = totalPicksCount > 0 ? (correctFighterCount / totalPicksCount) * 100 : 0

    // Method Accuracy: only counted when fighter was correct
    // Points = 5 (Winner + Method) or 10 (Winner + Method + Round)
    const correctMethodCount = filteredPicks.filter(p => {
        const pts = p.points ?? 0
        return pts === 5 || pts === 10
    }).length
    const methodAccuracy = correctFighterCount > 0 ? (correctMethodCount / correctFighterCount) * 100 : 0

    // Round Accuracy: only counted when fighter was correct and fight finished in KO/SUB
    // Points = 7 (Winner + Round) or 10 (Winner + Method + Round)
    // Non-decision fights where fighter was correct
    const finishesWithCorrectFighter = filteredPicks.filter(p => {
        const isCorrectFighter = (p.points ?? 0) > 0
        const fightMethod = p.fight.method?.toUpperCase() || ""
        const isNotDecision = !fightMethod.includes("DEC")
        return isCorrectFighter && isNotDecision
    })
    const correctRoundCount = filteredPicks.filter(p => {
        const pts = p.points ?? 0
        return pts === 7 || pts === 10
    }).length
    const roundAccuracy =
        finishesWithCorrectFighter.length > 0
            ? (correctRoundCount / finishesWithCorrectFighter.length) * 100
            : 0

    // Total points scored in filtered selection
    const totalPointsScored = filteredPicks.reduce((acc, p) => acc + (p.points ?? 0), 0)

    // Points distribution counts
    const distribution = useMemo(() => {
        const dist = { 10: 0, 7: 0, 5: 0, 2: 0, 0: 0 }
        filteredPicks.forEach(p => {
            const pts = p.points ?? 0
            if (pts === 10) dist[10]++
            else if (pts === 7) dist[7]++
            else if (pts === 5) dist[5]++
            else if (pts === 2) dist[2]++
            else dist[0]++
        })
        return dist
    }, [filteredPicks])

    // ── Event-Level Performance & Best / Worst Events ──────────────────────────
    const eventSummaries = useMemo(() => {
        const map = new Map<
            string,
            {
                id: string
                name: string
                date: Date
                totalPoints: number
                picksCount: number
                flawlessCount: number
                correctFighters: number
            }
        >()

        // Group picks that match current year & fight length filters (to provide event-level comparison)
        picks.forEach(p => {
            const evDate = new Date(p.fight.event.date)
            if (selectedYear !== "all" && evDate.getFullYear().toString() !== selectedYear) return
            if (selectedFightLength === "5" && p.fight.scheduledRounds !== 5) return
            if (selectedFightLength === "3" && p.fight.scheduledRounds !== 3) return

            const ev = p.fight.event
            if (!map.has(ev.id)) {
                map.set(ev.id, {
                    id: ev.id,
                    name: ev.name,
                    date: evDate,
                    totalPoints: 0,
                    picksCount: 0,
                    flawlessCount: 0,
                    correctFighters: 0
                })
            }

            const item = map.get(ev.id)!
            const pts = p.points ?? 0
            item.totalPoints += pts
            item.picksCount++
            if (pts === 10) item.flawlessCount++
            if (pts > 0) item.correctFighters++
        })

        // Sort chronologically ascending for trend chart
        return Array.from(map.values()).sort((a, b) => a.date.getTime() - b.date.getTime())
    }, [picks, selectedYear, selectedFightLength])

    // Calculate Best and Worst Event (by total points)
    const { bestEvent, worstEvent, avgPointsPerEvent } = useMemo(() => {
        if (eventSummaries.length === 0) {
            return { bestEvent: null, worstEvent: null, avgPointsPerEvent: 0 }
        }

        let best = eventSummaries[0]
        let worst = eventSummaries[0]
        let sumPoints = 0

        eventSummaries.forEach(ev => {
            sumPoints += ev.totalPoints
            if (ev.totalPoints > best.totalPoints) best = ev
            if (ev.totalPoints < worst.totalPoints) worst = ev
        })

        const avg = Math.round((sumPoints / eventSummaries.length) * 10) / 10
        return { bestEvent: best, worstEvent: worst, avgPointsPerEvent: avg }
    }, [eventSummaries])

    // Find max score for chart scaling
    const maxEventScore = useMemo(() => {
        if (eventSummaries.length === 0) return 50
        const max = Math.max(...eventSummaries.map(e => e.totalPoints))
        return Math.max(max, 30) // Baseline minimum ceiling
    }, [eventSummaries])

    // ── Helper to format dates ─────────────────────────────────────────────────
    const formatDate = (dateInput: string | Date) => {
        const d = new Date(dateInput)
        return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
        })
    }

    // If user has zero settled picks across all time
    if (picks.length === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto py-12 px-4 text-center">
                <Card className="bg-slate-900/60 border-slate-800 p-8 text-center backdrop-blur-md">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                        <Trophy className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{dict.analytics.empty.title}</h2>
                    <p className="text-slate-400 max-w-md mx-auto mb-6">{dict.analytics.empty.desc}</p>
                    <Link href="/">
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                            {dict.analytics.empty.cta}
                        </Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            {/* ── Page Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        {dict.analytics.title}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            <Sparkles className="w-3 h-3" />
                            PRO
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">{dict.analytics.subtitle}</p>
                </div>
            </div>

            {/* ── Interactive Filters ─────────────────────────────────────────── */}
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-md">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                                <Filter className="w-4 h-4 text-red-500" />
                                <span>{dict.analytics.filters.filterBy}</span>
                            </div>
                            {isFiltered && (
                                <button
                                    onClick={handleResetFilters}
                                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    {dict.analytics.filters.reset}
                                </button>
                            )}
                        </div>

                        {/* Filter Selectors Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Year Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">
                                    {dict.analytics.filters.year}
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={e => {
                                        setSelectedYear(e.target.value)
                                        setSelectedEventId("all")
                                        setCurrentPage(1)
                                    }}
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500/80 transition-colors"
                                >
                                    <option value="all">{dict.analytics.filters.allYears}</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year.toString()}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Event Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">
                                    {dict.analytics.filters.event}
                                </label>
                                <select
                                    value={selectedEventId}
                                    onChange={e => {
                                        setSelectedEventId(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500/80 transition-colors truncate"
                                >
                                    <option value="all">{dict.analytics.filters.allEvents}</option>
                                    {availableEvents.map(ev => (
                                        <option key={ev.id} value={ev.id}>
                                            {ev.name} ({ev.date.getFullYear()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Fight Type Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">
                                    {dict.analytics.filters.fightLength}
                                </label>
                                <select
                                    value={selectedFightLength}
                                    onChange={e => {
                                        setSelectedFightLength(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500/80 transition-colors"
                                >
                                    <option value="all">{dict.analytics.filters.allLengths}</option>
                                    <option value="5">{dict.analytics.filters.fiveRounds}</option>
                                    <option value="3">{dict.analytics.filters.threeRounds}</option>
                                </select>
                            </div>

                            {/* Outcome Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-400">
                                    {dict.analytics.filters.outcome}
                                </label>
                                <select
                                    value={selectedOutcome}
                                    onChange={e => {
                                        setSelectedOutcome(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500/80 transition-colors"
                                >
                                    <option value="all">{dict.analytics.filters.allOutcomes}</option>
                                    <option value="10">{dict.analytics.filters.onlyFlawless}</option>
                                    <option value="winner">{dict.analytics.filters.onlyWinners}</option>
                                    <option value="miss">{dict.analytics.filters.onlyMisses}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Key Performance Indicators (KPIs) ──────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Flawless 10-pt Picks */}
                <Card className="bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-900/60 border-amber-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:opacity-30 transition-opacity">
                        <Trophy className="w-12 h-12 text-amber-400" />
                    </div>
                    <CardHeader className="pb-1 p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                                {dict.analytics.kpis.flawlessPicks}
                            </CardTitle>
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{flawlessPicksCount}</span>
                            <span className="text-xs font-semibold text-amber-400/90">
                                ({flawlessPicksRate.toFixed(1)}%)
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{dict.analytics.kpis.flawlessPicksDesc}</p>
                    </CardContent>
                </Card>

                {/* 2. Fighter Win Rate */}
                <Card className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="pb-1 p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {dict.analytics.kpis.fighterWinRate}
                            </CardTitle>
                            <Target className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-emerald-400">
                                {fighterWinRate.toFixed(1)}%
                            </span>
                            <span className="text-xs text-slate-400">
                                {correctFighterCount}/{totalPicksCount}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{dict.analytics.kpis.fighterWinRateDesc}</p>
                    </CardContent>
                </Card>

                {/* 3. Method Accuracy */}
                <Card className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="pb-1 p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {dict.analytics.kpis.methodAccuracy}
                            </CardTitle>
                            <Zap className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-blue-400">
                                {methodAccuracy.toFixed(1)}%
                            </span>
                            <span className="text-xs text-slate-400">
                                {correctMethodCount}/{correctFighterCount}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{dict.analytics.kpis.methodAccuracyDesc}</p>
                    </CardContent>
                </Card>

                {/* 4. Round Accuracy */}
                <Card className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="pb-1 p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {dict.analytics.kpis.roundAccuracy}
                            </CardTitle>
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-purple-400">
                                {roundAccuracy.toFixed(1)}%
                            </span>
                            <span className="text-xs text-slate-400">
                                {correctRoundCount}/{finishesWithCorrectFighter.length}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{dict.analytics.kpis.roundAccuracyDesc}</p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Best & Worst Event Banner ──────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Best Event */}
                <Card className="bg-slate-900/40 border-slate-800 relative">
                    <CardHeader className="pb-1 p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                                {dict.analytics.kpis.bestEvent}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        {bestEvent ? (
                            <div>
                                <div className="text-lg font-bold text-white truncate">{bestEvent.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-2xl font-extrabold text-emerald-400">
                                        {bestEvent.totalPoints} pts
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        ({formatDate(bestEvent.date)})
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500">—</div>
                        )}
                    </CardContent>
                </Card>

                {/* Worst Event */}
                <Card className="bg-slate-900/40 border-slate-800 relative">
                    <CardHeader className="pb-1 p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                                {dict.analytics.kpis.worstEvent}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        {worstEvent ? (
                            <div>
                                <div className="text-lg font-bold text-white truncate">{worstEvent.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-2xl font-extrabold text-rose-400">
                                        {worstEvent.totalPoints} pts
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        ({formatDate(worstEvent.date)})
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500">—</div>
                        )}
                    </CardContent>
                </Card>

                {/* Average Points per Event */}
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="pb-1 p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {dict.analytics.kpis.averagePoints}
                            </CardTitle>
                            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-extrabold text-white">{avgPointsPerEvent} pts</div>
                        <p className="text-xs text-slate-400 mt-1">
                            {eventSummaries.length} {dict.analytics.kpis.totalEvents}
                        </p>
                    </CardContent>
                </Card>

                {/* Total Points in Filtered Range */}
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="pb-1 p-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {dict.analytics.kpis.totalPoints}
                            </CardTitle>
                            <Award className="w-3.5 h-3.5 text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-extrabold text-white">{totalPointsScored} pts</div>
                        <p className="text-xs text-slate-400 mt-1">
                            {totalPicksCount} {dict.analytics.kpis.totalPicks}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* ── Event Performance Trend Visual Chart ─────────────────────────── */}
            {eventSummaries.length > 0 && (
                <Card className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="p-4 sm:p-6 pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-red-500" />
                                    {dict.analytics.charts.trendTitle}
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-400">
                                    {dict.analytics.charts.trendSubtitle}
                                </CardDescription>
                            </div>
                            <div className="inline-flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
                                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                {dict.analytics.charts.avgLine.replace("{avg}", avgPointsPerEvent.toString())}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-4">
                        <div className="h-64 w-full flex items-end gap-2 sm:gap-4 pt-8 pb-6 px-2 overflow-x-auto">
                            {eventSummaries.map(ev => {
                                const heightPercent = Math.max(
                                    Math.round((ev.totalPoints / maxEventScore) * 100),
                                    6
                                )
                                const isBest = bestEvent && ev.id === bestEvent.id
                                const isWorst = worstEvent && ev.id === worstEvent.id && eventSummaries.length > 1

                                return (
                                    <div
                                        key={ev.id}
                                        className="flex-1 min-w-[54px] sm:min-w-[68px] flex flex-col items-center justify-end h-full group relative"
                                    >
                                        {/* Score above bar */}
                                        <span
                                            className={`text-xs font-bold mb-1.5 transition-transform group-hover:scale-110 ${
                                                isBest
                                                    ? "text-amber-400"
                                                    : isWorst
                                                    ? "text-rose-400"
                                                    : "text-slate-300"
                                            }`}
                                        >
                                            {ev.totalPoints}
                                        </span>

                                        {/* Bar column */}
                                        <div className="w-full max-w-[42px] bg-slate-800/80 rounded-t-md h-full flex items-end overflow-hidden p-0.5 relative">
                                            <div
                                                style={{ height: `${heightPercent}%` }}
                                                className={`w-full rounded-t transition-all duration-500 group-hover:brightness-125 ${
                                                    isBest
                                                        ? "bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                                                        : isWorst
                                                        ? "bg-gradient-to-t from-rose-700 to-rose-500"
                                                        : "bg-gradient-to-t from-red-700 to-red-500"
                                                }`}
                                            />
                                        </div>

                                        {/* Event label below bar */}
                                        <div className="mt-2 text-center w-full">
                                            <div
                                                className={`text-[10px] sm:text-xs font-semibold truncate ${
                                                    isBest ? "text-amber-400 font-bold" : "text-slate-400"
                                                }`}
                                                title={ev.name}
                                            >
                                                {ev.name.replace("UFC ", "")}
                                            </div>
                                            <div className="text-[9px] text-slate-500">{formatDate(ev.date)}</div>
                                        </div>

                                        {/* Tooltip on hover */}
                                        <div className="absolute -top-10 hidden group-hover:flex flex-col items-center z-20 pointer-events-none whitespace-nowrap bg-slate-950 text-white text-[11px] px-2.5 py-1 rounded shadow-xl border border-slate-700">
                                            <span>
                                                {ev.name}: <strong>{ev.totalPoints} pts</strong>
                                            </span>
                                            <span className="text-[9px] text-amber-400">
                                                {ev.flawlessCount} Flawless (10 pts)
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Accuracy Gauges & Points Breakdown ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Accuracy Breakdown Gauges */}
                <Card className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="p-4 sm:p-6 pb-3">
                        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                            <Target className="w-5 h-5 text-emerald-400" />
                            {dict.analytics.charts.accuracyBreakdown}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                        {/* Fighter Win Rate Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-300">{dict.analytics.kpis.fighterWinRate}</span>
                                <span className="text-emerald-400 font-bold">
                                    {fighterWinRate.toFixed(1)}% ({correctFighterCount}/{totalPicksCount})
                                </span>
                            </div>
                            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(fighterWinRate, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Method Accuracy Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-300">{dict.analytics.kpis.methodAccuracy}</span>
                                <span className="text-blue-400 font-bold">
                                    {methodAccuracy.toFixed(1)}% ({correctMethodCount}/{correctFighterCount})
                                </span>
                            </div>
                            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(methodAccuracy, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Round Accuracy Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-300">{dict.analytics.kpis.roundAccuracy}</span>
                                <span className="text-purple-400 font-bold">
                                    {roundAccuracy.toFixed(1)}% ({correctRoundCount}/{finishesWithCorrectFighter.length})
                                </span>
                            </div>
                            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div
                                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(roundAccuracy, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Flawless Picks Rate */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-slate-300">{dict.analytics.kpis.flawlessPicks}</span>
                                <span className="text-amber-400 font-bold">
                                    {flawlessPicksRate.toFixed(1)}% ({flawlessPicksCount}/{totalPicksCount})
                                </span>
                            </div>
                            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(flawlessPicksRate, 100)}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Points Distribution Breakdown */}
                <Card className="bg-slate-900/60 border-slate-800">
                    <CardHeader className="p-4 sm:p-6 pb-3">
                        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-red-500" />
                            {dict.analytics.charts.pointsDistribution}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400">
                            {dict.analytics.charts.pointsDesc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                        {[
                            {
                                label: dict.analytics.charts.pts10,
                                count: distribution[10],
                                color: "bg-amber-500 text-amber-400",
                                barColor: "bg-gradient-to-r from-amber-500 to-yellow-400"
                            },
                            {
                                label: dict.analytics.charts.pts7,
                                count: distribution[7],
                                color: "bg-purple-500 text-purple-400",
                                barColor: "bg-purple-500"
                            },
                            {
                                label: dict.analytics.charts.pts5,
                                count: distribution[5],
                                color: "bg-blue-500 text-blue-400",
                                barColor: "bg-blue-500"
                            },
                            {
                                label: dict.analytics.charts.pts2,
                                count: distribution[2],
                                color: "bg-emerald-500 text-emerald-400",
                                barColor: "bg-emerald-500"
                            },
                            {
                                label: dict.analytics.charts.pts0,
                                count: distribution[0],
                                color: "bg-slate-700 text-slate-400",
                                barColor: "bg-slate-700"
                            }
                        ].map(item => {
                            const pct = totalPicksCount > 0 ? (item.count / totalPicksCount) * 100 : 0
                            return (
                                <div key={item.label} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-300 font-medium">{item.label}</span>
                                        <span className="text-slate-400 font-semibold">
                                            {item.count}{" "}
                                            <span className="text-slate-500">({pct.toFixed(1)}%)</span>
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                            className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* ── Picks Drill-Down Explorer ─────────────────────────────────── */}
            <div className="space-y-4">
                {/* Quick Preset Filter Chips & Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 p-3 sm:p-4 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
                            <Layers className="w-3.5 h-3.5 text-red-500" />
                            {dict.analytics.explorer.quickPresets}:
                        </span>
                        <button
                            type="button"
                            onClick={() => handlePreset("flawless")}
                            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer border ${
                                selectedOutcome === "10"
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                            }`}
                        >
                            {dict.analytics.explorer.presetFlawless}
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePreset("title")}
                            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer border ${
                                selectedFightLength === "5"
                                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
                                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                            }`}
                        >
                            {dict.analytics.explorer.presetTitleFights}
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePreset("winners")}
                            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer border ${
                                selectedOutcome === "winner"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                            }`}
                        >
                            {dict.analytics.explorer.presetWinners}
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePreset("misses")}
                            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer border ${
                                selectedOutcome === "miss"
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.25)]"
                                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                            }`}
                        >
                            {dict.analytics.explorer.presetMisses}
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePreset("all")}
                            className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer border ${
                                selectedOutcome === "all" && selectedFightLength === "all"
                                    ? "bg-slate-800 text-white border-slate-600"
                                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                            }`}
                        >
                            {dict.analytics.explorer.presetAll}
                        </button>
                    </div>

                    {/* Toggle Collapse/Expand */}
                    <button
                        type="button"
                        onClick={() => setIsExplorerOpen(!isExplorerOpen)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700"
                    >
                        {isExplorerOpen ? (
                            <>
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                {dict.analytics.explorer.collapse}
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                {dict.analytics.explorer.expand} ({filteredPicks.length})
                            </>
                        )}
                    </button>
                </div>

                {/* Explorer Card */}
                {isExplorerOpen && (
                    <Card className="bg-slate-900/60 border-slate-800 overflow-hidden shadow-lg">
                        <CardHeader className="p-4 sm:p-6 pb-4 border-b border-slate-800/80">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-red-500" />
                                        {dict.analytics.explorer.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-400">
                                        {dict.analytics.explorer.subtitle}
                                    </CardDescription>
                                </div>
                                {filteredPicks.length > 0 && (
                                    <div className="text-xs font-semibold text-slate-400">
                                        {dict.analytics.explorer.showingPage
                                            .replace("{start}", startItem.toString())
                                            .replace("{end}", endItem.toString())
                                            .replace("{total}", filteredPicks.length.toString())}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {paginatedPicks.length === 0 ? (
                                <div className="py-12 text-center text-slate-400 text-sm">
                                    {dict.analytics.table.noFights}
                                </div>
                            ) : (
                                <>
                                    <div className="divide-y divide-slate-800/60">
                                        {paginatedPicks.map(pick => {
                                            const pts = pick.points ?? 0
                                            const isFlawless = pts === 10
                                            const fight = pick.fight

                                            // Resolved names
                                            const pickedWinnerName =
                                                pick.winner === "A"
                                                    ? fight.fighterA
                                                    : pick.winner === "B"
                                                    ? fight.fighterB
                                                    : pick.winner

                                            const actualWinnerName =
                                                fight.winner === "A"
                                                    ? fight.fighterA
                                                    : fight.winner === "B"
                                                    ? fight.fighterB
                                                    : fight.winner || "—"

                                            return (
                                                <div
                                                    key={pick.id}
                                                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-800/30 ${
                                                        isFlawless ? "bg-amber-500/5" : ""
                                                    }`}
                                                >
                                                    {/* Matchup & Event */}
                                                    <div className="space-y-1.5 flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-xs font-semibold text-red-400">
                                                                {fight.event.name}
                                                            </span>
                                                            <span className="text-slate-600">•</span>
                                                            <span className="text-xs text-slate-400">
                                                                {formatDate(fight.event.date)}
                                                            </span>
                                                            {fight.scheduledRounds === 5 && (
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                                    5 Rds
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                                                            <span>{fight.fighterA}</span>
                                                            <span className="text-xs text-slate-500 font-normal">vs</span>
                                                            <span>{fight.fighterB}</span>
                                                        </div>
                                                    </div>

                                                    {/* User Pick vs Official Result */}
                                                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
                                                        {/* User Pick */}
                                                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 min-w-[140px]">
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                                                {dict.analytics.table.yourPick}
                                                            </div>
                                                            <div className="text-sm font-bold text-white mt-0.5 truncate">
                                                                {pickedWinnerName}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                {pick.method} • R{pick.round}
                                                            </div>
                                                        </div>

                                                        <ChevronRight className="hidden sm:block w-4 h-4 text-slate-600" />

                                                        {/* Official Result */}
                                                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 min-w-[140px]">
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                                                                {dict.analytics.table.actualResult}
                                                            </div>
                                                            <div className="text-sm font-bold text-emerald-400 mt-0.5 truncate flex items-center gap-1.5">
                                                                {actualWinnerName}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                {fight.method} {fight.round ? `• R${fight.round}` : ""}
                                                            </div>
                                                        </div>

                                                        {/* Points Awarded Badge */}
                                                        <div className="text-right min-w-[80px]">
                                                            <div
                                                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-black border ${
                                                                    isFlawless
                                                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                                                                        : pts === 7
                                                                        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                                                        : pts === 5
                                                                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                                                        : pts === 2
                                                                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                                                        : "bg-slate-800/60 text-slate-400 border-slate-700/50"
                                                                }`}
                                                            >
                                                                {isFlawless && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                                                                +{pts} pts
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 mt-1">
                                                                {isFlawless
                                                                    ? "Flawless"
                                                                    : pts === 7
                                                                    ? "Winner + Round"
                                                                    : pts === 5
                                                                    ? "Winner + Method"
                                                                    : pts === 2
                                                                    ? "Winner Only"
                                                                    : "Miss"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Pagination Controls */}
                                    {filteredPicks.length > 0 && (
                                        <div className="p-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/40">
                                            {/* Showing X-Y of Z & Page Size Selector */}
                                            <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                                                <div className="text-xs text-slate-400">
                                                    {dict.analytics.explorer.showingPage
                                                        .replace("{start}", startItem.toString())
                                                        .replace("{end}", endItem.toString())
                                                        .replace("{total}", filteredPicks.length.toString())}
                                                </div>

                                                {/* Page Size Selector */}
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <span>{dict.analytics.explorer.perPage}</span>
                                                    <select
                                                        value={pageSize}
                                                        onChange={e => {
                                                            setPageSize(Number(e.target.value))
                                                            setCurrentPage(1)
                                                        }}
                                                        className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer"
                                                    >
                                                        <option value={10}>10</option>
                                                        <option value={25}>25</option>
                                                        <option value={50}>50</option>
                                                        <option value={100}>100</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Navigation Buttons: First, Prev, Jump Dropdown, Next, Last */}
                                            {totalPages > 1 && (
                                                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                                    {/* First Page Button */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={currentPage === 1}
                                                        onClick={() => setCurrentPage(1)}
                                                        title={dict.analytics.explorer.firstPage}
                                                        className="h-8 px-2 text-xs border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <ChevronsLeft className="w-3.5 h-3.5" />
                                                    </Button>

                                                    {/* Prev Page Button */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={currentPage === 1}
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        className="h-8 px-2.5 text-xs border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                                                        <span className="hidden sm:inline">{dict.analytics.explorer.prevPage}</span>
                                                    </Button>

                                                    {/* Direct Jump Dropdown */}
                                                    <div className="flex items-center gap-1 px-1">
                                                        <select
                                                            value={currentPage}
                                                            onChange={e => setCurrentPage(Number(e.target.value))}
                                                            aria-label={dict.analytics.explorer.goToPage}
                                                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500 font-semibold cursor-pointer"
                                                        >
                                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                                                <option key={p} value={p}>
                                                                    {p} / {totalPages}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Next Page Button */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={currentPage === totalPages}
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        className="h-8 px-2.5 text-xs border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <span className="hidden sm:inline">{dict.analytics.explorer.nextPage}</span>
                                                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                                    </Button>

                                                    {/* Last Page Button */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={currentPage === totalPages}
                                                        onClick={() => setCurrentPage(totalPages)}
                                                        title={dict.analytics.explorer.lastPage}
                                                        className="h-8 px-2 text-xs border-slate-800 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <ChevronsRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
