import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// Generate a random 6-digit number
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate attractive HTML email template
function generateEmailHtml(otp: string) {
    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">Placement Platform</h1>
                <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Verification Code</p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 24px;">Hello,</p>
            <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 32px;">Please use the verification code below to complete your sign-up. This code is valid for <strong>10 minutes</strong>.</p>
            
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #4f46e5; display: inline-block;">${otp}</span>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 24px; margin-bottom: 32px;">If you didn't request this email, you can safely ignore it.</p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Placement Platform. All rights reserved.</p>
            </div>
        </div>
    </div>
    `;
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in database
        await prisma.oneTimePassword.create({
            data: {
                email,
                code: otp,
                expiresAt,
            },
        });

        // Trigger n8n Webhook
        const webhookUrl = process.env.N8N_OTP_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error("N8N_OTP_WEBHOOK_URL is not configured");
            return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
        }

        try {
            const htmlContent = generateEmailHtml(otp);
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'Placement Platform OTP.',
                    recipient: email,
                    html: htmlContent,
                    data: { otp }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`n8n webhook failed with status ${response.status}: ${errorText}`);
                throw new Error(`Failed to send OTP email (Provider Error: ${response.status})`);
            }
        } catch (webhookError) {
            console.error("Failed to trigger n8n webhook:", webhookError);
            const errorMessage = webhookError instanceof Error ? webhookError.message : "Failed to send OTP email";
            return NextResponse.json({ message: errorMessage }, { status: 500 });
        }

        return NextResponse.json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error("OTP Generation Error:", error);
        return NextResponse.json({ message: `Internal Server Error: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }
}
