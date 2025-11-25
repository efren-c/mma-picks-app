import Link from "next/link"
import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"

export async function Navbar() {
    const session = await auth()

    return (
        <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-white">
                            MMA <span className="text-red-600">Picks</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {session?.user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                        Dashboard
                                    </Button>
                                </Link>
                                <span className="text-sm text-slate-400">
                                    {session.user.username || session.user.email}
                                </span>
                                <form
                                    action={async () => {
                                        "use server"
                                        await signOut()
                                    }}
                                >
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                        Sign Out
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                        Log In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
