"use server";

import { analyzeVoiceRecording } from "@/lib/gemini-audio";
import { logMonitoringEvent } from "./monitoring";

export async function processAudioChunk(formData: FormData, testId: string, company: string = "TCS") {
    try {
        const audioFile = formData.get("audio") as File;
        if (!audioFile) {
            return { success: false, error: "No audio file provided" };
        }

        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Analyze identifying cheating or low quality
        // Note: The prompt in gemini-audio is currently tailored for "Speech Assessment".
        // Use it as is for now, but we might want to interpret low confidence or specific keywords as violations.
        const analysis = await analyzeVoiceRecording(buffer, audioFile.type || "audio/webm");

        // Basic Proctoring Logic based on the response
        // If confidence is very low, it might mean silence or noise.
        // If we want to detect "someone else speaking", we rely on the specific prompt.
        // For now, we just log "Low Clarity" or "Fail" as potential warnings.

        // Example: If decision is FAIL (which means low fluency/clarity in the current prompt context), log it?
        // Actually, for proctoring, we might care more about "Suspicious Audio". 
        // But since the current prompt is for "Interview/Speech", let's use the 'clarity' and 'confidence' score.

        let violation = null;

        if (analysis.confidence < 50) {
            violation = "Audio Unclear/Noisy";
        }

        // If we had a "multiple voices" detector, we'd check that. 
        // Current Gemini prompt doesn't explicitly return "multiple voices" unless we change the prompt.
        // Proceeding with current capability.

        if (violation) {
            await logMonitoringEvent(company, "AUDIO_WARNING", violation);
        }

        return { success: true, analysis, violation };

    } catch (error) {
        console.error("Audio processing error:", error);
        return { success: false, error: "Failed to process audio" };
    }
}
