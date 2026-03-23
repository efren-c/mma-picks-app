import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CreateEventForm from './CreateEventForm'

export default async function CreateEventPage() {
    const session = await auth()
    const currentUser = session?.user?.email
        ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } })
        : null

    if (currentUser?.role === 'SCOREKEEPER') {
        redirect('/admin')
    }

    return <CreateEventForm />
}
