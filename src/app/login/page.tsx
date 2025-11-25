"use client"

import { useActionState } from "react"
import { authenticate } from "@/app/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined)

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
                        {errorMessage && (
                            <div className="text-red-500 text-sm">{errorMessage}</div>
                        )}
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                            Log In
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-slate-400">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-red-500 hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
