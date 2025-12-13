"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Trophy, Clock } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { isToday, isTomorrow } from "date-fns"

interface EventCardProps {
    id: string
    name: string
    date: Date
    image?: string | null
    slug?: string | null
    labels?: {
        liveNow: string
        today: string
        tomorrow: string
        completed: string
        upcoming: string
    }
}

export function EventCard({ id, name, date, image, slug, labels }: EventCardProps) {
    const eventDate = new Date(date)
    const now = new Date()

    // Determine status
    let status: 'UPCOMING' | 'LIVE' | 'PAST' | 'TODAY' | 'TOMORROW' = 'UPCOMING'

    if (eventDate <= now) {
        // If generic "now" is past event start, it's LIVE or PAST. 
        // simplistic check: if it started more than 12 hours ago, maybe it's past? 
        // For now, let's keep the existing logic roughly: 
        // The previous logic was: if (eventDate < todayStart) PAST, else if (eventDate <= now) LIVE.
        // Let's refine:

        // Assuming events last max 6-8 hours. If it started 12+ hours ago, it's probably done.
        // But let's stick to the previous simple logic for PAST vs LIVE first, then overlay TODAY logic.

        // Using the user's previous "todayStart" logic was a bit manual. 
        // Let's use isToday / isTomorrow from date-fns for the "User consulting the page" perspective.

        status = 'LIVE'
        // A simple "Past" check: if event was yesterday or earlier
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (eventDate < yesterday) { // very loose check, but matches "eventDate < todayStart" intent from before better
            status = 'PAST'
        }
        // Actually, let's look at the specific requirement: "taking into account the date of the event and the day the user is consulting the page"

        // If existing logic said "PAST" (previous day), good.
        // If existing logic said "LIVE" (started today), good.
    }

    // Let's restructure to be clearer:

    if (eventDate <= now) {
        // It has started. Is it still live?
        // Let's assume an event lasts 7 hours.
        const sevenHoursAfterStart = new Date(eventDate.getTime() + 7 * 60 * 60 * 1000);
        if (now > sevenHoursAfterStart) {
            status = 'PAST';
        } else {
            status = 'LIVE';
        }
    } else {
        // It hasn't started yet.
        if (isToday(eventDate)) {
            status = 'TODAY';
        } else if (isTomorrow(eventDate)) {
            status = 'TOMORROW';
        } else {
            status = 'UPCOMING';
        }
    }


    const getStatusColor = () => {
        switch (status) {
            case 'LIVE': return 'bg-green-600 text-white animate-pulse'
            case 'TODAY': return 'bg-amber-600 text-white'
            case 'TOMORROW': return 'bg-indigo-600 text-white'
            case 'PAST': return 'bg-slate-600 text-slate-200'
            default: return 'bg-blue-600 text-white'
        }
    }

    const getStatusText = () => {
        // Use labels if provided, otherwise default to English
        const l = labels || {
            liveNow: 'LIVE NOW',
            today: 'TODAY',
            tomorrow: 'TOMORROW',
            completed: 'COMPLETED',
            upcoming: 'UPCOMING'
        }

        switch (status) {
            case 'LIVE': return l.liveNow
            case 'TODAY': return l.today
            case 'TOMORROW': return l.tomorrow
            case 'PAST': return l.completed
            default: return l.upcoming
        }
    }

    const getBorderColor = () => {
        switch (status) {
            case 'LIVE': return 'hover:border-green-600/50 border-green-900/30'
            case 'TODAY': return 'hover:border-amber-600/50'
            case 'TOMORROW': return 'hover:border-indigo-600/50'
            case 'PAST': return 'hover:border-slate-600/50'
            default: return 'hover:border-blue-600/50'
        }
    }

    return (
        <Link href={`/events/${slug || id}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <Card className={`overflow-hidden transition-colors cursor-pointer h-full flex flex-col border-slate-800 ${getBorderColor()}`}>
                    <div className="relative h-48 w-full bg-slate-800">
                        {image ? (
                            <img
                                src={image}
                                alt={name}
                                className={`w-full h-full object-cover transition-opacity ${status === 'PAST' ? 'opacity-50 grayscale' : 'opacity-80 hover:opacity-100'}`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <Trophy className="w-16 h-16" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

                        {/* Status Badge */}
                        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider shadow-lg ${getStatusColor()}`}>
                            {getStatusText()}
                        </div>
                    </div>
                    <CardHeader>
                        <CardTitle className={`text-xl ${status === 'PAST' ? 'text-slate-400' : 'text-white'}`}>{name}</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <div className="flex items-center text-slate-400 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>
                                {new Date(date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit'
                                })}
                            </span>
                            {(status === 'LIVE' || status === 'TODAY' || status === 'TOMORROW' || status === 'UPCOMING') && (
                                <>
                                    <span className="mx-2 text-slate-600">•</span>
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>
                                        {new Date(date).toLocaleTimeString(undefined, {
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </Link >
    )
}
