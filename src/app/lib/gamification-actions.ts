'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { Prisma } from '@prisma/client';

type LeaderboardUser = Prisma.UserGetPayload<{
    select: {
        id: true;
        username: true;
        points: true;
        badges: {
            include: {
                badge: true;
            };
        };
    };
}> & { rank: number };

export async function getGlobalLeaderboard(): Promise<LeaderboardUser[]> {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            points: true,
            badges: {
                include: {
                    badge: true,
                },
            },
        },
        orderBy: {
            points: 'desc',
        },
        take: 50,
    });

    return users.map((user, index) => ({
        ...user,
        rank: index + 1,
    }));
}

export async function getEventLeaderboard(eventId: string) {
    // Calculate points for a specific event dynamically
    // We need to sum up points from picks for this event
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            badges: {
                include: {
                    badge: true,
                },
            },
            picks: {
                where: {
                    fight: {
                        eventId: eventId,
                    },
                },
                select: {
                    points: true,
                },
            },
        },
    });

    // Calculate event points and sort
    const leaderboard = users
        .map((user) => {
            const eventPoints = user.picks.reduce((sum, pick) => sum + (pick.points || 0), 0);
            return {
                id: user.id,
                username: user.username,
                points: eventPoints,
                badges: user.badges,
            };
        })
        .sort((a, b) => b.points - a.points)
        .map((user, index) => ({
            ...user,
            rank: index + 1,
        }));

    return leaderboard;
}

export async function getYearlyLeaderboard(year: number) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            badges: {
                include: {
                    badge: true,
                },
            },
            picks: {
                where: {
                    fight: {
                        event: {
                            date: {
                                gte: startDate,
                                lt: endDate,
                            },
                        },
                    },
                },
                select: {
                    points: true,
                },
            },
        },
    });

    return users
        .map((user) => {
            const yearlyPoints = user.picks.reduce((sum, pick) => sum + (pick.points || 0), 0);
            return {
                id: user.id,
                username: user.username,
                points: yearlyPoints,
                badges: user.badges,
            };
        })
        .sort((a, b) => b.points - a.points)
        .map((user, index) => ({
            ...user,
            rank: index + 1,
        }));
}

export async function checkAndAwardBadges(userId: string, eventId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            picks: {
                where: {
                    fight: {
                        eventId: eventId,
                    },
                },
                include: {
                    fight: true,
                },
            },
            badges: {
                include: {
                    badge: true,
                },
            },
        },
    });

    if (!user) return;

    const newBadges: string[] = [];

    // 1. First Pick Badge
    const hasFirstPickBadge = user.badges.some((b) => b.badge.name === 'First Pick');
    if (!hasFirstPickBadge && user.picks.length > 0) {
        await awardBadge(userId, 'First Pick');
        newBadges.push('First Pick');
    }

    // 2. Perfect Event Badge (All picks correct)
    // Only check if event is fully completed
    const eventFights = await prisma.fight.findMany({ where: { eventId } });
    const allFightsFinished = eventFights.every((f) => f.winner !== null);

    if (allFightsFinished && user.picks.length === eventFights.length) {
        const allCorrect = user.picks.every((pick) => pick.points && pick.points > 0); // Simplified check: > 0 points means some correctness, but "Perfect" usually means Winner correct.
        // Let's define Perfect as getting the Winner correct for ALL fights.
        const allWinnersCorrect = user.picks.every(pick => {
            return pick.winner === pick.fight.winner;
        });

        const hasPerfectBadge = user.badges.some((b) => b.badge.name === 'Perfect Event');
        if (allWinnersCorrect && !hasPerfectBadge) {
            await awardBadge(userId, 'Perfect Event');
            newBadges.push('Perfect Event');
        }
    }

    // 3. Underdog Hunter (Correctly predicted an underdog)
    // Need odds for this, but assuming we don't have odds yet, we can skip or implement a placeholder.
    // Skipping for now as we don't have odds in schema.

    // 4. Veteran (5 events)
    const distinctEvents = await prisma.pick.findMany({
        where: { userId },
        distinct: ['fightId'], // Approximation, ideally distinct eventId via relation
        select: {
            fight: {
                select: {
                    eventId: true
                }
            }
        }
    });
    // Group by eventId
    const eventIds = new Set(distinctEvents.map(p => p.fight.eventId));

    const hasVeteranBadge = user.badges.some((b) => b.badge.name === 'Veteran');
    if (eventIds.size >= 5 && !hasVeteranBadge) {
        await awardBadge(userId, 'Veteran');
        newBadges.push('Veteran');
    }

    if (newBadges.length > 0) {
        revalidatePath('/dashboard');
        revalidatePath('/leaderboard');
    }
}

async function awardBadge(userId: string, badgeName: string) {
    const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
    if (badge) {
        await prisma.userBadge.create({
            data: {
                userId,
                badgeId: badge.id,
            },
        });
    }
}
