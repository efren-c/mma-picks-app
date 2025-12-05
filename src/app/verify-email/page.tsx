
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyEmailPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/50">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-slate-800 p-3 rounded-full w-fit mb-4">
                        <Mail className="h-8 w-8 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl text-white">Check your email</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-slate-400">
                        We sent a verification link to your email address. Please click the link to confirm your account.
                    </p>
                    <div className="pt-4">
                        <Link href="/login" className="text-sm text-red-500 hover:text-red-400 font-medium">
                            Return to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
