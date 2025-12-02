import { getGlobalLeaderboard } from '@/app/lib/gamification-actions';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage() {
    const leaderboard = await getGlobalLeaderboard();
    const session = await auth();
    let currentUserId: string | undefined;

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });
        currentUserId = user?.id;
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">Global Leaderboard</CardTitle>
                    <CardDescription className="text-slate-400">Top players across all events</CardDescription>
                </CardHeader>
                <CardContent>
                    <LeaderboardTable users={leaderboard} currentUserId={currentUserId} />
                </CardContent>
            </Card>
        </div>
    );
}
