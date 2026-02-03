// Move API key check inside to avoid build-time errors if env is missing
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeVoiceRecording(audioBuffer: Buffer, mimeType: string = "audio/webm") {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing in environment variables");
        throw new Error("GEMINI_API_KEY is not defined");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const tryGenerate = async (modelName: string) => {
        console.log(`Analyzing audio with model: ${modelName}, size: ${audioBuffer.length} bytes`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
      Act as a professional Speech Assessor for Wipro/TCS placement interviews.
      Evaluate this voice recording based on 4 strict parameters (0-25 points each).

      1. Fluency (0-25): Smoothness, filler words (um, uh), pavers.
      2. Pronunciation (0-25): Phonetic accuracy, global intelligibility (Indian-neutral acccepted).
      3. Pace (0-25): WPM consistency (ideal 120-160). 
      4. Clarity (0-25): Articulation and volume.

      IMPORTANT:
      - Total Score = Sum of above.
      - Confidence Score (0-100): How sure are you about this evaluation? If audio is noisy or silent, lower confidence.
      - Pass/Fail: Pass if Total >= 70 AND every parameter >= 15. Else Fail.

      Return ONLY valid JSON:
      {
        "fluency": number,
        "pronunciation": number,
        "pace": number,
        "clarity": number,
        "totalScore": number,
        "confidence": number,
        "decision": "PASS" | "FAIL",
        "feedback": {
           "strengths": ["string"],
           "weaknesses": ["string"],
           "improvementTips": ["string"]
        },
        "transcription": "string (full text)"
      }
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType,
                    data: audioBuffer.toString("base64"),
                },
            },
        ]);

        const response = await result.response;
        return response.text();
    };

    // Try primary model then fallback
    try {
        try {
            // Updated to use 2.0 flash as primary based on availability check
            const text = await tryGenerate("gemini-2.0-flash");
            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (e: any) {
            console.warn("gemini-2.0-flash failed, trying gemini-1.5-flash...");
            // Fallback to 1.5 flash
            try {
                const text = await tryGenerate("gemini-3-flash-preview");
                const jsonStr = text.replace(/```json|```/g, "").trim();
                return JSON.parse(jsonStr);
            } catch (innerE) {
                // Fallback to 1.5 pro or latest
                console.warn("gemini-1.5-flash failed, trying gemini-1.5-flash-latest...");
                const text = await tryGenerate("gemini-3-flash-preview");
                const jsonStr = text.replace(/```json|```/g, "").trim();
                return JSON.parse(jsonStr);
            }
        }
    } catch (error) {
        // Second fallback to Pro if Flash fails completely
        try {
            console.warn("Flash models failed, trying gemini-1.5-pro...");
            const text = await tryGenerate("gemini-3-flash-preview");
            const jsonStr = text.replace(/```json|```/g, "").trim();
            return JSON.parse(jsonStr);
        } catch (finalErr) {
            console.error("All Gemini models failed:", finalErr);
            console.error("All Gemini models failed:", finalErr);
            throw new Error(`Failed to analyze voice recording: ${(finalErr as Error).message}`);
        }
    }
}
