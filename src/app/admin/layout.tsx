import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user?.email) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (user?.role !== 'ADMIN') {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <nav className="border-b border-slate-800 bg-slate-900/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                        <a href="/" className="text-slate-400 hover:text-white transition">
                            Back to Site
                        </a>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
