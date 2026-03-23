import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EventManagementClient from './EventManagementClient'
import { auth } from '@/auth'

export default async function EventManagementPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const session = await auth()
    const currentUser = session?.user?.email
        ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } })
        : null
    const userRole = currentUser?.role ?? 'USER'

    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            fights: {
                orderBy: { order: 'asc' },
            },
        },
    })

    if (!event) {
        notFound()
    }

    return (
        <div>
            <div className="mb-6">
                <Link href="/admin" className="text-slate-400 hover:text-white transition">
                    ← Back to Events
                </Link>
            </div>

            <h1 className="text-3xl font-bold text-white mb-6">{event.name}</h1>

            <EventManagementClient event={event} userRole={userRole} />
        </div>
    )
}
