"use client"

import { useActionState, useEffect } from "react"
import { authenticate } from "@/app/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [state, dispatch] = useActionState(authenticate, undefined)
    const router = useRouter()

    useEffect(() => {
        if (state?.success) {
            router.push('/')
            router.refresh()
        }
    }, [state, router])

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-white">Welcome Back</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-red-600"
                            />
                        </div>
                        <div className="flex items-center justify-end">
                            <Link href="/forgot-password" className="text-sm text-red-500 hover:text-red-400 cursor-pointer">
                                Forgot password?
                            </Link>
                        </div>
                        {state?.error && (
                            <div className="text-red-500 text-sm">{state.error}</div>
                        )}
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                            Log In
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-slate-400">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-red-500 hover:underline cursor-pointer">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
