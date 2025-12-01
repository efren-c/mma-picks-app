"use client"

import { useActionState } from "react"
import { createEvent } from "@/app/lib/admin-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CreateEventPage() {
    const [state, dispatch] = useActionState(createEvent, undefined)

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                    ← Back to Events
                </Link>
            </div>

            <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-2xl text-white">Create New Event</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Event Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. UFC 300"
                                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Date</label>
                            <input
                                type="datetime-local"
                                name="date"
                                required
                                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Image URL (optional)</label>
                            <input
                                type="url"
                                name="image"
                                placeholder="https://example.com/event-poster.jpg"
                                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                            />
                        </div>

                        {state?.message && (
                            <div className="text-red-500 text-sm">{state.message}</div>
                        )}

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                            Create Event
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
