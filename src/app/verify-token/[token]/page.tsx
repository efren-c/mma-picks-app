import { verifyEmail } from "@/app/lib/auth-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default async function VerifyTokenPage({
    params,
}: {
    params: Promise<{ token: string }>
}) {
    const resolvedParams = await params
    const { success, message } = await verifyEmail(resolvedParams.token)

    if (success) {
        redirect('/login?verified=true')
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Card className="w-full max-w-md border-slate-800 bg-slate-900/50">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-slate-800 p-3 rounded-full w-fit mb-4">
                        <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <CardTitle className="text-2xl text-white">
                        Verification Failed
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-slate-400">{message}</p>

                    <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white">
                        <Link href="/login">
                            Return to Login
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
    )
}
