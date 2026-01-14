'use server';

import { analyzeVoiceRecording } from "@/lib/gemini-audio";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function submitVoiceAssessment(formData: FormData) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized. Please login." };
    }

    const userId = session.user.id;
    const file = formData.get("audio") as File;

    // Find active application
    const application = await prisma.placementApplication.findFirst({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }
    });

    if (!application) {
        return { success: false, error: "No active placement application found." };
    }

    const applicationId = application.id;

    if (!file) {
        return { success: false, error: "Missing audio file" };
    }

    try {
        // 1. Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Analyze with Gemini
        console.log("Calling analyzeVoiceRecording...");
        const analysis = await analyzeVoiceRecording(buffer, "audio/webm");
        console.log("Analysis complete:", JSON.stringify(analysis).substring(0, 100) + "...");

        // 3. Determine Final Status based on Hybrid Logic
        let status = "PASSED";
        let reviewType = "AI_ONLY";

        if (analysis.decision === "FAIL") {
            status = "FAILED";
        }

        // Hybrid Rule: Low confidence triggers Human Review
        if (analysis.confidence < 95) {
            status = "HUMAN_REVIEW_PENDING";
            reviewType = "AI_ONLY";
        }

        // 4. Save to Database
        const mockAudioUrl = `/uploads/voice/${applicationId}-${Date.now()}.wav`;

        const assessment = await prisma.voiceAssessment.upsert({
            where: { applicationId },
            update: {
                audioUrl: mockAudioUrl,
                transcript: analysis.transcription,
                fluencyScore: analysis.fluency,
                pronunciationScore: analysis.pronunciation,
                paceScore: analysis.pace,
                clarityScore: analysis.clarity,
                totalScore: analysis.totalScore,
                confidenceScore: analysis.confidence,
                status: status,
                reviewType: reviewType,
                isPassed: status === "PASSED",
                aiFeedback: analysis.feedback ?? {},
                assessedAt: new Date(),
            },
            create: {
                applicationId,
                audioUrl: mockAudioUrl,
                transcript: analysis.transcription,
                fluencyScore: analysis.fluency,
                pronunciationScore: analysis.pronunciation,
                paceScore: analysis.pace,
                clarityScore: analysis.clarity,
                totalScore: analysis.totalScore,
                confidenceScore: analysis.confidence,
                status: status,
                reviewType: reviewType,
                isPassed: status === "PASSED",
                aiFeedback: analysis.feedback ?? {},
                assessedAt: new Date(),
            },
        });

        revalidatePath(`/dashboard/voice-assessment`);
        return { success: true, data: assessment };

    } catch (error) {
        console.error("Error submitting voice assessment:", error);
        return { success: false, error: "Assessment failed. Please try again." };
    }
}
