import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                name: true,
                email: true,
                image: true,
                coverImage: true,
                phone: true,
                accountType: true,
                autoPayout: true,
                role: true,
                graduationCGPA: true,
                tenthPercentage: true,
                twelfthPercentage: true,
            }
        });

        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();

        // Robust Validation
        const errors: Record<string, string> = {};

        if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters long";
        }

        if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = "Invalid email address";
        }

        if (!data.phone || typeof data.phone !== 'string' || !/^\d{10}$/.test(data.phone)) {
            errors.phone = "Phone number must be exactly 10 digits";
        }

        const parseNumeric = (val: any) => {
            if (val === null || val === undefined || val === '') return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 'INVALID' : parsed;
        };

        const cgpa = parseNumeric(data.graduationCGPA);
        if (cgpa === 'INVALID' || (typeof cgpa === 'number' && (cgpa < 0 || cgpa > 10))) {
            errors.graduationCGPA = "CGPA must be between 0 and 10";
        }

        const tenth = parseNumeric(data.tenthPercentage);
        if (tenth === 'INVALID' || (typeof tenth === 'number' && (tenth < 0 || tenth > 100))) {
            errors.tenthPercentage = "10th percentage must be between 0 and 100";
        }

        const twelfth = parseNumeric(data.twelfthPercentage);
        if (twelfth === 'INVALID' || (typeof twelfth === 'number' && (twelfth < 0 || twelfth > 100))) {
            errors.twelfthPercentage = "12th percentage must be between 0 and 100";
        }

        if (Object.keys(errors).length > 0) {
            console.warn("Profile Validation Failed:", { email: session.user.email, errors, dataReceived: data });
            return NextResponse.json({ message: "Validation failed", errors }, { status: 400 });
        }

        const validatedCGPA = typeof cgpa === 'number' ? cgpa : undefined;
        const validatedTenth = typeof tenth === 'number' ? tenth : undefined;
        const validatedTwelfth = typeof twelfth === 'number' ? twelfth : undefined;

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                accountType: data.accountType,
                image: data.image,
                coverImage: data.coverImage,
                autoPayout: data.autoPayout,
                graduationCGPA: validatedCGPA as number | undefined,
                tenthPercentage: validatedTenth as number | undefined,
                twelfthPercentage: validatedTwelfth as number | undefined,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
    }
}
