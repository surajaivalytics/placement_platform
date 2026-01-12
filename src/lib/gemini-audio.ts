import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function analyzeVoiceRecording(audioBuffer: Buffer) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

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
                    mimeType: "audio/wav", // Assuming WAV, but WebM is also supported often
                    data: audioBuffer.toString("base64"),
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean and parse JSON
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error analyzing voice:", error);
        throw new Error("Failed to analyze voice recording");
    }
}
