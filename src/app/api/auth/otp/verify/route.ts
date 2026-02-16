import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
        }

        // Find valid OTP
        const validOtp = await prisma.oneTimePassword.findFirst({
            where: {
                email,
                code: otp,
                expiresAt: { gt: new Date() }, // Check expiry
            },
            orderBy: { createdAt: 'desc' }, // Get latest
        });

        if (!validOtp) {
            return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
        }

        // Delete used OTP (and potentially older ones for this email to clean up)
        await prisma.oneTimePassword.deleteMany({
            where: { email },
        });

        return NextResponse.json({ message: "OTP verified successfully" });

    } catch (error) {
        console.error("OTP Verification Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
