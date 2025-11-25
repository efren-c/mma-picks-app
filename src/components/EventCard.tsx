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
    return (
        <Link href={`/events/${id}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
                <Card className="overflow-hidden hover:border-red-600/50 transition-colors cursor-pointer h-full flex flex-col">
                    <div className="relative h-48 w-full bg-slate-800">
                        {image ? (
                            <img
                                src={image}
                                alt={name}
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <Trophy className="w-16 h-16" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl text-white">{name}</CardTitle>
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
