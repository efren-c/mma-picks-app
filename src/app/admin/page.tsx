import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientDate } from '@/components/ClientDate'
import { ChevronLeft, ChevronRight } from "lucide-react"

interface AdminPageProps {
    searchParams: Promise<{
        page?: string
    }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
    const { page } = await searchParams
    const currentPage = Math.max(1, parseInt(page || "1", 10))
    const pageSize = 6

    const totalEvents = await prisma.event.count()
    const totalPages = Math.ceil(totalEvents / pageSize)

    const events = await prisma.event.findMany({
        orderBy: { date: 'desc' },
        include: {
            fights: true,
        },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
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
                                    <ClientDate date={event.date} format="date" />
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-4">
                    {currentPage > 1 ? (
                        <Link
                            href={`/admin?page=${currentPage - 1}`}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors text-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Link>
                    ) : (
                        <button disabled className="flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900/50 text-slate-600 rounded-lg cursor-not-allowed text-sm">
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                    )}
                    
                    <span className="text-slate-500 text-sm">
                        Page {currentPage} of {totalPages}
                    </span>

                    {currentPage < totalPages ? (
                        <Link
                            href={`/admin?page=${currentPage + 1}`}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors text-sm"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <button disabled className="flex items-center gap-2 px-4 py-2 border border-slate-800 bg-slate-900/50 text-slate-600 rounded-lg cursor-not-allowed text-sm">
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
