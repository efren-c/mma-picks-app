import { getGlobalLeaderboard, getEventLeaderboard } from '@/app/lib/gamification-actions';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { EventSelector } from '@/components/EventSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";

export default async function LeaderboardPage(props: { searchParams: Promise<{ eventId?: string }> }) {
    const searchParams = await props.searchParams;
    const dict = await getDictionary();
    const events = await prisma.event.findMany({
        select: { id: true, name: true, date: true },
        orderBy: { date: 'desc' }
    });

    let targetEventId = searchParams?.eventId;

    // Smart default: If no specific event request, check for "active" event (started within last 24h)
    if (!targetEventId) {
        const now = new Date();
        const recentLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Find the most recent event that has started
        const activeEvent = events.find(e => e.date < now && e.date > recentLimit);

        if (activeEvent) {
            targetEventId = activeEvent.id;
        }
    }

    let leaderboard;
    let title: string = dict.leaderboard.globalTitle;
    let description: string = dict.leaderboard.globalDescription;

    if (targetEventId) {
        leaderboard = await getEventLeaderboard(targetEventId);
        const event = events.find(e => e.id === targetEventId);
        if (event) {
            title = `${dict.leaderboard.titleSuffix}`;
            description = `${dict.leaderboard.eventDescription} ${event.name}`;
        }
    } else {
        leaderboard = await getGlobalLeaderboard();
    }

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
        <div className="container mx-auto py-8 max-w-4xl space-y-6">
            <div className="flex justify-end">
                <EventSelector events={events} selectedEventId={targetEventId} dict={dict} />
            </div>

            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
                            <CardDescription className="text-slate-400">{description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <LeaderboardTable users={leaderboard} currentUserId={currentUserId} dict={dict} />
                </CardContent>
            </Card>
        </div>
    );
}
