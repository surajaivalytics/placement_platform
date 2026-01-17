import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        console.log('🔍 Testing login for:', email);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'User not found',
                email,
            }, { status: 404 });
        }

        if (!user.password) {
            return NextResponse.json({
                success: false,
                error: 'User has no password set',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            }, { status: 400 });
        }

        // Test password
        const isValid = await bcrypt.compare(password, user.password);

        return NextResponse.json({
            success: true,
            passwordMatch: isValid,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Test login error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
