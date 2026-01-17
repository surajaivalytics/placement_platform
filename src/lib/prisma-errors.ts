import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

/**
 * Handles Prisma errors and returns appropriate NextResponse
 */
export function handlePrismaError(error: unknown, context: string = 'Database operation') {
    console.error(`❌ ${context} error:`, error);

    // Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle specific Prisma error codes
        switch (error.code) {
            case 'P2002':
                return NextResponse.json(
                    { error: 'A record with this data already exists', code: error.code },
                    { status: 409 }
                );
            case 'P2025':
                return NextResponse.json(
                    { error: 'Record not found', code: error.code },
                    { status: 404 }
                );
            case 'P2003':
                return NextResponse.json(
                    { error: 'Foreign key constraint failed', code: error.code },
                    { status: 400 }
                );
            default:
                return NextResponse.json(
                    {
                        error: 'Database error',
                        code: error.code,
                        details: process.env.NODE_ENV === 'development' ? error.message : undefined
                    },
                    { status: 500 }
                );
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        return NextResponse.json(
            {
                error: 'Invalid data provided',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 400 }
        );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
        return NextResponse.json(
            {
                error: 'Database connection failed',
                details: process.env.NODE_ENV === 'development' ? error.message : 'Please check database configuration'
            },
            { status: 503 }
        );
    }

    // Generic error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    return NextResponse.json(
        {
            error: `${context} failed`,
            details: errorMessage,
            debug: process.env.NODE_ENV === 'development' ? { stack: errorStack } : undefined
        },
        { status: 500 }
    );
}

/**
 * Validates database connection before operations
 */
export async function validateDatabaseConnection(prisma: any) {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.error('❌ Database connection validation failed:', error);
        return false;
    }
}
