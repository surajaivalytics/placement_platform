import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get identity verification status
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // In development mode, auto-verify authenticated users
        // In production, this would check actual identity verification status
        // from a database or external service
        const isDevMode = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_DEV_ID_VERIFY === 'true';
        
        if (isDevMode) {
            // Auto-verify in development mode for authenticated users
            return NextResponse.json({
                status: 'verified',
                reason: null,
            });
        }
        
        // In production, return pending until actual verification is done
        return NextResponse.json({
            status: 'pending',
            reason: 'Identity verification required. Please complete verification to proceed.',
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
export async function POST(req: Request) {
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

