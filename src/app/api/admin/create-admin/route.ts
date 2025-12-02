import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    const { secret, email, username, password } = await request.json();

    if (secret !== process.env.NEXTAUTH_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        return NextResponse.json({ success: true, userId: admin.id });
    } catch (error) {
        console.error('Create admin error:', error);
        return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
    }
}
