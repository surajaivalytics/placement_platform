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
                graduationCGPA: data.graduationCGPA ? parseFloat(data.graduationCGPA) : undefined,
                tenthPercentage: data.tenthPercentage ? parseFloat(data.tenthPercentage) : undefined,
                twelfthPercentage: data.twelfthPercentage ? parseFloat(data.twelfthPercentage) : undefined,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
    }
}
