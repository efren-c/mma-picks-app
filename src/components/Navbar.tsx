import Link from "next/link"
import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { getDictionary, getLocale } from "@/lib/i18n"
import { LanguageSelector } from "./LanguageSelector"

export async function Navbar() {
    const session = await auth()
    const locale = await getLocale()
    const dict = await getDictionary(locale)

    // Check if user is admin and fetch username
    let isAdmin = false
    let username = session?.user?.email // fallback to email
    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true, username: true }
        })
        isAdmin = user?.role === 'ADMIN'
        username = user?.username || session.user.email
    }

    return (
        <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── Desktop: single row ─────────────────────────────── */}
                <div className="hidden md:flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-xl font-bold text-white">
                            MMA <span className="text-red-600">Picks</span>
                        </Link>
                        <nav className="flex items-center gap-6">
                            <Link href="/leaderboard" className="text-slate-200 hover:text-white transition-colors text-sm font-semibold">
                                {dict.navbar.leaderboard}
                            </Link>
                            <Link href="/how-to-play" className="text-slate-200 hover:text-white transition-colors text-sm font-semibold">
                                {dict.navbar.howToPlay}
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        {session?.user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white font-medium">
                                        {dict.navbar.dashboard}
                                    </Button>
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 font-medium">
                                            {dict.navbar.adminPanel}
                                        </Button>
                                    </Link>
                                )}
                                <span className="text-sm text-slate-400">{username}</span>
                                <form
                                    action={async () => {
                                        "use server"
                                        await signOut({ redirectTo: "/" })
                                    }}
                                >
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                        {dict.navbar.signOut}
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                        {dict.navbar.logIn}
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                        {dict.navbar.signUp}
                                    </Button>
                                </Link>
                            </div>
                        )}
                        <LanguageSelector currentLocale={locale} />
                    </div>
                </div>

                {/* ── Mobile: two rows ────────────────────────────────── */}
                <div className="md:hidden">
                    {/* Row 1: brand + language selector */}
                    <div className="flex items-center justify-between h-12">
                        <Link href="/" className="text-xl font-bold text-white">
                            MMA <span className="text-red-600">Picks</span>
                        </Link>
                        <LanguageSelector currentLocale={locale} />
                    </div>

                    {/* Row 2: nav links */}
                    <div className="flex items-center justify-center gap-1 pb-2 border-t border-slate-800/60 pt-1 flex-wrap">
                        {session?.user ? (
                            <>
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white font-medium text-xs px-2">
                                        {dict.navbar.dashboard}
                                    </Button>
                                </Link>
                                <Link href="/leaderboard">
                                    <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white font-medium text-xs px-2">
                                        {dict.navbar.leaderboard}
                                    </Button>
                                </Link>
                                <Link href="/how-to-play">
                                    <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white font-medium text-xs px-2">
                                        {dict.navbar.howToPlay}
                                    </Button>
                                </Link>
                                {isAdmin && (
                                    <Link href="/admin">
                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 font-medium text-xs px-2">
                                            {dict.navbar.adminPanel}
                                        </Button>
                                    </Link>
                                )}
                                <form
                                    action={async () => {
                                        "use server"
                                        await signOut({ redirectTo: "/" })
                                    }}
                                >
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs px-2">
                                        {dict.navbar.signOut}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <>
                                <Link href="/leaderboard">
                                    <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white font-medium text-xs px-2">
                                        {dict.navbar.leaderboard}
                                    </Button>
                                </Link>
                                <Link href="/how-to-play">
                                    <Button variant="ghost" size="sm" className="text-slate-200 hover:text-white font-medium text-xs px-2">
                                        {dict.navbar.howToPlay}
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs px-2">
                                        {dict.navbar.logIn}
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs px-2">
                                        {dict.navbar.signUp}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </nav>
    )
}
