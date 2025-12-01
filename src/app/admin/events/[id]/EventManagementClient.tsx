"use client"

import { useActionState, useState, useEffect } from "react"
import { createFight, updateFightResult, deleteFight, updateEvent, deleteEvent, updateFight } from "@/app/lib/admin-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useRouter } from "next/navigation"

interface Fight {
    id: string
    fighterA: string
    fighterB: string
    order: number
    winner: string | null
    method: string | null
    round: number | null
    scheduledRounds: number
}

interface Event {
    id: string
    name: string
    date: Date
    image: string | null
    fights: Fight[]
}

function AddFightForm({ eventId }: { eventId: string }) {
    const [state, dispatch] = useActionState(
        createFight.bind(null, eventId),
        undefined
    )

    return (
        <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
                <CardTitle className="text-white">Add Fight</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={dispatch} className="space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-5 space-y-2">
                            <label className="text-sm font-medium text-slate-400">Red Corner</label>
                            <input
                                type="text"
                                name="fighterA"
                                required
                                placeholder="e.g. Alex Pereira"
                                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                            />
                        </div>

                        <div className="col-span-5 space-y-2">
                            <label className="text-sm font-medium text-slate-400">Blue Corner</label>
                            <input
                                type="text"
                                name="fighterB"
                                required
                                placeholder="e.g. Jamahal Hill"
                                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-400">Rounds</label>
                            <select
                                name="scheduledRounds"
                                defaultValue="3"
                                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                            >
                                <option value="3">3</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                    </div>

                    {/* Order is auto-generated */}

                    {state?.message && (
                        <div className={state.message.includes('success') ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                            {state.message}
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                        Add Fight
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

function FightResultForm({ fight, eventId }: { fight: Fight; eventId: string }) {
    const [selectedMethod, setSelectedMethod] = useState(fight.method || '')
    const [state, dispatch] = useActionState(
        updateFightResult.bind(null, fight.id),
        undefined
    )

    const isDecision = selectedMethod === 'DEC'

    return (
        <form action={dispatch} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Winner</label>
                    <select
                        name="winner"
                        defaultValue={fight.winner || ''}
                        required
                        className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-600"
                    >
                        <option value="">Select</option>
                        <option value="A">Red corner</option>
                        <option value="B">Blue corner</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Method</label>
                    <select
                        name="method"
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                        required
                        className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-600"
                    >
                        <option value="">Select</option>
                        <option value="KO">KO/TKO</option>
                        <option value="SUB">Submission</option>
                        <option value="DEC">Decision</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">
                        Round {isDecision && <span className="text-slate-500">(N/A)</span>}
                    </label>
                    {isDecision ? (
                        <>
                            <input type="hidden" name="round" value="" />
                            <select
                                disabled
                                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">All rounds</option>
                            </select>
                        </>
                    ) : (
                        <select
                            name="round"
                            defaultValue={fight.round?.toString() || ''}
                            required
                            className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-600"
                        >
                            <option value="">Select</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    )}
                </div>
            </div>

            {state?.message && (
                <div className={state.message.includes('success') ? 'text-green-500 text-xs' : 'text-red-500 text-xs'}>
                    {state.message}
                </div>
            )}

            <Button type="submit" size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                {fight.winner ? 'Update Result' : 'Set Result'}
            </Button>
        </form>
    )
}

function EditEventForm({ event, onCancel }: { event: Event; onCancel: () => void }) {
    const [state, dispatch] = useActionState(
        updateEvent.bind(null, event.id),
        undefined
    )

    useEffect(() => {
        if (state?.message?.includes('success')) {
            onCancel()
        }
    }, [state, onCancel])

    return (
        <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Event Name</label>
                <input
                    type="text"
                    name="name"
                    defaultValue={event.name}
                    required
                    className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Date</label>
                <input
                    type="datetime-local"
                    name="date"
                    defaultValue={new Date(event.date).toISOString().slice(0, 16)}
                    required
                    className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Image URL</label>
                <input
                    type="url"
                    name="image"
                    defaultValue={event.image || ''}
                    className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                />
            </div>

            {state?.message && (
                <div className={state.message.includes('success') ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                    {state.message}
                </div>
            )}

            <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    Save Changes
                </Button>
                <Button type="button" onClick={onCancel} variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                    Cancel
                </Button>
            </div>
        </form>
    )
}

function EditFightForm({ fight, eventId, onCancel }: { fight: Fight; eventId: string; onCancel: () => void }) {
    const [state, dispatch] = useActionState(
        updateFight.bind(null, fight.id, eventId),
        undefined
    )

    useEffect(() => {
        if (state?.message?.includes('success')) {
            onCancel()
        }
    }, [state, onCancel])

    return (
        <form action={dispatch} className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5 space-y-2">
                    <label className="text-sm font-medium text-slate-400">Red Corner</label>
                    <input
                        type="text"
                        name="fighterA"
                        defaultValue={fight.fighterA}
                        required
                        className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                    />
                </div>

                <div className="col-span-5 space-y-2">
                    <label className="text-sm font-medium text-slate-400">Blue Corner</label>
                    <input
                        type="text"
                        name="fighterB"
                        defaultValue={fight.fighterB}
                        required
                        className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                    />
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-slate-400">Rounds</label>
                    <select
                        name="scheduledRounds"
                        defaultValue={fight.scheduledRounds.toString()}
                        className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                    >
                        <option value="3">3</option>
                        <option value="5">5</option>
                    </select>
                </div>
            </div>

            {state?.message && (
                <div className={state.message.includes('success') ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                    {state.message}
                </div>
            )}

            <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    Save
                </Button>
                <Button type="button" size="sm" onClick={onCancel} variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                    Cancel
                </Button>
            </div>
        </form>
    )
}

export default function EventManagementClient({ event }: { event: Event }) {
    const [isEditingEvent, setIsEditingEvent] = useState(false)
    const [editingFightId, setEditingFightId] = useState<string | null>(null)
    const router = useRouter()

    const handleDeleteEvent = async () => {
        console.log('Delete button clicked!')
        if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            console.log('User confirmed deletion')
            try {
                const result = await deleteEvent(event.id)
                console.log('Delete result:', result)

                // If there's an error message, the delete failed
                if (result?.message) {
                    alert(result.message)
                } else {
                    // Success - navigate to admin page
                    console.log('Navigating to /admin')
                    router.push('/admin')
                    router.refresh()
                }
            } catch (error) {
                console.error('Error in handleDeleteEvent:', error)
                alert('An error occurred while deleting the event')
            }
        }
    }

    const handleDeleteFight = async (fightId: string) => {
        if (confirm('Are you sure you want to delete this fight?')) {
            await deleteFight(fightId, event.id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card className="border-slate-800 bg-slate-900/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white">Event Details</CardTitle>
                            {!isEditingEvent && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setIsEditingEvent(true)}
                                        variant="outline"
                                        size="sm"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={handleDeleteEvent}
                                        variant="destructive"
                                        size="sm"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {isEditingEvent ? (
                                <EditEventForm event={event} onCancel={() => setIsEditingEvent(false)} />
                            ) : (
                                <>
                                    <div>
                                        <p className="text-sm text-slate-400">Name</p>
                                        <p className="text-white font-medium">{event.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Date</p>
                                        <p className="text-white font-medium">
                                            {new Date(event.date).toLocaleString()}
                                        </p>
                                    </div>
                                    {event.image && (
                                        <div>
                                            <p className="text-sm text-slate-400">Image</p>
                                            <img src={event.image} alt={event.name} className="mt-2 rounded-md max-w-full h-auto" />
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <AddFightForm eventId={event.id} />
                </div>

                <div>
                    <Card className="border-slate-800 bg-slate-900/50">
                        <CardHeader>
                            <CardTitle className="text-white">Fights ({event.fights.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {event.fights
                                .sort((a, b) => a.order - b.order)
                                .map((fight) => (
                                    <div key={fight.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                        <div className="mb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-500">Fight #{fight.order} <span className="text-xs bg-slate-700 px-1.5 py-0.5 rounded ml-2 text-slate-300">{fight.scheduledRounds} Rnds</span></p>
                                                    {editingFightId === fight.id ? (
                                                        <EditFightForm
                                                            fight={fight}
                                                            eventId={event.id}
                                                            onCancel={() => setEditingFightId(null)}
                                                        />
                                                    ) : (
                                                        <>
                                                            <p className="text-white font-medium">
                                                                {fight.fighterA} vs {fight.fighterB}
                                                            </p>
                                                            {fight.winner && (
                                                                <p className="text-sm text-green-400 mt-1">
                                                                    Winner: Fighter {fight.winner} via {fight.method} (R{fight.round})
                                                                </p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                {editingFightId !== fight.id && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => setEditingFightId(fight.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                                                        >
                                                            ✎
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteFight(fight.id)}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {editingFightId !== fight.id && (
                                            <FightResultForm fight={fight} eventId={event.id} />
                                        )}
                                    </div>
                                ))}

                            {event.fights.length === 0 && (
                                <p className="text-slate-400 text-center py-8">No fights added yet</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
