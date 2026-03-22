"use client"

import { useEffect, useState } from "react"

interface ClientDateProps {
    date: Date | string | number
    format: "date" | "time" | "full"
}

export function ClientDate({ date, format }: ClientDateProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Render empty or a simple fallback during SSR/SSG to prevent hydration mismatch
        return <span className="opacity-0">--</span>
    }

    const d = new Date(date)

    if (format === "date") {
        return <>{d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" })}</>
    }

    if (format === "time") {
        return <>{d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</>
    }

    return <>{d.toLocaleString()}</>
}
