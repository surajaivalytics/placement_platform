import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { handlePrismaError } from '@/lib/prisma-errors';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const company = searchParams.get('company');
        const type = searchParams.get('type');
        const category = searchParams.get('category');

        // Build where clause
        const where: Prisma.QuestionWhereInput = {
            test: {
                type: 'company', // Only placement/company tests
            },
        };

        if (company) {
            where.test = {
                ...(where.test as object),
                company: company,
            };
        }

        if (type) {
            where.type = type;
        }

        if (category) {
            where.category = category;
        }

        // Fetch questions
        const questions = await prisma.question.findMany({
            where,
            include: {
                test: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                    },
                },
                options: {
                    orderBy: { id: 'asc' },
                },
            },
            orderBy: { id: 'desc' },
        });

        return NextResponse.json({ questions });
    } catch (error) {
        return handlePrismaError(error, 'Fetch placement questions');
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { testId, text, type, category, difficulty, options, metadata } = body;

        // Create question
        const question = await prisma.question.create({
            data: {
                testId,
                text,
                type,
                category,
                difficulty,
                metadata,
                options: {
                    create: options || [],
                },
            },
            include: {
                options: true,
                test: true,
            },
        });

        return NextResponse.json({ question });
    } catch (error) {
        return handlePrismaError(error, 'Create question');
    }
}
