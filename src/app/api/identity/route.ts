import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
export const dynamic = 'force-dynamic';

// GET - Get identity verification status
export async function GET(_req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // For now, auto-verify all authenticated users
        console.log('✅ Identity status requested for:', session.user.email);
        return NextResponse.json({
            status: 'verified',
            reason: null,
            user: {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image
            }
        });
    } catch (error) {
        console.error('Identity status fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Verify identity (for development/testing)
export async function POST(_req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // In development, allow manual verification
        // In production, this would trigger actual identity verification process
        const isDevMode = process.env.NEXT_PUBLIC_DEV_ID_VERIFY === 'true' ||
            process.env.NODE_ENV === 'development';

        if (!isDevMode) {
            return NextResponse.json(
                { error: 'Identity verification not available in production mode' },
                { status: 403 }
            );
        }

        // Return verified status for dev mode
        return NextResponse.json({
            status: 'verified',
            reason: null,
        });
    } catch (error) {
        console.error('Identity verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

