'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/app/lib/auth-actions'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { use } from 'react'

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params)
    const [state, dispatch] = useActionState(resetPassword.bind(null, token), undefined)

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Enter your new password below.
                    </p>
                </div>

                <form action={dispatch} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="sr-only">
                                New Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="relative block w-full rounded-md border-0 bg-slate-800 py-1.5 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 pl-3"
                                placeholder="New Password"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                className="relative block w-full rounded-md border-0 bg-slate-800 py-1.5 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 pl-3"
                                placeholder="Confirm Password"
                            />
                        </div>
                    </div>

                    {state?.message && (
                        <div className="text-sm text-center text-red-500 bg-red-900/20 p-3 rounded-md border border-red-900/50">
                            {state.message}
                        </div>
                    )}

                    <div>
                        <Button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                            Reset Password
                        </Button>
                    </div>

                    <div className="text-center">
                        <Link href="/login" className="text-sm font-medium text-red-500 hover:text-red-400">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
