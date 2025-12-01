import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminPage() {
    const events = await prisma.event.findMany({
        orderBy: { date: 'desc' },
        include: {
            fights: true,
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Events</h1>
                <Link href="/admin/events/create">
                    <Button className="bg-green-600 hover:bg-green-700">
                        Create New Event
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                    <Link key={event.id} href={`/admin/events/${event.id}`}>
                        <Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition cursor-pointer">
                            <CardHeader>
                                <CardTitle className="text-white">{event.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-400 text-sm">
                                    {new Date(event.date).toLocaleDateString()}
                                </p>
                                <p className="text-slate-500 text-sm mt-2">
                                    {event.fights.length} fights
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {events.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <p className="text-slate-400">No events yet. Create your first event!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
