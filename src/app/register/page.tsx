"use client"

import { useActionState, useState } from "react"
import { register } from "@/app/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
    const [state, dispatch] = useActionState(register, undefined)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordError, setPasswordError] = useState<string | null>(null)

    const handleSubmit = (formData: FormData) => {
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match")
            return
        }

        setPasswordError(null)
        dispatch(formData)
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-sm border-slate-800 bg-slate-900/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-center text-white">Create Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400">Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="w-full px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-600 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-red-600 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>

                        {passwordError && (
                            <div className="text-red-500 text-xs">{passwordError}</div>
                        )}

                        {state?.message && (
                            <div className="text-red-500 text-xs">{state.message}</div>
                        )}
                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white h-9 text-sm">
                            Sign Up
                        </Button>
                    </form>
                    <div className="mt-3 text-center text-xs text-slate-400">
                        Already have an account?{" "}
                        <Link href="/login" className="text-red-500 hover:underline cursor-pointer">
                            Log in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
