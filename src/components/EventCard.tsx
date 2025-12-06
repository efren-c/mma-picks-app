"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Trophy } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface EventCardProps {
    id: string
    name: string
    date: Date
    image?: string | null
}

export function EventCard({ id, name, date, image }: EventCardProps) {
    const eventDate = new Date(date)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let status: 'UPCOMING' | 'LIVE' | 'PAST' = 'UPCOMING'

    if (eventDate < todayStart) {
        // Event was on a previous day
        status = 'PAST'
    } else if (eventDate <= now) {
        // Event started today (current time has passed event start time)
        status = 'LIVE'
    } else {
        // Event hasn't started yet (either future day or today but time hasn't arrived)
        status = 'UPCOMING'
    }

    const getStatusColor = () => {
        switch (status) {
            case 'LIVE': return 'bg-green-600 text-white animate-pulse'
            case 'PAST': return 'bg-slate-600 text-slate-200'
            default: return 'bg-blue-600 text-white'
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'LIVE': return 'LIVE NOW'
            case 'PAST': return 'COMPLETED'
            default: return 'UPCOMING'
        }
    }

    return (
        <Link href={`/events/${id}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <Card className={`overflow-hidden transition-colors cursor-pointer h-full flex flex-col border-slate-800 ${status === 'LIVE' ? 'hover:border-green-600/50 border-green-900/30' :
                    status === 'PAST' ? 'hover:border-slate-600/50' :
                        'hover:border-blue-600/50'
                    }`}>
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
                            {new Date(date).toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
    )
}
