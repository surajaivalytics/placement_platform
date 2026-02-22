import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET user profile
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                bio: true,
                phone: true,
                address: true,
                image: true,
                emailVerified: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update user profile
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, bio, phone, address } = await req.json();

        // Validation
        if (name && (typeof name !== 'string' || name.trim().length < 2)) {
            return NextResponse.json({ error: 'Name must be at least 2 characters long' }, { status: 400 });
        }
        if (phone && (typeof phone !== 'string' || !/^\d{10}$/.test(phone))) {
            return NextResponse.json({ error: 'Phone number must be exactly 10 digits' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name || undefined,
                bio: bio || undefined,
                phone: phone || undefined,
                address: address || undefined,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                bio: true,
                phone: true,
                address: true,
                image: true,
            },
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            user,
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
