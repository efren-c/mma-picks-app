import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const badges = [
    { name: 'First Pick', description: 'Made your first prediction.', icon: 'Target' },
    { name: 'Perfect Event', description: 'Predicted all fights correctly in a single event.', icon: 'Trophy' },
    { name: 'Underdog Hunter', description: 'Correctly predicted an underdog win.', icon: 'Dog' },
    { name: 'Veteran', description: 'Participated in 5 events.', icon: 'Medal' },
];

export async function POST(request: Request) {
    const { secret } = await request.json();

    // Simple auth check
    if (secret !== process.env.NEXTAUTH_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        for (const badge of badges) {
            await prisma.badge.upsert({
                where: { name: badge.name },
                update: badge,
                create: badge,
            });
        }

        return NextResponse.json({ success: true, message: 'Badges seeded' });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: 'Failed to seed badges' }, { status: 500 });
    }
}
