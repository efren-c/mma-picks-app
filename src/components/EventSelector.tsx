"use client"

import { useRouter } from "next/navigation"
import { ChangeEvent } from "react"

interface Event {
    id: string
    name: string
}

interface EventSelectorProps {
    events: Event[]
    selectedEventId?: string
}

export function EventSelector({ events, selectedEventId, dict }: EventSelectorProps & { dict: any }) {
    const router = useRouter()

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        if (value) {
            router.push(`/leaderboard?eventId=${value}`)
        } else {
            router.push('/leaderboard')
        }
    }

    return (
        <div className="relative">
            <select
                value={selectedEventId || ""}
                onChange={handleChange}
                className="w-full md:w-64 bg-slate-900 border border-slate-700 text-white text-sm rounded-md pl-3 pr-10 py-2 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 appearance-none cursor-pointer hover:bg-slate-800 transition-colors"
                style={{
                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "0.65em auto",
                }}
            >
                <option value="">{dict.leaderboard.globalTitle}</option>
                {events.map(event => (
                    <option key={event.id} value={event.id}>
                        {event.name}
                    </option>
                ))}
            </select>
        </div>
    )
}
